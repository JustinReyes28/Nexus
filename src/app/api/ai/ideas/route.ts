import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { ideaGeneratorSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      console.log("[AI_IDEAS_START] Request received");
    }
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check
    // Since authentication happens first, session.user.id should always be available
    // Use authenticated user ID as the rate limit key
    const rateLimitKey = session.user.id;
    
    if (rateLimiter.isRateLimited(rateLimitKey)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 3. Input Validation
    const body = await req.json();
    
    // Only log sanitized data in production environments
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      // Sanitize the body by omitting potentially sensitive fields
      const sanitizedBody = {
        ...body,
        topic: body.topic ? '[REDACTED]' : undefined,
        constraints: body.constraints ? '[REDACTED]' : undefined
      };
      console.log("[AI_IDEAS_BODY]", JSON.stringify(sanitizedBody, null, 2));
    }
    
    const validatedData = ideaGeneratorSchema.safeParse(body);

    if (!validatedData.success) {
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
        // Sanitize validation errors to avoid exposing sensitive data
        const sanitizedErrors = validatedData.error.errors.map(error => ({
          path: error.path,
          message: error.message,
          code: error.code
        }));
        console.log("[AI_IDEAS_VALIDATION_ERROR]", sanitizedErrors);
      }
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { discipline, topic, constraints } = validatedData.data;
    
    // Only log in non-production environments with sensitive data redacted
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      console.log("[AI_IDEAS_VALIDATED]", {
        discipline: discipline,
        topic: '[REDACTED]',
        constraints: constraints ? '[REDACTED]' : constraints
      });
    }

    // 4. Generate Prompt
    const sanitizedTopic = sanitizePrompt(topic);
    const sanitizedDiscipline = sanitizePrompt(discipline);
    const prompt = `
      As an expert academic advisor in ${sanitizedDiscipline}, generate 3-5 unique and feasible research project ideas for the topic: "${sanitizedTopic}".
      ${constraints ? `Constraints: ${sanitizePrompt(constraints)}` : ""}
      
      For each idea, provide:
      1. Title
      2. Brief Description (2-3 sentences)
      3. Feasibility Score (1-10)
      4. Potential Methodology
      
      Format the output as a clean markdown structure.
    `;

    // 5. Call AI (Non-streaming for now to track tokens easily, will implement streaming in components)
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      console.log("[AI_IDEAS_PROMPT]", `Prompt length: ${prompt.length} characters`);
    }
    const result = await model.generateContent(prompt);
    const responseTextRaw = result.response?.text();
    const responseText = typeof responseTextRaw === 'string' ? responseTextRaw : Array.isArray(responseTextRaw) ? responseTextRaw.join(' ') : '';
    const usage = result.usage;
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      console.log("[AI_IDEAS_RESPONSE]", `Response length: ${responseText.length} characters`, `Usage:`, usage);
    }

    // 6. Calculate credits needed
    const creditsToDeduct = usage
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(typeof responseText === 'string' ? responseText : ''));

    try {
      // 7. Transactionally get user tier, deduct credits and log interaction
      // This ensures that credits are only deducted if the conversation record is successfully created
      const transactionResult = await db.$transaction(async (tx) => {
        // First, get user data to access tier for retention policy
        const user = await tx.user.findUnique({
          where: { id: session.user.id as string },
          select: { aiCreditsUsed: true, aiCreditsLimit: true, tier: true },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        // Attempt to deduct credits by updating the user record
        const updateResult = await tx.user.updateMany({
          where: {
            id: session.user.id,
            aiCreditsUsed: { lt: user.aiCreditsLimit }, // aiCreditsUsed < aiCreditsLimit
          },
          data: {
            aiCreditsUsed: { increment: creditsToDeduct }
          },
        });

        // If no records were updated, it means the user exceeded their credit limit
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

        // Then create the conversation record - if this fails, the credit deduction will be rolled back
        await tx.aIConversation.create({
          data: {
            feature: "IDEA_GENERATOR",
            prompt: prompt, // Store the full prompt instead of just the sanitized topic
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + (typeof responseText === 'string' ? responseText : '')), // Use full prompt for token estimation
            userId: session.user.id,
            expiresAt: getConversationExpirationDate(user.tier || 'FREE'),
          },
        });

        return { tier: user.tier };
      });
    } catch (error) {
      // Handle the case where the user has exceeded their credit limit or user not found
      if (error instanceof Error && error.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      // Re-throw other errors to be handled by the main catch block
      throw error;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    // Log error details only in non-production environments to prevent information leakage
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGGING === 'true') {
      console.error("[AI_IDEAS_ERROR]", error);
    } else {
      // In production, log minimal information without exposing internal details
      console.error("[AI_IDEAS_ERROR] An error occurred during idea generation");
    }

if (error instanceof Error) {
      // Prefer structured error identifiers from AI SDK
      const errorCode = (error as any).code || (error as any).type || (error as any).name || '';
      const errorDetails = (error as any).body || {};
      
      // Check for canonical error codes first
      if (errorCode === 'invalid_api_key' || errorCode === 'unauthorized' || 
          errorDetails.code === 'invalid_api_key' || errorDetails.code === 'unauthorized' ||
          error.message.includes("API key not valid") || error.message.includes("Invalid API key")) {
        return NextResponse.json({ error: "Invalid AI API configuration" }, { status: 500 });
      } else if (errorCode === 'network_error' || errorCode === 'timeout' ||
                 errorDetails.code === 'network_error' || errorDetails.code === 'timeout' ||
                 error.message.includes("network") || error.message.includes("fetch")) {
        return NextResponse.json({ error: "AI service unavailable. Please try again later." }, { status: 503 });
      }
      // Note: String matching fallback is used when SDK doesn't provide structured error codes
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
