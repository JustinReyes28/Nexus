"use client";

import React, { useState } from "react";
import { 
  Lightbulb, 
  BookOpen, 
  FileEdit, 
  FlaskConical, 
  TrendingUp, 
  PenTool,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { ToolCard } from "@/components/ai/ToolCard";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { TheGuide } from "@/components/ai/TheGuide";
import { cn } from "@/lib/utils";

// Tool View Imports
import { IdeaGeneratorView } from "@/components/ai/IdeaGeneratorView";
import { ResearchAssistantView } from "@/components/ai/ResearchAssistantView";
import { ProposalWriterView } from "@/components/ai/ProposalWriterView";
import { MethodologyAdvisorView } from "@/components/ai/MethodologyAdvisorView";
import { ProgressAnalyzerView } from "@/components/ai/ProgressAnalyzerView";
import { WritingAssistantView } from "@/components/ai/WritingAssistantView";

// Tool Definitions
const TOOLS = [
  {
    id: "ideas",
    title: "Idea Generator",
    description: "Brainstorm actionable topics based on your interests.",
    icon: Lightbulb,
    color: "text-amber-500",
  },
  {
    id: "research",
    title: "Research Assistant",
    description: "Literature review suggestions & gap identification.",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    id: "proposal",
    title: "Proposal Writer",
    description: "Interactive builder with real-time academic feedback.",
    icon: FileEdit,
    color: "text-crimson",
  },
  {
    id: "methodology",
    title: "Methodology Advisor",
    description: "Data collection & analysis recommendations.",
    icon: FlaskConical,
    color: "text-purple-500",
  },
  {
    id: "progress",
    title: "Progress Analyzer",
    description: "Identify bottlenecks & risk assessment checks.",
    icon: TrendingUp,
    color: "text-teal",
  },
  {
    id: "writing",
    title: "Writing Assistant",
    description: "Grammar, tone & coherence analysis.",
    icon: PenTool,
    color: "text-sunny",
  },
];

export default function CapstoneAssistantPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const selectedTool = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-700">
      {/* Texture Backgrounds */}
      <div className="fixed inset-0 bg-paper opacity-40 pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-grain opacity-[0.03] pointer-events-none -z-10" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-gray-100 border-dashed mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal font-handwritten text-xl">
             <Sparkles className="w-5 h-5 animate-pulse-organic" />
             AI-Powered Mentorship
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            Capstone Assistant
            <WavyUnderline className="text-teal/20" />
          </h1>
          <p className="text-gray-500 font-body max-w-xl">
            Select a specialized tool to assist you at any stage of your academic journey.
          </p>
        </div>
        
        {activeTool ? (
          <Button 
            variant="ghost" 
            onClick={() => setActiveTool(null)}
            leftIcon={<ArrowLeft size={16} />}
            className="font-bold uppercase tracking-widest text-xs"
          >
            Back to Tools
          </Button>
        ) : (
          <Link href="/dashboard">
             <Button variant="outline" size="sm" className="rotate-1 hover:rotate-0">
                Back to Base Camp
             </Button>
          </Link>
        )}
      </div>

      {!activeTool ? (
        /* Tool Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 container px-4 md:px-0">
          {TOOLS.map((tool, index) => (
            <ToolCard
              key={tool.id}
              index={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              isActive={false}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}

          {/* Guide Banner */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-12 bg-canvas border-2 border-teal/20 rounded-3xl p-6 md:p-10 relative overflow-hidden group shadow-xl shadow-teal/5">
             <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-teal/5 rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20 blur-3xl" />
             <div className="relative z-10 flex flex-col items-center gap-6 md:gap-10">
                <div className="relative">
                   <TheGuide size="md" className="md:scale-110" />
                   <div className="absolute -inset-4 bg-teal/20 rounded-full blur-2xl -z-10 animate-pulse-organic" />
                </div>
                <div className="space-y-4 text-center">
                   <h3 className="text-xl md:text-2xl font-heading font-extrabold text-gray-900">
                      Unsure where to start?
                   </h3>
                   <p className="text-gray-600 font-body max-w-md md:max-w-lg leading-relaxed text-sm md:text-base">
                      "Each tool above is designed for a specific phase. If you're just starting, the Idea Generator is your best friend. If you're polishing, the Writing Assistant will help you cross the finish line!"
                   </p>
                   <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                      <Button variant="ai" size="sm" onClick={() => setActiveTool("ideas")}>
                         Brainstorm Ideas
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        /* Active Tool View */
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-teal text-white rounded-2xl shadow-lg shadow-teal/20">
              {selectedTool && <selectedTool.icon size={32} />}
            </div>
            <div>
              <h2 className="text-3xl font-heading font-extrabold text-gray-900 leading-none">
                {selectedTool?.title}
              </h2>
              <p className="text-gray-500 font-body mt-1 uppercase tracking-widest text-[10px] font-bold">
                Active Session
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
             <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none" />
             
             <div className="min-h-[500px]">
                {activeTool === "ideas" && <IdeaGeneratorView />}
                {activeTool === "research" && <ResearchAssistantView />}
                {activeTool === "proposal" && <ProposalWriterView />}
                {activeTool === "methodology" && <MethodologyAdvisorView />}
                {activeTool === "progress" && <ProgressAnalyzerView />}
                {activeTool === "writing" && <WritingAssistantView />}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
