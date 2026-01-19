"use client";

import React from "react";
import ProgressRing from "@/components/dashboard/ProgressRing";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectProgressProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    todoTasks: number;
    inProgressTasks: number;
  };
  deadline: Date | string | null;
}

export default function ProjectProgress({ stats, deadline }: ProjectProgressProps) {
  const completionPercentage = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const timeLeft = deadline ? (() => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} left` : "Deadline passed";
  })() : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Visual Ring Section */}
      <div className="bg-canvas/50 border-2 border-dashed border-gray-100 rounded-2xl p-8 flex items-center justify-around group hover:border-crimson/20 transition-colors">
        <div className="relative">
          <ProgressRing 
            value={completionPercentage} 
            size={120} 
            strokeWidth={10} 
            className="text-crimson drop-shadow-sm" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-heading font-extrabold text-gray-900 leading-none">{completionPercentage}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Done</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-crimson/10 rounded-lg text-crimson">
               <Target className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Total Benchmarks</p>
               <p className="text-xl font-heading font-extrabold text-gray-900">{stats.totalTasks}</p>
             </div>
          </div>
          {timeLeft && (
            <div className="flex items-center gap-3">
               <div className="p-2 bg-sunny/10 rounded-lg text-sunny">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Time Horizon</p>
                 <p className={cn(
                   "text-xl font-heading font-extrabold",
                   timeLeft.includes("passed") ? "text-crimson" : "text-gray-900"
                 )}>{timeLeft}</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="space-y-4 flex flex-col justify-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          Progress Breakdown
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
           <BreakdownItem 
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} 
            label="Completed" 
            count={stats.completedTasks} 
            color="bg-green-500"
            percentage={(stats.completedTasks / (stats.totalTasks || 1)) * 100}
           />
           <BreakdownItem 
            icon={<Clock className="w-4 h-4 text-blue-500" />} 
            label="In Progress" 
            count={stats.inProgressTasks} 
            color="bg-blue-500"
            percentage={(stats.inProgressTasks / (stats.totalTasks || 1)) * 100}
           />
           <BreakdownItem 
            icon={<Circle className="w-4 h-4 text-gray-300" />} 
            label="To-Do" 
            count={stats.todoTasks} 
            color="bg-gray-200"
            percentage={(stats.todoTasks / (stats.totalTasks || 1)) * 100}
           />
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({ icon, label, count, color, percentage }: { 
  icon: React.ReactNode, 
  label: string, 
  count: number, 
  color: string,
  percentage: number
}) {
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden hidden sm:block">
          <div 
            className={cn("h-full transition-all duration-1000", color)} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        <span className="text-sm font-heading font-extrabold text-gray-900 min-w-[1.5rem] text-right">{count}</span>
      </div>
    </div>
  );
}
