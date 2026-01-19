"use client";

// i will Review this later
import React from "react";
import { cn } from "@/lib/utils";
import { HandDrawnArrow, Sparkle } from "@/components/ui/HandDrawnElements";

// Define the icon components outside the main component
const ProblemIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const SolutionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isSolution: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, isSolution }) => (
  <div className={cn(
        "relative p-8 rounded-xl bg-white shadow-sm border-2 transition-all duration-300 group",
        isSolution ? "border-teal/30 rotate-1 hover:rotate-0" : "border-yellow-400 -rotate-1 hover:rotate-0",
        "bg-paper"
      )}>
    <div className={cn(
      "w-12 h-12 rounded-lg flex items-center justify-center mb-6",
      isSolution ? "bg-teal/10 text-teal" : "bg-gray-100 text-gray-400"
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-heading font-bold mb-3 text-gray-900 group-hover:text-crimson transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 font-body leading-relaxed">
      {description}
    </p>
    
    {isSolution && (
      <div className="absolute top-4 right-4 animate-sparkle">
        <Sparkle className="w-4 h-4 text-sunny" />
      </div>
    )}
  </div>
);

export const ProblemSolutionGrid = () => {
  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-4">
            From Chaos to <span className="text-crimson">Clarity</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto italic font-handwritten text-lg">
            "Your capstone shouldn't be a source of burnout. It should be your proudest work."
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
          {/* Problem Side */}
          <div className="space-y-8">
            <FeatureCard
              title="Struggling with vague topics?"
              description="Most students get stuck before they even start. Vague research questions lead to frustrating dead-ends and wasted months."
              icon={ProblemIcon}
              isSolution={false}
            />
          </div>

          {/* Connection Arrow (Mobile: down, LG: right) */}
          <div className="flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 z-10">
             <div className="bg-sunny p-3 rounded-full shadow-lg rotate-90 lg:rotate-0">
                <HandDrawnArrow className="text-white w-8 h-8" />
             </div>
          </div>

          {/* Solution Side */}
          <div className="space-y-8 lg:translate-y-12">
            <FeatureCard 
              isSolution
              title="Actionable Brainstorming"
              description="Nexus helps by brainstorming actionable research questions and structured methodologies tailored to your unique interests."
              icon={SolutionIcon}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
