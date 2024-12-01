import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <nav className="container mx-auto p-4">
        <Logo size="md" />
      </nav>
      
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center gap-8 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <Logo size="lg" className="justify-center" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Organize Your Tasks,<br />Unlock Your Potential
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into actionable tasks. KnoTasker helps you manage projects
            with an intuitive Kanban board system designed for maximum productivity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-x-4"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            onClick={() => setLocation("/auth")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              const demoSection = document.getElementById("demo");
              demoSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See How It Works
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative w-full max-w-5xl mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-500/30 rounded-lg blur-xl"></div>
          <div className="relative bg-card rounded-lg border shadow-2xl overflow-hidden">
            <img
              src="/demo-board.png"
              alt="KnoTasker Demo"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </main>

      <section id="demo" className="container mx-auto py-20 space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">How KnoTasker Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple yet powerful project management tool that adapts to your workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-card rounded-lg p-6 border"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto p-8 text-center text-muted-foreground">
          <Logo size="sm" className="justify-center mb-4" />
          <p> 2024 KnoTasker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Project Templates",
    description: "Start quickly with pre-built project templates or create your own custom workflow.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    title: "Kanban Boards",
    description: "Visualize your workflow with customizable Kanban boards that keep your team aligned.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    title: "Real-time Updates",
    description: "Stay in sync with your team through real-time updates and notifications.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];
