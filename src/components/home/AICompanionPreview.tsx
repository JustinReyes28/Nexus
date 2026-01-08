"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AISparkleIcon } from "@/components/ui/AISparkleIcon";
import { CircleHighlight, Sparkle } from "@/components/ui/HandDrawnElements";


export const AICompanionPreview = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image/Mascot Side */}
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="relative w-full max-w-[500px] mx-auto">
               {/* Mascot Background */}
               <div className="absolute inset-0 bg-teal/5 rounded-full blur-3xl animate-pulse-organic" />
               
               {/* "The Guide" Mascot (Geometric Teal Shape) */}
               <div className="relative z-10 flex items-center justify-center p-12">
                  <div className="w-64 h-64 bg-teal rounded-[40% 60% 40% 60% / 60% 40% 60% 40%] animate-[pulse-organic_5s_infinite] shadow-2xl shadow-teal/20 flex items-center justify-center overflow-hidden">
                     {/* Mascot "Eyes" or minimalist face */}
                     <div className="flex gap-12">
                        <div className="w-4 h-4 bg-white rounded-full" />
                        <div className="w-4 h-4 bg-white rounded-full" />
                     </div>
                     {/* Subtle grid pattern inside mascot */}
                     <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%">
                           <defs>
                              <pattern id="mascotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                 <circle cx="1" cy="1" r="1" fill="white" />
                              </pattern>
                           </defs>
                           <rect width="100%" height="100%" fill="url(#mascotGrid)" />
                        </svg>
                     </div>
                  </div>
                  
                  {/* Floating Tooltips around Mascot */}
                  <div className="absolute top-0 right-4 p-3 bg-white shadow-lg rounded-xl flex items-center gap-2 border border-teal/10 animate-float">
                     <AISparkleIcon />
                     <span className="text-xs font-bold text-gray-700">Research Advisor</span>
                  </div>
                  <div className="absolute bottom-12 left-0 p-3 bg-white shadow-lg rounded-xl flex items-center gap-2 border border-teal/10 animate-float [animation-delay:1.5s]">
                     <div className="w-2 h-2 rounded-full bg-sunny" />
                     <span className="text-xs font-bold text-gray-700">Writing Assistant</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-4xl lg:text-6xl font-heading font-extrabold text-gray-900 mb-8 leading-tight">
              Meet <CircleHighlight className="text-teal/40">The Guide</CircleHighlight>
            </h2>
            <p className="text-xl text-gray-600 mb-10 font-body leading-relaxed">
              Not a robot, but a mentor. The Guide lives within your workflow, 
              offering structure when you're lost and inspiration when you're stuck.
            </p>

            <div className="space-y-6">
               {/* Chat Bubbles Mockup */}
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                     <span className="text-xs font-bold">You</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-xl rounded-tl-none max-w-[80%] shadow-sm">
                     <p className="text-sm text-gray-800 font-body">I'm stuck on my methodology section...</p>
                  </div>
               </div>

               <div className="flex flex-row-reverse gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center flex-shrink-0 shadow-md">
                     <span className="text-xs font-bold text-white">G</span>
                  </div>
                  <div className="bg-teal text-white p-4 rounded-xl rounded-tr-none max-w-[80%] shadow-lg">
                     <p className="text-sm font-body">
                       Let's break it down! Are you leaning towards qualitative interviews or quantitative surveys?
                     </p>
                  </div>
               </div>
               
               <p className="text-sm font-handwritten text-teal mt-4 flex items-center gap-2">
                 <Sparkle className="w-4 h-4" />
                 "The Guide suggests 3 actionable next steps"
               </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
