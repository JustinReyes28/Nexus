import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProjectCard from "@/components/dashboard/ProjectCard";
import DeadlineWidget from "@/components/dashboard/DeadlineWidget";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Plus, LayoutGrid, ListTodo, History } from "lucide-react";
import Link from "next/link";
import { ProjectStatus } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Fetch projects with task counts
  const projects = await db.project.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: { tasks: true }
      },
      tasks: {
        where: { status: "COMPLETED" },
        select: { id: true }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  // Fetch upcoming deadlines (next 30 days)
  const upcomingTasks = await db.task.findMany({
    where: {
      project: { ownerId: session.user.id },
      status: { not: "COMPLETED" },
      dueDate: {
        not: null,
        gt: new Date(),
      }
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const upcomingProjects = projects
    .filter((p: any) => p.deadline && p.deadline > new Date())
    .map((p: any) => ({ id: p.id, title: p.title, dueDate: p.deadline as Date, type: "PROJECT" as const }));

  const deadlines = [
    ...upcomingTasks.map((t: any) => ({ id: t.id, title: t.title, dueDate: t.dueDate as Date, type: "TASK" as const })),
    ...upcomingProjects
  ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 5);

  // For Demo: Use mock activities if none found (In real app, we'd have an Activity model)
  const activities = [
    {
      id: "1",
      type: "PROJECT_CREATED" as const,
      user: { name: session.user.name || "User" },
      target: projects[0]?.title || "First Project",
      timestamp: projects[0]?.createdAt || new Date(),
    }
  ].filter(a => projects.length > 0);

  const processedProjects = projects.map((p: any) => ({
    ...p,
    completedTasks: p.tasks.length
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session.user?.name || session.user?.email}</p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm shadow-blue-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Projects Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              Active Projects
            </h2>
            <Link href="/projects" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          
          {processedProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {processedProjects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 group hover:border-blue-200 transition-colors">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-200 group-hover:text-blue-500 group-hover:bg-blue-100 transition-all">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">No projects yet</h3>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto mt-1">Start your first capstone project with AI assistance.</p>
              </div>
              <Link 
                href="/projects/new"
                className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Create a project
              </Link>
            </div>
          )}

          {/* AI Quick Actions */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
             <div className="relative z-10 flex flex-col gap-2">
                <h3 className="text-xl font-bold">Need a new idea?</h3>
                <p className="text-blue-100 text-sm max-w-[300px]">Our AI Brainstormer can help you find the perfect capstone topic based on your interests.</p>
             </div>
             <Link 
              href="/ai/ideas"
              className="relative z-10 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
             >
              Brainstorm Now
             </Link>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-orange-500" />
              Deadlines
            </h2>
            <DeadlineWidget deadlines={deadlines} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              Activity
            </h2>
            <ActivityFeed activities={activities as any} />
          </section>
        </div>
      </div>
    </div>
  );
}
