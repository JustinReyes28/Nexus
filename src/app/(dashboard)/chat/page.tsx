"use client";

import React from "react";
import { ChatInterface } from "@/components/ai/ChatInterface";

const CHAT_ADDITIONAL_DATA = { discipline: "general" } as const;

export default function ChatModePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
         <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chat Mode</h1>
           <p className="text-gray-600 dark:text-gray-300 mb-4">
             Interact with The Guide in a conversational interface
           </p>
           <p className="text-gray-700 dark:text-gray-200 mb-6">
             Welcome to Chat Mode! Here you can have a free-form conversation with The Guide.
             Ask questions, brainstorm ideas, or get help with your capstone project.
           </p>
         </div>

        <div className="mt-8">
          <ChatInterface
            endpoint="/api/ai/chat"
            feature="CHAT"
            placeholder="Ask The Guide anything about your project..."
            initialMessage="**The Guide:** Hello! I'm here to help with your capstone project. What would you like to discuss today?"
            additionalData={CHAT_ADDITIONAL_DATA}
          />
        </div>
      </div>
    </div>
  );
}