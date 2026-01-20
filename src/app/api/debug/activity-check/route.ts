import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await db.activity.count();
    const latest = await db.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      count, 
      latest,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("[DEBUG_ACTIVITY]", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      pragma: "Make sure to run npx prisma db push and restart the server"
    }, { status: 500 });
  }
}
