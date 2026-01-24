import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { proposalSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate } from "@/config/ai";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  // Apply CSRF protection
  const csrfError = csrfMiddleware(req);
  if (csrfError) return csrfError;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (rateLimiter.isRateLimited(session.user.id)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validationResult = proposalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request data", details: validationResult.error.format() }, { status: 400 });
    }

    const { section, context, discipline, templateLevel } = validationResult.data;

    const prompt = sanitizePrompt(`
      As an expert in ${discipline || 'general'} field, create a ${templateLevel.toLowerCase()} level proposal for the ${section} section.
      
      Context: ${context}
      
      Provide a well-structured, professional response appropriate for the selected template level.
    `);

    const estimatedTokens = estimateTokens(prompt);
    const creditCost = calculateCredits(estimatedTokens, estimatedTokens * 0.5); // Using the proper function signature

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiCreditsUsed: true, aiCreditsLimit: true },
    });

    if (!user || (user.aiCreditsUsed + creditCost) > user.aiCreditsLimit) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const result = await model.generateContent(prompt);
    const proposal = result.response.text();
    if (!proposal) {
      throw new Error("Failed to generate proposal");
    }

    // Get user tier for expiration date calculation
    const userWithTier = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    });

    const conversation = await db.aIConversation.create({
      data: {
        userId: session.user.id,
        feature: "PROPOSAL_WRITER", // Using the correct enum value
        prompt,
        response: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
        tokensUsed: estimatedTokens, // Using correct field name
        expiresAt: getConversationExpirationDate(userWithTier?.tier || 'FREE'), // Pass the tier parameter
      },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { aiCreditsUsed: { increment: creditCost } },
    });

    return NextResponse.json({
      success: true,
      proposal: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
      conversationId: conversation.id,
      creditsUsed: creditCost,
      remainingCredits: user.aiCreditsLimit - (user.aiCreditsUsed + creditCost)
    });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
