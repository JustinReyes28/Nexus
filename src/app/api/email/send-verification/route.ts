import { db } from "@/lib/db";
import { renderVerificationEmail } from "@/emails/verification";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const verificationSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { email } = verificationSchema.parse(body);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in DB
    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: code } },
      update: { expires },
      create: { identifier: email, token: code, expires },
    });

    // Add to email queue
    await emailQueue.add({
      to: email,
      subject: "Verify your email - Nexus",
      html: renderVerificationEmail(code),
    });

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[VERIFICATION_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
