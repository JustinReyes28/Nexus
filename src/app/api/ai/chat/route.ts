import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { getConversationExpirationDate, CONVERSATION_RETENTION_POLICY } from "@/config/ai";
import { logger } from "@/lib/logger";
import { csrfMiddleware } from "@/lib/csrf";

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
  // Apply CSRF protection
  const csrfError = csrfMiddleware(req);
  if (csrfError) return csrfError;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (rateLimiter.isRateLimited(session.user.id)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { projectId, message, conversationHistory, feature = "CHAT" } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 10000) {
      return NextResponse.json({ error: "Message too long. Maximum 10,000 characters." }, { status: 400 });
    }

    const project = projectId ? await db.project.findUnique({
      where: { id: projectId, ownerId: session.user.id },
    }) : null;

    const sanitizedMessage = sanitizePrompt(message);
    const conversationHistoryFormatted = conversationHistory?.map((msg: any) => ({
      role: msg.role,
      content: sanitizePrompt(msg.content)
    })) || [];

    const systemPrompt = project ? `
      You are an AI assistant helping with project: ${project.title}
      Project description: ${project.description || 'No description'}
      Status: ${project.status}
      ${project.discipline ? `Discipline: ${project.discipline}` : ''}
      ${project.startDate ? `Start Date: ${project.startDate.toISOString().split('T')[0]}` : ''}
      ${project.deadline ? `Deadline: ${project.deadline.toISOString().split('T')[0]}` : ''}
      
      Provide helpful, professional, and concise responses.
    ` : "You are an AI assistant. Provide helpful, professional, and concise responses.";

    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${conversationHistoryFormatted.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${sanitizedMessage}`;

    const estimatedTokens = estimateTokens(fullPrompt);
    const creditCost = calculateCredits(estimatedTokens, 2000);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiCreditsLimit: true, aiCreditsUsed: true },
    });

    if (!user || (user.aiCreditsUsed + creditCost) > user.aiCreditsLimit) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    logger.info(`AI Chat request`, {
      userId: session.user.id,
      projectId,
      feature,
      messageLength: sanitizedMessage.length,
      estimatedTokens,
      creditCost,
      sanitized: sanitizeForLogging(sanitizedMessage)
    });

    const completion = await model.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistoryFormatted,
        { role: "user", content: sanitizedMessage }
      ],
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("Failed to generate response");
    }

    const conversation = await db.aIConversation.create({
      data: {
        userId: session.user.id,
        feature,
        prompt: fullPrompt,
        response,
        tokenUsage: estimatedTokens,
        creditCost,
        projectId: projectId || null,
        expiresAt: getConversationExpirationDate(),
      },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { aiCreditsUsed: { increment: creditCost } },
    });

    logger.info(`AI Chat response generated`, {
      userId: session.user.id,
      conversationId: conversation.id,
      creditsUsed: creditCost,
      remainingCredits: user.aiCreditsLimit - (user.aiCreditsUsed + creditCost)
    });

    return NextResponse.json({ 
      success: true, 
      response,
      conversationId: conversation.id,
      creditsUsed: creditCost,
      remainingCredits: user.aiCreditsLimit - (user.aiCreditsUsed + creditCost)
    });
  } catch (error) {
    logger.error("[AI_CHAT_ERROR]", { error: error instanceof Error ? error.message : String(error) });
    console.error("[AI_CHAT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
