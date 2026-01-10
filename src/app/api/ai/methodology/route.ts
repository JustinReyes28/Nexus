import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { model, sanitizePrompt, estimateTokens, calculateCredits } from "@/lib/ai";
import { rateLimiter } from "@/lib/rate-limit";
import { methodologySchema } from "@/lib/validations/ai";

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
      // When not trusting proxies, avoid using X-Forwarded-For as it can be spoofed by clients
      // Instead, we'll use alternative headers that are typically set by infrastructure (not clients)
      // These headers are less likely to be spoofed when not behind a trusted proxy
      const xRealIP = req.headers.get('x-real-ip');
      const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
      const xOriginalForwardedFor = req.headers.get('x-original-forwarded-for');

      // Use alternative headers that are typically set by infrastructure, not clients
      if (cfConnectingIP) {
        ip = cfConnectingIP;
      } else if (xRealIP) {
        ip = xRealIP;
      } else if (xOriginalForwardedFor) {
        // If we have x-original-forwarded-for, take the first IP
        ip = xOriginalForwardedFor.split(",")[0].trim() || "anonymous";
      } else {
        // If no trusted headers are present and we don't trust X-Forwarded-For,
        // we'll default to anonymous since we can't securely determine the IP
        // In a real Next.js environment, you might have access to the IP through other means
        // but in the App Router API routes, direct socket access isn't available
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

    // Set up timeout for AI model call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let aiResult: any;
    try {
      // Using AbortController with the model call if supported, otherwise using Promise.race
      aiResult = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        )
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 408 });
      }
      throw error; // Re-throw other errors
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = aiResult.response.text() as string;
    const usage = aiResult.usage;

    const creditsToDeduct = usage 
      ? calculateCredits(usage.promptTokens, usage.completionTokens)
      : calculateCredits(estimateTokens(prompt), estimateTokens(responseText));

    // Perform credit check and increment in a transaction
    try {
      await db.$transaction(async (tx) => {
        // First check if user still has credits (extra safety)
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { aiCreditsUsed: true, aiCreditsLimit: true }
        });

        if (!user || user.aiCreditsUsed >= user.aiCreditsLimit) {
          throw new Error("Credit limit reached");
        }

        // Increment credits
        await tx.user.update({
          where: { id: session.user.id },
          data: { aiCreditsUsed: { increment: creditsToDeduct } }
        });

        // Create the conversation record
        return await tx.aIConversation.create({
          data: {
            feature: "METHODOLOGY_ADVISOR",
            prompt: `Type: ${researchType} | Discipline: ${discipline} | Problem: ${problemStatement.substring(0, 50)}...`,
            response: responseText,
            tokensUsed: usage?.totalTokens ?? estimateTokens(prompt + responseText),
            userId: session.user.id,
          },
        });
      });
    } catch (transactionError) {
      // If the transaction failed because no records were updated (credit limit reached), return 403
      if ((transactionError as any).message?.includes?.('Credit limit reached')) {
        return NextResponse.json({ error: "AI credit limit reached" }, { status: 403 });
      }
      // Re-throw other errors
      throw transactionError;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[AI_METHODOLOGY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
