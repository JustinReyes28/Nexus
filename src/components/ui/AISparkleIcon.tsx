"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const AISparkleIcon = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-teal fill-teal animate-pulse-organic"
        aria-hidden="true"
      >
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-sunny rounded-full animate-sparkle" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-crimson rounded-full animate-sparkle [animation-delay:0.2s]" />
    </div>
  );
};
