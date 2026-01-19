// i will Review this later
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WavyUnderline, Sparkle } from "@/components/ui/HandDrawnElements";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sunny/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 bg-crimson/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container px-6 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Left Side: Content (60%) */}
          <div className="lg:w-[60%] text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sunny/20 border border-sunny/50 text-xs font-bold text-gray-900 mb-6 animate-float">
              <Sparkle className="w-3 h-3" />
              <span>Your Capstone, Reimagined</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-gray-900 leading-[1.1] mb-6">
              You're not alone on your{" "}
              <span className="relative">
                capstone
                <WavyUnderline className="text-crimson" />
              </span>{" "}
              journey.
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl font-body leading-relaxed">
              Nexus is your collaborative canvas for academic excellence. 
              We combine human creativity with AI-powered mentorship to turn 
              overwhelming projects into structured success stories.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="shadow-lg shadow-crimson/20">
                <a href="/register">
                  Start Your Journey
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/about">
                  Explore the Canvas
                </a>
              </Button>
            </div>
            
          </div>
          
          {/* Right Side: Visual (40%) */}
          <div className="lg:w-[40%] relative">
             <div className="relative aspect-square w-full max-w-[450px] mx-auto">
                {/* Asymmetric Image/Illustration Container */}
                <div className="absolute inset-x-4 inset-y-0 bg-sunny rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] animate-[pulse-organic_4s_infinite] opacity-20" />
                
                <div className="absolute inset-0 flex items-center justify-center p-8">
                   {/* Abstract Digital Graphic / Mind Map Illustration */}
                   <svg viewBox="0 0 200 200" className="w-full h-full text-crimson" aria-hidden="true">
                      <circle cx="100" cy="100" r="10" fill="currentColor" />
                      <path d="M100 100 L150 50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="150" cy="50" r="6" fill="var(--teal)" />
                      
                      <path d="M100 100 L160 140" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="160" cy="140" r="8" fill="var(--sunny)" />
                      
                      <path d="M100 100 L40 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="40" cy="60" r="5" fill="currentColor" />
                      
                      <path d="M40 60 L60 150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="60" cy="150" r="4" fill="var(--teal)" />

                      {/* Floating Decorative Elements */}
                      <circle cx="180" cy="100" r="3" fill="var(--sunny)" className="animate-float" />
                      <circle cx="20" cy="120" r="4" fill="var(--crimson)" className="animate-float [animation-delay:1s]" />
                   </svg>
                </div>
                
                {/* Floating "Note" Card */}
                <div className="absolute -bottom-4 -right-4 bg-white p-4 shadow-xl rounded-lg rotate-3 border-2 border-sunny/20 max-w-[180px] hidden lg:block">
                   <p className="font-handwritten text-sm text-gray-800 leading-tight">
                     "The first step is always the hardest. Let's draft your intro today!"
                   </p>
                   <div className="mt-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-[10px] text-white font-bold">G</div>
                      <span className="text-[10px] font-bold text-teal uppercase tracking-widest">The Guide</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
