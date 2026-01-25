import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BILLING_CONSTANTS } from '@/config/constants';

export interface PaymentResult {
  success: boolean;
  user: {
    id: string;
    tier: string;
    aiCreditsUsed: number;
    aiCreditsLimit: number;
  };
  payment: {
    id: string;
    creditsPurchased: number;
    amount: number;
    bundleType: string;
  };
}

export async function processCreditPurchase(
  userId: string,
  bundleType: 'starter' | 'pro' | 'power',
  paymentIntentId: string
): Promise<PaymentResult> {
  // Check if this paymentIntentId has already been processed
  const existingPayment = await db.payment.findUnique({
    where: { paymentIntentId },
  });

  if (existingPayment) {
    // Return the existing payment result to ensure idempotency
    // Verify that the existing payment belongs to the requesting user
    if (existingPayment.userId !== userId) {
      throw new Error('Unauthorized: Payment does not belong to this user');
    }
    
    const user = await db.user.findUnique({ where: { id: existingPayment.userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      user: {
        id: user.id,
        tier: user.tier,
        aiCreditsUsed: user.aiCreditsUsed,
        aiCreditsLimit: user.aiCreditsLimit,
      },
      payment: {
        id: existingPayment.id,
        creditsPurchased: existingPayment.creditsPurchased,
        amount: existingPayment.amount / 100, // Convert back to dollars
        bundleType: existingPayment.bundleType,
      },
    };
  }

  const bundle = BILLING_CONSTANTS.CREDIT_BUNDLES[bundleType];

  return await db.$transaction(async (tx) => {
    // Get current user data
    const user = await tx.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Auto-upgrade logic
    let finalCreditsUsed = user.aiCreditsUsed;
    let finalCreditsLimit = user.aiCreditsLimit;
    let finalTier = user.tier;

    if (user.tier === 'FREE') {
      finalTier = 'PREMIUM';
      finalCreditsLimit = 1000;
      finalCreditsUsed = Math.min(user.aiCreditsUsed, 1000);
    }

    // Add purchased credits
    finalCreditsUsed = Math.min(
      finalCreditsUsed + bundle.credits,
      finalCreditsLimit
    );

    // Create payment record BEFORE user update to prevent double-crediting
    // on concurrent requests (P2002 errors)
    let payment;
    try {
      payment = await tx.payment.create({
        data: {
          userId,
          paymentIntentId,
          amount: bundle.price * 100, // Store in cents
          currency: 'USD',
          status: 'succeeded',
          creditsPurchased: bundle.credits,
          bundleType,
          receiptUrl: `/receipts/${paymentIntentId}`,
        },
      });
    } catch (error: any) {
      // Handle unique constraint violation for paymentIntentId
      if (error.code === 'P2002' && error.meta?.target?.includes('paymentIntentId')) {
        // Another request created the payment concurrently
        // Re-throw to abort the transaction and let outer logic handle it
        throw error;
      }
      // Re-throw other errors
      throw error;
    }

    // Update user with credits after successful payment creation
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        tier: finalTier,
        aiCreditsLimit: finalCreditsLimit,
        aiCreditsUsed: finalCreditsUsed,
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        tier: updatedUser.tier,
        aiCreditsUsed: updatedUser.aiCreditsUsed,
        aiCreditsLimit: updatedUser.aiCreditsLimit,
      },
      payment: {
        id: payment.id,
        creditsPurchased: payment.creditsPurchased,
        amount: payment.amount / 100, // Convert back to dollars
        bundleType: payment.bundleType,
      },
    };
  });
}

export async function getUserPaymentHistory(userId: string) {
  return await db.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function verifyAuthenticatedUser(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session.user.id;
}