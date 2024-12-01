import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, File, Comment } from "@db/schema";
import { useTasks } from "../hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

interface TaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDialog({ task, isOpen, onClose }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    assignedToId: task.assignedToId,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateTask } = useTasks(task.projectId ?? 0);

  const uploadFile = useMutation({
    mutationFn: async (file: Blob) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/tasks/${task.id}/files`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload file");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", task.id] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const { data: files = [] } = useQuery({
    queryKey: ["files", task.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}/files`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["project-members", task.projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${task.projectId}/members`);
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    }
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
      await updateTask({
        taskId: task.id,
        updates: {
          title: editedTask.title.trim(),
          description: editedTask.description?.trim() || null,
          status: editedTask.status || "todo",
          assignedToId: editedTask.assignedToId,
        },
      });
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      onClose();
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
              <Label>Assignee</Label>
              <Select
                value={editedTask.assignedToId?.toString() ?? "unassigned"}
                onValueChange={(value) => {
                  const assignedToId = value === "unassigned" ? null : parseInt(value);
                  setEditedTask({ ...editedTask, assignedToId });
                  if (!isEditing) {
                    updateTask({ 
                      taskId: task.id, 
                      updates: { assignedToId } 
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {members.map((member: { userId: number; username: string }) => (
                    <SelectItem key={member.userId} value={member.userId.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {member.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.username}</span>
                      </div>
                    </SelectItem>
                  ))}
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
              <Input
                type="file"
                className="mb-2"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile.mutate(file);
                }}
                disabled={uploadFile.isPending}
              />
              <div className="grid grid-cols-1 gap-2">
                {files.map((file: File) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm truncate">{file.originalName}</span>
                    <a
                      href={`/api/files/${file.filename}`}
                      download={file.originalName}
                      className="ml-2"
                    >
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
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
                comments.map((comment: Comment) => (
                  <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {comment.createdAt && format(new Date(comment.createdAt), "MMM d, yyyy")}
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
