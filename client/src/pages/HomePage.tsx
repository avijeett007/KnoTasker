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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="gradient-text text-2xl font-bold">KnoTasker</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username || user?.email?.split("@")[0]}
            </span>
            <Button variant="ghost" onClick={() => logout()} className="hover:text-primary transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="gradient-text text-3xl font-bold">Your Projects</h2>
            <p className="text-muted-foreground">
              Manage and track your projects progress
            </p>
          </div>
          <Dialog
            open={isNewProjectDialogOpen}
            onOpenChange={setIsNewProjectDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="animated-button">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10">
              <DialogHeader>
                <DialogTitle className="gradient-text text-2xl">Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="glass-card bg-transparent"
                />
                <Textarea
                  placeholder="Project description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="glass-card bg-transparent"
                />
                <ProjectTypeSelector
                  onSelect={(typeId) => setSelectedProjectType(typeId)}
                />
                <Button
                  onClick={handleCreateProject}
                  disabled={!selectedProjectType}
                  className="w-full animated-button"
                >
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card animate-pulse h-48"></div>
            ))}
          </div>
        ) : projects?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="glass-card h-48 transition-transform hover:scale-105 cursor-pointer group">
                  <CardHeader>
                    <CardContent>
                      <h3 className="gradient-text text-xl font-semibold mb-2 group-hover:scale-105 transition-transform">
                        {project.name}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>
                    </CardContent>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              No projects yet. Create your first project to get started!
            </p>
            <Button
              onClick={() => setIsNewProjectDialogOpen(true)}
              className="animated-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
