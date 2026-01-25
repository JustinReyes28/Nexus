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

    // Perform credit check and AI generation in a single transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
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

      // Call AI after successful credit deduction
      const result = await model.generateContent(prompt);
      const proposal = result.response.text();
      if (!proposal) {
        throw new Error("Failed to generate proposal");
      }

      // Create conversation record
      const conversation = await tx.aIConversation.create({
        data: {
          userId: session.user.id,
          feature: "PROPOSAL_WRITER", // Using the correct enum value
          prompt,
          response: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
          tokensUsed: result.usage?.totalTokens ?? estimatedTokens, // Use actual token count if available
          expiresAt: getConversationExpirationDate(user.tier || 'FREE'), // Use the tier from the user query
        },
      });

      return { proposal, conversation, remainingCredits: user.aiCreditsLimit - (user.aiCreditsUsed + creditCost) };
    });

    return NextResponse.json({
      success: true,
      proposal: typeof result.proposal === 'string' ? result.proposal : Array.isArray(result.proposal) ? result.proposal.join(' ') : '',
      conversationId: result.conversation.id,
      creditsUsed: creditCost,
      remainingCredits: result.remainingCredits
    });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
