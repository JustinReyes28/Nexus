import { emailLayout } from "@/lib/email";

export const renderTeamInviteEmail = (inviterName: string, projectName: string, inviteLink: string) => {
  return emailLayout(`
    <h2>You've been invited!</h2>
    <p><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> on Nexus.</p>
    <p>Nexus helps teams manage their capstone projects with AI-assisted research and planning tools.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteLink}" class="button">Accept Invitation</a>
    </div>
    <p>If you don't have an account, you'll be prompted to create one.</p>
  `);
};
