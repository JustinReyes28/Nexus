"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Sparkles, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  feature: string;
  prompt: string;
  response: string;
  createdAt: string | Date;
}

export interface ConversationPreviewProps {
  conversation: Conversation;
  onClick: () => void;
  isActive?: boolean;
}

export const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  conversation,
  onClick,
  isActive = false,
}) => {
  const date = new Date(conversation.createdAt);
  const isValidDate = !isNaN(date.getTime());

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "border-teal bg-teal/5 shadow-lg shadow-teal/5"
          : "border-gray-100 bg-white hover:border-teal/30 hover:bg-gray-50 shadow-sm"
      )}
    >
      {/* Texture bg */}
      <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            isActive ? "bg-teal text-white" : "bg-gray-100 text-gray-400 group-hover:text-teal transition-colors"
          )}>
            <MessageSquare size={14} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {conversation.feature.replaceAll("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
          <Clock size={10} />
          {isValidDate ? formatDistanceToNow(date, { addSuffix: true }) : 'Just now'}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <p className="text-sm font-body font-bold text-gray-900 line-clamp-1 group-hover:text-teal transition-colors">
          {conversation.prompt}
        </p>
        <p className="text-xs font-body text-gray-500 line-clamp-2 leading-relaxed">
          {conversation.response.replace(/[#*`]/g, "")}
        </p>
      </div>

      <div className={cn(
        "absolute right-2 bottom-2 p-1 rounded-lg transition-all duration-500",
        isActive ? "text-teal rotate-0" : "text-gray-200 opacity-0 -rotate-90 group-hover:opacity-100 group-hover:rotate-0"
      )}>
        <ChevronRight size={16} />
      </div>

      {isActive && (
        <div className="absolute top-0 right-0 p-1">
          <Sparkles size={12} className="text-teal animate-sparkle" />
        </div>
      )}
    </button>
  );
};
