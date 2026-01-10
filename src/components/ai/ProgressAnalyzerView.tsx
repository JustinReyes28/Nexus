"use client";

import React, { useState, useEffect } from "react";
import { ChatInterface } from "./ChatInterface";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Activity, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";

export const ProgressAnalyzerView: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        const projectsData = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch projects");
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-10">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-teal/10 text-teal rounded-3xl flex items-center justify-center mx-auto rotate-3">
              <Activity size={32} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900 mt-4">
              Analyze Your Progress
            </h3>
            <p className="text-gray-500 font-body italic text-sm">
              "Tell me how your project is going, and I'll help you spot risks and plan your next moves."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-canvas border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-200/50">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Select Project</label>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-teal transition-all appearance-none cursor-pointer disabled:opacity-50"
                disabled={isLoadingProjects || projects.length === 0}
              >
                {isLoadingProjects ? (
                  <option>Loading projects...</option>
                ) : projects.length > 0 ? (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))
                ) : (
                  <option>No projects found</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Current Status & Recent Hurdles</label>
              <textarea
                placeholder="What have you completed recently? Any blockers or concerns about the timeline?"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                rows={5}
                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-teal transition-all resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="ai" 
              className="w-full h-14 text-base shadow-lg shadow-teal/20"
              leftIcon={<Sparkles size={20} />}
              disabled={!selectedProjectId || !currentStatus.trim()}
            >
              Run Status Analysis
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
          {/* Progress Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-canvas border-2 border-gray-100 p-6 rounded-3xl space-y-6">
              <h4 className="text-sm font-heading font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-teal" />
                Snapshot
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Project</p>
                  <p className="text-sm font-body font-semibold text-gray-700">{selectedProject?.title || "Project Name"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phase</p>
                     <div className="flex items-center gap-1">
                        <Clock size={12} className="text-sunny" />
                        <p className="text-xs font-body font-semibold text-gray-600">{selectedProject?.status || "In Progress"}</p>
                     </div>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Health</p>
                     <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-teal" />
                        <p className="text-xs font-body font-semibold text-gray-600">Stable</p>
                     </div>
                   </div>
                </div>
              </div>

              <div className="pt-4">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                   onClick={() => setIsSubmitted(false)}
                 >
                   Re-analyze Status
                 </Button>
              </div>
            </div>

            <div className="bg-sunny/5 border-2 border-sunny/20 p-6 rounded-3xl space-y-4">
               <div className="flex items-center gap-2 text-sunny">
                  <AlertCircle size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Risk Assessment</span>
               </div>
               <p className="text-xs font-body text-gray-600 leading-relaxed italic">
                  "I'm comparing your current status against your original timeline to identify potential bottlenecks early."
               </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface 
              endpoint="/api/ai/progress"
              placeholder="Ask for next steps or deadline checks..."
              initialMessage={`Analysis complete for **${selectedProject?.title}**. Based on your update, I've identified some core strengths and a few areas where we might need to adjust the pace. How would you like to proceed?`}
              additionalData={{ projectId: selectedProjectId, currentStatus }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
