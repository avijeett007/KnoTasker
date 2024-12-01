import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  typeId: number;
}

const PROJECT_TYPES = [
  {
    id: 1,
    name: "Web Development",
    color: "from-purple-600 to-blue-500",
  },
  {
    id: 2,
    name: "YouTube Video",
    color: "from-pink-600 to-rose-500",
  },
  {
    id: 3,
    name: "Livestreaming",
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: 4,
    name: "Course Creation",
    color: "from-orange-600 to-red-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ProjectListPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { logout } = useAuth();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text mb-4">
            Your Projects
          </h1>
          <p className="text-xl text-muted-foreground">
            Create and manage your projects with our intuitive Kanban boards
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-card hover:bg-card/50 rounded-lg border-2 border-dashed border-muted p-6 cursor-pointer transition-all"
            onClick={() => setLocation("/project/new")}
          >
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground group-hover:text-primary">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium">Create New Project</p>
            </div>
          </motion.div>

          {projects.map((project) => {
            const projectType = PROJECT_TYPES.find((type) => type.id === project.typeId) || PROJECT_TYPES[0];
            return (
              <motion.div
                key={project.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-card hover:bg-card/50 rounded-lg border overflow-hidden transition-all"
                onClick={() => setLocation(`/project/${project.id}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${projectType.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative p-6">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{projectType.name}</span>
                      <span>
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {isLoading && (
            <motion.div
              variants={item}
              className="col-span-full text-center text-muted-foreground"
            >
              Loading projects...
            </motion.div>
          )}

          {!isLoading && projects.length === 0 && (
            <motion.div
              variants={item}
              className="col-span-full text-center text-muted-foreground"
            >
              No projects yet. Create your first project!
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
