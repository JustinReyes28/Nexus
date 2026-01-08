"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Flame, Star } from "lucide-react";


interface DeadlineItem {
  id: string;
  title: string;
  dueDate: Date;
  type: "PROJECT" | "TASK";
}

interface DeadlineWidgetProps {
  deadlines: DeadlineItem[];
}

export default function DeadlineWidget({ deadlines }: DeadlineWidgetProps) {
  const getUrgencyStyles = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "bg-red-500 text-white rotate-1";
    if (diffDays <= 3) return "bg-sunny text-gray-900 -rotate-1 shadow-sunny/20";
    return "bg-white text-gray-700 border border-gray-100 rotate-0";
  };

  const getUrgencyLabel = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "LATE 💀";
    if (diffDays <= 3) return "HOT 🔥";
    return "CHILL ✨";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
         <h3 className="font-heading font-extrabold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-crimson" />
            Deadlines
         </h3>
         <button className="text-[10px] font-bold text-gray-400 hover:text-crimson transition-colors uppercase tracking-widest">
            See Master Plan
         </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {deadlines.length > 0 ? (
          deadlines.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "p-4 rounded-xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-between group",
                getUrgencyStyles(new Date(item.dueDate))
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold truncate max-w-[140px]">
                  {item.title}
                </span>
                <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
                  {item.type}
                </span>
              </div>
              
              <div className="text-right flex flex-col items-end">
                 <span className="text-xs font-handwritten font-bold mb-0.5">
                    {formatDate(new Date(item.dueDate))}
                 </span>
                 <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-black/5">
                    {getUrgencyLabel(new Date(item.dueDate))}
                 </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            <Star className="w-8 h-8 opacity-10 mx-auto mb-2" />
            <p className="text-xs font-handwritten">All clear! Go grab a coffee.</p>
          </div>
        )}
      </div>
    </div>
  );
}

