"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PushPin } from "@/components/ui/HandDrawnElements";

export const TeamFeaturePreview = () => {
  return (
    <section className="py-24 bg-canvas overflow-hidden">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16 px-4">
          <div className="inline-block px-4 py-1 rounded bg-sunny/20 text-sunny font-bold text-xs uppercase tracking-widest mb-4">
            Collaboration Hub
          </div>
          <h2 className="text-3xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-6">
            Built for <span className="text-crimson">Students</span>, by Students
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-body text-lg leading-relaxed">
            Thesis work is lonely. Team work is messy. Nexus fixes both with a shared digital workspace that feels like your favorite coffee shop corner.
          </p>
        </div>

        {/* Feature Mockup: The Project Wall */}
        <div className="relative max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-4 md:p-8 min-h-[400px]">
           {/* Corkboard Background Overlay (CSS) */}
           <div className="absolute inset-4 rounded-xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pinned Card 1 */}
              <div className="bg-paper p-6 rounded-lg shadow-md border border-gray-100 rotate-1 relative group hover:rotate-0 transition-transform">
                 <PushPin className="absolute -top-3 left-1/2 -translate-x-1/2" />
                 <h4 className="font-heading font-bold text-gray-900 mb-2">Literature Review</h4>
                 <p className="text-xs text-gray-500 mb-4 font-body">Due in 2 days • Sarah is editing</p>
                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-crimson w-[65%]" />
                 </div>
              </div>

              {/* Pinned Card 2 (Sticky Note) */}
              <div className="bg-sunny/40 p-6 rounded-lg shadow-md -rotate-2 relative group hover:rotate-0 transition-transform min-h-[160px]">
                 <p className="font-handwritten text-lg text-gray-800 leading-tight">
                    "Don't forget to cite the new AI paper Sarah found!"
                 </p>
                 <div className="mt-6 flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400" />
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-crimson flex items-center justify-center text-[10px] text-white font-bold">S</div>
                 </div>
              </div>

              {/* Pinned Card 3 (AI Suggestion) */}
              <div className="bg-teal/10 p-6 rounded-lg shadow-md rotate-1 border border-teal/20 relative group hover:rotate-0 transition-transform">
                 <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-teal rounded-full animate-pulse-organic" />
                 </div>
                 <h4 className="font-heading font-bold text-teal mb-2">AI Suggestion</h4>
                 <p className="text-xs text-teal/80 font-body italic mb-0">"Your bibliography looks sparse. Want me to find related sources?"</p>
              </div>
           </div>

           {/* Floating Cursor Avatars (Anti-AI personality) */}
           <div className="absolute top-1/2 left-1/4 animate-float">
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-crimson rotate-45" />
                 <span className="px-2 py-1 bg-crimson text-white text-[10px] font-bold rounded shadow-lg">Sarah</span>
              </div>
           </div>
           
           <div className="absolute top-3/4 right-1/4 animate-float [animation-delay:2s]">
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 bg-teal rotate-45" />
                 <span className="px-2 py-1 bg-teal text-white text-[10px] font-bold rounded shadow-lg">The Guide</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
