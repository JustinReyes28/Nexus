import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { getConversationExpirationDate, CONVERSATION_RETENTION_POLICY } from "@/config/ai";
import { logger } from "@/lib/logger";

/**
 * Sanitizes text for logging by removing potential PII and sensitive content
 */
function sanitizeForLogging(text: string): string {
  if (!text || text.length === 0) return "[EMPTY]";
  
  // Remove potential email addresses
  let sanitized = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  
  // Remove potential credit card numbers (basic pattern)
  sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CREDIT_CARD]');
  
  // Remove potential API keys/tokens (common patterns)
  sanitized = sanitized.replace(/\b(api[_-]?key|token|access[_-]?key|secret)\b\s*[:=]?\s*['"]?[a-zA-Z0-9]{16,}['"]?/gi, '$1: [REDACTED]');
  
  // Truncate if too long to avoid log bloat
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + "... [TRUNCATED]";
  }
  
  return sanitized;
}

export async function POST(req: NextRequest) {
  try {
    logger.debug("[AI_CHAT_START] Request received");
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check
    const forwardedIp = req.headers.get("x-forwarded-for");
    const rateLimitIdentifier = session.user?.id 
      ? `${session.user.id}:${forwardedIp || 'no-ip'}` 
      : forwardedIp || crypto.randomUUID();
    
    if (rateLimiter.isRateLimited(rateLimitIdentifier)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

// 3. Input Validation
    const body = await req.json();
    logger.debug("[AI_CHAT_BODY] Request metadata:", {
      hasTopic: !!body.topic,
      hasMessage: !!body.message,
      hasContext: !!body.context,
      messageLength: body.message?.length || body.topic?.length || 0,
      contextLength: body.context?.length || 0
    });

    // For chat, we just need a topic/message field
    const { topic, message, context } = body;
    if (!topic && !message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Validate against whitespace-only input
    const hasValidContent = (topic?.trim() && topic.trim().length > 0) || 
                           (message?.trim() && message.trim().length > 0);
    if (!hasValidContent) {
      return NextResponse.json({ error: "Message cannot be empty or whitespace only" }, { status: 400 });
    }

    const userMessage = topic || message || "";
    logger.debug("[AI_CHAT_VALIDATED] Message validated with length:", userMessage?.length || 0);

    // 4. Generate Prompt
    const sanitizedMessage = sanitizePrompt(userMessage);
    const sanitizedContext = context ? sanitizePrompt(context) : "";

    const prompt = `
      As "The Guide", an AI academic assistant, engage in a helpful conversation with the user about their capstone project or academic work.
      
      User message: "${sanitizedMessage}"
      ${sanitizedContext ? `Additional context: ${sanitizedContext}` : ""}
      
      Provide a helpful, friendly, and informative response that addresses their question or continues the conversation naturally.
      Keep responses concise but informative, and maintain a supportive tone appropriate for academic guidance.
      If the user asks about a specific academic topic, provide insights that would be valuable for a student working on a capstone project.
      
      Format your response in clear markdown.
    `;

    // 5. Call AI
    logger.metadata("[AI_CHAT_PROMPT]", prompt);
    
    // Set up timeout for AI call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let result;
    try {
      result = await model.generateContent(prompt);
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
    
    // Defensively read response text without blind type assertion
    const responseTextRaw = result.response.text();
    // Handle both string and ContentChunk[] types
    const responseText = Array.isArray(responseTextRaw) 
      ? responseTextRaw.map(chunk => typeof chunk === 'string' ? chunk : '').join('')
      : (responseTextRaw as string);
      
    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Empty response received from AI service");
    }
    
    const safeResponseText = sanitizeForLogging(responseText);
    logger.metadata("[AI_CHAT_RESPONSE]", safeResponseText);
    
    const usage = result.usage;

    const creditsToDeduct = usage 
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // Get user data for credit check and tier info
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { aiCreditsUsed: true, aiCreditsLimit: true, tier: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 6. Deduct Credits & Log Interaction (Atomic Transaction with Credit Check)
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
        let processedResponse = responseText as string;
        
        // If response exceeds the safe threshold, truncate and add summary
        if ((responseText as string).length > MAX_RESPONSE_LENGTH) {
          processedResponse = (responseText as string).substring(0, MAX_RESPONSE_LENGTH) + 
            "\n\n---\n*Response truncated due to length. The full response was too long to store in the database.*";
        }

        await tx.aIConversation.create({
          data: {
            feature: "CHAT" as const,
            prompt: sanitizedMessage as string,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + (responseText as string)),
            userId: session.user.id,
            expiresAt: getConversationExpirationDate(user?.tier || 'FREE'),
          },
        });
      });
    } catch (dbError) {
      // Check if it's a credit limit error
      if (dbError instanceof Error && dbError.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      console.error("[AI_CHAT_DB_ERROR]", dbError);
      throw dbError;
    }

return NextResponse.json({ response: responseText as string });
  } catch (error) {
    logger.error("[AI_CHAT_ERROR]", error);

    if (error instanceof Error) {
      // Use AI SDK canonical error identifiers when available
      const errorCode = (error as any).code || (error as any).type || '';
      const errorDetails = (error as any).body || {};
      
      // Check for canonical error codes first
      if (errorCode === 'invalid_api_key' || errorCode === 'unauthorized' || 
          errorDetails.code === 'invalid_api_key' || errorDetails.code === 'unauthorized') {
        return NextResponse.json({ error: "Invalid AI API configuration" }, { status: 500 });
      } else if (errorCode === 'network_error' || errorCode === 'timeout' ||
                 errorDetails.code === 'network_error' || errorDetails.code === 'timeout') {
        return NextResponse.json({ error: "AI service unavailable. Please try again later." }, { status: 503 });
      } else if (errorCode === 'rate_limit_exceeded' || errorDetails.code === 'rate_limit_exceeded') {
        return NextResponse.json({ error: "AI service rate limit exceeded. Please try again later." }, { status: 429 });
      } else if (errorCode === 'quota_exceeded' || errorDetails.code === 'quota_exceeded') {
        return NextResponse.json({ error: "AI service quota exceeded. Please upgrade your plan." }, { status: 402 });
      }
      
      // Fallback to message-based checks for backward compatibility
      if (error.message.includes("API key not valid") || error.message.includes("Invalid API key")) {
        return NextResponse.json({ error: "Invalid AI API configuration" }, { status: 500 });
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        return NextResponse.json({ error: "AI service unavailable. Please try again later." }, { status: 503 });
      } else if (error.message.includes("credit limit reached") || error.message.includes("AI credit limit reached")) {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}