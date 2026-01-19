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

const rateKey = session.user.id || session.id || session.user?.email || "anonymous";
    if (rateLimiter.isRateLimited(rateKey)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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
      default: throw new Error(`Unsupported writing type: ${type}`);
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

// Get user with all needed fields in a single query
    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { tier: true, aiCreditsUsed: true, aiCreditsLimit: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
            feature: "WRITING_ASSISTANT",
            prompt: `Type: ${type} | Content: ${Array.from(content).slice(0, 50).join('')}...`,
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
      console.error("[AI_WRITING_DB_ERROR]", dbError);
      throw dbError;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_WRITING_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
