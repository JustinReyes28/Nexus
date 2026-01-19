"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { authOptions } from "@/lib/auth"; // If needed, but checking imports
// Sparkle and WavyUnderline were imported but not used, removing them as requested.

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let errorMessage = "Something went wrong. Let's try again?";
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || errorMessage);
        }
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || errorMessage);
        }
      }

      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-canvas font-body overflow-hidden">
      {/* Texture bg */}
      <div className="fixed inset-0 bg-grain pointer-events-none opacity-40" />
      
      {/* Left Side: Visual / Info (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-crimson relative items-center justify-center p-24 overflow-hidden">
         <div className="absolute inset-0 bg-paper opacity-5 mix-blend-overlay" />
         <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-sunny/20 rounded-full blur-3xl animate-pulse-organic" />
         
         <div className="relative z-10 text-white max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
               <div className="w-10 h-10 bg-white rounded-xl rotate-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-crimson rounded-sm" />
               </div>
               <span className="text-3xl font-heading font-extrabold tracking-tighter">NEXUS</span>
            </Link>
            
            <h2 className="text-5xl font-heading font-extrabold mb-8 leading-tight">
               Your journey starts with a single <span className="text-sunny text-6xl">spark.</span>
            </h2>
            
            <p className="text-xl text-white/80 leading-relaxed mb-12 italic font-handwritten">
               "Joining Nexus isn't just signing up for a tool—it's gaining a mentor and a team."
            </p>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md">
           <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-2 border-gray-100 relative group">
              <div className="mb-8">
                 <h1 className="text-3xl font-heading font-extrabold text-gray-900 mb-2">Create Account</h1>
                 <p className="text-gray-500 text-sm font-body">
                    Sign up to start your collaborative capstone.
                 </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border-2 border-red-100 text-red-700 rounded-xl text-xs font-bold font-body">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={isLoading}
                    autoComplete="name"
                    placeholder="Alex Student"
                    className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    placeholder="alex@campus.edu"
                    className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm disabled:opacity-50"
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full shadow-lg shadow-crimson/10 mt-4"
                >
                  Join the Huddle
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-gray-100 border-dashed"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-gray-400">Or use visitor pass</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.224 1.224-3.136 2.52-6.648 2.52-5.392 0-9.472-4.36-9.472-9.752s4.08-9.752 9.472-9.752c3.056 0 5.328 1.208 7.008 2.8l2.32-2.32C18.604 1.432 15.824 0 12.48 0 6.64 0 1.8 4.84 1.8 10.68s4.84 10.68 10.68 10.68c3.16 0 5.56-1.048 7.424-3.008 1.912-1.912 2.52-4.592 2.52-6.76 0-.648-.048-1.28-.144-1.68H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </button>


              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                 <p className="text-sm text-gray-600 font-body">
                    Already a member?{" "}
                    <Link href="/login" className="text-crimson font-bold hover:underline underline-offset-4">
                       Sign in instead
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
