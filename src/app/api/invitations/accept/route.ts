import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    // Find the invitation by token
    const invitation = await db.invitation.findUnique({
      where: {
        token,
      },
      include: {
        project: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if invitation has already been used
    if (invitation.used) {
      return NextResponse.json({ error: "Invitation has already been used" }, { status: 400 });
    }

    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      // Redirect to login with the token so we can process the invitation after login
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=/invitations/accept?token=${encodeURIComponent(token)}`, req.url)
      );
    }

    // Check if user is already a member of the project
    const existingMembership = await db.teamMember.findFirst({
      where: {
        userId: session.user.id,
        projectId: invitation.projectId,
      },
    });

    if (existingMembership) {
      // Already a member, redirect to the project page
      await db.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      });
      
      return NextResponse.redirect(new URL(`/projects/${invitation.projectId}`, req.url));
    }

    // Add user to the project team
    await db.teamMember.create({
      data: {
        userId: session.user.id,
        projectId: invitation.projectId,
        role: "MEMBER", // Default role for invited members
      },
    });

    // Mark invitation as used
    await db.invitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });

    // Redirect to the project page
    return NextResponse.redirect(new URL(`/projects/${invitation.projectId}`, req.url));

  } catch (error) {
    console.error("[INVITATION_ACCEPT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}