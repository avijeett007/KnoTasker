import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function generateGradient(seed: string) {
  const colors = [
    ["from-purple-600", "to-blue-500"],
    ["from-emerald-600", "to-teal-500"],
    ["from-orange-600", "to-red-500"],
    ["from-pink-600", "to-rose-500"],
    ["from-blue-600", "to-cyan-500"],
    ["from-yellow-600", "to-amber-500"],
  ];

  const index = Math.abs(
    seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % colors.length;

  return colors[index];
}
