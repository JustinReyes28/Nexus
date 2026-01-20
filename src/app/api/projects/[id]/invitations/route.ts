import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { renderTeamInviteEmail } from "@/emails/team-invite";
import { emailQueue } from "@/lib/email-queue";
import { randomBytes } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectId = params.id;

    // Verify user has access to the project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { team: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const invitations = await db.invitation.findMany({
      where: {
        projectId,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("[INVITATIONS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { invitationId } = await req.json();

    if (!invitationId) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
    }

    // Verify inviter/owner - only owner or the person who invited can cancel
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { project: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.projectId !== params.id) {
        return NextResponse.json({ error: "Invalid invitation for this project" }, { status: 400 });
    }

    if (invitation.project.ownerId !== session.user.id && invitation.invitedBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.invitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true, message: "Invitation cancelled" });
  } catch (error) {
    console.error("[INVITATION_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { invitationId } = await req.json();

    if (!invitationId) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
    }

    // Verify authorized to resend
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { project: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.project.ownerId !== session.user.id && invitation.invitedBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reset expiry and generate new token
    const newToken = randomBytes(32).toString('hex');
    const updatedInvitation = await db.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(), // Update createdAt to show it was recently resent
      },
    });

    // Send email
    const inviteLink = `${process.env.NEXTAUTH_URL}/invitations/accept?token=${encodeURIComponent(newToken)}`;
    
    await emailQueue.add({
      to: invitation.email,
      subject: `Resent: Invitation to collaborate on ${invitation.project.title} - Nexus`,
      html: renderTeamInviteEmail(session.user.name || "A team member", invitation.project.title, inviteLink),
    });

    return NextResponse.json({ success: true, message: "Invitation resent successfully" });
  } catch (error) {
    console.error("[INVITATION_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
