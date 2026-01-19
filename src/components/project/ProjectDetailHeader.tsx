// i will Review this later
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { ProjectStatus } from "@prisma/client";

interface ProjectDetailHeaderProps {
  project: {
    id: string;
    title: string;
    status: ProjectStatus;
    discipline: string | null;
    deadline: Date | string | null;
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

export default function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const isDraft = project.status === "IDEATION";
  
  return (
    <div className="flex flex-col gap-6 pb-8 border-b-2 border-gray-100 border-dashed animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-gray-400 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          <Sparkles className="w-3.5 h-3.5 text-sunny" />
          <span>Project ID: {project.id.slice(-6)}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Badge variant={isDraft ? "default" : statusVariants[project.status]}>
               {isDraft ? "Draft Mode" : project.status.replaceAll("_", " ")}
             </Badge>
             {project.discipline && (
               <div className="flex items-center gap-1.5 text-xs font-bold text-teal uppercase tracking-wider">
                 <Lightbulb className="w-3.5 h-3.5" />
                 {project.discipline}
               </div>
             )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            {project.title}
            <WavyUnderline className="text-crimson/20" />
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
            <Calendar className="w-4 h-4 text-sunny" />
            <span>
              {project.deadline
                ? (() => {
                    const date = new Date(project.deadline);
                    return isNaN(date.getTime())
                      ? "Invalid deadline"
                      : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date)
                  })()
                : "No Deadline Set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
