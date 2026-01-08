import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { renderTeamInviteEmail } from "@/emails/team-invite";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";

const inviteSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
});

import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, email } = inviteSchema.parse(body);

    // Verify inviter is project owner
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    // Create invitation (In real app, we'd have an Invitation model, for now we can use TeamMember with a pending status if we add it, or just send the email)
    // For now, let's just send the email with a link to join
    const inviteLink = `${process.env.NEXTAUTH_URL}/projects/${projectId}/join?email=${encodeURIComponent(email)}`;

    await emailQueue.add({
      to: email,
      subject: `Invitation to collaborate on ${project.title} - Nexus`,
      html: renderTeamInviteEmail(session.user.name || "A team member", project.title, inviteLink),
    });

    return NextResponse.json({ success: true, message: "Invitation email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[TEAM_INVITE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
