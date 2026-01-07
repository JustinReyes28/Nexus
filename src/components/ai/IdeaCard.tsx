"use client";

import React from "react";
import { Lightbulb, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  title: string;
  description: string;
  feasibility: number;
  methodology?: string;
  className?: string;
  onSelect?: () => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  title,
  description,
  feasibility,
  methodology,
  className,
  onSelect,
}) => {
  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return "text-green-500 bg-green-50 dark:bg-green-950/30";
    if (score >= 5) return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
    return "text-red-500 bg-red-50 dark:bg-red-950/30";
  };

  return (
    <div 
      className={cn(
        "group relative border rounded-xl p-5 bg-card hover:shadow-md transition-all cursor-pointer border-border/50",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Lightbulb size={20} />
        </div>
        <div className={cn("px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5", getFeasibilityColor(feasibility))}>
          <TrendingUp size={14} />
          {feasibility}/10 Feasibility
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {description}
      </p>

      {methodology && (
        <div className="mt-4 pt-4 border-t border-dashed flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-primary" />
            Recommended Methodology
          </span>
          <p className="text-xs italic text-muted-foreground line-clamp-2">
            {methodology}
          </p>
        </div>
      )}

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-xl transition-all" />
    </div>
  );
};
