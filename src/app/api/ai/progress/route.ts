import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { progressSchema } from "@/lib/validations/ai";
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
    const validatedData = progressSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { projectId, currentStatus } = validatedData.data;

    // Fetch project details for better analysis
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    
    const taskSummary = project.tasks.map((t: any) => `${t.title} (${t.status})`).join(", ");
    
    const prompt = `
      As a project management assistant for academic research, analyze the progress of the project "${project.title}".
      Current Status: ${project.status}
      Tasks: ${taskSummary}
      Additional Info: ${currentStatus || "None provided"}
      
      Structure your response:
      1. Progress Assessment (Where are we?)
      2. Potential Bottlenecks (What might be slowing us down?)
      3. Immediate Next Steps (3 items)
      4. Recommendations for acceleration
      
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

    await db.$transaction([
      db.user.update({ where: { id: session.user.id }, data: { aiCreditsUsed: { increment: creditsToDeduct } } }),
      db.aIConversation.create({
        data: {
          feature: "PROGRESS_ANALYZER",
          prompt: `Project: ${project.title}`,
          response: responseText,
          tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
          userId: session.user.id,
          projectId: project.id,
          expiresAt: getConversationExpirationDate(userWithTier?.tier || 'FREE'),
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_PROGRESS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
