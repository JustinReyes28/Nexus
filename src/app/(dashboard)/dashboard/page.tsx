import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome back, {session.user?.name || session.user?.email}</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="font-semibold">Project Ideas</h2>
          <p className="text-sm text-gray-500 mt-2">Generate and validate your capstone ideas.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="font-semibold">Research Assistant</h2>
          <p className="text-sm text-gray-600 mt-2">Get literature and methodology suggestions.</p>
        </div>
      </div>
    </div>
  );
}
