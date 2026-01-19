import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { methodologySchema } from "@/lib/validations/ai";

interface AiResponse {
  response: {
    text: () => string | any[];
  };
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  choices?: Array<{
    message?: {
      content?: string | any[];
    };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Secure IP extraction with proxy trust validation
    let ip = "anonymous";

    // Check if we trust proxies based on environment variable
    const trustProxy = process.env.TRUST_PROXY === "true";

    if (trustProxy) {
      // When trusting proxies, extract the first IP from X-Forwarded-For header
      const forwarded = req.headers.get("x-forwarded-for");
      if (forwarded) {
        // Take only the first IP address to prevent spoofing
        ip = forwarded.split(",")[0].trim() || "anonymous";
      }
    } else {
      // When not trusting proxies, avoid using infrastructure headers as they can be spoofed by clients
      // Only use headers that are guaranteed to be set by the hosting platform (like cf-connecting-ip from Cloudflare)
      // These headers cannot be spoofed by external clients
      const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare - cannot be spoofed externally
      
      if (cfConnectingIP) {
        ip = cfConnectingIP;
      } else {
        // If no platform-specific headers are present and we don't trust proxies,
        // we cannot securely determine the IP in Next.js App Router API routes
        // (direct socket access isn't available)
        ip = "anonymous";
      }
    }

    // Normalize IP address (remove IPv6 prefix if present)
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7); // Remove IPv6 to IPv4 mapping prefix
    }

    if (rateLimiter.isRateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = await req.json();
    const validatedData = methodologySchema.safeParse(body);
    if (!validatedData.success) return NextResponse.json({ error: validatedData.error.errors[0].message }, { status: 400 });

    const { researchType, discipline, problemStatement } = validatedData.data;

    // Format discipline and researchType for display in the prompt (replace hyphens with spaces and capitalize)
    const formattedDiscipline = discipline.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedResearchType = researchType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const prompt = `
      As a research methodology expert in ${formattedDiscipline}, recommend a suitable ${formattedResearchType} methodology for the following problem:
      "${sanitizePrompt(problemStatement)}"

      Structure your response:
      1. Recommended Methodology Type
      2. Data Collection Methods
      3. Data Analysis Techniques
      4. Ethical Considerations
      5. Potential Limitations

      Format in clean markdown.
    `;

    // Pre-check prompt size against model limits (assuming max ~30k tokens)
    const promptTokens = estimateTokens(prompt);
    if (promptTokens > 25000) { // Leave buffer for response
      return NextResponse.json({
        error: "Prompt too large. Please reduce the length of your problem statement."
      }, { status: 400 });
    }

    // Set up timeout for AI model call using Promise.race
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 30000)
    );
    
    let aiResult: AiResponse;
    try {
      // Race between the AI call and timeout
      aiResult = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 408 });
      }
      throw error; // Re-throw other errors
    }

    const responseText = aiResult.response.text() as string;
    const usage = aiResult.usage;

    const creditsToDeduct = usage
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // First fetch user data to get the current credit limit
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiCreditsUsed: true, aiCreditsLimit: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Perform atomic credit check and deduction in a single transaction
    try {
      // Execute credit deduction and conversation creation in a single transaction
      await db.$transaction(async (tx) => {
        // Atomic update: increment credits only if within limit
        const updatedUser = await tx.user.updateMany({
          where: {
            id: session.user.id,
            // Check that current usage + new deduction doesn't exceed limit
            aiCreditsUsed: { lt: user.aiCreditsLimit - creditsToDeduct }
          },
          data: {
            aiCreditsUsed: { increment: creditsToDeduct }
          }
        });

        // If no records were updated, it means the credit limit would be exceeded
        if (updatedUser.count === 0) {
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
            feature: "METHODOLOGY_ADVISOR",
            prompt: `Type: ${researchType} | Discipline: ${discipline} | Problem: ${problemStatement.substring(0, 50)}${problemStatement.length > 50 ? "..." : ""}`,
            response: processedResponse,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
            userId: session.user.id,
          },
        });
      });
    } catch (dbError) {
      // Check if it's a credit limit error
      if (dbError instanceof Error && dbError.message === "AI credit limit reached") {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      console.error("[AI_METHODOLOGY_DB_ERROR]", dbError);
      throw dbError;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_METHODOLOGY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
