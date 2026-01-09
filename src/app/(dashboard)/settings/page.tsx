import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AISettings from "@/components/settings/AISettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DataManagement from "@/components/settings/DataManagement";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Fetch user data
  const user = await db.user.findUnique({
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
      emailVerified: true,
      accounts: {
        select: {
          provider: true,
        }
      }
    }
  });

  // Fetch notification preferences
  const notificationPreferences = await db.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

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
          session={session}
        />
        <SecuritySettings
          user={user}
          hasGoogleAccount={user?.accounts?.some(acc => acc.provider === "google") || false}
        />
        <AISettings
          aiCreditsUsed={user?.aiCreditsUsed || 0}
          aiCreditsLimit={user?.aiCreditsLimit || 100}
          userId={session.user.id}
        />
        <NotificationSettings
          preferences={notificationPreferences}
          userId={session.user.id}
        />
        <DataManagement userId={session.user.id} />
      </div>
    </div>
  );
}
