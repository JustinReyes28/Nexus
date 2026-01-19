import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIFeature } from "@prisma/client";

/**
 * GET /api/ai/history
 * Fetches conversation history for the current user.
 * Supports optional filtering by feature and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

const { searchParams } = new URL(req.url);
    const feature = searchParams.get("feature") as AIFeature | null;
    
    // Validate and sanitize pagination parameters
    const rawPage = parseInt(searchParams.get("page") || "1");
    const rawLimit = parseInt(searchParams.get("limit") || "10");
    const maxLimit = 100;
    
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, maxLimit);
    const skip = Math.max(0, (page - 1) * limit);

    // Validate feature if provided
    if (feature && !Object.values(AIFeature).includes(feature)) {
      return NextResponse.json({ error: "Invalid feature type" }, { status: 400 });
    }

    const where = {
      userId: session.user.id,
      ...(feature && { feature }),
    };

    const [conversations, total] = await Promise.all([
      db.aIConversation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.aIConversation.count({ where }),
    ]);

    return NextResponse.json({
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[AI_HISTORY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
