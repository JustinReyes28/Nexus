// Fixed: Type compatibility between ChatMessage and Message interfaces in MethodologyAdvisorView component - fixed type mismatch for historyMessages prop in ChatInterface
"use client";

import React, { useState } from "react";
import type { Conversation, ChatMessage } from "@/types/aiTypes";
import { convertConversationToMessages } from "@/types/aiTypes";
import { ChatInterface } from "./ChatInterface";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { Button } from "@/components/ui/Button";
import { FlaskConical, Beaker, FileText, AlertTriangle, Sparkles, History } from "lucide-react";

const RESEARCH_TYPES = [
  "Quantitative",
  "Qualitative",
  "Mixed-Methods",
  "Experimental",
  "Observational",
  "Survey",
  "Case Study",
];

const DISCIPLINES = [
  "Computer Science",
  "Engineering",
  "Social Sciences",
  "Natural Sciences",
  "Healthcare",
  "Business",
];

export const MethodologyAdvisorView: React.FC = () => {
  const [formData, setFormData] = useState({
    researchType: "quantitative",
    discipline: "computer-science",
    problemStatement: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[] | undefined>();
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();

const handleHistorySelect = (conv: Conversation) => {
    setActiveHistoryId(conv.id);
    setHistoryMessages(convertConversationToMessages(conv));
    setIsSubmitted(true);
    setIsHistoryOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.problemStatement.length < 20) return;
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
                  className="text-xs text-gray-400 hover:text-purple-600 font-bold"
                  leftIcon={<History size={14} />}
               >
                  History
               </Button>
            </div>
            <div className="w-16 h-16 bg-purple-500/10 text-purple-600 rounded-3xl flex items-center justify-center mx-auto -rotate-6">
              <FlaskConical size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              Design Your Methodology
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Tell me your research problem, and I'll suggest the most robust methodology for your field."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Research Type</label>
                 <select 
                   value={formData.researchType}
                   onChange={(e) => setFormData({ ...formData, researchType: e.target.value })}
                   className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                 >
                   {RESEARCH_TYPES.map(t => (
                     <option key={t} value={t.toLowerCase()}>{t}</option>
                   ))}
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Discipline</label>
                 <select 
                   value={formData.discipline}
                   onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                   className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                 >
                    {DISCIPLINES.map(d => (
                      <option key={d} value={d.toLowerCase().replace(/\s+/g, "-")}>{d}</option>
                    ))}
                 </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Problem Statement</label>
              <textarea
                placeholder="Describe the core problem or research question you are addressing..."
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                rows={5}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-purple-500 transition-all resize-none"
                required
              />
              <div className="text-[10px] text-gray-400 italic px-1">
                 Min. 20 characters for a comprehensive recommendation
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base shadow-lg shadow-purple-500/10 bg-purple-600 hover:bg-purple-700 border-none text-white"
              leftIcon={<Sparkles size={20} />}
              disabled={formData.problemStatement.length < 20}
            >
              Get Methodology Advice
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Advisor Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Beaker size={16} className="text-purple-600" />
                Parameters
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Research Type</p>
                  <p className="text-sm font-body font-semibold text-gray-700 capitalize">{formData.researchType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discipline</p>
                   <p className="text-sm font-body font-semibold text-gray-700 capitalize">{formData.discipline.replace(/-/g, " ")}</p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                       <FileText size={10} />
                       Problem Statement
                    </p>
                    <p className="text-xs text-gray-600 font-body leading-relaxed line-clamp-4">
                       {formData.problemStatement}
                    </p>
                 </div>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                   onClick={() => setIsSubmitted(false)}
                 >
                   Edit problem statement
                 </Button>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl space-y-3">
               <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Limitation Check</span>
               </div>
               <p className="text-xs font-body text-amber-900/70 font-medium">
                  "I'll also identify potential limitations in your chosen approach and suggest mitigation strategies."
               </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface 
              endpoint="/api/ai/methodology"
              feature="METHODOLOGY_ADVISOR"
              placeholder="Ask about data collection, analysis, or tools..."
              submitOnMount={!historyMessages || historyMessages.length === 0}
              initialInput={formData.problemStatement}
              loadedHistoryId={activeHistoryId}
              additionalData={{ ...formData, historyMessages }}
            />
          </div>
        </div>
      )}

      {!isSubmitted && (
        <ChatHistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
          featureFilter="METHODOLOGY_ADVISOR"
          activeId={activeHistoryId}
        />
      )}
    </div>
  );
};
