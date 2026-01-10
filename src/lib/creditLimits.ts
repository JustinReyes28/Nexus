/**
 * Defines the credit limits for different user tiers
 */

export const CREDIT_LIMITS = {
  FREE: 25,
  PREMIUM: 1000, // Changed from unlimited to 1000 as requested
} as const;

export type Tier = keyof typeof CREDIT_LIMITS;

/**
 * Gets the credit limit for a given tier
 * @param tier - The user's subscription tier
 * @returns The credit limit for the specified tier
 */
export function getCreditLimitForTier(tier: Tier): number {
  return CREDIT_LIMITS[tier];
}

/**
 * Updates a user's credit limit based on their tier
 * @param userId - The ID of the user to update
 * @param tier - The user's tier
 * @param db - Database instance (Prisma client)
 * @returns Updated user object
 */
export async function updateUserCreditLimit(userId: string, tier: Tier, db: any) {
  const creditLimit = getCreditLimitForTier(tier);
  
  return await db.user.update({
    where: { id: userId },
    data: { aiCreditsLimit: creditLimit },
  });
}