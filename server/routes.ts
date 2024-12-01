import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "../db";
import { projects, tasks, comments, projectTypes } from "@db/schema";
import { eq } from "drizzle-orm";

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
    const { status, order } = req.body;
    const [task] = await db.update(tasks)
      .set({ status, order, updatedAt: new Date() })
      .where(eq(tasks.id, parseInt(req.params.taskId)))
      .returning();
    res.json(task);
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
}
