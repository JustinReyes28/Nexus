import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSolutionGrid } from "@/components/home/ProblemSolutionGrid";
import { AICompanionPreview } from "@/components/home/AICompanionPreview";
import { TeamFeaturePreview } from "@/components/home/TeamFeaturePreview";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background font-body">
      {/* Navigation Header (Simplified for Landing) */}
      <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-crimson rounded-lg rotate-3" />
            <span className="text-2xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-gray-600 hover:text-crimson transition-colors">Features</Link>
            <Link href="https://github.com/JustinReyes28/Nexus" className="text-sm font-semibold text-gray-600 hover:text-crimson transition-colors">See the Code</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Problem/Solution Grid */}
      <ProblemSolutionGrid />

      {/* AI Companion Feature */}
      <AICompanionPreview />

      {/* Team Feature Hub */}
      <TeamFeaturePreview />

      {/* Call to Action Bottom */}
      <section className="py-24 bg-crimson relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 bg-grain" />
        <div className="container px-6 mx-auto relative z-10">
          <h2 className="text-4xl lg:text-6xl font-heading font-extrabold mb-8 leading-tight">
            Ready to finish your capstone<br />without the burnout?
          </h2>
          <Link href="/register">
             <Button size="lg" variant="secondary" className="px-12">
                Join the Nexus Today
             </Button>
          </Link>
          <p className="mt-8 text-white/60 font-handwritten text-xl italic">
            "Your digital campus library is open 24/7."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-crimson rounded rotate-3" />
              <span className="text-xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
           </div>
           <p className="text-sm text-gray-400">© 2026 Nexus AI. All rights reserved. Human-centric by design.</p>
        </div>
      </footer>
    </main>
  );
}

