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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus</title>
  <style>
    /* Reset & Typography */
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
    
    .wrapper {
      padding: 40px 20px;
      background-color: #f8f9fa;
    }

    /* Card Design */
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    /* Gradient Top Border */
    .top-bar {
      height: 4px;
      background: linear-gradient(90deg, #b30909, #06d6a0);
    }

    .header { 
      padding: 32px 40px 24px;
      text-align: center;
    }

    .brand {
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #b30909;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .content {
      padding: 0 40px 40px;
    }

    .content h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-top: 0;
    }

    /* Button Styles from Design.md */
    .button { 
      display: inline-block; 
      padding: 12px 32px; 
      background-color: #b30909; 
      color: #ffffff !important; 
      text-decoration: none; 
      border-radius: 8px; 
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      text-align: center;
      transition: background-color 0.2s;
    }

    .footer { 
      padding: 24px 40px;
      background-color: #f9fafb;
      border-top: 1px solid #f3f4f6;
      font-size: 13px; 
      color: #6b7280; 
      text-align: center;
    }

    .footer p {
      margin: 4px 0;
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .container { border-radius: 0; }
      .content, .header, .footer { padding-left: 20px; padding-right: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-bar"></div>
      <div class="header">
        <h1 class="brand">Nexus</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Nexus. All rights reserved.</p>
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
