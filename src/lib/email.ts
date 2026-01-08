import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

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
    const info = await transporter.sendMail({
      from: `"Nexus" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || "This email requires HTML to view properly.",
    });
    console.log(`[EMAIL_SENT] Message sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL_ERROR]", error);
    return { success: false, error };
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
    ${content}
    <div class="footer">
      &copy; ${new Date().getFullYear()} Nexus. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
