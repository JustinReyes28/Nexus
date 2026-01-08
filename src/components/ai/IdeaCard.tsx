"use client";

import React from "react";
import { AISparkleIcon } from "@/components/ui/AISparkleIcon";
import { Sparkle, WavyUnderline } from "@/components/ui/HandDrawnElements";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: {
    title: string;
    description: string;
    methodology?: string;
    relevance?: string;
  };
  onSelect?: () => void;
}

export default function IdeaCard({ idea, onSelect }: IdeaCardProps) {
  return (
    <div 
      className="bg-paper p-8 rounded-3xl border-2 border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:border-teal/40 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      onClick={onSelect}
    >
      {/* Texture bg */}
      <div className="absolute inset-0 bg-paper opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-10 pointer-events-none" />
      
      {/* AI Sparkle floating header */}
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
         <Sparkle className="w-6 h-6 text-sunny" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
           <div className="p-3 bg-teal/10 rounded-2xl text-teal group-hover:bg-teal group-hover:text-white transition-all duration-300 shadow-sm border border-teal/5">
              <AISparkleIcon className="scale-110" />
           </div>
           <h3 className="text-2xl font-heading font-extrabold text-gray-900 group-hover:text-teal transition-colors leading-tight tracking-tight">
             {idea.title}
           </h3>
        </div>

        <p className="text-base text-gray-600 mb-8 font-body leading-relaxed flex-grow italic line-clamp-4">
           "{idea.description}"
        </p>

        {idea.methodology && (
          <div className="space-y-3 pt-6 border-t border-gray-100 border-dashed mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-sunny rounded-full animate-pulse-organic" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recommended Approach</span>
            </div>
            <p className="text-xs text-gray-500 font-body leading-relaxed line-clamp-2">
              {idea.methodology}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full" />
              <span className="text-[10px] font-bold text-teal uppercase tracking-widest">AI Insight</span>
           </div>
           <button className="px-5 py-2.5 bg-crimson text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-crimson/10 hover:bg-crimson/90 active:scale-95 transition-all">
              Draft Proposal
           </button>
        </div>
      </div>
    </div>
  );
}
