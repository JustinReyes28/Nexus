import { renderWelcomeEmail } from "@/emails/welcome";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const welcomeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { email, name } = welcomeSchema.parse(body);

    // Add to email queue
    await emailQueue.add({
      to: email,
      subject: "Welcome to Nexus - Your Capstone Project Assistant",
      html: renderWelcomeEmail(name),
    });

    return NextResponse.json({ success: true, message: "Welcome email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[WELCOME_EMAIL_POST]", { name: error.name, message: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
