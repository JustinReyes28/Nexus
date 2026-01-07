"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  endpoint,
  placeholder = "Type your prompt...",
  initialMessage,
  onResponse,
  additionalData = {},
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ role: "bot", content: initialMessage }]);
    }
  }, [initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...additionalData, topic: input, content: input, problemStatement: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const botMessage: Message = { role: "bot", content: data.response };
      setMessages((prev) => [...prev, botMessage]);
      if (onResponse) onResponse(data.response);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-card shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted rounded-tl-none whitespace-pre-wrap"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-muted">
              <Bot size={18} />
            </div>
            <div className="bg-muted p-3 rounded-lg rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm italic">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-muted rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};
