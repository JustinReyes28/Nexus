"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-body text-gray-900",
          "shadow-sm placeholder:text-gray-400 focus:border-crimson/20 focus:ring-0 focus:bg-white",
          "transition-all disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
