// TODO: Review type compatibility between different Message interfaces in ProposalWriterView component - fix role type mismatch between \"assistant\"|\"system\" and \"bot\" roles - assign to @developer
"use client";

import React, { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { Button } from "@/components/ui/Button";
import { FileEdit, ClipboardList, CheckCircle, Info, Sparkles, History } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  prompt: string;
  response: string;
  section?: string;
  context?: string;
}

const SECTIONS = [
  "Introduction",
  "Problem Statement",
  "Objectives",
  "Literature Review",
  "Methodology",
  "Expected Outcomes",
  "Timeline & Resources",
] as const;

export const ProposalWriterView: React.FC = () => {
  const [section, setSection] = useState<typeof SECTIONS[number]>("Introduction");
  const [templateLevel, setTemplateLevel] = useState<"Standard" | "Advanced" | "Academic">("Standard");
  const [context, setContext] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[] | undefined>();
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();

const handleHistorySelect = (conv: Conversation) => {
    setActiveHistoryId(conv.id);
    
    // Validate and clean history messages
    const cleanedMessages: Message[] = [
      { 
        id: Date.now().toString(), 
        role: "user", 
        content: conv.prompt || "",
        timestamp: new Date().toISOString()
      },
      { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        content: conv.response || "",
        timestamp: new Date().toISOString()
      }
    ];
    
    setHistoryMessages(cleanedMessages);
    
    if (conv.section) setSection(conv.section as typeof SECTIONS[number]);
    if (conv.context) setContext(conv.context);
    setIsSubmitted(true);
    setIsHistoryOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (context.length < 10) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-10">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2 relative">
             <div className="absolute top-0 right-0">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-xs text-gray-400 hover:text-crimson font-bold"
                  leftIcon={<History size={14} />}
               >
                  History
               </Button>
            </div>
            <div className="w-16 h-16 bg-crimson/10 text-crimson rounded-3xl flex items-center justify-center mx-auto rotate-6">
              <FileEdit size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              Draft Your Proposal
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Select a section and provide some context. I'll help you structure it with academic brilliance."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Proposal Section</label>
<select 
                    value={section}
                    onChange={(e) => setSection(e.target.value as typeof SECTIONS[number])}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-crimson transition-all appearance-none cursor-pointer"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
               </div>
               
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Template Level</label>
                   <div className="flex gap-2">
                      {["Standard", "Advanced", "Academic"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setTemplateLevel(level as any)}
                          className={`flex-1 border-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            templateLevel === level
                              ? "border-crimson bg-crimson/5 text-crimson shadow-sm"
                              : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Section Context or Draft</label>
<textarea
                placeholder="Paste your rough draft here or describe what you want to include in this section..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={6}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-crimson transition-all resize-none"
              />
              <div className="flex items-center gap-2 text-[10px] text-gray-400 italic mt-1 px-1">
                 <Info size={12} />
                 Minimum 10 characters for better AI analysis
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base shadow-lg shadow-crimson/10 border-crimson bg-crimson hover:bg-crimson/90"
              leftIcon={<Sparkles size={20} />}
              disabled={context.length < 10}
            >
              Enhance Proposal Section
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Builder Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-crimson" />
                Draft Module
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Section</p>
                  <div className="flex items-center gap-2">
                     <CheckCircle size={14} className="text-teal" />
                     <p className="text-sm font-body font-semibold text-gray-700">{section}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Length</p>
                  <p className="text-sm font-body font-semibold text-gray-700">{context.length} characters</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-medium text-gray-500 line-clamp-3 italic">
                    "{context}"
                 </div>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                   onClick={() => setIsSubmitted(false)}
                 >
                   Update context
                 </Button>
              </div>
            </div>

            <div className="bg-crimson/5 border-2 border-crimson/10 p-6 rounded-3xl text-center space-y-4">
               <div className="flex justify-center">
                  <Sparkles className="text-crimson animate-pulse-organic" size={24} />
               </div>
<p className="text-xs font-body text-crimson/80 font-medium">
                   I'm reviewing your tone, structure, and academic clarity. Any feedback I give will be tailored specifically to the <strong>{section}</strong> module.
                </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
<ChatInterface 
              endpoint="/api/ai/proposal"
              feature="PROPOSAL_WRITER"
              placeholder="Ask for revisions or specific improvements..."
              submitOnMount={!historyMessages || historyMessages.length === 0}
              initialInput={`Draft the ${section} section based on this context.`}
              loadedHistoryId={activeHistoryId}
              additionalData={{ 
                section, 
                context, 
                templateLevel,
                // Only include historyMessages if it's a valid array
                ...(historyMessages && Array.isArray(historyMessages) && historyMessages.length > 0 && {
                  historyMessages: historyMessages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                  }))
                })
              }}
            />
          </div>
        </div>
      )}

      {!isSubmitted && (
        <ChatHistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
          featureFilter="PROPOSAL_WRITER"
          activeId={activeHistoryId}
        />
      )}
    </div>
  );
};
