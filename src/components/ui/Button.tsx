"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ai";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-heading font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-crimson text-white hover:bg-crimson/90 shadow-sm border-2 border-crimson",
      secondary: "bg-sunny text-gray-900 hover:bg-sunny/90 shadow-sm border-2 border-sunny",
      outline: "bg-transparent border-2 border-crimson text-crimson hover:bg-crimson/5",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
      ai: "bg-teal text-white hover:bg-teal/90 shadow-md border-2 border-teal animate-pulse-organic",
    };

    const sizes = {
      sm: "h-9 px-4 rounded-md text-xs",
      md: "h-11 px-6 rounded-lg text-sm",
      lg: "h-14 px-10 rounded-xl text-base",
    };

    // Organic imperfections for buttons (Anti-AI)
    const organicStyles = variant === "outline" ? "rounded-[8px] border-b-4" : "rounded-[8px]";

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], organicStyles, className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
            </div>
            {children && <span>Loading...</span>}
          </div>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
