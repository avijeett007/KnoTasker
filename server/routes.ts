import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "../db";
import { projects, tasks, comments, projectTypes, projectMembers, projectInvites, users, files } from "@db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

async function checkProjectAccess(
  req: Express.Request,
  projectId: number,
  requiredRole?: "owner" | "admin" | "member"
) {
  if (!req.user) return false;
  
  const [member] = await db.select()
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId))
    .where(eq(projectMembers.userId, req.user.id));

  if (!member) return false;
  
  if (requiredRole) {
    if (requiredRole === "owner") return member.role === "owner";
    if (requiredRole === "admin") return ["owner", "admin"].includes(member.role);
    return true; // member role can do basic operations
  }
  
  return true;
}

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Project Types
  app.get("/api/project-types", async (req, res) => {
    const types = await db.select().from(projectTypes);
    res.json(types);
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const userProjects = await db.select().from(projects)
      .where(eq(projects.createdById, req.user.id));
    res.json(userProjects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const { name, description, typeId } = req.body;
    const [project] = await db.insert(projects)
      .values({
        name,
        description,
        typeId,
        createdById: req.user.id,
      })
      .returning();

    // Add creator as project owner
    await db.insert(projectMembers)
      .values({
        projectId: project.id,
        userId: req.user.id,
        role: "owner"
      });

    res.json(project);
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const project = await db.select().from(projects)
      .where(eq(projects.id, parseInt(req.params.id)))
      .limit(1);
    
    if (!project.length) {
      return res.status(404).send("Project not found");
    }
    
    res.json(project[0]);
  });

  // Tasks
  app.get("/api/projects/:projectId/tasks", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const projectTasks = await db.select().from(tasks)
      .where(eq(tasks.projectId, parseInt(req.params.projectId)))
      .orderBy(tasks.order);
    res.json(projectTasks);
  });

  app.post("/api/projects/:projectId/tasks", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const hasAccess = await checkProjectAccess(req, parseInt(req.params.projectId), "member");
    if (!hasAccess) return res.status(403).send("Insufficient permissions");
    
    const { title, description, status, order } = req.body;
    const [task] = await db.insert(tasks)
      .values({
        title,
        description,
        status,
        order,
        projectId: parseInt(req.params.projectId),
        createdById: req.user.id,
      })
      .returning();
    res.json(task);
  });

  app.patch("/api/tasks/:taskId", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const [task] = await db.select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(req.params.taskId)))
      .limit(1);
      
    if (!task) return res.status(404).send("Task not found");
    
    const hasAccess = await checkProjectAccess(req, task.projectId, "member");
    if (!hasAccess) return res.status(403).send("Insufficient permissions");
    
    const { title, description, status, order, assignedToId } = req.body;
    const [updatedTask] = await db.update(tasks)
      .set({ 
        title: title || undefined,
        description: description || null,
        status: status || undefined,
        order: order || undefined,
        assignedToId: assignedToId,
        updatedAt: new Date() 
      })
      .where(eq(tasks.id, parseInt(req.params.taskId)))
      .returning();
    res.json(updatedTask);
  });

  // Comments
  app.get("/api/tasks/:taskId/comments", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const taskComments = await db.select().from(comments)
      .where(eq(comments.taskId, parseInt(req.params.taskId)));
    res.json(taskComments);
  });

  app.post("/api/tasks/:taskId/comments", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const { content } = req.body;
    const [comment] = await db.insert(comments)
      .values({
        content,
        taskId: parseInt(req.params.taskId),
        createdById: req.user.id,
      })
      .returning();
    res.json(comment);
  });

  // Project Members and Collaboration
  app.get("/api/projects/:projectId/members", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    // Check if user is a member of the project
    const [membership] = await db.select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, parseInt(req.params.projectId)))
      .where(eq(projectMembers.userId, req.user.id))
      .limit(1);

    if (!membership) {
      return res.status(403).send("Not a member of this project");
    }

    const members = await db.select({
      id: projectMembers.id,
      userId: users.id,
      username: users.username,
      role: projectMembers.role,
      createdAt: projectMembers.createdAt
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, parseInt(req.params.projectId)));

    res.json(members);
  });

  app.post("/api/projects/:projectId/invites", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    // Check if user has permission to invite
    const [membership] = await db.select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, parseInt(req.params.projectId)))
      .where(eq(projectMembers.userId, req.user.id))
      .where(eq(projectMembers.role, "owner"))
      .limit(1);

    if (!membership) {
      return res.status(403).send("Only project owners can invite members");
    }

    const { email } = req.body;
    
    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const [invite] = await db.insert(projectInvites)
      .values({
        projectId: parseInt(req.params.projectId),
        invitedByUserId: req.user.id,
        invitedUserEmail: email,
        expiresAt
      })
      .returning();

    res.json(invite);
  });

  app.post("/api/invites/:inviteId/accept", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const [invite] = await db.select()
      .from(projectInvites)
      .where(eq(projectInvites.id, parseInt(req.params.inviteId)))
      .limit(1);

    if (!invite || invite.status !== "pending") {
      return res.status(400).send("Invalid or expired invitation");
    }

    // Add user as project member
    const [membership] = await db.insert(projectMembers)
      .values({
        projectId: invite.projectId,
        userId: req.user.id,
        role: "member"
      })
      .returning();

    // Update invite status
    await db.update(projectInvites)
      .set({ status: "accepted" })
      .where(eq(projectInvites.id, invite.id));

    res.json(membership);
  });

  app.delete("/api/projects/:projectId/members/:memberId", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    // Check if user is project owner
    const [ownership] = await db.select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, parseInt(req.params.projectId)))
      .where(eq(projectMembers.userId, req.user.id))
      .where(eq(projectMembers.role, "owner"))
      .limit(1);

    if (!ownership) {
      return res.status(403).send("Only project owners can remove members");
    }

    await db.delete(projectMembers)
      .where(eq(projectMembers.id, parseInt(req.params.memberId)))
      .where(eq(projectMembers.projectId, parseInt(req.params.projectId)));

    res.json({ message: "Member removed successfully" });
  });

  // File Upload Routes
  app.post("/api/tasks/:taskId/files", upload.single("file"), async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (!req.file) return res.status(400).send("No file uploaded");

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
  });

  app.get("/api/tasks/:taskId/files", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const taskFiles = await db.select().from(files)
      .where(eq(files.taskId, parseInt(req.params.taskId)));
    
    res.json(taskFiles);
  });

  app.get("/api/files/:filename", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    res.download(path.join("./uploads", req.params.filename));
  });
}
