import { Project } from "@db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Users } from "lucide-react";
import { ProjectTeamDialog } from "./ProjectTeamDialog";
import { AITaskGeneratorDialog } from "./AITaskGeneratorDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTasks } from "../hooks/use-tasks";
import { TaskStatus } from "../../../shared/types";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const { createTask } = useTasks(project.id);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({
      title: newTaskTitle,
      description: newTaskDescription,
      status: TaskStatus.TODO,
      order: 0,
    });
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsNewTaskDialogOpen(false);
  };

  return (
    <div
      className="p-6 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1531545514256-b1400bc00f31)`,
      }}
    >
      <div className="flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm opacity-90">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <AITaskGeneratorDialog projectId={project.id} />
          <Button variant="secondary" onClick={() => setIsTeamDialogOpen(true)} className="mr-2">
            <Users className="h-4 w-4 mr-2" />
            Team
          </Button>
          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Task description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!newTaskTitle}>
                    Create Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ProjectTeamDialog
        projectId={project.id}
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
      />
    </div>
  );
}
