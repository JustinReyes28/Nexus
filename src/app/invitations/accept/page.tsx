import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { recordActivity } from "@/lib/activities";
import Link from "next/link";
import { Sparkle } from "@/components/ui/HandDrawnElements";

interface AcceptInvitationPageProps {
  searchParams: {
    token?: string;
  };
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
        <ErrorDisplay 
            title="Missing Token" 
            message="No invitation token was provided. Please check the link you received." 
        />
    );
  }

  let invitation;
  let session;

  try {
    // Find the invitation by token
    invitation = await db.invitation.findUnique({
      where: { token },
      include: { project: true },
    });
  } catch (error) {
    console.error("[INVITATION_ACCEPT_PAGE_DB_ERROR]", error);
    return (
        <ErrorDisplay 
            title="System Error" 
            message="Something went wrong while connecting to the database. Please try again later." 
        />
    );
  }

  if (!invitation) {
    return (
        <ErrorDisplay 
            title="Invalid Invitation" 
            message="This invitation link is invalid or has expired." 
        />
    );
  }

  // Check if invitation is expired
  if (invitation.expiresAt < new Date()) {
    return (
        <ErrorDisplay 
            title="Expired Invitation" 
            message="This invitation has expired. Please ask the project owner to send a new one." 
        />
    );
  }

  // Get the current session
  session = await getServerSession(authOptions);

  if (invitation.used) {
    if (session && session.user?.id) {
      const existingMembership = await db.teamMember.findFirst({
        where: {
          userId: session.user.id,
          projectId: invitation.projectId,
        },
      });
      if (existingMembership) {
        redirect(`/projects/${invitation.projectId}`);
      }
    }
    
    return (
        <ErrorDisplay 
            title="Invitation Used" 
            message="This invitation has already been used to join the project." 
        />
    );
  }

   if (!session || !session.user?.id) {
    const callbackPath = `/invitations/accept?token=${encodeURIComponent(token)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
   }

  // Check if user is already a member of the project
  const existingMembership = await db.teamMember.findFirst({
    where: {
      userId: session.user.id,
      projectId: invitation.projectId,
    },
  });

  if (existingMembership) {
    await db.invitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });
    
    redirect(`/projects/${invitation.projectId}`);
  }

  try {
    // Add user to the project team
    await db.teamMember.create({
      data: {
        userId: session.user.id,
        projectId: invitation.projectId,
        role: invitation.role || "MEMBER",
      },
    });

    // Log activity
    await recordActivity({
      type: "MEMBER_ADDED",
      userId: session.user.id,
      projectId: invitation.projectId,
      targetId: session.user.id,
      targetName: session.user.name || session.user.email || "New Member",
    });

    // Mark invitation as used
    await db.invitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });
  } catch (error) {
    console.error("[INVITATION_ACCEPT_PAGE_PROCESS_ERROR]", error);
    return (
        <ErrorDisplay 
            title="Processing Error" 
            message="We couldn't add you to the project team. You might already be a member or the project no longer exists." 
        />
    );
  }

  // Redirect to the project page
  redirect(`/projects/${invitation.projectId}`);
}


function ErrorDisplay({ title, message }: { title: string; message: string }) {
    return (
        <main className="flex min-h-screen bg-canvas font-body overflow-hidden items-center justify-center p-6">
            <div className="fixed inset-0 bg-grain pointer-events-none opacity-40" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-crimson rounded-lg rotate-3" />
                    <span className="text-2xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-2 border-gray-100 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-heading font-extrabold text-gray-900 mb-4">{title}</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <Link 
                        href="/dashboard"
                        className="inline-block w-full py-3 px-6 bg-crimson text-white font-bold rounded-xl shadow-lg hover:shadow-crimson/30 transition-all active:scale-[0.98]"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
