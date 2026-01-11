"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Wand2, User, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { TheGuide } from "./TheGuide";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { AIFeature } from "@prisma/client";


interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatInterfaceProps {
  endpoint: string;
  placeholder?: string;
  initialMessage?: string;
  onResponse?: (response: string) => void;
  additionalData?: Record<string, any>;
  discipline?: string;
  feature?: AIFeature;
  submitOnMount?: boolean;
  initialInput?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  endpoint,
  placeholder = "What's on your mind?",
  initialMessage,
  onResponse,
  additionalData = {},
  discipline,
  feature,
  submitOnMount = false,
  initialInput = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (initialMessage && messages.length === 0 && !submitOnMount) {
      setMessages([{ role: "bot", content: initialMessage }]);
    }
  }, [initialMessage, submitOnMount]);

  // Exposed method to update messages externally if needed, or we can use another prop
  // For now, let's add a way to set messages from parent
  useEffect(() => {
    if (additionalData?.historyMessages) {
      setMessages(additionalData.historyMessages);
    }
  }, [additionalData?.historyMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...additionalData, topic: text, ...(discipline && { discipline }) }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to get response";
        if (response.status === 400) {
          throw new Error(`Input validation error: ${errorMessage}`);
        } else if (response.status === 401) {
          throw new Error("Authentication required. Please log in.");
        } else if (response.status === 403) {
          throw new Error("AI credit limit reached. Please upgrade your plan.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        } else {
          throw new Error(errorMessage);
        }
      }

      const botMessage: Message = { role: "bot", content: data.response };
      setMessages((prev: Message[]) => [...prev, botMessage]);
      if (onResponse) onResponse(data.response);
    } catch (error: any) {
      console.error("ChatInterface error:", error);
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "bot", content: `**The Guide:** Oops! Something went wrong: *${error.message}*. Let's try again?` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  // Handle auto-submit on mount
  useEffect(() => {
    if (submitOnMount && initialInput && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      sendMessage(initialInput);
    }
  }, [submitOnMount, initialInput]);

  return (
    <div className="flex flex-col h-[600px] border-2 border-gray-100 rounded-2xl bg-white shadow-xl shadow-gray-200/50 overflow-hidden relative">
      {/* Texture bg */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-20" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm relative z-10">
         <div className="flex items-center gap-3">
            <TheGuide size="sm" expression={isLoading ? "thinking" : "idle"} />
            <div>
               <h4 className="text-sm font-heading font-extrabold text-gray-900">The Guide</h4>
               <p className="text-[10px] text-teal font-bold uppercase tracking-widest">Always Active</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {feature && (
               <button
                  type="button"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={cn(
                     "p-2 rounded-xl transition-all duration-300",
                     isHistoryOpen ? "bg-teal text-white shadow-lg shadow-teal/20" : "bg-gray-100 text-gray-400 hover:text-teal hover:bg-teal/5"
                  )}
                  title="View History"
               >
                  <HistoryIcon size={16} />
               </button>
            )}
            <Wand2 className="w-4 h-4 text-teal animate-sparkle" />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        {messages.map((msg: Message, i: number) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full shadow-sm",
                msg.role === "user" ? "bg-white border-2 border-gray-100 text-gray-400" : "bg-teal text-white shadow-teal/20"
              )}
            >
              {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div
              className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm font-body leading-relaxed relative",
                msg.role === "user"
                  ? "bg-gray-50 text-gray-800 border-2 border-gray-100 rounded-tr-none hover:rotate-1 transition-transform"
                  : "bg-teal text-white rounded-tl-none shadow-lg shadow-teal/10 -rotate-1 hover:rotate-0 transition-transform"
              )}
            >
              {/* Speech bubble tail mockup */}
              <div className={cn(
                "absolute top-0 w-3 h-3 bg-inherit",
                msg.role === "user" ? "-right-1" : "-left-1"
              )} style={{ clipPath: msg.role === 'user' ? "polygon(0 0, 100% 0, 100% 100%)" : "polygon(0 0, 100% 0, 0 100%)" }} />

              <div className="prose prose-sm prose-p:leading-relaxed max-w-none text-inherit">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {DOMPurify.sanitize(msg.content)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-teal text-white animate-pulse-organic">
              <Sparkles size={16} />
            </div>
            <div className="bg-teal/10 text-teal p-4 rounded-2xl rounded-tl-none flex items-center gap-3 border border-teal/20 -rotate-1">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-xs font-bold italic font-handwritten">The Guide is thinking creatively...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex gap-3 relative z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal/30 border-2 border-transparent focus:border-teal/20 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-teal text-white p-3 rounded-xl hover:bg-teal/90 disabled:opacity-50 transition-all shadow-lg shadow-teal/20 active:scale-95 flex items-center justify-center min-w-[48px]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>

      {feature && (
        <ChatHistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={(conv) => {
            setActiveHistoryId(conv.id);
            setMessages([
              { role: "user", content: conv.prompt },
              { role: "bot", content: conv.response }
            ]);
            setIsHistoryOpen(false);
          }}
          featureFilter={feature}
          activeId={activeHistoryId}
        />
      )}
    </div>
  );
};
