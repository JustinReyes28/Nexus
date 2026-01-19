/**
 * Script to update credit limits for existing premium users
 * This ensures that any premium users who were created before the credit limit changes
 * now have the correct credit limit (1000) instead of the default (100) or unlimited
 */

import { db } from '@/lib/db';
import { getCreditLimitForTier } from '@/lib/creditLimits';

async function updatePremiumUserCredits() {
  try {
    console.log('Starting premium user credit update...');
    
    // Find all users with PREMIUM tier
    const premiumUsers = await db.user.findMany({
      where: {
        tier: 'PREMIUM',
      },
      select: {
        id: true,
        name: true,
        email: true,
        aiCreditsLimit: true,
      },
    });
    
    console.log(`Found ${premiumUsers.length} premium users to update`);
    
    let updatedCount = 0;
    for (const user of premiumUsers) {
      // Update credit limit to 1000 (the new premium limit)
      const newCreditLimit = getCreditLimitForTier('PREMIUM');
      
      // Only update if the current limit is different from the expected premium limit
      if (user.aiCreditsLimit !== newCreditLimit) {
        await db.user.update({
          where: { id: user.id },
          data: { 
            aiCreditsLimit: newCreditLimit,
            // Optionally reset credits used when applying the new limit
            // aiCreditsUsed: 0 
          },
        });
        
        console.log(`Updated user ${user.email} credit limit from ${user.aiCreditsLimit} to ${newCreditLimit}`);
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} premium user(s)`);
    console.log('Premium user credit update completed!');
  } catch (error) {
    console.error('Error updating premium user credits:', error);
    process.exitCode = 1;
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the function if this file is executed directly
if (typeof require !== 'undefined' ? require.main === module : import.meta && import.meta.url === `file://${process.argv[1]}`) {
  updatePremiumUserCredits().catch((error) => {
    console.error('Error in premium credits update:', error);
    process.exit(1);
  });
}

export default updatePremiumUserCredits;