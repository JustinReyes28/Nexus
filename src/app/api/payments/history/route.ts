import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuthenticatedUser } from '@/lib/payments';

export async function GET(request: Request) {
  try {
    const userId = await verifyAuthenticatedUser(request);
    
    const payments = await db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}