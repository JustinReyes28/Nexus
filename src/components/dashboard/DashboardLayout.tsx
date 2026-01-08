"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TeamSidebar from "@/components/dashboard/TeamSidebar";
import { cn } from "@/lib/utils";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-canvas font-body overflow-hidden">
      {/* Texture Overlay for the whole dashboard */}
      <div className="fixed inset-0 bg-grain pointer-events-none z-0" />
      
      {/* Left Navigation Sidebar (240px) */}
      <Sidebar className="z-20 w-60 hidden lg:flex border-r border-gray-200 bg-white" />

      {/* Main Content Area (Fluid) */}
      <main className="flex-1 overflow-y-auto relative z-10 px-4 md:px-8 py-8">
        <div className="max-w-5xl mx-auto min-h-full">
           {children}
        </div>
      </main>

      {/* Right Team/AI Sidebar (300px) */}
      <TeamSidebar className="z-20 w-[320px] hidden xl:flex border-l border-gray-200 bg-white" />
    </div>
  );
}
