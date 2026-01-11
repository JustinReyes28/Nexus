import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { writingSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate, CONVERSATION_RETENTION_POLICY } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    if (rateLimiter.isRateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { aiCreditsUsed: true, aiCreditsLimit: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.aiCreditsUsed >= user.aiCreditsLimit) {
      return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = writingSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { content, style, type } = validatedData.data;
    
    let instructions = "";
    switch (type) {
      case "grammar": instructions = "Fix grammar, spelling, and punctuation errors."; break;
      case "tone": instructions = `Adjust the tone to be more ${style}.`; break;
      case "summarize": instructions = "Provide a concise summary of the given text."; break;
      case "expand": instructions = "Expand upon the ideas in the text with more detail and depth."; break;
    }

    const prompt = `
      As an academic writing assistant, ${instructions}
      Target Style: ${style}
      Text: "${sanitizePrompt(content)}"
      
      Provide the revised text and a brief explanation of the major changes made.
      Format in clean markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text() as string;
    const usage = result.usage;

    const creditsToDeduct = usage 
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // 7. Get user tier for retention policy
    const userWithTier = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { tier: true },
    });

    await db.user.update({ where: { id: session.user.id }, data: { aiCreditsUsed: { increment: creditsToDeduct } } });
    await db.aIConversation.create({
      data: {
        feature: "WRITING_ASSISTANT",
        prompt: `Type: ${type} | Content: ${content.substring(0, 50)}...`,
        response: responseText,
        tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
        userId: session.user.id,
        expiresAt: getConversationExpirationDate(userWithTier?.tier || 'FREE'),
      },
    });

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_WRITING_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
