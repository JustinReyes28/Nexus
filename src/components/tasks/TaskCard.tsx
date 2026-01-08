"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Calendar, AlertCircle, Clock, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PushPin } from "@/components/ui/HandDrawnElements";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
  };
  onStatusChange?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
}


export default function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
  const isCompleted = task.status === "COMPLETED";

  const priorityVariants = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "danger",
    URGENT: "danger",
  };

  return (
    <div 
      className={cn(
        "bg-paper p-5 rounded-xl border-2 border-gray-100 shadow-sm transition-all duration-300 relative group hover:shadow-xl hover:-translate-y-1",
        isOverdue ? "border-l-4 border-l-crimson" : "border-l-4 border-l-teal",
        isCompleted && "opacity-70 grayscale-[0.5]"
      )}
      onClick={() => onEdit?.(task.id)}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-paper opacity-50 pointer-events-none rounded-xl" />
      <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none rounded-xl" />

      {/* Pushpin indicator for specific tasks */}
      {task.priority === "HIGH" && (
        <div className="absolute -top-3 -right-3 z-20">
           <PushPin className="w-6 h-6 rotate-12 drop-shadow-md" />
        </div>
      )}

      <div className="flex items-start gap-4 relative z-10">
        <Checkbox 
          id={task.id} 
          checked={isCompleted}
          onCheckedChange={(checked: boolean) => onStatusChange?.(task.id, checked)}
          className="mt-1.5"
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              "font-heading font-extrabold text-gray-900 leading-tight transition-all text-lg",
              isCompleted && "line-through text-gray-400"
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-1">
               <Badge variant={priorityVariants[task.priority as keyof typeof priorityVariants] as any} className="text-[8px] h-4">
                 {task.priority}
               </Badge>
               <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(task.id); }}
                className="text-gray-300 hover:text-gray-600 transition-colors"
               >
                  <MoreVertical className="w-4 h-4" />
               </button>
            </div>
          </div>

          
          {task.description && (
            <p className="text-sm text-gray-500 font-body italic line-clamp-2">
              "{task.description}"
            </p>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 border-dashed">
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
              isOverdue ? "text-crimson" : "text-gray-400"
            )}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 text-sunny" />}
              <span>
                {task.dueDate 
                  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate))
                  : "No date"}
              </span>
            </div>
            
            {isOverdue && (
              <span className="text-[8px] bg-crimson text-white px-2 py-0.5 rounded-full font-bold animate-pulse">OVERDUE</span>
            )}
            
            {isCompleted && (
              <span className="text-[8px] bg-teal text-white px-2 py-0.5 rounded-full font-bold">DONE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
