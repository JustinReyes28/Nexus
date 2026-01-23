// Test
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import NewProjectForm from "@/components/projects/NewProjectForm";

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 border-dashed">
        <div>
          <div className="flex items-center gap-2 text-sunny font-handwritten text-xl mb-1">
            <Sparkles className="w-5 h-5" />
            Time to Create Something Amazing!
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            Launch Your Next Project
            <WavyUnderline className="text-crimson/20" />
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <NewProjectForm />
    </div>
  );
}
