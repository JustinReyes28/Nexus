import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { chatSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check
    const rateLimitKey = session.user.id;
    
    if (rateLimiter.isRateLimited(rateLimitKey)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 3. Input Validation
    const body = await req.json();
    
    const validatedData = chatSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { topic, discipline } = validatedData.data;
    
    // 4. Generate Prompt
    const sanitizedTopic = sanitizePrompt(topic);
    const prompt = `You are a helpful AI assistant. The user is asking about: "${sanitizedTopic}"
${discipline ? `Context: ${sanitizePrompt(discipline)}` : ""}

Provide a helpful, accurate, and concise response. Focus on being informative while maintaining a conversational tone.`;

    // 5. Call AI
    const result = await model.generateContent(prompt);
    const responseTextRaw = result.response?.text();
    const responseText = typeof responseTextRaw === 'string' ? responseTextRaw : Array.isArray(responseTextRaw) ? responseTextRaw.join(' ') : '';
    const usage = result.usage;

    // 6. Calculate credits needed
    const creditsToDeduct = usage
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(typeof responseText === 'string' ? responseText : ''));

    try {
      // 7. Transactionally get user tier, deduct credits and log interaction
      const transactionResult = await db.$transaction(async (tx) => {
        // First, get user data to access tier for retention policy
        const user = await tx.user.findUnique({
          where: { id: session.user.id as string },
          select: { aiCreditsUsed: true, aiCreditsLimit: true, tier: true },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        // Attempt to deduct credits
        const updateResult = await tx.user.updateMany({
          where: {
            id: session.user.id,
            aiCreditsUsed: { lt: user.aiCreditsLimit },
          },
          data: {
            aiCreditsUsed: { increment: creditsToDeduct }
          },
        });

        if (updateResult.count === 0) {
          throw new Error("AI credit limit reached");
        }

        // Create AI conversation record with response size handling
        const MAX_RESPONSE_LENGTH = 15 * 1024 * 1024; // 15MB safe threshold
        let processedResponse = responseText;
        
        if (responseText.length > MAX_RESPONSE_LENGTH) {
          processedResponse = responseText.substring(0, MAX_RESPONSE_LENGTH) + 
            "\n\n---\n*Response truncated due to length.*";
        }

        await tx.aIConversation.create({
          data: {
            feature: "CHAT",
            prompt: prompt,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + (typeof responseText === 'string' ? responseText : '')),
            userId: session.user.id,
            expiresAt: getConversationExpirationDate(user.tier || 'FREE'),
          },
        });

        return { tier: user.tier };
      });
    } catch (error) {
      if (error instanceof Error && error.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    if (error instanceof Error) {
      const errorCode = (error as any).code || (error as any).type || (error as any).name || '';
      const errorDetails = (error as any).body || {};
      
      if (errorCode === 'invalid_api_key' || errorCode === 'unauthorized' || 
          errorDetails.code === 'invalid_api_key' || errorDetails.code === 'unauthorized' ||
          error.message.includes("API key not valid") || error.message.includes("Invalid API key")) {
        return NextResponse.json({ error: "Invalid AI API configuration" }, { status: 500 });
      } else if (errorCode === 'network_error' || errorCode === 'timeout' ||
                 errorDetails.code === 'network_error' || errorDetails.code === 'timeout' ||
                 error.message.includes("network") || error.message.includes("fetch")) {
        return NextResponse.json({ error: "AI service unavailable. Please try again later." }, { status: 503 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}