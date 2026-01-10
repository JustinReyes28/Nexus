"use client";

import React, { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { Button } from "@/components/ui/Button";
import { BookOpen, Search, Tags, Beaker, Quote, Sparkles } from "lucide-react";

export const ResearchAssistantView: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAddFocusArea = () => {
    if (focusArea.trim() && !focusAreas.includes(focusArea.trim())) {
      setFocusAreas([...focusAreas, focusArea.trim()]);
      setFocusArea("");
    }
  };

  const handleRemoveFocusArea = (tag: string) => {
    setFocusAreas(focusAreas.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.length < 3) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-10">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto -rotate-3">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              Explore the Literature
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Tell me your research topic, and I'll help you find gaps and relevant methodologies."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Research Topic</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Impact of remote work on employee wellbeing"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm font-body focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Focus Areas (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Mental health, productivity..."
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFocusArea())}
                  className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-blue-500 transition-all"
                />
                <Button type="button" variant="outline" onClick={handleAddFocusArea} className="px-4">
                   <Tags size={18} />
                </Button>
              </div>
              
              {focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {focusAreas.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-blue-100 animate-in zoom-in-75 duration-300"
                    >
                      {tag}
                      <button type="button" onClick={() => handleRemoveFocusArea(tag)} className="hover:text-blue-800">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-14 text-base shadow-lg shadow-blue-500/10"
              leftIcon={<Sparkles size={20} />}
              disabled={topic.length < 3}
            >
              Start Research Assistance
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Dashboard Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Search size={16} className="text-blue-500" />
                Query Details
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Topic</p>
                  <p className="text-sm font-body font-semibold text-gray-700">{topic}</p>
                </div>
                {focusAreas.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {focusAreas.map(tag => (
                        <span key={tag} className="text-[10px] bg-white border border-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 pt-4">
                 <Button variant="ghost" size="sm" className="justify-start text-xs text-gray-500 hover:text-blue-500 group">
                    <Beaker size={14} className="mr-2 group-hover:scale-110 transition-transform" />
                    Cite this search
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)} className="text-xs">
                    Reset parameters
                 </Button>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl space-y-4 text-center">
              <Quote className="mx-auto text-blue-500 opacity-50" size={32} />
              <p className="text-xs font-body text-blue-900/60 font-medium italic">
                "I'll prioritize literature reviews and concept summaries for you. Let's find those research gaps!"
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface 
              endpoint="/api/ai/research"
              placeholder="Ask for literature suggestions or summaries..."
              initialMessage={`Hello! I'm your Research Assistant. I've noted your interest in **${topic}**. Where should we start? I can suggest relevant papers, summarize key concepts, or help identify gaps in current research.`}
              additionalData={{ topic, focusAreas }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
