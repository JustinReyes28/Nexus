import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuthenticatedUser } from '@/lib/payments';
import { BILLING_CONSTANTS } from '@/config/constants';
import { csrfMiddleware } from '@/lib/csrf';
import Stripe from 'stripe';
import type { NextRequest } from 'next/server';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  // Apply CSRF protection
  const csrfError = csrfMiddleware(request);
  if (csrfError) return csrfError;

  try {
    const userId = await verifyAuthenticatedUser(request);
    
    const body = await request.json();
    const { bundleType } = body;

    if (!['starter', 'pro', 'power'].includes(bundleType)) {
      return NextResponse.json(
        { error: 'Invalid bundle type' },
        { status: 400 }
      );
    }

    // Get bundle price based on type
    const bundlePrices: Record<string, number> = {
      starter: BILLING_CONSTANTS.CREDIT_BUNDLES.starter.price,
      pro: BILLING_CONSTANTS.CREDIT_BUNDLES.pro.price,
      power: BILLING_CONSTANTS.CREDIT_BUNDLES.power.price,
    };

    const amount = bundlePrices[bundleType];
    if (!amount) {
      return NextResponse.json(
        { error: 'Invalid bundle type' },
        { status: 400 }
      );
    }

    // Create idempotency key from purchase identifier
    const purchaseId = body.purchaseId;
    const idempotencyKey = purchaseId 
      ? `purchase_${purchaseId}`
      : `user_${userId}_bundle_${bundleType}`;

    // Create actual Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId: userId,
        bundleType: bundleType,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      idempotencyKey: idempotencyKey,
    });

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Unauthorized or invalid request' },
      { status: 401 }
    );
  }
}
