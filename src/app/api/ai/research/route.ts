import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { researchSchema } from "@/lib/validations/ai";
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
    const validatedData = researchSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { topic, focusAreas } = validatedData.data;
    const sanitizedTopic = sanitizePrompt(topic);
    
    const prompt = `
      As a specialized research assistant, provide a brief literature review overview and gap analysis for the topic: "${sanitizedTopic}".
      ${focusAreas ? `Focus areas: ${focusAreas.join(", ")}` : ""}
      
      Structure your response:
      1. Current State of Research
      2. Key Literature/Authors (General mention)
      3. Identified Research Gaps
      4. Proposed Research Questions (2-3)
      
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

    // 8. Deduct Credits & Log Interaction
    await db.$transaction([
      db.user.update({ where: { id: session.user.id }, data: { aiCreditsUsed: { increment: creditsToDeduct } } }),
      db.aIConversation.create({
        data: {
          feature: "RESEARCH_ASSISTANT",
          prompt: sanitizedTopic as string,
          response: responseText,
          tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
          userId: session.user.id,
          expiresAt: getConversationExpirationDate(userWithTier?.tier || 'FREE'),
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_RESEARCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
