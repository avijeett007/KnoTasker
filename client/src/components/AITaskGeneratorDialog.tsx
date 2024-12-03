import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "../../../shared/types";

interface AITaskGeneratorDialogProps {
  projectId: number;
}

interface GeneratedTask {
  title: string;
  description: string;
}

export function AITaskGeneratorDialog({ projectId }: AITaskGeneratorDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const generateTasksMutation = useMutation<GeneratedTask[], Error, { projectId: number; prompt: string }>({
    mutationFn: async ({ projectId, prompt }: { projectId: number; prompt: string }) => {
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tasks");
      }

      const data = await response.json();
      return data.tasks;
    },
    onSuccess: async (tasks) => {
      // Create each generated task
      for (const task of tasks) {
        await createTask(task);
      }
      
      // Reset form and close dialog
      setPrompt("");
      setIsOpen(false);
      
      // Refresh tasks list
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const createTask = async (task: GeneratedTask) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        title: task.title,
        description: task.description,
        status: TaskStatus.TODO,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return response.json();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTasksMutation.mutate({ projectId, prompt });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          title="Generate tasks with AI"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Tasks with AI</DialogTitle>
          <DialogDescription>
            Describe your project and I'll help you break it down into tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="e.g., I want to create a blog website with user authentication, comments, and a rich text editor..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!prompt || generateTasksMutation.isPending}
              className="w-full"
            >
              {generateTasksMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
