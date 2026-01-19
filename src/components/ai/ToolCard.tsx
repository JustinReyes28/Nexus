// i will Review this later
"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  isActive,
  onClick,
  index,
}) => {
  // Organic rotation based on index
  const rotation = index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";
  const activeRotation = index % 2 === 0 ? "rotate-1" : "-rotate-1";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "group relative flex flex-col items-start p-6 text-left transition-all duration-300 rounded-2xl border-2",
        "bg-white shadow-lg hover:shadow-xl",
        isActive
          ? cn("border-teal bg-teal/5 shadow-teal/10", activeRotation)
          : "border-gray-100 hover:border-teal/30 hover:bg-canvas/50",
        rotation
      )}
    >
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none rounded-2xl" />
      
      {/* Icon with Aura */}
      <div className={cn(
        "mb-4 p-3 rounded-xl transition-all duration-300",
        isActive 
          ? "bg-teal text-white shadow-lg shadow-teal/20 scale-110" 
          : "bg-gray-50 text-gray-400 group-hover:bg-teal/10 group-hover:text-teal group-hover:scale-110",
        color
      )}>
        <Icon size={24} strokeWidth={2.5} className={color} />
      </div>

      <h3 className={cn(
        "text-lg font-heading font-extrabold leading-tight mb-2 transition-colors",
        isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-xs font-body leading-relaxed transition-colors",
        isActive ? "text-teal/80 font-medium" : "text-gray-400 group-hover:text-gray-500"
      )}>
        {description}
      </p>

      {/* Active Indicator Sparkle */}
      {isActive && (
        <div className="absolute top-4 right-4 animate-pulse-organic">
          <div className="w-2 h-2 rounded-full bg-teal shadow-[0_0_8px_rgba(6,214,160,0.6)]" />
        </div>
      )}

      {/* Hand-drawn accent for inactive cards on hover */}
      {!isActive && (
        <div className="absolute -bottom-1 left-4 right-4 h-1 bg-teal/0 group-hover:bg-teal/10 rounded-full blur-sm transition-all duration-300" />
      )}
    </button>
  );
};
