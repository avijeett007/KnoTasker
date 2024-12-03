import express from 'express';
import db from '../db/index.js';
import { projects, tasks, projectMembers, projectTypes } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { TaskStatus } from '../shared/types.js';
import { authenticateUser } from '../middleware/auth.js';

interface TaskTemplate {
  title: string;
  description: string;
}

interface ProjectWithType {
  id: number;
  name: string;
  description: string | null;
  typeId: number | null;
  type: {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
  } | null;
}

const taskTemplates: Record<string, TaskTemplate[]> = {
  'Web Development': [
    { title: 'Project Setup', description: 'Initialize project repository and setup basic development environment' },
    { title: 'Requirements Analysis', description: 'Document project requirements and create technical specifications' },
    { title: 'Frontend Development', description: 'Implement user interface components and layouts' },
    { title: 'Backend Development', description: 'Create API endpoints and database models' },
    { title: 'Testing', description: 'Write and execute unit tests and integration tests' },
    { title: 'Deployment', description: 'Deploy application to production environment' }
  ],
  'YouTube Video': [
    { title: 'Screen Recording Setup', description: 'Set up screen recording software with optimal settings for tutorial recording' },
    { title: 'Camera Setup', description: 'Configure webcam and camera positioning for presenter video' },
    { title: 'Audio Setup', description: 'Set up microphone and audio settings for clear voice recording' },
    { title: 'Script Preparation', description: 'Write detailed script or outline for the tutorial content' },
    { title: 'Recording Environment', description: 'Prepare quiet recording space and proper lighting' },
    { title: 'Recording Software Features', description: 'Implement basic recording features like start/stop, pause, and camera toggle' },
    { title: 'Video Processing', description: 'Add video processing capabilities for recorded content' },
    { title: 'Storage Implementation', description: 'Implement local storage for recorded videos' },
    { title: 'UI Development', description: 'Create user-friendly interface for recording controls and preview' },
    { title: 'Export Options', description: 'Add various video export options and formats' }
  ],
  'Livestreaming': [
    { title: 'Stream Setup', description: 'Configure streaming software and equipment' },
    { title: 'Content Planning', description: 'Plan stream content and schedule' },
    { title: 'Test Stream', description: 'Conduct test stream to verify setup' },
    { title: 'Promotion', description: 'Promote upcoming stream on social media' },
    { title: 'Stream Execution', description: 'Conduct the live stream' },
    { title: 'Post-Stream Review', description: 'Review stream analytics and feedback' }
  ],
  'Course Creation': [
    { title: 'Course Outline', description: 'Create detailed course outline and learning objectives' },
    { title: 'Content Research', description: 'Research and gather course materials' },
    { title: 'Lesson Planning', description: 'Plan individual lessons and assignments' },
    { title: 'Content Creation', description: 'Create course content and materials' },
    { title: 'Review and Testing', description: 'Review content and test course flow' },
    { title: 'Course Launch', description: 'Launch course and monitor initial feedback' }
  ]
};

async function generateTasks(projectId: number, prompt: string): Promise<TaskTemplate[]> {
  try {
    // Get project and its type from database
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        type: true
      }
    });

    if (!project || !project.type) {
      throw new Error('Project or project type not found');
    }

    // Get task templates for project type
    const templates = taskTemplates[project.type.name];
    if (!templates) {
      throw new Error(`No task templates found for project type: ${project.type.name}`);
    }

    // Get existing tasks for the project to determine order
    const existingTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.id));

    // Analyze prompt to customize tasks (basic implementation)
    const lowercasePrompt = prompt.toLowerCase();
    
    return templates.map(template => ({
      title: template.title,
      description: template.description
    }));
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
}

const router = express.Router();

// Add authentication middleware
router.use(authenticateUser);

router.post("/generate-tasks", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { projectId, prompt } = req.body;

    if (!projectId || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user has access to the project
    const membership = await db.select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, req.user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return res.status(403).json({ error: "Not authorized to access this project" });
    }

    // Generate tasks
    const generatedTasks = await generateTasks(projectId, prompt);

    // Create tasks in database
    const createdTasks = await Promise.all(
      generatedTasks.map(async (task, index) => {
        return await db.insert(tasks)
          .values({
            title: task.title,
            description: task.description,
            status: TaskStatus.TODO,
            projectId: projectId,
            createdAt: new Date(),
            completed: false,
            order: index
          })
          .returning();
      })
    );

    res.json({ tasks: createdTasks });
  } catch (error) {
    console.error('Error in generate-tasks route:', error);
    res.status(500).json({ error: "Failed to generate tasks" });
  }
});

export default router;
