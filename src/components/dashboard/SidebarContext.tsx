"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const getInitialCollapsedState = () => {
  if (typeof window === "undefined") return false;
  try {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState !== null ? savedState === "true" : false;
  } catch (error) {
    console.warn("Could not read sidebar-collapsed from localStorage:", error);
    return false;
  }
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);

  // Load collapse state from local storage on mount
  useEffect(() => {
    const savedState = typeof window !== "undefined" ? localStorage.getItem("sidebar-collapsed") : null;
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("sidebar-collapsed", String(newState));
      } catch (error) {
        console.warn("Could not save sidebar-collapsed to localStorage:", error);
      }
      return newState;
    });
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    toggleMobile,
    setIsMobileOpen,
  }), [isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, setIsMobileOpen]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
