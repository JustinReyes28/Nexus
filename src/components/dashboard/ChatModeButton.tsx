"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface ChatModeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const ChatModeButton = React.forwardRef<HTMLButtonElement, ChatModeButtonProps>(
  ({ isActive = false, isCollapsed = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative",
          isActive
            ? "text-crimson"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
          isCollapsed && "justify-center px-2",
          className
        )}
        title={isCollapsed ? "Chat Mode" : undefined}
        {...props}
      >
        <MessageCircle
          className={cn(
            "w-5 h-5 flex-shrink-0",
            isActive
              ? "text-crimson"
              : "text-gray-400 group-hover:text-gray-900"
          )}
        />
        <span className={cn(
          "whitespace-nowrap overflow-hidden transition-all duration-300",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 block"
        )}>
          Chat Mode
        </span>

        {isActive && (
          <div className={cn(
            "absolute left-0 w-1 bg-crimson rounded-r-full",
            isCollapsed ? "h-3" : "h-6"
          )} />
        )}
      </button>
    );
  }
);

ChatModeButton.displayName = "ChatModeButton";