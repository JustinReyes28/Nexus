"use client";

import React from "react";
import { TaskStatus, Priority } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Calendar, CheckCircle2, Circle, Clock, MoreVertical, User } from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
    assignee?: {
      name: string | null;
      image: string | null;
    } | null;
  };
  onEdit?: (id: string) => void;
}

const priorityVariants: Record<Priority, "info" | "warning" | "danger" | "default"> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  URGENT: "danger",
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  TODO: <Circle className="w-4 h-4 text-gray-400" />,
  IN_PROGRESS: <Clock className="w-4 h-4 text-blue-500" />,
  REVIEW: <Clock className="w-4 h-4 text-purple-500" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4 text-green-500" />,
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group border-l-4" 
         style={{ borderLeftColor: isOverdue ? "#ef4444" : "transparent" }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {statusIcons[task.status]}
          <Badge variant={priorityVariants[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <button 
          onClick={() => onEdit?.(task.id)}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">
            {task.assignee?.image ? (
               <img src={task.assignee.image} alt={task.assignee.name || ""} className="w-full h-full rounded-full object-cover" />
            ) : (
               <User className="w-3 h-3" />
            )}
          </div>
          <span className="text-[10px] text-gray-500 truncate font-medium">
            {task.assignee?.name || "Unassigned"}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
          <Calendar className="w-3 h-3" />
          <span>
            {task.dueDate 
              ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate))
              : "No date"}
          </span>
        </div>
      </div>
    </div>
  );
}
