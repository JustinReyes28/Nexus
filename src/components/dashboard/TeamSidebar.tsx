"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Sparkles, X, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string;
  status: string;
  image: string | null;
  initial: string;
}

export default function TeamSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStartChat = () => {
    router.push('/chat');
    setIsOpen(false); // Close the sidebar after navigating
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Type guard to validate API response
  const isValidTeamMemberResponse = (data: unknown): data is TeamMember[] => {
    if (!Array.isArray(data)) return false;
    
    return data.every(member =>
      typeof member === 'object' &&
      member !== null &&
      typeof member.id === 'string' &&
      typeof member.name === 'string' &&
      typeof member.status === 'string' &&
      (member.image === null || typeof member.image === 'string') &&
      typeof member.initial === 'string'
    );
  };

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team/members');
        if (response.ok) {
          const data = await response.json();
          
          if (isValidTeamMemberResponse(data)) {
            setTeamMembers(data);
          } else {
            console.error('Invalid team members data received from API');
            setTeamMembers([]);
          }
        } else {
          console.error('Failed to fetch team members:', response.statusText);
          setTeamMembers([]);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setLoading(true); // Reset loading state when opening
      fetchTeamMembers();
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-20 right-4 z-50 p-3 bg-white border-2 border-sunny",
          "rounded-xl hover:border-sunny hover:shadow-md transition-all shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-sunny/20",
          isOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Open team sidebar"
      >
        <PanelRightClose className="w-5 h-5 text-gray-700" />
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 
                     transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[320px] bg-white shadow-xl",
          "flex flex-col py-8 px-6 border-l border-gray-200",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
        role="dialog"
        aria-label="Team sidebar"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-crimson/20"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content - "The Team" Section */}
        <div className="mb-8 px-2 mt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            The Team
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                          member.status === "online"
                            ? "border-sunny bg-white text-gray-900"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                        )}
                      >
                        {member.initial}
                      </div>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                          member.status === "online"
                            ? "bg-sunny animate-pulse-organic"
                            : "bg-gray-300"
                        )}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                      {member.name}
                    </span>
                  </div>
                  <MessageCircle className="w-4 h-4 text-gray-300 group-hover:text-crimson opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No team members found</p>
            )}
          </div>
        </div>

        {/* Content - "The Guide" Section */}
        <div className="mt-auto">
          <div className="bg-canvas p-6 rounded-2xl border-2 border-dashed border-teal/30 relative overflow-hidden text-center">
            {/* Breathing Mascot Preview */}
            <div className="w-20 h-20 bg-teal/10 rounded-[35% 65% 45% 5% / 5% 45% 65% 35%] animate-[pulse-organic_4s_infinite] mx-auto mb-4 flex items-center justify-center">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-teal rounded-full" />
                <div className="w-1.5 h-1.5 bg-teal rounded-full" />
              </div>
            </div>

            <h4 className="font-heading font-extrabold text-gray-900 mb-2">
              The Guide
            </h4>
            <p className="text-[10px] text-gray-500 font-body italic mb-4">
              "Ready whenever you are."
            </p>

            <button
              onClick={handleStartChat}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-teal text-teal font-bold rounded-xl text-xs hover:bg-teal hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              Start Chat
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
