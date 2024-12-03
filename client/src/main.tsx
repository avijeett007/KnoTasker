import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProjectListPage } from "@/pages/ProjectListPage";
import { NewProjectPage } from "@/pages/NewProjectPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { useUser } from "@/hooks/use-user";
import "./index.css";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!user) {
    window.location.href = "/auth";
    return null;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (user) {
    window.location.href = "/projects";
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="knotasker-theme">
        <Router>
          <Switch>
            <Route path="/">
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            </Route>
            <Route path="/auth">
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            </Route>
            <Route path="/projects">
              <ProtectedRoute>
                <ProjectListPage />
              </ProtectedRoute>
            </Route>
            <Route path="/project/new">
              <ProtectedRoute>
                <NewProjectPage />
              </ProtectedRoute>
            </Route>
            <Route path="/project/:id">
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
