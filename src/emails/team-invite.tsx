import { emailLayout } from "@/lib/email";
import { escapeHtml } from "@/lib/utils";
import { validateAndSanitizeUrl } from "@/lib/utils";

export const renderTeamInviteEmail = (inviterName: string, projectName: string, inviteLink: string) => {
  // Escape inviterName and projectName to prevent HTML injection
  const escapedInviterName = escapeHtml(inviterName);
  const escapedProjectName = escapeHtml(projectName);
  
  // Validate and sanitize the inviteLink
  const isDev = process.env.NODE_ENV === "development";
  const allowedProtocols = isDev ? ["https:", "http:"] : ["https:"];
  const sanitizedInviteLink = validateAndSanitizeUrl(inviteLink, allowedProtocols);
  if (!sanitizedInviteLink) {
    throw new Error("Invalid inviteLink provided to renderTeamInviteEmail");
  }

  return emailLayout(`
    <h2>You've been invited!</h2>
    <p><strong>${escapedInviterName}</strong> has invited you to collaborate on the project <strong>"${escapedProjectName}"</strong> on Nexus.</p>
    <p>Nexus helps teams manage their capstone projects with AI-assisted research and planning tools.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${sanitizedInviteLink}" class="button">Accept Invitation</a>
    </div>
    <p>If you don't have an account, you'll be prompted to create one.</p>
  `);
};
