"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@prisma/client";
import ProgressRing from "./ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Paperclip } from "lucide-react";
import { PushPin } from "@/components/ui/HandDrawnElements";


interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: ProjectStatus;
    deadline: Date | null;
    _count?: {
      tasks: number;
    };
    completedTasks?: number;
  };
}

const statusVariants: Record<ProjectStatus, "info" | "success" | "warning" | "danger" | "default" | "secondary"> = {
  IDEATION: "info",
  PROPOSAL: "secondary",
  RESEARCH: "warning",
  DEVELOPMENT: "info",
  WRITING: "info",
  REVIEW: "warning",
  COMPLETED: "success",
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const completionPercentage = project._count?.tasks && project._count.tasks > 0
    ? ((project.completedTasks || 0) / project._count.tasks) * 100 
    : 0;

// Anti-AI: Deterministic subtle rotation for pinned feel based on project.id
  const rotations = ["rotate-1", "-rotate-1", "rotate-0", "rotate-[0.5deg]", "-rotate-[0.5deg]"];
  const isDraft = project.status === "IDEATION";
  const rotation = rotations[project.id.charCodeAt(0) % rotations.length];

  return (
    <Link href={`/projects/${project.id}`} className={cn("block transition-all duration-300 hover:scale-[1.02] hover:z-20", rotation)}>
      <div className={cn(
        "bg-paper p-6 rounded-lg shadow-md border border-gray-100 relative group flex flex-col h-full min-h-[220px]",
        isDraft && "border-dashed border-gray-300 bg-gray-50/50"
      )}>
        {/* Pushpin decor */}
        <PushPin className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex justify-between items-start mb-4">
<Badge variant={isDraft ? "default" : (statusVariants[project.status] || "default")}>
            {isDraft ? "Draft" : project.status.replace(/_/g, " ")}
          </Badge>
          <ProgressRing value={completionPercentage} size={36} strokeWidth={3} className={isDraft ? "text-gray-400" : "text-crimson"} />
        </div>
        
        <h3 className="text-lg font-heading font-extrabold mb-2 text-gray-900 group-hover:text-crimson transition-colors leading-tight">
          {project.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow font-body italic">
           "{project.description || "Fresh project waiting for structure."}"
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 border-dashed">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-sunny" />
            <span>
              {project.deadline 
                ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(project.deadline))
                : "Open Draft"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{project._count?.tasks || 0} Assets</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

