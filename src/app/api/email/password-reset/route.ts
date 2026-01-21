import { renderPasswordResetEmail } from "@/emails/password-reset";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const passwordResetSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  resetLink: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { email, name, resetLink } = passwordResetSchema.parse(body);

    // Add to email queue
    await emailQueue.add({
      to: email,
      subject: "Reset your Nexus password",
      html: renderPasswordResetEmail(name || "", resetLink),
    });

    return NextResponse.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[PASSWORD_RESET_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
