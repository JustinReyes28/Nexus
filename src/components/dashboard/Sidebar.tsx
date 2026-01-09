"use client";

import React from "react";
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
  Sparkle as SparkleIcon
} from "lucide-react";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";

const navItems = [
  { label: "Base Camp", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Drafts", icon: FileText, href: "/drafts" },
  { label: "Research", icon: Search, href: "/research" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col py-8 px-6", className)}>
      <Link href="/" className="flex items-center gap-3 mb-12 px-2">
        <div className="w-8 h-8 bg-crimson rounded-lg rotate-3" />
        <span className="text-xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
      </Link>

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
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-crimson" : "text-gray-400 group-hover:text-gray-900")} />
              {item.label}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-crimson rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-2">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
          <Settings className="w-5 h-5 text-gray-400" />
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-crimson rounded-lg hover:bg-red-50 text-left"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-crimson" />
          Sign Out
        </button>
      </div>

      {/* "The Guide" Quick Access Card */}
      <div className="mt-8 p-4 bg-teal/5 rounded-xl border border-teal/10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-1 opacity-20 transition-opacity group-hover:opacity-100">
            <SparkleIcon className="w-4 h-4 text-teal animate-sparkle" />
         </div>
         <p className="text-[10px] uppercase font-bold text-teal tracking-widest mb-1">AI Assistant</p>
         <p className="text-xs font-heading font-bold text-gray-900 mb-3">Ask The Guide</p>
         <button className="w-full py-2 bg-teal text-white rounded-lg text-xs font-bold shadow-sm shadow-teal/20 hover:bg-teal/90 transition-colors">
            Summon Guide
         </button>
      </div>
    </aside>
  );
}
