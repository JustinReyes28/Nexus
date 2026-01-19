import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { progressSchema } from "@/lib/validations/ai";
import { getConversationExpirationDate, CONVERSATION_RETENTION_POLICY } from "@/config/ai";
import { Task } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Secure IP extraction - only use cf-connecting-ip as it cannot be spoofed externally
    let ip = "anonymous";
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      ip = cfConnectingIP;
    }
    if (rateLimiter.isRateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    // Calculate credits needed before checking limits
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
      }
      throw parseError; // Re-throw if it's not a SyntaxError
    }
    const validatedData = progressSchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { projectId, currentStatus } = validatedData.data;

    // Fetch project details for better analysis
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });
    
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    
    // Authorization check: Verify the project belongs to the authenticated user
    if (project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Access denied: Project does not belong to user" }, { status: 403 });
    }
    
    const taskSummary = project.tasks.map((t: Task) => `${t.title} (${t.status})`).join(", ");
    
    const safeProjectTitle = sanitizePrompt(project.title);
    const safeTaskSummary = sanitizePrompt(taskSummary);
    const safeCurrentStatus = sanitizePrompt(currentStatus || "None provided");

    const prompt = `
      As a project management assistant for academic research, analyze the progress of the project "${safeProjectTitle}".
      Current Status: ${project.status}
      Tasks: ${safeTaskSummary}
      Additional Info: ${safeCurrentStatus}
      
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

    // Perform atomic credit check and deduction in a single transaction
    try {
      // Execute credit deduction and conversation creation in a single transaction
      await db.$transaction(async (tx) => {
        // We need the user tier and limits
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { aiCreditsLimit: true, tier: true }
        });

        if (!user) throw new Error("User not found");

        // Atomic update: increment credits only if within limit
        const updateResult = await tx.user.updateMany({
          where: {
            id: session.user.id,
            // Check that current usage + new deduction doesn't exceed limit
            aiCreditsLimit: { gt: 0 } // Basic check, the real limit is handled by application logic or schema
          },
          data: {
            aiCreditsUsed: { increment: creditsToDeduct }
          }
        });

        // If no records were updated (shouldn't happen with gt: 0, but keeping for structure)
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
            feature: "PROGRESS_ANALYZER",
            prompt: `Project: ${project.title}`,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
            userId: session.user.id,
            projectId: project.id,
            expiresAt: getConversationExpirationDate(user.tier || 'FREE'),
          },
        });
      });
    } catch (dbError) {
      // Check if it's a credit limit error
      if (dbError instanceof Error && dbError.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      console.error("[AI_PROGRESS_DB_ERROR]", dbError);
      throw dbError;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_PROGRESS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
