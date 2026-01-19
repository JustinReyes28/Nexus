"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TheGuideProps {
  expression?: "idle" | "thinking" | "happy" | "celebrating";
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
  decorative?: boolean;
}

export const TheGuide = ({ expression = "idle", className, size = "md", ariaLabel, decorative = false }: TheGuideProps) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-24 h-24",
    lg: "w-48 h-48",
  };

  const bubbleSizes = {
    sm: {
      sizeLarge: "w-3 h-3",
      sizeSmall: "w-2 h-2",
      posLarge: "-top-1 -right-1",
      posSmall: "-top-3 -right-3"
    },
    md: {
      sizeLarge: "w-4 h-4",
      sizeSmall: "w-3 h-3",
      posLarge: "-top-2 -right-2",
      posSmall: "-top-6 -right-6"
    },
    lg: {
      sizeLarge: "w-6 h-6",
      sizeSmall: "w-4 h-4",
      posLarge: "-top-4 -right-4",
      posSmall: "-top-10 -right-10"
    }
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", sizes[size], className)}
      {...(decorative ? { "aria-hidden": "true" } : { role: "img", "aria-label": ariaLabel || `AI Guide expression: ${expression}` })}
    >
      {/* Background Breathing Aura */}
      <div className="absolute inset-0 bg-teal/10 rounded-full blur-xl animate-pulse-organic" />
      
      {/* The Guide Body (Organic Geometric Shape) */}
      <div className={cn(
        "relative w-full h-full bg-teal shadow-lg shadow-teal/20 transition-all duration-700",
        expression === "thinking" ? "rounded-[50%]" : "rounded-[40% 60% 40% 60% / 60% 40% 60% 40%]",
        expression === "celebrating" ? "animate-bounce" : "animate-[pulse-organic_4s_infinite]"
      )}>
        {/* Face/Eyes */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 lg:gap-4">
          <div className={cn(
            "bg-white rounded-full transition-all duration-300",
            size === "sm" ? "w-1 h-1" : size === "lg" ? "w-4 h-4" : "w-2.5 h-2.5",
            expression === "thinking" ? "opacity-30 scale-x-150" : "scale-100"
          )} />
          <div className={cn(
            "bg-white rounded-full transition-all duration-300",
            size === "sm" ? "w-1 h-1" : size === "lg" ? "w-4 h-4" : "w-2.5 h-2.5",
            expression === "thinking" ? "opacity-30 scale-x-150" : "scale-100"
          )} />
        </div>

        {/* Thinking Bubbles if thinking */}
        {expression === "thinking" && (
           <>
             <div className={cn("absolute bg-sunny rounded-full animate-bounce [animation-delay:0.1s]", bubbleSizes[size].posLarge, bubbleSizes[size].sizeLarge)} />
             <div className={cn("absolute bg-teal rounded-full animate-bounce [animation-delay:0.3s]", bubbleSizes[size].posSmall, bubbleSizes[size].sizeSmall)} />
           </>
        )}
      </div>
    </div>
  );
};
