import { emailLayout } from "@/lib/email";
import { validateAndSanitizeUrl } from "@/lib/utils";

export const renderPasswordResetEmail = (name: string, resetLink: string) => {
  // Validate and sanitize the resetLink
  const sanitizedResetLink = validateAndSanitizeUrl(resetLink);
  if (!sanitizedResetLink) {
    throw new Error("Invalid resetLink provided to renderPasswordResetEmail");
  }

  // Use a safe default if name is empty, otherwise use the provided name
  const greetingName = name && name.trim() ? name : "there";

  return emailLayout(`
    <h2>Reset your password</h2>
    <p>Hi ${greetingName},</p>
    <p>We received a request to reset your password for your Nexus account. Click the button below to choose a new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${sanitizedResetLink}" class="button">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  `);
};
