"use client";

import React from "react";
import { TaskStatus } from "@prisma/client";

interface TaskItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
}

interface GanttChartProps {
  tasks: TaskItem[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  if (tasks.length === 0) return null;

  // Find min and max dates
  const minDate = new Date(Math.min(...tasks.map(t => t.startDate.getTime())));
  const maxDate = new Date(Math.max(...tasks.map(t => t.endDate.getTime())));
  
  // Add some padding
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 5);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const statusColors: Record<TaskStatus, string> = {
    TODO: "bg-gray-200",
    IN_PROGRESS: "bg-blue-400",
    REVIEW: "bg-purple-400",
    COMPLETED: "bg-green-500",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Timeline visualization</h3>
      </div>
      <div className="p-6 overflow-x-auto">
        <div className="relative" style={{ minWidth: 800 }}>
          {/* Timeline header */}
          <div className="flex border-b mb-8 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
             <div className="w-48 flex-shrink-0">Task</div>
             <div className="flex-grow flex justify-between px-4">
                <span>{minDate.toLocaleDateString()}</span>
                <span>Timeline</span>
                <span>{maxDate.toLocaleDateString()}</span>
             </div>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const startOffset = Math.ceil((task.startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
              const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
              
              const left = (startOffset / totalDays) * 100;
              const width = (duration / totalDays) * 100;

              return (
                <div key={task.id} className="flex items-center group">
                  <div className="w-48 flex-shrink-0 text-sm font-medium text-gray-600 truncate pr-4">
                    {task.title}
                  </div>
                  <div className="flex-grow h-6 bg-gray-50 rounded-full relative">
                    <div 
                      className={`absolute h-full rounded-full ${statusColors[task.status]} shadow-sm group-hover:scale-y-110 transition-transform cursor-pointer`}
                      style={{ 
                        left: `${left}%`, 
                        width: `${Math.max(width, 2)}%`,
                        minWidth: "1rem"
                      }}
                      title={`${task.title}: ${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today marker */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-red-400 z-10 opacity-50 pointer-events-none"
            style={{ 
              left: `${((new Date().getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
