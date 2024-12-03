export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: number;
  assigneeId?: number;
  createdAt: Date;
  dueDate?: Date;
  completed: boolean;
}
