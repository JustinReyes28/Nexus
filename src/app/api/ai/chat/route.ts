import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    console.log("[AI_CHAT_START] Request received");
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    if (rateLimiter.isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 3. User Credit Check
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { aiCreditsUsed: true, aiCreditsLimit: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.aiCreditsUsed >= user.aiCreditsLimit) {
      return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
    }

    // 4. Input Validation
    const body = await req.json();
    console.log("[AI_CHAT_BODY]", JSON.stringify(body, null, 2));

    // For chat, we just need a topic/message field
    const { topic, message, context } = body;
    if (!topic && !message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userMessage = topic || message || "";
    if (userMessage.length < 1) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    console.log("[AI_CHAT_VALIDATED]", { userMessage, context });

    // 5. Generate Prompt
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

    // 6. Call AI
    console.log("[AI_CHAT_PROMPT]", prompt);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text() as string;
    const usage = result.usage;
    console.log("[AI_CHAT_RESPONSE]", responseText);

    const creditsToDeduct = usage 
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // 7. Deduct Credits & Log Interaction
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { aiCreditsUsed: { increment: creditsToDeduct } },
      }),
      db.aIConversation.create({
        data: {
          feature: "CHAT" as const,
          prompt: sanitizedMessage as string,
          response: responseText,
          tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_CHAT_ERROR]", error);

    if (error instanceof Error) {
      if (error.message.includes("API key not valid") || error.message.includes("Invalid API key")) {
        return NextResponse.json({ error: "Invalid AI API configuration" }, { status: 500 });
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        return NextResponse.json({ error: "AI service unavailable. Please try again later." }, { status: 503 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}