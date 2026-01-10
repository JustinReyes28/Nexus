"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Search,
  Calendar,
  Settings,
  LogOut,
  Sparkle as SparkleIcon,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
} from "lucide-react";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";

const navItems = [
  { label: "Base Camp", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Drafts", icon: FileText, href: "/drafts" },
  { label: "Research", icon: Search, href: "/research" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "Chat Mode", icon: MessageCircle, href: "/chat" },
];

export default function Sidebar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when menu is open (mobile only)
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
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden p-3 bg-white border-2 border-gray-200",
          "rounded-xl hover:border-crimson hover:shadow-md transition-all shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-crimson/20",
          isOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Open sidebar menu"
      >
        <PanelLeftClose className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40
                     transition-opacity duration-300 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Unified Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white shadow-xl w-full",
          "flex flex-col border-r border-gray-200",
          "transition-all duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:shadow-none",
          isCollapsed ? "lg:w-20 px-3 py-6" : "lg:w-60 px-6 py-8",
          className
        )}
        role="dialog"
        aria-label="Main navigation sidebar"
      >
        {/* Mobile Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg
                     transition-colors focus:outline-none focus:ring-2 focus:ring-crimson/20
                     lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Desktop Collapse Toggle Button - ONLY VISIBLE ON DESKTOP */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-4 -right-3 z-50 p-1.5 bg-white border border-gray-200 rounded-full
                     shadow-sm hover:border-crimson hover:text-crimson transition-all
                     focus:outline-none focus:ring-2 focus:ring-crimson/20 items-center justify-center text-gray-400"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Logo/Brand */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 mb-10 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <div className="w-8 h-8 bg-crimson rounded-lg rotate-3 flex-shrink-0" />
          <span className={cn(
            "text-xl font-heading font-extrabold tracking-tighter text-gray-900 whitespace-nowrap overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            NEXUS
          </span>
        </Link>
        
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative",
                  isActive
                    ? "text-crimson"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                   isCollapsed && "justify-center px-2"
                )}
                onClick={handleClose}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive
                      ? "text-crimson"
                      : "text-gray-400 group-hover:text-gray-900"
                  )}
                />
                <span className={cn(
                  "whitespace-nowrap overflow-hidden transition-all duration-300",
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                )}>
                  {item.label}
                </span>
                
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 w-1 h-6 bg-crimson rounded-r-full" />
                )}
                 {isActive && isCollapsed && (
                  <div className="absolute left-0 w-1 h-3 bg-crimson rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={cn(
          "pt-6 border-t border-gray-100 flex flex-col gap-2 mt-auto text-sm transition-all",
           isCollapsed ? "items-center" : "items-stretch"
        )}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 font-semibold",
              isCollapsed && "justify-center"
            )}
            onClick={handleClose}
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span className={isCollapsed ? "hidden" : "block"}>Settings</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut({ callbackUrl: "/login" });
              handleClose();
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-crimson rounded-lg hover:bg-red-50 text-left font-semibold",
              isCollapsed && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-crimson" />
             <span className={isCollapsed ? "hidden" : "block"}>Sign Out</span>
          </button>
        </div>

        {/* "The Guide" Quick Access Card */}
        <div className={cn(
          "mt-6 rounded-xl border relative overflow-hidden group transition-all duration-300",
          isCollapsed 
            ? "bg-transparent border-transparent p-0 w-full flex justify-center h-10" 
            : "p-4 bg-teal/5 border-teal/10"
        )}>
           {isCollapsed ? (
             <button className="p-2 bg-teal/10 rounded-lg hover:bg-teal/20 text-teal transition-colors" title="Ask The Guide">
                <SparkleIcon className="w-5 h-5" />
             </button>
           ) : (
             <>
               <div className="absolute top-0 right-0 p-1 opacity-20 transition-opacity group-hover:opacity-100">
                <SparkleIcon className="w-4 h-4 text-teal animate-sparkle" />
              </div>
              <p className="text-[10px] uppercase font-bold text-teal tracking-widest mb-1">
                AI Assistant
              </p>
              <p className="text-xs font-heading font-bold text-gray-900 mb-3">
                Ask The Guide
              </p>
              <Link href="/capstone-assistant" className="block w-full">
                <button className="w-full py-2 bg-teal text-white rounded-lg text-xs font-bold shadow-sm shadow-teal/20 hover:bg-teal/90 transition-colors">
                  Summon Guide
                </button>
              </Link>
            </>
           )}
        </div>
      </aside>
    </>
  );
}
