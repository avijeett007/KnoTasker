import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProjectHeader } from "../components/ProjectHeader";
import { ProjectBoard } from "../components/ProjectBoard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@db/schema";

export function ProjectPage() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id ? parseInt(params.id) : 0;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">
            Error loading project
          </p>
          <Link href="/projects">
            <Button className="animated-button">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-background to-background">
      <div className="sticky top-0 z-10 bg-background/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="gradient-text text-2xl font-bold">KnoTasker</h1>
          </div>
        </div>
      </div>

      <ProjectHeader project={project} />

      <main className="container mx-auto px-4 py-8">
        <div className="glass-card p-6">
          <ProjectBoard projectId={project.id} />
        </div>
      </main>
    </div>
  );
}
