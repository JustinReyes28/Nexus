import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { researchSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate, CONVERSATION_RETENTION_POLICY } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    console.log("[AI_RESEARCH_DEBUG] Starting request");
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const xForwardedFor = req.headers.get("x-forwarded-for");
    const ip = xForwardedFor ? xForwardedFor.split(',').pop()?.trim() : `anon_${req.headers.get('user-agent') || 'unknown'}`;
    const rateLimitKey = `${session.user.id}:${ip}`;
    if (rateLimiter.isRateLimited(rateLimitKey)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

const userId = session.user.id as string;

    // First, just get user data to prepare for the operation
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { aiCreditsUsed: true, aiCreditsLimit: true, tier: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userTier = user.tier;

    const body = await req.json();
    if (process.env.NODE_ENV !== "production" && process.env.DEBUG_AI_RESEARCH === "true") {
      console.log("[AI_RESEARCH_DEBUG] Body received:", JSON.stringify(body));
    }
    const validatedData = researchSchema.safeParse(body);
    if (!validatedData.success) {
      console.log("[AI_RESEARCH_DEBUG] Validation failed:", validatedData.error.errors);
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });
    }

const { topic, focusAreas, webSearchEnabled } = validatedData.data;
    const sanitizedTopic = sanitizePrompt(topic);
    const sanitizedFocusAreas = focusAreas ? focusAreas.map(area => sanitizePrompt(area)) : null;
    
    const prompt = `
      As a specialized research assistant, provide a brief literature review overview and gap analysis for the topic: "${sanitizedTopic}".
      ${sanitizedFocusAreas ? `Focus areas: ${sanitizedFocusAreas.join(", ")}` : ""}
      
      Structure your response:
      1. Current State of Research
      2. Key Literature/Authors (General mention)
      3. Identified Research Gaps
      4. Proposed Research Questions (2-3)
      
      Format in clean markdown.
    `;

    console.log("[AI_RESEARCH_DEBUG] Generating content for topic:", sanitizedTopic, "webSearchEnabled:", webSearchEnabled);
    const result = await model.generateResearchContent(prompt, webSearchEnabled);
    console.log("[AI_RESEARCH_DEBUG] Content generation result received");
const responseText = result.response.text() as string;
    if (!responseText) {
      console.log("[AI_RESEARCH_DEBUG] Warning: responseText is empty");
      const errorMessage = webSearchEnabled 
        ? "Web search returned empty results. Please try again or disable web search."
        : "No response received from model; web search is disabled.";
      throw new Error(errorMessage);
    }
    const usage = result.usage;
    console.log("[AI_RESEARCH_DEBUG] Usage:", JSON.stringify(usage));

const creditsToDeduct = usage
  ? calculateCredits(usage.promptTokens, usage.completionTokens)
  : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

// Deduct Credits & Log Interaction in a single atomic transaction with credit limit check
    try {
      await db.$transaction(async (tx) => {
        // Atomic update: increment credits only if within limit
        const updateResult = await tx.user.updateMany({
          where: {
            id: session.user.id,
            // Check that current usage + new deduction doesn't exceed limit
            aiCreditsUsed: { lt: user.aiCreditsLimit }
          },
          data: {
            aiCreditsUsed: { increment: creditsToDeduct }
          }
        });

        // If no records were updated, it means the credit limit would be exceeded
        if (updateResult.count === 0) {
          throw new Error("AI credit limit reached");
        }

        // Create AI conversation record with response size handling
        const MAX_RESPONSE_LENGTH = 15 * 1024 * 1024; // 15MB safe threshold (MongoDB limit is 16MB)
        let processedResponse = responseText;
        
        // If response exceeds the safe threshold, truncate and add summary
        if (responseText.length > MAX_RESPONSE_LENGTH) {
          processedResponse = responseText.substring(0, MAX_RESPONSE_LENGTH) + 
            "\n\n---\n*Response truncated due to length. The full response was too long to store in the database.*";
        }

        // Create AI conversation record
        await tx.aIConversation.create({
          data: {
            feature: "RESEARCH_ASSISTANT",
            prompt: sanitizedTopic as string,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
            userId: session.user.id,
            expiresAt: getConversationExpirationDate(userTier || 'FREE'),
          },
        });
      });
    } catch (dbError) {
      // Check if it's a credit limit error
      if (dbError instanceof Error && dbError.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      console.error("[AI_RESEARCH_DB_ERROR]", dbError);
      throw dbError;
    }

    return NextResponse.json({ response: responseText });
} catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorBody = error.body ? JSON.stringify(error.body) : "";
    console.error("[AI_RESEARCH_ERROR]", errorMessage, errorBody);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
