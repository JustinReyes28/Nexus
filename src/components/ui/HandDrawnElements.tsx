"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const WavyUnderline = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 10" 
    preserveAspectRatio="none" 
    className={cn("absolute left-0 bottom-[-4px] w-full h-[6px] text-sunny pointer-events-none", className)}
  >
    <path 
      d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

export const CircleHighlight = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className="relative inline-block">
    <svg 
      viewBox="0 0 100 40" 
      className={cn("absolute inset-0 w-[110%] h-[110%] left-[-5%] top-[-5%] text-sunny/40 pointer-events-none", className)}
    >
      <ellipse 
        cx="50" cy="20" rx="48" ry="18" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeDasharray="300"
        strokeDashoffset="300"
        className="animate-[draw_1s_ease-out_forwards]"
        style={{ transform: "rotate(-2deg)" }}
      />
    </svg>
    {children}
  </span>
);

export const HandDrawnArrow = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("w-6 h-6", className)}
  >
    <path d="M3 12h18" />
    <path d="M15 6l6 6-6 6" />
    <path d="M3 12c.5-2 1.5-3 3-3" />
    <path d="M3 12c.5 2 1.5 3 3 3" />
  </svg>
);

export const Sparkle = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("text-sunny fill-current", className)}
  >
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

export const PushPin = ({ className }: { className?: string }) => (
  <div className={cn("relative w-6 h-6", className)}>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-crimson rounded-full shadow-sm" />
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-gray-400 rotate-12" />
  </div>
);
