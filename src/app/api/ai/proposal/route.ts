import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { proposalSchema } from "@/lib/validations/ai";

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
    const validatedData = proposalSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { section, context, discipline } = validatedData.data;
    
    const prompt = `
      As an academic writing expert, provide guidance and a drafted outline for the "${section}" section of a research proposal.
      Discipline: ${discipline || "General Academic"}
      Target Context: ${sanitizePrompt(context)}
      
      Structure your response:
      1. Purpose of this section
      2. Key elements to include
      3. Draft Outline/Example Content
      4. Tips for academic tone
      
      Format in clean markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const tokensUsed = estimateTokens(prompt + responseText);

    await db.$transaction([
      db.user.update({ where: { id: session.user.id }, data: { aiCreditsUsed: { increment: 1 } } }),
      db.aIConversation.create({
        data: {
          feature: "PROPOSAL_WRITER",
          prompt: `Section: ${section} | Context: ${context.substring(0, 50)}...`,
          response: responseText,
          tokensUsed,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
