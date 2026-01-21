import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { renderTeamInviteEmail } from "@/emails/team-invite";
import { emailQueue } from "@/lib/email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomBytes } from "crypto";

const inviteSchema = z.object({
  projectId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid project ID format"),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export async function POST(req: Request) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, email, role } = inviteSchema.parse(body);

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

    // Generate a cryptographically secure token
    const token = randomBytes(32).toString('hex');
    
    // Create invitation record in the database
    await db.invitation.create({
      data: {
        projectId,
        email,
        token,
        role,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
      }
    });
    
    // Build invite link using the token instead of email
    const inviteLink = `${process.env.NEXTAUTH_URL}/invitations/accept?token=${encodeURIComponent(token)}`;

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
