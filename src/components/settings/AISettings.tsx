"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AI_SETTINGS_LABELS, AI_TIERS } from "@/config/ai";
import { Tier } from "@prisma/client";

interface AISettingsProps {
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  userId: string;
 tier: Tier;
  activeProjectsCount: number;
  uniqueFeaturesUsed: number;
  tasksCompleted: number;
}

export default function AISettings({
  aiCreditsUsed,
  aiCreditsLimit,
  userId,
  tier,
  activeProjectsCount,
  uniqueFeaturesUsed,
  tasksCompleted
}: AISettingsProps) {
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
        <h3 className="text-xl font-heading font-bold text-primary">{AI_SETTINGS_LABELS.sectionHeader}</h3>
        <p className="text-sm text-gray-500 mt-1">{AI_SETTINGS_LABELS.sectionSubheader}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Tier */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">Current Tier</h4>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-heading font-bold text-teal animate-pulse-organic">
                  {AI_TIERS[tier].name}
                </p>
                <p className="text-sm text-gray-500 mt-1">{AI_TIERS[tier].description}</p>
              </div>
              <Button
                variant="ai"
                onClick={handleUpgrade}
                disabled={isLoading}
                className="animate-sparkle hover:animate-none"
              >
                {AI_TIERS[tier].upgradeLabel}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Credits Progress */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">{AI_SETTINGS_LABELS.creditsHeader}</h4>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{AI_SETTINGS_LABELS.monthlyCredits}</p>
              <p className="font-semibold text-gray-800">
                {tier === "PREMIUM" ? (
                  <span className="text-teal">Unlimited</span>
                ) : (
                  `${aiCreditsUsed} / ${aiCreditsLimit} credits used`
                )}
              </p>
            </div>

            {tier !== "PREMIUM" && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">{AI_SETTINGS_LABELS.usageStatsHeader}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">{aiCreditsUsed}</p>
              <p className="text-xs text-gray-500 mt-1">AI Queries</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">{uniqueFeaturesUsed}</p>
              <p className="text-xs text-gray-500 mt-1">{AI_SETTINGS_LABELS.featuresUsed}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">{tasksCompleted}</p>
              <p className="text-xs text-gray-500 mt-1">{AI_SETTINGS_LABELS.tasksCompleted}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-2xl font-heading font-bold text-teal animate-float">{activeProjectsCount}</p>
              <p className="text-xs text-gray-500 mt-1">{AI_SETTINGS_LABELS.activeProjects}</p>
            </div>
          </div>
        </div>

        {/* AI Features Info */}
        <div className="bg-white/50 rounded-xl p-4 border border-teal/20">
          <h4 className="text-md font-heading font-semibold text-teal mb-3 flex items-center gap-2">
            <span className="animate-pulse-organic">🤖</span>
            {AI_SETTINGS_LABELS.featuresAvailable}
          </h4>
          <div className="space-y-2 text-sm">
            {AI_TIERS[tier].features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}