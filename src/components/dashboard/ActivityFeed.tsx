"use client";

import React from "react";
import { MessageSquare, CheckCircle, PlusCircle, UserPlus, Info } from "lucide-react";

type ActivityType = "TASK_CREATED" | "TASK_COMPLETED" | "PROJECT_CREATED" | "MEMBER_ADDED" | "STATUS_CHANGE";

interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    image?: string;
  };
  target: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const icons: Record<ActivityType, React.ReactNode> = {
  TASK_CREATED: <PlusCircle className="w-3.5 h-3.5" />,
  TASK_COMPLETED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  PROJECT_CREATED: <Info className="w-3.5 h-3.5 text-blue-500" />,
  MEMBER_ADDED: <UserPlus className="w-3.5 h-3.5 text-purple-500" />,
  STATUS_CHANGE: <MessageSquare className="w-3.5 h-3.5 text-amber-500" />,
};

const labels: Record<ActivityType, string> = {
  TASK_CREATED: "created task",
  TASK_COMPLETED: "completed task",
  PROJECT_CREATED: "started project",
  MEMBER_ADDED: "added team member to",
  STATUS_CHANGE: "updated status of",
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTime = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
      </div>
      <div className="p-4 flex-grow overflow-auto">
        <div className="space-y-6">
          {activities.length > 0 ? (
            activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex gap-4">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-[-24px] w-[1px] bg-gray-100" />
                )}
                <div className="relative z-10 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                  {icons[activity.type]}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{activity.user.name}</span>{" "}
                    {labels[activity.type]}{" "}
                    <span className="font-medium text-blue-600">{activity.target}</span>
                  </p>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                    {formatTime(new Date(activity.timestamp))}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm italic">
              No recent activity found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
