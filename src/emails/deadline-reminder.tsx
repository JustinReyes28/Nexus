import { emailLayout } from "@/lib/email";

export const renderDeadlineReminderEmail = (taskTitle: string, dueDate: Date) => {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  return emailLayout(`
    <h2>Deadline Reminder</h2>
    <p>This is a reminder that the task <strong>"${taskTitle}"</strong> is due soon.</p>
    <div style="background: #fff8f1; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #c2410c;"><strong>Due:</strong> ${formattedDate}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Task</a>
    </div>
  `);
};
