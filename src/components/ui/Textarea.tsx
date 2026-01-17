"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-body text-gray-900",
          "shadow-sm placeholder:text-gray-400 focus:border-crimson/20 focus:ring-0 focus:bg-white",
          "transition-all disabled:opacity-50 resize-none",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
