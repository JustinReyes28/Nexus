import { PrismaClient } from '@prisma/client';
import { getCreditLimitForTier } from '../src/lib/creditLimits';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default values...');
  
  // The schema already defines default values, but we're ensuring 
  // that the application's understanding of credit limits is consistent
  
  // Update any existing users who might have incorrect defaults
  const freeUsers = await prisma.user.findMany({
    where: { 
      tier: 'FREE',
      aiCreditsLimit: { not: getCreditLimitForTier('FREE') } 
    },
    select: { id: true }
  });
  
  if (freeUsers.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: freeUsers.map(u => u.id) } },
      data: { aiCreditsLimit: getCreditLimitForTier('FREE') }
    });
    console.log(`Updated ${freeUsers.length} FREE users to have correct credit limit`);
  }
  
  const premiumUsers = await prisma.user.findMany({
    where: { 
      tier: 'PREMIUM',
      aiCreditsLimit: { not: getCreditLimitForTier('PREMIUM') } 
    },
    select: { id: true }
  });
  
  if (premiumUsers.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: premiumUsers.map(u => u.id) } },
      data: { aiCreditsLimit: getCreditLimitForTier('PREMIUM') }
    });
    console.log(`Updated ${premiumUsers.length} PREMIUM users to have correct credit limit`);
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