"use client";

import React, { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { Button } from "@/components/ui/Button";
import { PenTool, Highlighter, Type, Languages, Sparkles, Wand2 } from "lucide-react";

const STYLES = [
  { id: "academic", label: "Academic", description: "Formal, objective, and precise." },
  { id: "professional", label: "Professional", description: "Clear, concise, and business-like." },
  { id: "simplified", label: "Simplified", description: "Easy to understand without jargon." },
];

const TYPES = [
  { id: "grammar", label: "Grammar & Flow", icon: Highlighter },
  { id: "tone", label: "Tone Adjustment", icon: Languages },
  { id: "summarize", label: "Summarize", icon: Type },
  { id: "expand", label: "Expand & Elaborate", icon: Wand2 },
];

export const WritingAssistantView: React.FC = () => {
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("academic");
  const [type, setType] = useState("grammar");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-10">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-sunny/10 text-sunny rounded-3xl flex items-center justify-center mx-auto rotate-12">
              <PenTool size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              Refine Your Writing
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Paste your text below, and I'll help you polish it to perfection."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="space-y-4">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Choose a Style</label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        style === s.id 
                          ? "border-sunny bg-sunny/5 shadow-lg shadow-sunny/5" 
                          : "border-gray-50 bg-white hover:border-sunny/20"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-widest ${style === s.id ? "text-sunny" : "text-gray-400"}`}>{s.label}</p>
                      <p className="text-[10px] text-gray-500 font-body mt-1 leading-tight">{s.description}</p>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Transformation Type</label>
               <div className="flex flex-wrap gap-3">
                  {TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                        type === t.id 
                          ? "border-sunny bg-sunny text-gray-900 shadow-md" 
                          : "border-gray-50 bg-white text-gray-500 hover:border-sunny/30"
                      }`}
                    >
                      <t.icon size={16} />
                      <span className="text-xs font-bold whitespace-nowrap">{t.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Your Content</label>
              <textarea
                placeholder="Paste the paragraph or section you want to improve..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-sunny transition-all resize-none"
                required
              />
              <div className="text-[10px] text-gray-400 italic px-1">
                 Min. 10 characters for transformation
              </div>
            </div>

            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full h-14 text-base shadow-lg shadow-sunny/10"
              leftIcon={<Sparkles size={20} />}
              disabled={content.length < 10}
            >
              Polish Content
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Writing Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Highlighter size={16} className="text-sunny" />
                Session Info
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Style</p>
                  <p className="text-sm font-body font-semibold text-gray-700 capitalize">{style}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transformation</p>
                  <p className="text-sm font-body font-semibold text-gray-700 capitalize">{type}</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="p-4 bg-white border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Original Excerpt</p>
                    <p className="text-xs text-gray-400 font-body italic line-clamp-6">
                       "{content}"
                    </p>
                 </div>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                   onClick={() => setIsSubmitted(false)}
                 >
                   Edit original text
                 </Button>
              </div>
            </div>

            <div className="bg-sunny/5 border-2 border-sunny/10 p-6 rounded-3xl space-y-4 text-center">
               <Languages className="mx-auto text-sunny" size={32} />
               <p className="text-xs font-body text-gray-700 font-medium">
                  "I'm enhancing your text for **${style}** clarity. I'll focus on **${type.replace("-", " ")}** while maintaining your core message."
               </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface 
              endpoint="/api/ai/writing"
              placeholder="Ask for further refinements or alternatives..."
              initialMessage={`I've received your text and I'm applying **${style}** style enhancements with a focus on **${type}**. Here is the improved version...`}
              additionalData={{ content, style, type }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
