import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <Logo size="md" />
        <ThemeToggle />
      </nav>
      
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center gap-8 p-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left space-y-4"
          >
            <Logo size="lg" className="justify-center md:justify-start" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              Organize Your Tasks,<br />Unlock Your Potential
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your ideas into actionable tasks. KnoTasker helps you manage projects
              with an intuitive Kanban board system designed for maximum productivity.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-x-4 pt-4"
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden md:block relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-lg blur-xl -z-10"></div>
            <img 
              src="/images/hero.svg" 
              alt="Task Management" 
              className="w-full h-auto rounded-lg shadow-xl" 
            />
          </motion.div>
        </div>
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
              className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow"
            >
              <img src={feature.icon} alt={feature.title} className="w-12 h-12 mb-4" />
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
    title: "Work Projects",
    description: "Start quickly with pre-built project templates or create your own custom workflow.",
    icon: "/images/work.svg"
  },
  {
    title: "Education Tasks",
    description: "Organize your study materials and assignments with our education-focused templates.",
    icon: "/images/education.svg"
  },
  {
    title: "Personal Goals",
    description: "Track your personal goals and daily tasks with our intuitive interface.",
    icon: "/images/personal.svg"
  }
];
