// Fixed: Message handling and input validation in ChatInterface component - updated to use unified ChatMessage type for compatibility
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
import type { ChatMessage } from "@/types/aiTypes";

interface SanitizedMarkdownProps {
  content: string;
}

const SanitizedMarkdown: React.FC<SanitizedMarkdownProps> = React.memo(({ content }) => {
  const sanitized = React.useMemo(() => DOMPurify.sanitize(content), [content]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {sanitized}
    </ReactMarkdown>
  );
});

type Message = ChatMessage;

interface AdditionalData {
  historyMessages?: Message[];
  fromHistory?: boolean;
  [key: string]: any; // Allow additional properties
}

interface ChatInterfaceProps {
  endpoint: string;
  placeholder?: string;
  initialMessage?: string;
  onResponse?: (response: string) => void;
  additionalData?: AdditionalData;
  discipline?: string;
  feature?: AIFeature;
  submitOnMount?: boolean;
  initialInput?: string;
  loadedHistoryId?: string;
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
  loadedHistoryId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  // const [messageIdCounter, setMessageIdCounter] = useState(0); // Removed in favor of unique ID generation
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [draftConversation, setDraftConversation] = useState<{ id: string; messages: Message[] } | null>(null);
  const [additionalDataState, setAdditionalDataState] = useState<AdditionalData>(additionalData || {});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (initialMessage && messages.length === 0 && !submitOnMount) {
      setMessages([{ id: `msg-${Date.now()}`, role: "bot", content: initialMessage }]);
    }
  }, [initialMessage, submitOnMount]);

  // Exposed method to update messages externally if needed, or we can use another prop
  // For now, let's add a way to set messages from parent
  useEffect(() => {
    if (loadedHistoryId && Array.isArray(additionalData?.historyMessages)) {
      const historyMessages = additionalData.historyMessages as Message[];
      const isValidMessageArray = historyMessages.every(
        (msg) => msg && typeof msg === 'object' && 'role' in msg && 'content' in msg && 'id' in msg
      );
      if (isValidMessageArray) {
        setMessages(historyMessages);
      }
    }
  }, [additionalData, loadedHistoryId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        // disable abort on unmount to fix the empty body issue
        // abortControllerRef.current.abort();
      }
    };
  }, []);

const sendMessage = React.useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Use current time + random for unique ID
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = { id: msgId, role: "user", content: text };
    
    if (isMountedRef.current) {
      setMessages((prev: Message[]) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
    }

    try {
      // Safe serialization function to handle circular references
      const safeStringify = (obj: any): string => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
          }
          return value;
        });
      };

      // Clean and validate additionalData before sending
      const cleanAdditionalData = { ...additionalData };
      
      // Remove circular references from historyMessages if present
      if (cleanAdditionalData.historyMessages) {
        cleanAdditionalData.historyMessages = cleanAdditionalData.historyMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }));
      }

      // Remove undefined values
      Object.keys(cleanAdditionalData).forEach(key => {
        if (cleanAdditionalData[key] === undefined) {
          delete cleanAdditionalData[key];
        }
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: safeStringify({ ...cleanAdditionalData, topic: text, ...(discipline && { discipline }) }),
        signal: controller.signal,
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        let errorMessage = "Failed to get response";
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || responseText;
          } catch (jsonError) {
            errorMessage = responseText;
          }
        } catch (textError) {
          errorMessage = response.statusText || errorMessage;
        }

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

      const data = await response.json();

      if (isMountedRef.current) {
        const botMessage: Message = { 
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          role: "bot", 
          content: data.response 
        };
        setMessages((prev: Message[]) => [...prev, botMessage]);
        if (onResponse) onResponse(data.response);
      }
    } catch (error: any) {
        if (isMountedRef.current) {
          console.error("ChatInterface error:", error);
          const errorMessage: Message = { 
            id: `msg-${Date.now()}-error`, 
            role: "bot", 
            content: `**The Guide:** Oops! Something went wrong: *${error.message}*. Let's try again?` 
          };
          setMessages((prev: Message[]) => [...prev, errorMessage]);
        }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [endpoint, additionalData, discipline, isLoading, onResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

// Handle auto-submit on mount
  useEffect(() => {
    if (submitOnMount && initialInput && !hasAutoSubmitted.current && !additionalData?.fromHistory) {
      hasAutoSubmitted.current = true;
      sendMessage(initialInput);
    }
  }, [submitOnMount, initialInput, additionalData?.fromHistory, sendMessage]);

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
             key={msg.id}
            className={cn(
              "flex items-start gap-3",
              (msg.role === "user" || msg.role === "system") ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full shadow-sm",
                (msg.role === "user" || msg.role === "system") ? "bg-white border-2 border-gray-100 text-gray-400" : "bg-teal text-white shadow-teal/20"
              )}
            >
              {(msg.role === "user" || msg.role === "system") ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div
              className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm font-body leading-relaxed relative",
                (msg.role === "user" || msg.role === "system")
                  ? "bg-gray-50 text-gray-800 border-2 border-gray-100 rounded-tr-none hover:rotate-1 transition-transform"
                  : "bg-teal text-white rounded-tl-none shadow-lg shadow-teal/10 rotate-0"
              )}
            >
              {/* Speech bubble tail mockup */}
              <div className={cn(
                "absolute top-0 w-3 h-3 bg-inherit",
                (msg.role === "user" || msg.role === "system") ? "-right-1" : "-left-1"
              )} style={{ clipPath: (msg.role === 'user' || msg.role === 'system') ? "polygon(0 0, 100% 0, 100% 100%)" : "polygon(0 0, 100% 0, 0 100%)" }} />

               <div className="prose prose-sm prose-p:leading-relaxed max-w-none text-inherit">
                 <SanitizedMarkdown content={msg.content} />
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
          className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-teal/30 border-4 border-gray-300 focus:border-teal-500 transition-all"
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
            const hasExistingMessages = messages.length > 0;
            const isSameConversation = activeHistoryId === conv.id;
            
            if (hasExistingMessages && !isSameConversation) {
              setDraftConversation({ id: activeHistoryId || 'current', messages });
            }
            
            setActiveHistoryId(conv.id);
            setMessages([
              { id: `msg-${Date.now()}-1`, role: "user", content: conv.prompt },
              { id: `msg-${Date.now()}-2`, role: "bot", content: conv.response }
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
