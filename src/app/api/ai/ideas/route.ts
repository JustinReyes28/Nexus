import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { ideaGeneratorSchema } from "@/lib/validations/ai";

export async function POST(req: NextRequest) {
  try {
    console.log("[AI_IDEAS_START] Request received");
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
    console.log("[AI_IDEAS_BODY]", JSON.stringify(body, null, 2));
    const validatedData = ideaGeneratorSchema.safeParse(body);

    if (!validatedData.success) {
      console.log("[AI_IDEAS_VALIDATION_ERROR]", validatedData.error.errors);
      return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });
    }

    const { discipline, topic, constraints } = validatedData.data;
    console.log("[AI_IDEAS_VALIDATED]", { discipline, topic, constraints });

    // 5. Generate Prompt
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

    // 6. Call AI (Non-streaming for now to track tokens easily, will implement streaming in components)
    console.log("[AI_IDEAS_PROMPT]", prompt);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("[AI_IDEAS_RESPONSE]", responseText);

    const tokensUsed = estimateTokens(prompt + responseText);

    // 7. Deduct Credits & Log Interaction
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { aiCreditsUsed: { increment: 1 } },
      }),
      db.aIConversation.create({
        data: {
          feature: "IDEA_GENERATOR",
          prompt: sanitizedTopic,
          response: responseText,
          tokensUsed: tokensUsed,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_IDEAS_ERROR]", error);

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
