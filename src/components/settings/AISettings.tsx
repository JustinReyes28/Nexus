"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AISettingsProps {
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  userId: string;
}

export default function AISettings({ aiCreditsUsed, aiCreditsLimit, userId }: AISettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Calculate percentage used
  const usagePercentage = aiCreditsLimit > 0
    ? Math.min(100, Math.round((aiCreditsUsed / aiCreditsLimit) * 100))
    : 0;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // This would typically redirect to a premium upgrade flow
      alert("Premium upgrade would be handled by payment flow");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to process upgrade");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card rounded-xl shadow-md bg-teal/5 border border-teal">
      <div className="px-6 py-4 border-b border-teal/20">
        <h3 className="text-xl font-heading font-bold text-primary">AI Credits & Usage</h3>
        <p className="text-sm text-gray-500 mt-1">Manage your AI feature access and usage</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Tier */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">Current Tier</h4>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-heading font-bold text-teal animate-pulse-organic">FREE</p>
                <p className="text-sm text-gray-500 mt-1">Enjoy basic AI features</p>
              </div>
              <Button
                variant="ai"
                onClick={handleUpgrade}
                disabled={isLoading}
                className="animate-sparkle hover:animate-none"
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>

        {/* AI Credits Progress */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">AI Credits Usage</h4>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Monthly AI Credits</p>
              <p className="font-semibold text-gray-800">
                {aiCreditsUsed} / {aiCreditsLimit} credits used
              </p>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-teal h-full rounded-full animate-pulse-organic"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">Usage Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">{aiCreditsUsed}</p>
              <p className="text-xs text-gray-500 mt-1">AI Queries</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">12</p>
              <p className="text-xs text-gray-500 mt-1">Features Used</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">85%</p>
              <p className="text-xs text-gray-500 mt-1">AI Satisfaction</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">4</p>
              <p className="text-xs text-gray-500 mt-1">Active Projects</p>
            </div>
          </div>
        </div>

        {/* AI Features Info */}
        <div className="bg-white/50 rounded-xl p-4 border border-teal/20">
          <h4 className="text-md font-heading font-semibold text-teal mb-3 flex items-center gap-2">
            <span className="animate-pulse-organic">🤖</span>
            AI Features Available
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span>Research Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span>Writing Enhancement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span>Idea Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}