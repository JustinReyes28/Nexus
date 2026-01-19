import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AISettings from "@/components/settings/AISettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DataManagement from "@/components/settings/DataManagement";
import BillingSettings from "@/components/settings/BillingSettings";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Fetch user data and notification preferences in parallel
  const [user, notificationPreferences] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        program: true,
        year: true,
        image: true,
        aiCreditsUsed: true,
        aiCreditsLimit: true,
        tier: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
          }
        },
        projects: {
          where: {
            status: { not: "COMPLETED" }
          },
          select: {
            id: true
          }
        },
        tasks: {
          where: {
            status: "COMPLETED"
          },
          select: {
            id: true
          }
        },
        conversations: {
          select: {
            feature: true
          }
        }
      }
    }),
    db.notificationPreference.findUnique({
      where: { userId: session.user.id },
    })
  ]);

  // Handle case where user is not found
  if (!user) {
    redirect("/onboarding"); // or redirect to an error/onboarding page
  }

  // Calculate stats from user data
  const activeProjectsCount = user.projects.length;
  const uniqueFeaturesUsed = new Set(user.conversations.map(c => c.feature)).size;
  const tasksCompleted = user.tasks.length;

  // Extract hasGoogleAccount value for SecuritySettings
  const hasGoogleAccount = user.accounts.some(acc => acc.provider === "google");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="pb-4 border-b-2 border-gray-100 border-dashed">
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
          Account Settings
          <WavyUnderline className="text-teal/20" />
        </h1>
        <p className="text-gray-500 mt-2 font-body">Manage your profile, security, and preferences</p>
      </div>

      <div className="grid gap-8">
        <ProfileSettings
          user={user}
          session={{}} // Pass empty session object as per component definition
        />
        <SecuritySettings
          hasGoogleAccount={hasGoogleAccount}
        />
        <AISettings
          aiCreditsUsed={Number(user.aiCreditsUsed)}
          aiCreditsLimit={Number(user.aiCreditsLimit)}
          tier={user.tier}
          activeProjectsCount={activeProjectsCount}
          uniqueFeaturesUsed={uniqueFeaturesUsed}
          tasksCompleted={tasksCompleted}
        />
        <BillingSettings />
        <NotificationSettings
          preferences={notificationPreferences}
          userId={session.user.id}
        />
        <DataManagement userId={session.user.id} />
      </div>
    </div>
  );
}
