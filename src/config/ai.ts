export const AI_SETTINGS_LABELS = {
  sectionHeader: "AI Credits & Usage",
  sectionSubheader: "Manage your AI feature access and usage",
  usageStatsHeader: "Usage Statistics",
  creditsHeader: "AI Credits Usage",
  monthlyCredits: "Monthly AI Credits",
  featuresUsed: "Features Used",
  tasksCompleted: "Tasks Completed",
  activeProjects: "Active Projects",
  featuresAvailable: "AI Features Available",
};

export const AI_TIERS = {
  FREE: {
    name: "FREE",
    description: "Enjoy basic AI features",
    upgradeLabel: "Upgrade to Premium",
    features: [
      "Research Assistant",
      "Writing Enhancement",
      "Idea Generation",
      "Progress Tracking",
    ],
  },
  PREMIUM: {
    name: "PREMIUM",
    description: "Unlock full AI potential with enhanced limits",
    upgradeLabel: "Manage Subscription",
    features: [
      "Advanced Research Assistant",
      "Priority Writing Support",
      "Enhanced Idea Generation (1000 credits)",
      "Deep Progress Analytics",
      "Custom Methodology Advice",
    ],
  },
};

// Retention policy constants for chat history retention
// FREE users: 1-day retention
// PREMIUM users: 30-day retention
export const CONVERSATION_RETENTION_POLICY = {
  FREE: {
    days: 1,
    milliseconds: 1 * 24 * 60 * 60 * 1000, // 1 day in ms
    description: "Conversations retained for 1 day for FREE users"
  },
  PREMIUM: {
    days: 30,
    milliseconds: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    description: "Conversations retained for 30 days for PREMIUM users"
  }
};

/**
 * Calculate conversation expiration date based on user tier
 * @param userTier - The user's subscription tier ('FREE' | 'PREMIUM')
 * @returns Date when the conversation should expire
 */
export function getConversationExpirationDate(userTier: 'FREE' | 'PREMIUM'): Date {
  const retentionPolicy = userTier === 'PREMIUM' 
    ? CONVERSATION_RETENTION_POLICY.PREMIUM 
    : CONVERSATION_RETENTION_POLICY.FREE;
  
  return new Date(Date.now() + retentionPolicy.milliseconds);
}
