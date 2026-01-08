import { emailLayout } from "@/lib/email";

export const renderPasswordResetEmail = (name: string, resetLink: string) => {
  return emailLayout(`
    <h2>Reset your password</h2>
    <p>We received a request to reset your password for your Nexus account. Click the button below to choose a new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
  `);
};
