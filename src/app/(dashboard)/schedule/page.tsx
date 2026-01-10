import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { Calendar } from "lucide-react";

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="pb-4 border-b-2 border-gray-100 border-dashed">
        <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
          Schedule Manager
          <WavyUnderline className="text-teal/20" />
        </h1>
        <p className="text-gray-500 mt-2 font-body">Organize your timeline and important dates</p>
      </div>

      <div className="bg-white border-2 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-teal/10 flex items-center justify-center text-teal">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="max-w-[320px]">
          <h3 className="text-xl font-heading font-extrabold text-gray-900">Feature Coming Soon</h3>
          <p className="text-sm text-gray-500 font-body italic mt-2">"Time you enjoy wasting is not wasted time." - Marthe Troly-Curtin</p>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-md">
          <p className="text-sm text-yellow-700 text-center">
            <strong>Note:</strong> The Schedule Manager page is currently under development. 
            This feature will be available in an upcoming release!
          </p>
        </div>
      </div>
    </div>
  );
}