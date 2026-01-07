import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { methodologySchema } from "@/lib/validations/ai";

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
    const validatedData = methodologySchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { researchType, discipline, problemStatement } = validatedData.data;
    
    const prompt = `
      As a research methodology expert in ${discipline}, recommend a suitable ${researchType} methodology for the following problem:
      "${sanitizePrompt(problemStatement)}"
      
      Structure your response:
      1. Recommended Methodology Type
      2. Data Collection Methods
      3. Data Analysis Techniques
      4. Ethical Considerations
      5. Potential Limitations
      
      Format in clean markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const tokensUsed = estimateTokens(prompt + responseText);

    await db.$transaction([
      db.user.update({ where: { id: session.user.id }, data: { aiCreditsUsed: { increment: 1 } } }),
      db.aIConversation.create({
        data: {
          feature: "METHODOLOGY_ADVISOR",
          prompt: `Type: ${researchType} | Problem: ${problemStatement.substring(0, 50)}...`,
          response: responseText,
          tokensUsed,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_METHODOLOGY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
