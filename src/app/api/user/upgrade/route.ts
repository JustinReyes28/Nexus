import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditLimitForTier } from "@/lib/creditLimits";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return Response.json({ error: "User ID not found" }, { status: 400 });
    }

    const userId = session.user.id;
    
    // Verify payment/subscription status
    // In a real application, this would verify Stripe paymentIntent/subscription
    const body = await request.json();
    const { paymentIntentId, subscriptionId } = body;

    // For demo purposes, we'll require a payment verification token
    // In production, verify against your payment provider
    if (!paymentIntentId && !subscriptionId) {
      return Response.json({ error: "Payment verification required" }, { status: 400 });
    }

    // Get current user to preserve usage
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { aiCreditsUsed: true }
    });

    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const premiumCreditLimit = getCreditLimitForTier('PREMIUM');
    const aiCreditsUsed = currentUser.aiCreditsUsed || 0;
    
    // Cap usage at premium limit
    const finalCreditsUsed = aiCreditsUsed > premiumCreditLimit ? premiumCreditLimit : aiCreditsUsed;

    // Update user tier to PREMIUM and set appropriate credit limit
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        tier: 'PREMIUM',
        aiCreditsLimit: premiumCreditLimit, // 1000 credits for premium users
        aiCreditsUsed: finalCreditsUsed // Preserve usage, cap at premium limit
      },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        aiCreditsUsed: true,
        aiCreditsLimit: true,
      }
    });

    return Response.json({ 
      message: "Successfully upgraded to premium", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return Response.json({ error: "Failed to upgrade user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return Response.json({ error: "User ID not found" }, { status: 400 });
    }

    const userId = session.user.id;
    
    const body = await request.json();
    const { tier } = body;

    if (!tier || !['FREE', 'PREMIUM'].includes(tier)) {
      return Response.json({ error: "Invalid tier value" }, { status: 400 });
    }

    // For downgrades, preserve aiCreditsUsed to prevent abuse via tier cycling
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { aiCreditsUsed: true, tier: true }
    });

    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Preserve existing usage to prevent abuse
    const aiCreditsUsed = currentUser.aiCreditsUsed || 0;
    const newCreditLimit = getCreditLimitForTier(tier as 'FREE' | 'PREMIUM');
    
    // Cap usage at new limit if downgrading and over limit
    const finalCreditsUsed = aiCreditsUsed > newCreditLimit ? newCreditLimit : aiCreditsUsed;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        tier: tier,
        aiCreditsLimit: newCreditLimit,
        aiCreditsUsed: finalCreditsUsed // Preserve usage, cap if over new limit
      },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        aiCreditsUsed: true,
        aiCreditsLimit: true,
      }
    });

    const action = tier === 'FREE' ? 'downgraded to free' : 'upgraded to premium';
    return Response.json({ 
      message: `Successfully ${action} tier`, 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error changing user tier:", error);
    return Response.json({ error: "Failed to change user tier" }, { status: 500 });
  }
}