import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { ProjectTypeSelector } from "@/components/ProjectTypeSelector";

export function NewProjectPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const { logout } = useAuth();

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; typeId: number }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create project");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setLocation("/projects");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const typeId = parseInt(formData.get("typeId") as string);

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project name is required",
      });
      return;
    }

    if (!typeId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project type is required",
      });
      return;
    }

    createProjectMutation.mutate({ name, description, typeId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.email?.split("@")[0]}
            </span>
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text mb-4">
              Create New Project
            </h1>
            <p className="text-xl text-muted-foreground">
              Set up your project and start organizing your tasks
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-8 bg-card p-8 rounded-lg border"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter project description"
                rows={4}
              />
            </div>

            <input type="hidden" name="typeId" id="typeId" />
            <ProjectTypeSelector
              onSelect={(typeId) => {
                const input = document.getElementById("typeId") as HTMLInputElement;
                input.value = typeId.toString();
              }}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/projects")}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </main>
    </div>
  );
}
