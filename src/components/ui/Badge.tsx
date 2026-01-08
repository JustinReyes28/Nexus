import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "primary";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-800 border border-gray-200",
  secondary: "bg-sunny/20 text-gray-900 border border-sunny",
  success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  warning: "bg-sunny text-gray-900 border border-sunny/50",
  danger: "bg-crimson/10 text-crimson border border-crimson/20",
  info: "bg-teal/10 text-teal border border-teal/20",
  primary: "bg-crimson text-white",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
      variants[variant as keyof typeof variants],
      "rounded-[6px]", // Anti-AI imperfection: non-perfectly round pill
      className
    )}>
      {children}
    </span>
  );
}

