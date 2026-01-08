import { emailLayout } from "@/lib/email";

export const renderWelcomeEmail = (name: string) => {
  return emailLayout(`
    <h2>Welcome to Nexus, ${name}!</h2>
    <p>We're thrilled to have you on board. Nexus is designed to help you navigate your capstone project with ease using AI assistance.</p>
    <p>Here's how to get started:</p>
    <ul>
      <li><strong>Brainstorm:</strong> Use the Idea Generator to find a project topic.</li>
      <li><strong>Plan:</strong> Create your project and set milestones.</li>
      <li><strong>Collaborate:</strong> Invite team members to join your project.</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <p>If you have any questions, simply reply to this email.</p>
  `);
};
