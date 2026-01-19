"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/dashboard/Sidebar";
import TeamSidebar from "@/components/dashboard/TeamSidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/components/dashboard/SidebarContext";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleMobile } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto relative z-10 py-8 transition-all duration-300 ease-in-out px-4 md:px-8",
        isCollapsed ? "lg:pl-20" : "lg:pl-[260px]"
      )}
    >
      {/* Mobile Header Trigger */}
      <div className="lg:hidden flex items-center mb-6">
        <button
          onClick={toggleMobile}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/dashboard" className="ml-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
            <Image src="/images/logo.png" alt="App logo" width={32} height={32} className="w-8 h-8" />
          </div>
          <span className="font-bold text-xl text-teal tracking-tight">Nexus</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto min-h-full">
        {children}
      </div>
    </main>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-canvas font-body overflow-hidden">
        {/* Texture Overlay for the whole dashboard */}
        <div className="fixed inset-0 bg-grain pointer-events-none z-0 opacity-50" />

        {/* Left Navigation Sidebar */}
        <Sidebar className="z-30" />

        {/* Main Content Area (Fluid) */}
        <MainContent>
          {children}
        </MainContent>

        {/* TeamSidebar */}
        <TeamSidebar />
      </div>
    </SidebarProvider>
  );
}
