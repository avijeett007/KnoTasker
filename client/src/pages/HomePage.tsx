import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "../hooks/use-user";
import { useProjects } from "../hooks/use-projects";
import { ProjectTypeSelector } from "../components/ProjectTypeSelector";
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
import { Plus, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useUser();
  const { projects, createProject, isLoading } = useProjects();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState<number>();

  const handleCreateProject = () => {
    if (selectedProjectType) {
      createProject({
        name: newProjectName,
        description: newProjectDescription,
        typeId: selectedProjectType,
      });
      setIsNewProjectDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setSelectedProjectType(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Project Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="ghost" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Your Projects</h2>
            <p className="text-muted-foreground">
              Manage and track your projects progress
            </p>
          </div>
          <Dialog
            open={isNewProjectDialogOpen}
            onOpenChange={setIsNewProjectDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <Textarea
                  placeholder="Project description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
                <ProjectTypeSelector
                  onSelect={(typeId) => setSelectedProjectType(typeId)}
                />
                <Button
                  onClick={handleCreateProject}
                  disabled={!selectedProjectType}
                >
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p>Loading projects...</p>
          ) : (
            projects?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div
                      className="h-32 rounded-t-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1622050756792-5b1180bbb873)`,
                      }}
                    />
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-2">
                      {project.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
