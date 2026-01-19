import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has alternative authentication methods before allowing unlink
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
    
    // Check if user has other OAuth providers linked
    const otherOAuthProviders = user.accounts && user.accounts.length > 0 
      ? user.accounts.some(account => account.provider !== 'google')
      : false;

    // Prevent unlink if user would lose access
    if (!hasPassword && !otherOAuthProviders) {
      return NextResponse.json(
        { 
          error: "Cannot disconnect Google account", 
          message: "Please set up a password before disconnecting Google account to avoid losing access" 
        }, 
        { status: 400 }
      );
    }

    // Find the Google account to unlink
    const googleAccount = user.accounts?.find(account => account.provider === 'google');
    
    if (!googleAccount) {
      return NextResponse.json({ error: "Google account not found" }, { status: 404 });
    }

    // Delete the Google account connection
    await db.account.delete({
      where: {
        id: googleAccount.id,
      },
    });

    return NextResponse.json({ message: "Google account unlinked successfully" });
  } catch (error) {
    console.error("Error unlinking Google account:", error);
    return NextResponse.json(
      { error: "An error occurred while unlinking Google account" },
      { status: 500 }
    );
  }
}