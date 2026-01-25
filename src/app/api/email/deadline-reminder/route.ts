import { renderDeadlineReminderEmail } from "@/emails/deadline-reminder";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const deadlineReminderSchema = z.object({
  email: z.string().email(),
  taskTitle: z.string().min(1),
  dueDate: z.string().datetime(),
});

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    const { email, taskTitle, dueDate } = deadlineReminderSchema.parse(body);

    // Parse the due date string to a Date object
    const dueDateObj = new Date(dueDate);

    // Add to email queue
    await emailQueue.add({
      to: email,
      subject: `Deadline Reminder: ${taskTitle}`,
      html: renderDeadlineReminderEmail(taskTitle, dueDateObj),
    });

    return NextResponse.json({ success: true, message: "Deadline reminder email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[DEADLINE_REMINDER_EMAIL_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
