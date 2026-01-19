// Test
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const drafts = await db.project.findMany({
      where: { 
        ownerId: session.user.id,
        status: "IDEATION"
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("[DRAFTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
