// TODO: Review type compatibility between ConversationHistory and Message interfaces in ProgressAnalyzerView component - fix type mismatch for historyMessages prop in ChatInterface - assign to @developer
"use client";

import React, { useState, useEffect } from "react";
import { ChatInterface } from "./ChatInterface";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Activity, CheckCircle2, Clock, AlertCircle, Sparkles, History } from "lucide-react";

interface Project {
  id: string;
  title: string;
  status?: string;
}

interface ConversationHistory {
  id: string;
  prompt: string;
  response: string;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

export const ProgressAnalyzerView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyMessages, setHistoryMessages] = useState<ConversationHistory[] | undefined>();
  
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

const handleHistorySelect = (conv: ConversationHistory) => {
    setActiveHistoryId(conv.id);
    setHistoryMessages([conv]);
    setIsSubmitted(true);
    setIsHistoryOpen(false);
  };

useEffect(() => {
    async function fetchProjects() {
      const controller = new AbortController();
      const { signal } = controller;

      try {
        const response = await fetch("/api/projects", { signal });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        
        const data = await response.json();
        const projectsData = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectsData);
        setProjectsError(null);
        
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Failed to fetch projects:", error);
          setProjectsError(error instanceof Error ? error.message : "Failed to load projects");
        }
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();

    return () => {
      // Cleanup not needed since controller is local to the fetch function
    };
  }, []);

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await fetch("/api/projects", { signal });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const data = await response.json();
      const projectsData = Array.isArray(data) ? data : data.projects || [];
      setProjects(projectsData);
      
      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Failed to fetch projects:", error);
        setProjectsError(error instanceof Error ? error.message : "Failed to load projects");
      }
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
                  className="text-xs text-gray-400 hover:text-teal font-bold"
                  leftIcon={<History size={14} />}
               >
                  History
               </Button>
            </div>
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
                  <option value="">Loading projects...</option>
                ) : projectsError ? (
                  <option value="">Failed to load projects — retry</option>
                ) : projects.length > 0 ? (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))
                ) : (
                  <option value="">No projects found</option>
                )}
              </select>
              {projectsError && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={loadProjects}
                >
                  Retry
                </Button>
              )}
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
                   onClick={() => {
                     setIsSubmitted(false);
                     setHistoryMessages(undefined);
                     setActiveHistoryId(undefined);
                   }}
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
              feature="PROGRESS_ANALYZER"
              placeholder="Ask for next steps or deadline checks..."
              submitOnMount={!historyMessages || historyMessages.length === 0}
              initialInput={`Analyze the progress for ${selectedProject?.title ?? 'the project'}.`}
              loadedHistoryId={activeHistoryId}
              additionalData={{
                projectId: selectedProjectId,
                currentStatus,
                historyMessages: historyMessages?.flatMap(hm => [
                  { id: `user-${hm.id}`, role: "user" as const, content: hm.prompt },
                  { id: `bot-${hm.id}`, role: "bot" as const, content: hm.response }
                ]),
                fromHistory: !!historyMessages && historyMessages.length > 0
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
          featureFilter="PROGRESS_ANALYZER"
          activeId={activeHistoryId}
        />
      )}
    </div>
  );
};
