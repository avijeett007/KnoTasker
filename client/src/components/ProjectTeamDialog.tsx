import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ProjectMember } from "@db/schema";

interface ProjectTeamDialogProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectTeamDialog({ projectId, isOpen, onClose }: ProjectTeamDialogProps) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: members = [] } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    }
  });
  
  const addMember = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      if (!response.ok) throw new Error("Failed to add member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      setUsername("");
      toast({
        title: "Success",
        description: "Member added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: number) => {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to remove member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
      toast({
        title: "Success",
        description: "Member removed successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button 
              onClick={() => username && addMember.mutate(username)}
              disabled={addMember.isPending}
            >
              Add Member
            </Button>
          </div>
          
          <div className="space-y-2">
            {members.map((member: ProjectMember) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{member.username}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
                {member.role !== "owner" && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember.mutate(member.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
