import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { proposalSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate } from "@/config/ai";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  // Apply CSRF protection
  const csrfError = csrfMiddleware(req);
  if (csrfError) return csrfError;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (rateLimiter.isRateLimited(session.user.id)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validationResult = proposalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request data", details: validationResult.error.format() }, { status: 400 });
    }

    const { projectId, requirements, features, additionalInfo } = validationResult.data;
    
    const project = await db.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const prompt = sanitizePrompt(`
      Create a detailed project proposal based on:
      Requirements: ${requirements}
      Features: ${features}
      Additional Information: ${additionalInfo}
      
      Project Details:
      - Title: ${project.title}
      - Description: ${project.description}
      - Target Audience: ${project.targetAudience || 'Not specified'}
      - Budget: ${project.budget || 'Not specified'}
      - Timeline: ${project.timeline || 'Not specified'}
      
      Include:
      1. Executive Summary
      2. Problem Statement
      3. Proposed Solution
      4. Scope of Work
      5. Timeline and Milestones
      6. Budget Breakdown
      7. Success Metrics
      8. Risk Assessment
    `);

    const estimatedTokens = estimateTokens(prompt);
    const creditCost = calculateCredits(estimatedTokens);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const completion = await model.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      max_tokens: 4000,
      temperature: 0.7,
    });

    const proposal = completion.choices[0]?.message?.content;
    if (!proposal) {
      throw new Error("Failed to generate proposal");
    }

    const conversation = await db.aIConversation.create({
      data: {
        userId: session.user.id,
        feature: "PROPOSAL",
        prompt,
        response: proposal,
        tokenUsage: estimatedTokens,
        creditCost,
        expiresAt: getConversationExpirationDate(),
      },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: creditCost } },
    });

    return NextResponse.json({ 
      success: true, 
      proposal,
      conversationId: conversation.id,
      creditsUsed: creditCost,
      remainingCredits: user.credits - creditCost
    });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
