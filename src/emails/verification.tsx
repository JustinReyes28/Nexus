import { emailLayout } from "@/lib/email";
import { escapeHtml } from "@/lib/utils";

export const renderVerificationEmail = (code: string) => {
  // Escape the code to prevent HTML injection
  const escapedCode = escapeHtml(code);

  return emailLayout(`
    <h2>Verify your email</h2>
    <p>Please use the following verification code to complete your registration. This code will expire in 15 minutes.</p>
    <div style="text-align: center; margin: 40px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${escapedCode}</span>
    </div>
    <p>If you did not request this code, please ignore this email.</p>
  `);
};
