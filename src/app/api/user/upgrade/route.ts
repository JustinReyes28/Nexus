import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditLimitForTier, updateUserCreditLimit } from "@/lib/creditLimits";
import { Tier } from "@/lib/creditLimits";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real application, you would verify the payment/subscription here
    // For now, we'll just upgrade the user to premium
    
    const userId = session.user.id as string;
    
    // Update user tier to PREMIUM and set appropriate credit limit
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        tier: 'PREMIUM',
        aiCreditsLimit: getCreditLimitForTier('PREMIUM'), // 1000 credits for premium users
        aiCreditsUsed: 0 // Reset credits used when upgrading
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    
    // Downgrade user to FREE tier and set appropriate credit limit
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        tier: 'FREE',
        aiCreditsLimit: getCreditLimitForTier('FREE'), // 100 credits for free users
        aiCreditsUsed: 0 // Reset credits used when downgrading
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
      message: "Successfully downgraded to free tier", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error downgrading user:", error);
    return Response.json({ error: "Failed to downgrade user" }, { status: 500 });
  }
}