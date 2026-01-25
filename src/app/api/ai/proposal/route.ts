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
      const origErr = error;
      try {
        const result = await db.user.updateMany({
          where: {
            id: session.user.id,
            aiCreditsUsed: { gte: creditCost },
          },
          data: {
            aiCreditsUsed: { decrement: creditCost }
          },
        });
        if (result.count === 0) {
          console.warn(`Failed to refund credits for user ${session.user.id}: no records updated (creditCost: ${creditCost})`);
          // Emit monitoring metric for failed refund
          // await metrics.emit('credits.refund.failed', { userId: session.user.id, creditCost, reason: 'no_records_updated' });
          
          // Persist failed refund to retry queue
          // await db.failedRefund.create({
          //   data: {
          //     userId: session.user.id,
          //     creditAmount: creditCost,
          //     errorDetails: 'No records updated during refund - concurrent modification or insufficient credits',
          //     feature: 'PROPOSAL_WRITER'
          //   }
          // });
          
          // Attach refund error to original error without replacing it
          const refundErrorMessage = `Credits may require manual reconciliation for user ${session.user.id}`;
          if (origErr instanceof Error) {
            (origErr as any).refundError = refundErrorMessage;
          }
        }
      } catch (refundError) {
        const errorMessage = refundError instanceof Error ? refundError.message : String(refundError);
        console.error(`Failed to refund credits for user ${session.user.id} (creditCost: ${creditCost}):`, refundError);
        // Emit monitoring metric for refund error
        // await metrics.emit('credits.refund.error', { userId: session.user.id, creditCost, error: errorMessage });
        
        // Persist failed refund to retry queue
        // await db.failedRefund.create({
        //   data: {
        //     userId: session.user.id,
        //     creditAmount: creditCost,
        //     errorDetails: errorMessage,
        //     feature: 'PROPOSAL_WRITER'
        //   }
        // });
        
        // Attach refund error to original error without replacing it
        const refundErrorMessage = `Credits may require manual reconciliation for user ${session.user.id}: ${errorMessage}`;
        if (origErr instanceof Error) {
          (origErr as any).refundError = refundErrorMessage;
        }
      }
      throw origErr; // Re-throw the original error after attempting refund
    }

    // Create conversation record after successful AI call
    let conversation;
    try {
      conversation = await db.aIConversation.create({
        data: {
          userId: session.user.id,
          feature: "PROPOSAL_WRITER",
          prompt,
          response: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
          tokensUsed: estimatedTokens, // Use estimated tokens since we don't have actual usage outside transaction
          expiresAt: getConversationExpirationDate(transactionResult.user.tier || 'FREE'),
        },
      });
    } catch (error) {
      console.error(`Failed to create conversation for user ${session.user.id} (prompt: ${prompt.substring(0, 100)}...):`, error);
      // Continue with response even if conversation persistence fails
    }

    return NextResponse.json({
      success: true,
      proposal: typeof proposal === 'string' ? proposal : Array.isArray(proposal) ? proposal.join(' ') : '',
      conversationId: conversation?.id,
      conversationSaved: !!conversation,
      creditsUsed: creditCost,
      remainingCredits: transactionResult.remainingCredits
    });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
