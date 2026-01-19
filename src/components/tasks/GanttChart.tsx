"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  tasks: Array<{
    id: string;
    title: string;
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: Date | null;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    description?: string;
  }>;
}

export default function GanttChart({ tasks }: GanttChartProps) {
  // Simple Gantt implementation for visualization
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getPriorityColor = (priority: GanttChartProps["tasks"][number]["priority"]) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return "bg-crimson border-crimson shadow-crimson/20";
      case "MEDIUM":
        return "bg-sunny border-sunny shadow-sunny/20";
      case "LOW":
        return "bg-teal border-teal shadow-teal/20";
      default:
        const _exhaustiveCheck: never = priority;
        throw new Error(`Unhandled priority: ${_exhaustiveCheck}`);
    }
  };

  const getBarPosition = (task: GanttChartProps["tasks"][number], timelineStart: Date, timelineEnd: Date) => {
    const taskStart = task.startDate ?? task.createdAt;
    const taskEnd = task.endDate ?? task.dueDate ?? new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const duration = taskEnd.getTime() - taskStart.getTime();
    const left = ((taskStart.getTime() - timelineStart.getTime()) / totalDuration) * 100;
    const width = (duration / totalDuration) * 100;
    return {
      left: Math.max(0, Math.min(100, left)),
      width: Math.max(5, Math.min(100 - left, width))
    };
  };

  const timelineStart = new Date(Math.min(...sortedTasks.map(task => new Date(task.startDate ?? task.createdAt).getTime())));
  const timelineEnd = new Date(Math.max(...sortedTasks.map(task => new Date(task.endDate ?? task.dueDate ?? new Date((task.startDate ?? task.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)).getTime())));

  return (
    <div className="bg-canvas p-6 rounded-3xl border-2 border-gray-100 shadow-xl relative overflow-hidden">
      {/* Texture bg */}
      <div className="absolute inset-0 bg-paper opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
              <div className="w-4 h-4 bg-crimson rounded-sm rotate-12" />
              Project Timeline
           </h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-crimson rounded-full" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgent</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-sunny rounded-full" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-teal rounded-full" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Regular</span>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[600px] space-y-4">
            {/* Timeline header */}
            <div className="flex border-b border-gray-100 pb-2 mb-6">
               <div className="w-48 flex-shrink-0" />
               <div className="flex-1 flex justify-between px-2 text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                  <span>Start</span>
                  <span>Middle</span>
                  <span>Goal</span>
               </div>
            </div>

             {sortedTasks.map((task) => {
               const { left, width } = getBarPosition(task, timelineStart, timelineEnd);
               return (
                 <div key={task.id} className="flex items-center group">
                   <div className="w-48 pr-4 flex-shrink-0">
                     <span className="text-xs font-bold text-gray-600 line-clamp-1 group-hover:text-crimson transition-colors">
                       {task.title}
                     </span>
                   </div>
                   <div className="flex-1 h-3 bg-gray-50 rounded-full relative overflow-hidden">
                      <div
                        className={cn(
                          "absolute h-full rounded-full border shadow-sm transition-all duration-700 ease-out",
                          getPriorityColor(task.priority)
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          opacity: task.status === "COMPLETED" ? 0.4 : 1
                        }}
                      />
                   </div>
                 </div>
               );
             })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 border-dashed text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
              "The best way to predict the future is to create it."
           </p>
        </div>
      </div>
    </div>
  );
}
