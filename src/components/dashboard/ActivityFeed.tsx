// i will Review this later
"use client";

import React, { useCallback } from "react";
import { MessageSquare, CheckCircle, PlusCircle, UserPlus, Info, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType = "TASK_CREATED" | "TASK_COMPLETED" | "PROJECT_CREATED" | "MEMBER_ADDED" | "STATUS_CHANGE";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
  };
  target: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const icons: Record<ActivityType, React.ReactNode> = {
  TASK_CREATED: <PlusCircle className="w-4 h-4" />,
  TASK_COMPLETED: <CheckCircle className="w-4 h-4 text-teal" />,
  PROJECT_CREATED: <Info className="w-4 h-4 text-crimson" />,
  MEMBER_ADDED: <UserPlus className="w-4 h-4 text-sunny" />,
  STATUS_CHANGE: <MessageSquare className="w-4 h-4 text-teal" />,
};

const labels: Record<ActivityType, string> = {
  TASK_CREATED: "sketched out",
  TASK_COMPLETED: "finalized",
  PROJECT_CREATED: "founded",
  MEMBER_ADDED: "brought in",
  STATUS_CHANGE: "reshaped",
};

// Move formatTime outside the component and handle edge cases
const formatTime = (date: Date) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  
  // Handle future dates
  if (diff < 0) {
    const futureDiff = Math.abs(diff);
    const minutes = Math.floor(futureDiff / (1000 * 60));
    if (minutes < 1) return "very soon";
    const hours = Math.floor(futureDiff / (1000 * 60 * 60));
    if (hours < 1) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;
    return `in ${Math.floor(hours / 24)}d`;
  }
  
  // Handle past dates
  if (diff < 60000) return "just now"; // Less than 1 minute
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewHistory?: () => void; // Optional handler for history button
}

export default function ActivityFeed({ activities, onViewHistory }: ActivityFeedProps) {
  const handleTargetClick = useCallback((activity: ActivityItem) => {
    // Implement navigation or other action based on activity target
    console.log("Activity target clicked:", activity.target);
    // Example: You could navigate to the target resource here
    // navigateToTarget(activity.target);
  }, []);

  return (
    <div className="bg-paper p-6 rounded-3xl border-2 border-yellow-400 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Texture bg */}
      <div className="absolute inset-0 bg-paper opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 border-dashed pb-4">
          <h3 className="font-heading font-extrabold text-gray-900 text-lg">Activity Feed</h3>
          <div className="px-2 py-0.5 bg-sunny/20 border border-sunny/30 rounded-full">
             <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Live Feed</span>
          </div>
        </div>

        <ul className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity, idx) => (
              <li key={activity.id} className="relative flex gap-6 group">
                {/* Hand-drawn timeline connector */}
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[13px] top-8 bottom-[-32px] w-[2px] bg-gray-100 border-l border-dashed border-gray-300" />
                )}
                
                <div className="relative z-10 w-7 h-7 rounded-sm rotate-3 flex-shrink-0 bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:rotate-0 transition-transform group-hover:border-crimson/30 group-hover:text-crimson">
                  {icons[activity.type]}
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="text-sm font-body leading-tight text-gray-600">
                    <span className="font-extrabold text-gray-900">{activity.user.name}</span>{" "}
                    <span className="italic opacity-80">{labels[activity.type]}</span>{" "}
                    <button
                      className="font-bold text-crimson group-hover:underline underline-offset-4 cursor-pointer bg-transparent border-none p-0"
                      onClick={() => handleTargetClick(activity)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTargetClick(activity)}
                      aria-label={`View ${activity.target}`}
                      tabIndex={0}
                    >
                      {activity.target}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest bg-gray-50 px-2 py-0.5 rounded-full">
                       {formatTime(activity.timestamp)}
                     </span>
                     {idx === 0 && <span className="text-[8px] text-teal font-bold uppercase animate-pulse">Just In</span>}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div className="py-12 text-center">
               <Sparkle className="w-8 h-8 text-gray-100 mx-auto mb-4" />
               <p className="text-sm text-gray-400 font-body italic">
                  Peaceful campus today. No new movements.
               </p>
            </div>
          )}
        </ul>

        <div className="mt-12 pt-6 border-t border-gray-100 border-dashed">
           <button
             className={`w-full py-3 bg-white border-2 rounded-xl text-xs font-bold transition-all font-heading uppercase tracking-widest ${
               onViewHistory
                 ? "border-gray-100 text-gray-400 hover:text-crimson hover:border-crimson/20"
                 : "border-gray-100 text-gray-300 cursor-not-allowed"
             }`}
             onClick={onViewHistory}
             disabled={!onViewHistory}
             aria-disabled={!onViewHistory}
           >
              View History Log
           </button>
        </div>
      </div>
    </div>
  );
}
