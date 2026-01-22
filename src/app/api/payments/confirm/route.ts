import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processCreditPurchase, verifyAuthenticatedUser } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const userId = await verifyAuthenticatedUser(request);
    
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Extract bundle type from payment intent ID (mock implementation)
    // In real implementation, this would come from Stripe metadata
    let bundleType: 'starter' | 'pro' | 'power' = 'pro';
    if (paymentIntentId.includes('starter')) bundleType = 'starter';
    else if (paymentIntentId.includes('power')) bundleType = 'power';

    const result = await processCreditPurchase(userId, bundleType, paymentIntentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}