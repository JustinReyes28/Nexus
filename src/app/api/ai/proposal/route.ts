import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { proposalSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (rateLimiter.isRateLimited(session.user.id)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[JSON_PARSE_ERROR] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 },
      );
    }

    const validatedData = proposalSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { section, context, discipline, templateLevel = "Standard" } = validatedData.data;
    
    // Get user with both credits and tier in a single query
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { tier: true, aiCreditsUsed: true, aiCreditsLimit: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Sanitize all user-controlled fields
    const sanitizedSection = sanitizePrompt(section || "");
    const sanitizedDiscipline = sanitizePrompt(discipline || "");
    const sanitizedContext = sanitizePrompt(context || "");
    const sanitizedLevel = sanitizePrompt(templateLevel);

    let levelInstruction = "";
    if (templateLevel === "Advanced") {
      levelInstruction = "Use sophisticated vocabulary and deeper technical analysis. Assume a knowledgeable audience.";
    } else if (templateLevel === "Academic") {
      levelInstruction = "Adhere to strict academic standards. Emphasize methodology, citation readiness, and formal structure.";
    } else {
      levelInstruction = "Maintain a balanced, professional tone suitable for general academic proposals.";
    }

    const prompt = `
      As an academic writing expert, provide guidance and a drafted outline for the "${sanitizedSection}" section of a research proposal.
      Discipline: ${sanitizedDiscipline || "General Academic"}
      Template Level: ${sanitizedLevel}
      Specific Instructions: ${levelInstruction}
      Target Context: ${sanitizedContext}
       
      Structure your response:
      1. Purpose of this section
      2. Key elements to include
      3. Draft Outline/Example Content
      4. Tips for academic tone
       
      Format in clean markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text() as string;
    const usage = result.usage;

    const creditsToDeduct = usage 
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // Perform atomic credit check and deduction in a single transaction
    try {
      // Execute credit deduction and conversation creation in a single transaction
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
        let processedResponse = responseText;
        
        // If response exceeds the safe threshold, truncate and add summary
        if (responseText.length > MAX_RESPONSE_LENGTH) {
          processedResponse = responseText.substring(0, MAX_RESPONSE_LENGTH) + 
            "\n\n---\n*Response truncated due to length. The full response was too long to store in the database.*";
        }

        // Create the conversation record
        await tx.aIConversation.create({
          data: {
            feature: "PROPOSAL_WRITER",
            prompt: `Section: ${section} | Level: ${templateLevel} | Context: ${context.substring(0, 50)}${context.length > 50 ? "..." : ""}`,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
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
      console.error("[AI_PROPOSAL_DB_ERROR]", dbError);
      throw dbError;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_PROPOSAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
