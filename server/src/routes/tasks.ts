import express from 'express';
import { prisma } from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { projectId, title, description, status } = req.body;
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status
      }
    });
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export default router;
