import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuthenticatedUser } from '@/lib/payments';
import { BILLING_CONSTANTS } from '@/config/constants';
import { csrfMiddleware } from '@/lib/csrf';
import type { NextRequest } from 'next/server';

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

    // Generate mock payment intent ID
    const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;

    return NextResponse.json({
      paymentIntentId,
      clientSecret: `secret_${paymentIntentId}`,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Unauthorized or invalid request' },
      { status: 401 }
    );
  }
}
