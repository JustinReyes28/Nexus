"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function Checkbox({ id, checked, onCheckedChange, className, onClick }: CheckboxProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        onClick?.(e);
        onCheckedChange(!checked);
      }}

      className={cn(
        "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center relative active:scale-90",
        checked 
          ? "bg-teal border-teal shadow-sm shadow-teal/20" 
          : "bg-white border-gray-200 hover:border-gray-300",
        className
      )}
    >
      {checked && (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 text-white animate-in zoom-in-50 duration-200"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      
      {/* Subtle organic shadow */}
      <div className="absolute inset-0 bg-paper opacity-0 group-hover:opacity-10 pointer-events-none rounded-lg" />
    </button>
  );
}
