import { Express, Request, Response, NextFunction } from "express";
import { setupAuth } from "./auth";
import { db } from "../db";
import { projects, tasks, comments, projectTypes, projectMembers, users, files, TaskStatus } from "@db/schema";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Extend Express.Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

// Custom middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

async function checkProjectAccess(
  req: Request,
  projectId: number,
  requiredRole?: "owner" | "admin" | "member"
) {
  if (!req.user) return false;
  
  const members = await db.select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, req.user.id)
      )
    );

  const member = members[0];
  if (!member) return false;
  
  if (requiredRole) {
    if (requiredRole === "owner") return member.role === "owner";
    if (requiredRole === "admin") return ["owner", "admin"].includes(member.role);
    return true;
  }
  
  return true;
}

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Project Types
  app.get("/api/project-types", ensureAuthenticated, async (req: Request, res: Response) => {
    const types = await db.select().from(projectTypes);
    res.json(types);
  });

  // Projects
  app.get("/api/projects", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userProjects = await db.select()
      .from(projects)
      .where(eq(projects.createdById, req.user.id));
    res.json(userProjects);
  });

  app.post("/api/projects", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, typeId } = req.body;

    // Validate project type exists
    const [projectType] = await db.select()
      .from(projectTypes)
      .where(eq(projectTypes.id, typeId));

    if (!projectType) {
      return res.status(400).json({ error: "Invalid project type" });
    }

    const [project] = await db.insert(projects)
      .values({
        name,
        description,
        typeId,
        createdById: req.user.id,
      })
      .returning();

    // Create project member entry for the creator
    await db.insert(projectMembers)
      .values({
        projectId: project.id,
        userId: req.user.id,
        role: "owner"
      });

    res.json(project);
  });

  app.get("/api/projects/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    const projectResults = await db.select()
      .from(projects)
      .where(eq(projects.id, parseInt(req.params.id)));
    
    if (!projectResults.length) {
      return res.status(404).send("Project not found");
    }
    
    res.json(projectResults[0]);
  });

  // Tasks
  app.get("/api/projects/:projectId/tasks", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const projectTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.projectId, parseInt(req.params.projectId)));
    res.json(projectTasks);
  });

  app.post("/api/projects/:projectId/tasks", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const projectId = parseInt(req.params.projectId);
    const hasAccess = await checkProjectAccess(req, projectId, "member");
    if (!hasAccess) return res.status(403).send("Insufficient permissions");
    
    const { title, description, status, order } = req.body;
    
    if (status && !Object.values(TaskStatus).includes(status)) {
      return res.status(400).send("Invalid task status");
    }
    
    const [task] = await db.insert(tasks)
      .values({
        title,
        description,
        status,
        order,
        projectId,
        createdById: req.user.id,
      })
      .returning();
    res.json(task);
  });

  app.patch("/api/tasks/:taskId", ensureAuthenticated, async (req: Request, res: Response) => {
    const taskResults = await db.select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(req.params.taskId)));
      
    if (!taskResults.length) return res.status(404).send("Task not found");
    const task = taskResults[0];
    
    if (task.projectId) {
      const hasAccess = await checkProjectAccess(req, task.projectId, "member");
      if (!hasAccess) return res.status(403).send("Insufficient permissions");
    }
    
    const { title, description, status, order, assignedToId } = req.body;
    const [updatedTask] = await db.update(tasks)
      .set({ 
        title: title || undefined,
        description: description || null,
        status: status || undefined,
        order: order || undefined,
        assignedToId: assignedToId || null,
        updatedAt: new Date() 
      })
      .where(eq(tasks.id, parseInt(req.params.taskId)))
      .returning();
    res.json(updatedTask);
  });

  // Project Members and Collaboration
  app.get("/api/projects/:projectId/members", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const projectId = parseInt(req.params.projectId);
    const results = await db
      .select({
        id: projectMembers.id,
        userId: users.id,
        username: users.username,
        role: projectMembers.role,
        createdAt: projectMembers.createdAt
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(projectMembers.projectId, projectId));

    res.json(results);
  });

  app.post("/api/projects/:projectId/members", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const projectId = parseInt(req.params.projectId);
    const isOwner = await checkProjectAccess(req, projectId, "owner");
    if (!isOwner) {
      return res.status(403).send("Only project owners can add members");
    }

    const { username } = req.body;
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if already a member
    const [existingMember] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, user.id)
        )
      );

    if (existingMember) {
      return res.status(400).send("User is already a member of this project");
    }

    // Add user as project member
    const [member] = await db
      .insert(projectMembers)
      .values({
        projectId,
        userId: user.id,
        role: "member"
      })
      .returning();

    res.json(member);
  });

  app.delete("/api/projects/:projectId/members/:memberId", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const projectId = parseInt(req.params.projectId);
    const isOwner = await checkProjectAccess(req, projectId, "owner");
    if (!isOwner) {
      return res.status(403).send("Only project owners can remove members");
    }

    await db.delete(projectMembers)
      .where(
        and(
          eq(projectMembers.id, parseInt(req.params.memberId)),
          eq(projectMembers.projectId, projectId)
        )
      );

    res.json({ message: "Member removed successfully" });
  });

  // Files
  app.post("/api/tasks/:taskId/files", ensureAuthenticated, async (req: Request, res: Response) => {
    // Check if task exists and user has access
    const [task] = await db.select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(req.params.taskId)));
      
    if (!task) return res.status(404).send("Task not found");
    
    if (task.projectId) {
      const hasAccess = await checkProjectAccess(req, task.projectId, "member");
      if (!hasAccess) return res.status(403).send("Insufficient permissions");
    }
    
    upload.single("file")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        return res.status(400).send(err.message);
      } else if (err) {
        return res.status(400).send(err.message);
      }
      
      if (!req.file) return res.status(400).send("No file uploaded");

      try {
        const [file] = await db.insert(files)
          .values({
            taskId: parseInt(req.params.taskId),
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedById: req.user.id,
          })
          .returning();

        res.json(file);
      } catch (error) {
        // Clean up uploaded file if database insert fails
        fs.unlinkSync(path.join("./uploads", req.file.filename));
        res.status(500).send("Failed to save file information");
      }
    });
  });

  app.get("/api/tasks/:taskId/files", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const taskFiles = await db.select()
      .from(files)
      .where(eq(files.taskId, parseInt(req.params.taskId)));
    
    res.json(taskFiles);
  });

  app.get("/api/files/:filename", ensureAuthenticated, async (req: Request, res: Response) => {
    res.download(path.join("./uploads", req.params.filename));
  });

  // Comments
  app.post("/api/tasks/:taskId/comments", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [task] = await db.select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(req.params.taskId)));
      
    if (!task) return res.status(404).send("Task not found");
    if (!task.projectId) return res.status(400).send("Task is not associated with a project");
    
    // Allow any project member to add comments
    const [member] = await db.select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, task.projectId),
          eq(projectMembers.userId, req.user.id)
        )
      );
      
    if (!member) return res.status(403).send("Must be a project member to add comments");
    
    const { content } = req.body;
    const [comment] = await db.insert(comments)
      .values({
        content,
        taskId: task.id,
        createdById: req.user.id,
      })
      .returning();
    
    res.json(comment);
  });

  app.get("/api/tasks/:taskId/comments", ensureAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [task] = await db.select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(req.params.taskId)));
      
    if (!task) return res.status(404).send("Task not found");
    
    if (!task.projectId) return res.status(400).send("Task is not associated with a project");
    
    // Allow any project member to view comments
    const [member] = await db.select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, task.projectId),
          eq(projectMembers.userId, req.user.id)
        )
      );
      
    if (!member) return res.status(403).send("Must be a project member to view comments");
    
    const taskComments = await db.select()
      .from(comments)
      .where(eq(comments.taskId, parseInt(req.params.taskId)));
    
    res.json(taskComments);
  });
}
