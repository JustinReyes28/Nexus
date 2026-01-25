"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        className="md:hidden p-2"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 p-4">
           <div className="flex flex-col gap-4">
             <Link href="#features" className="text-sm font-semibold text-gray-600 hover:text-crimson transition-colors" onClick={() => setIsOpen(false)}>Features</Link>
             <Link href="https://github.com/JustinReyes28/Nexus" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-600 hover:text-crimson transition-colors" onClick={() => setIsOpen(false)}>See the Code</Link>
             <Button variant="ghost" size="sm" asChild onClick={() => setIsOpen(false)}>
               <Link href="/login">Sign In</Link>
             </Button>
             <Button size="sm" asChild onClick={() => setIsOpen(false)}>
               <Link href="/register">Get Started</Link>
             </Button>
           </div>
        </div>
      )}
    </>
  );
}