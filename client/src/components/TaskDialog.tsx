import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { Task } from "@db/schema";
import { useTasks } from "../hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDialog({ task, isOpen, onClose }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(() => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status || "todo",
    projectId: task.projectId,
    assignedToId: task.assignedToId,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    order: task.order
  }));

  useEffect(() => {
    setEditedTask({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status || "todo",
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      createdById: task.createdById,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      order: task.order
    });
  }, [task]);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { updateTask } = useTasks(task.projectId!);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!editedTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateTask({
        taskId: task.id,
        updates: {
          title: editedTask.title.trim(),
          description: editedTask.description?.trim() || null,
          status: editedTask.status || "todo",
        },
      });
      
      setEditedTask(result);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      onClose(); // Close the dialog after successful update
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            {isEditing ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-semibold"
              />
            ) : (
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
            )}
            <Button 
              variant="ghost" 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save"
              ) : (
                "Edit"
              )}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) => {
                  setEditedTask({ ...editedTask, status: value });
                  if (!isEditing) {
                    updateTask({ taskId: task.id, updates: { status: value } });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Created</Label>
              <div className="text-sm text-muted-foreground">
                {format(new Date(task.createdAt || new Date()), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-muted-foreground">
                {task.description || "No description provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border rounded-lg p-4">
              <Input type="file" className="mb-2" disabled />
              <p className="text-sm text-muted-foreground">File attachments coming soon</p>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium">Comments</h3>
            <div className="space-y-4">
              <Textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
              />
              <Button 
                onClick={() => comment.trim() && addComment.mutate(comment.trim())}
                disabled={addComment.isPending || !comment.trim()}
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Comment
              </Button>
            </div>
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
