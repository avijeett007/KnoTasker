import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
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

interface TaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDialog({ task, isOpen, onClose }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { updateTask } = useTasks(task.projectId!);
  const { toast } = useToast();

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
      const updatedTask = await updateTask({
        taskId: task.id,
        updates: {
          title: editedTask.title.trim(),
          description: editedTask.description?.trim() || null,
          status: editedTask.status,
        },
      });
      
      // Update the local state with the server response
      setEditedTask(updatedTask);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
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
                disabled
              />
              <Button disabled>
                Comments coming soon
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
