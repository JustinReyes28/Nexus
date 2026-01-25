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

    // Perform credit check and deduction in transaction first
    const transactionResult = await db.$transaction(async (tx) => {
      // Atomic credit check and deduction
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { aiCreditsUsed: true, aiCreditsLimit: true, tier: true },
      });

      if (!user || (user.aiCreditsUsed + creditCost) > user.aiCreditsLimit) {
        throw new Error("Insufficient credits");
      }

      // Deduct credits atomically
      const updateResult = await tx.user.updateMany({
        where: {
          id: session.user.id,
          aiCreditsUsed: { lte: user.aiCreditsLimit - creditCost },
        },
        data: { aiCreditsUsed: { increment: creditCost } },
      });

      if (updateResult.count === 0) {
        throw new Error("Insufficient credits");
      }

      return { 
        user, 
        remainingCredits: user.aiCreditsLimit - (user.aiCreditsUsed + creditCost) 
      };
    });

    // Call AI outside the transaction to avoid timeouts
    let proposal;
    try {
      const result = await model.generateContent(prompt);
      proposal = result.response.text();
      if (!proposal) {
        throw new Error("Failed to generate proposal");
      }
    } catch (error) {
      // If AI call fails, refund the deducted credits
      await db.user.updateMany({
        where: {
          id: session.user.id,
          aiCreditsUsed: { gte: creditCost },
        },
        data: {
          aiCreditsUsed: { decrement: creditCost }
        },
      });
      throw error; // Re-throw the error after refunding credits
    }

    // Create conversation record after successful AI call
    const conversation = await db.aIConversation.create({
      data: {
        userId: session.user.id,
        feature: "PROPOSAL_WRITER",
        prompt,
        response: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
        tokensUsed: estimatedTokens, // Use estimated tokens since we don't have actual usage outside transaction
        expiresAt: getConversationExpirationDate(transactionResult.user.tier || 'FREE'),
      },
    });

    return NextResponse.json({
      success: true,
      proposal: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
      conversationId: conversation.id,
      creditsUsed: creditCost,
      remainingCredits: transactionResult.remainingCredits
    });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
