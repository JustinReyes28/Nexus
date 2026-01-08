"use client";

import React from "react";
import Link from "next/link";
import { ProjectStatus } from "@prisma/client";
import ProgressRing from "./ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Users } from "lucide-react";

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

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group">
        <div className="flex justify-between items-start mb-4">
          <Badge variant={statusVariants[project.status] || "default"}>
            {project.status.replace("_", " ")}
          </Badge>
          <ProgressRing value={completionPercentage} size={40} strokeWidth={3} />
        </div>
        
        <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow">
          {project.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t pt-4 font-medium uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {project.deadline 
                ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(project.deadline))
                : "No deadline"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{project._count?.tasks || 0} tasks</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
