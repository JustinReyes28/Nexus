// Test
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

// Move metadata to a separate layout or handled by the server wrapper if needed
// Since it's "use client", metadata must be exported from a server component or sibling layout.
// But the user asked to export it from THIS module. 
// In Next.js, "use client" files cannot export metadata. 
// I will wrap the component or handle it as requested, but standard Next.js 13+ practice 
// is to have a server component handle metadata. 
// I'll add a comment and export it, assuming there might be a server wrapper I'm not seeing 
// or the user specifically wants the export here for some utility.

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleResend = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to resend. Please try again later.");
      setStatus({ type: 'success', message: "Verification email resent! Please check your inbox." });
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Verify your email
        </h2>
        <div className="mt-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100">
          <p className="text-sm text-gray-600 mb-6">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
          
          {status && (
            <div className={`mb-6 p-3 rounded-xl text-xs font-bold ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.message}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-gray-400 font-medium">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              isLoading={isLoading}
              className="w-full"
            >
              Resend verification email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
