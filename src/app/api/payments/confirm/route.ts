import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processCreditPurchase, verifyAuthenticatedUser } from '@/lib/payments';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

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

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify that the payment intent belongs to the authenticated user
    if (paymentIntent.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Payment intent does not belong to the authenticated user' },
        { status: 403 }
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment intent is not in succeeded state' },
        { status: 400 }
      );
    }

    // Extract bundle type from payment intent metadata
    const bundleType = paymentIntent.metadata.bundleType as 'starter' | 'pro' | 'power';
    
    if (!bundleType || !['starter', 'pro', 'power'].includes(bundleType)) {
      return NextResponse.json(
        { error: 'Invalid or missing bundle type in payment intent metadata' },
        { status: 400 }
      );
    }

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