// Test
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a local password
    const hasPassword = !!user.password;
    
    // Check if user has other OAuth providers linked (excluding Google if that's what they're disconnecting from)
    const otherOAuthProviders = user.accounts && user.accounts.length > 0 
      ? user.accounts.some(account => account.provider !== 'google')
      : false;

    return NextResponse.json({
      hasPassword,
      otherMethods: otherOAuthProviders,
      canDisconnectGoogle: hasPassword || otherOAuthProviders
    });
  } catch (error) {
    console.error("Error fetching auth methods:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching authentication methods" },
      { status: 500 }
    );
  }
}