"use client";

import React from "react";
import { Plus, LayoutGrid, Sparkles, Video, ChevronRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  DEFAULT_EMPTY_STATE_CONFIG, 
  QuickTip, 
  ProjectTemplate, 
  ProjectExample 
} from "@/lib/dashboard-data";

interface EmptyDashboardStateProps {
  tips?: QuickTip[];
  templates?: ProjectTemplate[];
  examples?: ProjectExample[];
  tutorialLink?: string;
}

export default function EmptyDashboardState({
  tips = DEFAULT_EMPTY_STATE_CONFIG.tips,
  templates = DEFAULT_EMPTY_STATE_CONFIG.templates,
  examples = DEFAULT_EMPTY_STATE_CONFIG.examples,
  tutorialLink = DEFAULT_EMPTY_STATE_CONFIG.tutorialLink,
}: EmptyDashboardStateProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Hero Empty State */}
      <div className="bg-white border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-6 group hover:border-sunny/50 transition-all bg-paper shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-sunny/10 flex items-center justify-center text-sunny group-hover:bg-sunny/20 transition-all rotate-3 group-hover:rotate-0 duration-500">
          <Plus className="w-10 h-10" />
        </div>
        <div className="max-w-[400px]">
          <h3 className="text-2xl font-heading font-extrabold text-gray-900">Your canvas is empty</h3>
          <p className="text-base text-gray-500 font-body italic mt-2">
            "Every masterpiece begins with a single research question."
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/projects/new">
            <Button className="shadow-lg shadow-crimson/10 rotate-1 hover:rotate-0 px-8">
              Start Drafting
            </Button>
          </Link>
          <Link href={tutorialLink} target="_blank">
            <Button variant="outline" leftIcon={<Video className="w-4 h-4" />}>
              Watch Guide
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Visual Guidance Elements */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <h4 className="font-heading font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-crimson" />
            Visual Preview
          </h4>
          <div className="bg-canvas border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-sunny/10 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-sunny" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Sample Research Project</h4>
                  <p className="text-xs text-gray-400">3 tasks • 45% complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-crimson h-1.5 rounded-full w-[45%]"></div>
              </div>
              <p className="text-xs text-gray-500 font-body">This is how your projects will be organized on your dashboard.</p>
              <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 bg-sunny rounded-full animate-pulse"></div>
              </div>
          </div>
        </div>

        {/* 4. Progress Visualization */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-heading font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sunny" />
              Getting Started
            </h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">0/3 Steps</span>
          </div>
          <div className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-teal h-2 rounded-full w-[10%]"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-crimson flex items-center justify-center">
                   <div className="w-2 h-2 bg-crimson rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs font-bold text-gray-700">Create your first project</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                <span className="text-xs font-bold text-gray-400">Add 3 key tasks</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                <span className="text-xs font-bold text-gray-400">Set your first deadline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Quick Start Tips */}
        <div className="lg:col-span-1 space-y-4">
          <h4 className="font-heading font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-sunny" />
            Quick Tips
          </h4>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 group">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-teal group-hover:scale-150 transition-transform" />
                <p className="text-xs text-gray-600 font-body">
                  <strong className="text-gray-900">{tip.title}:</strong> {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Template Options */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-heading font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-crimson" />
            Jumpstart with a Template
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templates.map((template) => (
              <Link 
                key={template.id} 
                href={`/projects/new?template=${template.id}`}
                className="group p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 bg-white transition-all text-center hover:shadow-sm"
              >
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-${template.color}/10 flex items-center justify-center text-${template.color} group-hover:scale-110 transition-transform`}>
                   <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-700">{template.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Inspirational Examples */}
      <div className="bg-canvas border-2 border-dashed border-teal/20 rounded-2xl p-6">
        <h4 className="font-heading font-extrabold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal" />
          Popular Project Types
        </h4>
        <div className="flex flex-wrap gap-3">
           {examples.map((type) => (
             <div key={type.name} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-600 shadow-sm hover:translate-y-[-2px] transition-transform">
                <div className={`w-2 h-2 rounded-full ${type.color}`} />
                {type.name}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
