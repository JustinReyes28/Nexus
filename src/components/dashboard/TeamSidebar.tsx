"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { User, MessageCircle, Sparkles } from "lucide-react";

const teamMembers = [
  { name: "Sarah", status: "online", image: null, initial: "S" },
  { name: "James", status: "offline", image: null, initial: "J" },
  { name: "Mia", status: "online", image: null, initial: "M" },
];

export default function TeamSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("flex flex-col py-8 px-6", className)}>
      <div className="mb-8 px-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">The Team</h3>
        <div className="space-y-4">
           {teamMembers.map((member) => (
             <div key={member.name} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                        member.status === "online" ? "border-sunny bg-white text-gray-900" : "border-gray-200 bg-gray-50 text-gray-400"
                      )}>
                         {member.initial}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        member.status === "online" ? "bg-sunny animate-pulse-organic" : "bg-gray-300"
                      )} />
                   </div>
                   <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{member.name}</span>
                </div>
                <MessageCircle className="w-4 h-4 text-gray-300 group-hover:text-crimson opacity-0 group-hover:opacity-100 transition-all" />
             </div>
           ))}
        </div>
      </div>

      <div className="mt-auto">
        {/* "The Guide" Personality Card */}
        <div className="bg-canvas p-6 rounded-2xl border-2 border-dashed border-teal/30 relative overflow-hidden text-center">
            {/* Breathing Mascot Preview */}
            <div className="w-20 h-20 bg-teal/10 rounded-[35% 65% 45% 55% / 55% 45% 65% 35%] animate-[pulse-organic_4s_infinite] mx-auto mb-4 flex items-center justify-center">
               <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-teal rounded-full" />
                  <div className="w-1.5 h-1.5 bg-teal rounded-full" />
               </div>
            </div>
            
            <h4 className="font-heading font-extrabold text-gray-900 mb-2">The Guide</h4>
            <p className="text-[10px] text-gray-500 font-body italic mb-4">"Ready whenever you are."</p>
            
            <button className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-teal text-teal font-bold rounded-xl text-xs hover:bg-teal hover:text-white transition-all shadow-sm">
                <Sparkles className="w-3 h-3" />
                Start Chat
            </button>
        </div>
      </div>
    </aside>
  );
}
