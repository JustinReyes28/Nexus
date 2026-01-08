"use client";

import React from "react";
import { Clock, AlertCircle } from "lucide-react";

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
  const getUrgencyColor = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 bg-red-50";
    if (diffDays <= 3) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Upcoming Deadlines
        </h3>
      </div>
      <div className="divide-y flex-grow overflow-auto">
        {deadlines.length > 0 ? (
          deadlines.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  {item.type}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-md flex flex-col items-center min-w-[60px] ${getUrgencyColor(new Date(item.dueDate))}`}>
                <span className="text-xs font-bold">{formatDate(new Date(item.dueDate))}</span>
                <span className="text-[10px] opacity-75">
                  {Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 opacity-20" />
            <p className="text-sm">No upcoming deadlines</p>
          </div>
        )}
      </div>
    </div>
  );
}
