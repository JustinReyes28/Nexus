"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type AIState = "idle" | "thinking" | "streaming" | "done" | "error";

interface ProgressIndicatorProps {
  state: AIState;
  message?: string;
  tokensUsed?: number;
  className?: string;
}

const config: Record<AIState, { icon: React.ReactNode; label: string; color: string; }> = {
  idle: {
    icon: <Sparkles className="text-muted-foreground" size={18} />,
    label: "AI Ready",
    color: "border-border",
  },
  thinking: {
    icon: <RefreshCw className="text-primary animate-spin" size={18} />,
    label: "AI is thinking...",
    color: "border-primary",
  },
  streaming: {
    icon: <RefreshCw className="text-primary animate-spin" size={18} />,
    label: "Generating output...",
    color: "border-primary shadow-[0_0_10px_rgb(var(--primary)_/_0.2)]",
  },
  done: {
    icon: <CheckCircle2 className="text-green-500" size={18} />,
    label: "Response complete",
    color: "border-green-500/50 bg-green-500/5 dark:bg-green-500/10",
  },
  error: {
    icon: <AlertCircle className="text-destructive" size={18} />,
    label: "Something went wrong",
    color: "border-destructive/50 bg-destructive/5 dark:bg-destructive/10",
  },
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  state,
  message,
  tokensUsed,
  className,
}) => {
  const { icon, label, color } = config[state];

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="status"
      aria-busy={state === "streaming"}
      aria-label={`${message || label} - ${state} state`}
    >
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 border rounded-full transition-all duration-300",
        color
      )}>
        <span aria-hidden="true">{icon}</span>
        <span className="text-sm font-medium">{message || label}</span>
        {tokensUsed !== undefined && state === "done" && (
          <span
            className="ml-auto text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded"
            aria-live="polite"
          >
            {tokensUsed} tokens
          </span>
        )}
      </div>
      
      {state === "streaming" && (
        <div
          className="w-full bg-muted h-1 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="AI generation progress"
          aria-valuenow={undefined}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-primary h-full animate-progress-indeterminate w-1/3 rounded-full"
            role="presentation"
          />
        </div>
      )}
    </div>
  );
};
