import { renderPasswordResetEmail } from "@/emails/password-reset";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

const passwordResetSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    let body;
    try {
      body = await req.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
      }
      throw error;
    }

    const parseResult = passwordResetSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });
    }

    const { email, name } = parseResult.data;

    // Look up user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return generic success to avoid enumeration
      return NextResponse.json({ success: true, message: "If an account exists with this email, you will receive a password reset link" });
    }

    // Generate cryptographically secure token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token with expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Construct reset link server-side
    const resetLink = `${process.env.APP_URL || process.env.NEXTAUTH_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Add to email queue
    await emailQueue.add({
      to: email,
      subject: "Reset your Nexus password",
      html: renderPasswordResetEmail(name || "", resetLink),
    });

    return NextResponse.json({ success: true, message: "If an account exists with this email, you will receive a password reset link" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[PASSWORD_RESET_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
