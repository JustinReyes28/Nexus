import { PrismaClient } from '@prisma/client';
import { getCreditLimitForTier } from '../src/lib/creditLimits';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default values...');
  
  const tierConfigs = [
    { tier: 'FREE' as const },
    { tier: 'PREMIUM' as const },
    // Add future tiers here
  ];

  for (const config of tierConfigs) {
    const limit = getCreditLimitForTier(config.tier);
    const result = await prisma.user.updateMany({
      where: { 
        tier: config.tier,
        aiCreditsLimit: { not: limit } 
      },
      data: { aiCreditsLimit: limit }
    });

    if (result.count > 0) {
      console.log(`Updated ${result.count} ${config.tier} users to have correct credit limit (${limit})`);
    } else {
      console.log(`All ${config.tier} users already have correct credit limits.`);
    }
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });