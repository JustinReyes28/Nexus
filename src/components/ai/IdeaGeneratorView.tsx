"use client";

import React, { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { Button } from "@/components/ui/Button";
import { Sparkles, Brain, Target, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const DISCIPLINES = [
  "Computer Science",
  "Engineering",
  "Business & Marketing",
  "Healthcare & Medicine",
  "Social Sciences",
  "Natural Sciences",
  "Arts & Humanities",
  "Education",
  "Environmental Science",
];

export const IdeaGeneratorView: React.FC = () => {
  const [formData, setFormData] = useState({
    discipline: "Computer Science",
    topic: "",
    constraints: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.topic.length < 3) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-10">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-sunny/10 text-sunny rounded-3xl flex items-center justify-center mx-auto rotate-3 group-hover:rotate-0 transition-transform">
              <Brain size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              What sparks your interest?
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Tell me a bit about your field and what you're passionate about."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Field of Study</label>
              <select 
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-teal transition-all appearance-none cursor-pointer"
              >
                {DISCIPLINES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Initial Topic or Interest</label>
              <input
                type="text"
                placeholder="e.g. Sustainable energy in urban areas"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-teal transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Constraints (Optional)</label>
              <textarea
                placeholder="e.g. Must be low-cost, 6-month timeline, local resources only"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                rows={3}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-teal transition-all resize-none"
              />
            </div>

            <Button 
              type="submit" 
              variant="ai" 
              className="w-full h-14 text-base shadow-lg shadow-teal/20"
              leftIcon={<Sparkles size={20} />}
              disabled={formData.topic.length < 3}
            >
              Generate & Validate Ideas
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Input Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Target size={16} className="text-crimson" />
                Current Focus
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discipline</p>
                  <p className="text-sm font-body font-semibold text-gray-700">{formData.discipline}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Topic</p>
                  <p className="text-sm font-body font-semibold text-gray-700">{formData.topic}</p>
                </div>
                {formData.constraints && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Constraints</p>
                    <p className="text-sm font-body font-semibold text-gray-700">{formData.constraints}</p>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setIsSubmitted(false)}
              >
                Edit Parameters
              </Button>
            </div>

            <div className="bg-teal/5 border-2 border-teal/20 p-6 rounded-3xl space-y-4 text-center">
              <ShieldCheck className="mx-auto text-teal" size={32} />
              <p className="text-xs font-body text-teal-900/70 font-medium">
                "I'll validate your ideas against academic rigor and available scope as we brainstorm!"
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface 
              endpoint="/api/ai/ideas"
              placeholder="Ask for more ideas or deeper validation..."
              initialMessage={`Hello! I've analyzed your interest in **${formData.topic}** within the **${formData.discipline}** field. Here are some high-potential capstone project ideas we can explore together...`}
              additionalData={formData}
            />
          </div>
        </div>
      )}
    </div>
  );
};
