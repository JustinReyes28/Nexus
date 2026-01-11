"use client";

import React, { useState, useEffect } from "react";
import { X, History, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationPreview } from "./ConversationPreview";
import { Button } from "@/components/ui/Button";

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (conversation: any) => void;
  featureFilter?: string;
  activeId?: string;
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  isOpen,
  onClose,
  onSelect,
  featureFilter,
  activeId,
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL("/api/ai/history", window.location.origin);
      if (featureFilter) url.searchParams.append("feature", featureFilter);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to load history");
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, featureFilter]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile and desktop click-away */}
      <div 
        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l-2 border-gray-100 flex flex-col">
        {/* Texture bg */}
        <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal/10 text-teal rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-gray-900">History</h3>
              <p className="text-[10px] text-teal font-bold uppercase tracking-widest">Past Insights</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-500"
            title="Close history"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:inline animate-in fade-in slide-in-from-right-2">Close</span>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <Loader2 size={32} className="text-teal animate-spin" />
              <p className="text-sm font-handwritten text-teal/60 font-bold italic">The Guide is recalling...</p>
            </div>
          ) : error ? (
            <div className="bg-sunny/10 border-2 border-sunny/20 p-6 rounded-3xl space-y-4 text-center">
              <AlertCircle className="mx-auto text-sunny" size={32} />
              <p className="text-xs font-body text-sunny-900/70 font-medium">
                Couldn't reach your past insights. Let's try again?
              </p>
              <Button variant="outline" size="sm" onClick={fetchHistory} leftIcon={<RefreshCw size={14} />}>
                Retry
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 space-y-4 opacity-50">
              <Sparkles size={48} className="mx-auto text-gray-200" />
              <div className="space-y-1">
                <p className="text-sm font-body font-bold text-gray-900">No history yet</p>
                <p className="text-xs font-body text-gray-500">Your future insights will appear here!</p>
              </div>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationPreview
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                onClick={() => onSelect(conv)}
              />
            ))
          )}
        </div>

        {/* Footer / Tip */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 relative z-10">
          <p className="text-[10px] font-body text-gray-400 leading-relaxed italic">
            "Your past chats are archived here to help you build upon previous ideas and refine your research."
          </p>
        </div>
      </div>
    </>
  );
};
