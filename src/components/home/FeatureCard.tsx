"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { featureColors, FeatureVariant } from "@/lib/featureColors";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: FeatureVariant;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
  showSparkle?: boolean;
  rotation?: number;
  animation?: "pulse" | "float" | "bounce";
  ariaLabel?: string;
  tabIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  variant = "collaboration",
  size = "md",
  onClick,
  href,
  showSparkle,
  rotation = 0,
  animation,
  ariaLabel,
  tabIndex = 0,
  className,
  style,
}) => {
  const colors = featureColors[variant];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
      if (href) window.location.href = href;
    }
  };

  const CardWrapper = href ? "a" : "div";

  return (
    <CardWrapper
      href={href}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={onClick || href ? "button" : undefined}
      aria-label={ariaLabel || `Feature: ${title}`}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        ...style,
      }}
      className={cn(
        "group relative flex flex-col p-6 rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2",
        colors.border,
        variant === "management" && "border-sunny/40",
        onClick || href ? "cursor-pointer" : "",
        variant === "ai" && "hover:border-teal/50",
        variant === "research" && "hover:border-indigo/50",
        variant === "collaboration" && "hover:border-crimson/50",
        variant === "management" && "hover:border-sunny/70 border-2",
        className
      )}
    >
      {/* Background Glow for different Variants */}
      {variant === "ai" && (
        <div className="absolute inset-0 bg-teal/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10 blur-xl" />
      )}
      {variant === "collaboration" && (
        <div className="absolute inset-0 bg-crimson/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10 blur-xl" />
      )}
      {variant === "research" && (
        <div className="absolute inset-0 bg-indigo/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10 blur-xl" />
      )}
      {variant === "management" && (
        <div className="absolute inset-0 bg-sunny/5 opacity-100 group-hover:opacity-100 transition-opacity rounded-xl -z-10 blur-2xl" />
      )}

      {/* Card Header: Icon + Title */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110",
            colors.background,
            colors.icon,
            variant === "ai" && "animate-pulse-organic",
            variant === "research" && "animate-pulse-organic",
            variant === "collaboration" && "animate-pulse-organic",
            variant === "management" && "animate-pulse-organic group-hover:bg-sunny/20 group-hover:shadow-md"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 leading-tight">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="flex-grow text-gray-600 font-body text-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* CTA or Link (Optional) */}
      {(onClick || href) && (
        <div className={cn("inline-flex items-center text-sm font-semibold transition-transform group-hover:translate-x-1", colors.icon)}>
          Learn More <span className="ml-1">→</span>
        </div>
      )}

      {/* Micro-interactions: Sparkle */}
      {showSparkle && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sunny rounded-full animate-sparkle" />
      )}
    </CardWrapper>
  );
};
