import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text",
        "transition-all duration-300 hover:scale-105",
        sizeClasses[size]
      )}>
        KnoTasker
      </div>
      <div className="relative w-6 h-6 animate-spin-slow">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-75 blur"></div>
        <div className="absolute inset-1 bg-black rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
