import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // Restrict to non-production environments
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Enforce authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await db.activity.count();
    const latest = await db.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        createdAt: true,
        // Omit user relation to avoid PII exposure
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      count, 
      latest,
      timestamp: new Date().toISOString() 
    });
  } catch (err: unknown) {
    console.error("[DEBUG_ACTIVITY]", err);
    
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ 
      success: false, 
      error: message,
      pragma: "Make sure to run npx prisma db push and restart the server"
    }, { status: 500 });
  }
}
