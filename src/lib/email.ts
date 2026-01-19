import nodemailer from "nodemailer";
import crypto from "crypto";

let cachedTransporter: nodemailer.Transporter | null = null;

const validateEnvVars = () => {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST environment variable is required");
  }
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER environment variable is required");
  }
  if (!process.env.SMTP_PASSWORD) {
    throw new Error("SMTP_PASSWORD environment variable is required");
  }
};

export const getTransporter = () => {
  if (!cachedTransporter) {
    validateEnvVars();
    
    const parsedPort = parseInt(process.env.SMTP_PORT || "587");
    const secure = parsedPort === 465; // true for 465, false for other ports
    
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parsedPort,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return cachedTransporter;
};

export const verifyConnection = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: "SMTP connection verified successfully" };
  } catch (error) {
    console.error("[EMAIL_CONNECTION_ERROR]", error);
    return {
      success: false,
      error: {
        message: "Failed to verify SMTP connection",
        code: "CONNECTION_VERIFY_FAILED"
      }
    };
  }
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Nexus" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || "This email requires HTML to view properly.",
    });
    
    // Create a hash of the email for logging purposes (without exposing PII)
    const emailHash = crypto.createHash('sha256').update(to).digest('hex').substring(0, 8);
    console.log(`[EMAIL_SENT] Message sent: ${info.messageId} to recipient with hash: ${emailHash}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL_ERROR]", error);
    return {
      success: false,
      error: {
        message: 'Failed to send email',
        code: 'EMAIL_SEND_FAILED'
      }
    };
  }
};

/**
 * Basic Email Template Wrapper
 */
export const emailLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .footer { font-size: 12px; color: #999; text-align: center; margin-top: 30px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #2563eb; margin: 0;">Nexus</h1>
    </div>
    \${content}
    <div class="footer">
      &copy; \${new Date().getFullYear()} Nexus. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
