// i will Review this later
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Hmm, that doesn't look right. Please check your credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Even The Guide is confused!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-100 text-red-700 rounded-xl text-xs font-bold font-body animate-in fade-in slide-in-from-top-1" role="alert">
          {error}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            placeholder="student@campus.edu"
            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
              Password
            </label>
            <Link href="/reset-password" title="Forgot password?" className="text-[10px] font-bold text-gray-400 hover:text-crimson transition-colors uppercase tracking-widest">
              Lost Key?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            placeholder="••••••••"
            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full shadow-lg shadow-crimson/10"
        >
          Enter the Campus
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
    </div>
  );
}
