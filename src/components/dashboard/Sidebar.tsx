// i will Review this later
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Search,
  Calendar,
  MessageCircle,
  Sparkles,
  Settings,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { TheGuide } from "@/components/ai/TheGuide";
import { signOut } from "next-auth/react";

interface NavItemProps {
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  variant?: "default" | "danger";
}

const NavItem = ({ href, onClick, icon: Icon, label, isCollapsed, variant = "default" }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = href ? (
    href === "/"
      ? pathname === "/" || pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)
  ) : false;

  const content = (
    <>
      <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
      {!isCollapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
      {isCollapsed && (
        <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap font-medium">
          {label}
        </div>
      )}
    </>
  );

  const baseStyles = cn(
    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
    isCollapsed ? "justify-center" : "",
    variant === "danger" 
      ? "text-gray-500 hover:bg-crimson/5 hover:text-crimson"
      : isActive 
        ? "bg-teal text-white shadow-md shadow-teal/20" 
        : "text-gray-500 hover:bg-teal/5 hover:text-teal"
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(baseStyles, "w-full text-left")}>
      {content}
    </button>
  );
};

export default function Sidebar({ className }: { className?: string }) {
  const { isCollapsed, toggleCollapse, isMobileOpen, toggleMobile, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Base Camp" },
    { href: "/drafts", icon: FileText, label: "My Drafts" },
    { href: "/research", icon: Search, label: "Research" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/chat", icon: MessageCircle, label: "Chat Mode" },
  ];

  const bottomNavItems = [
    { href: "/settings", icon: Settings, label: "Settings" },
    { 
      onClick: () => signOut({ callbackUrl: "/" }), 
      icon: LogOut, 
      label: "Sign Out", 
      variant: "danger" as const 
    },
  ];

  const renderSidebarContent = (collapsed: boolean, isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={cn(
        "flex items-center p-4 border-b border-gray-100 h-16",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
<Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
              <Image src="/images/logo.png" alt="Nexus logo" width={24} height={24} className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-teal tracking-tight">Nexus</span>
          </Link>
        ) : (
<Link href="/dashboard" className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
              <Image src="/images/logo.png" alt="Nexus logo" width={24} height={24} className="w-6 h-6" />
            </div>
          </Link>
        )}
        
        {/* Desktop Toggle */}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Mobile Toggle inside sidebar */}
        <button 
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.href} 
            {...item} 
            isCollapsed={collapsed} 
          />
        ))}

        {/* The Guide Card */}
        <div className={cn(
          "mt-8 p-4 rounded-2xl bg-gradient-to-br from-teal/5 to-sunny/5 border border-teal/10 relative overflow-hidden group",
          collapsed ? "p-2 items-center flex flex-col" : ""
        )}>
          <div className="flex flex-col items-center gap-3 relative z-10">
            <TheGuide size="sm" className="drop-shadow-sm" />
            {!collapsed && (
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">The Guide</p>
                <p className="text-[10px] text-gray-500 mb-2">Ready to assist</p>
                <Link 
                  href="/capstone-assistant"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-[11px] font-bold rounded-full hover:bg-teal-600 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  Summon Guide
                </Link>
              </div>
            )}
            {collapsed && (
              <Link 
                href="/capstone-assistant"
                className="p-2 bg-teal text-white rounded-full hover:bg-teal-600 transition-colors shadow-sm"
                title="Summon Guide"
              >
                <Sparkles className="w-4 h-4" />
              </Link>
            )}
          </div>
          {/* Subtle decoration */}
          {!collapsed && (
            <Sparkles className="absolute -top-1 -right-1 w-8 h-8 text-sunny/10 -rotate-12 group-hover:scale-110 transition-transform" />
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {bottomNavItems.map((item, idx) => (
          <NavItem 
            key={idx}
            {...item}
            isCollapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-30 border-r border-gray-100",
          isCollapsed ? "w-20" : "w-[260px]",
          className
        )}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />
      
      <aside 
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-[280px] bg-white z-50 transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebarContent(false, true)}
      </aside>
    </>
  );
}
