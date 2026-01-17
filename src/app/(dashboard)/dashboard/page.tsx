import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProjectCard from "@/components/dashboard/ProjectCard";
import DeadlineWidget from "@/components/dashboard/DeadlineWidget";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Plus, LayoutGrid, ListTodo, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AISparkleIcon } from "@/components/ui/AISparkleIcon";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import EmptyDashboardState from "@/components/dashboard/EmptyDashboardState";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Fetch active projects (excluding drafts)
  const activeProjects = await db.project.findMany({
    where: { 
      ownerId: session.user.id,
      status: { not: "IDEATION" }
    },
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

  // Fetch recent drafts
  const recentDrafts = await db.project.findMany({
    where: { 
      ownerId: session.user.id,
      status: "IDEATION"
    },
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
    take: 3,
  });

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

  const deadlines = [
    ...upcomingTasks.map((t: any) => ({ id: t.id, title: t.title, dueDate: t.dueDate as Date, type: "TASK" as const })),
  ].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 5);

  const activities = [
    {
      id: "1",
      type: "PROJECT_CREATED" as const,
      user: { name: session.user.name?.split(" ")[0] || "Student" },
      target: activeProjects[0]?.title || recentDrafts[0]?.title || "Visionary Project",
      timestamp: activeProjects[0]?.createdAt || recentDrafts[0]?.createdAt || new Date(),
    }
  ].filter(a => activeProjects.length > 0 || recentDrafts.length > 0);

  const processedProjects = activeProjects.map((p: any) => ({
    ...p,
    completedTasks: p.tasks.length
  }));

  const processedDrafts = recentDrafts.map((p: any) => ({
    ...p,
    completedTasks: p.tasks.length
  }));

  const greetings = ["Happy Brainstorming", "Focus Power On", "Creative Energy High", "Leveling Up"];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-gray-100 border-dashed">
        <div>
          <div className="flex items-center gap-2 text-sunny font-handwritten text-xl mb-1">
             <Sparkles className="w-5 h-5" />
             {greeting}, {session.user?.name?.split(" ")[0]}!
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            Project Base Camp
            <WavyUnderline className="text-crimson/20" />
          </h1>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="w-4 h-4" />} className="shadow-lg shadow-crimson/10 rotate-1 hover:rotate-0">
            Create Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Projects Grid */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Recent Drafts Section */}
          {processedDrafts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
                  Recent Drafts
                </h2>
                <Link href="/drafts" className="text-xs font-bold text-gray-400 hover:text-teal transition-colors uppercase tracking-widest">
                  View All Drafts
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {processedDrafts.map((draft: any) => (
                  <ProjectCard key={draft.id} project={draft} />
                ))}
              </div>
            </div>
          )}

          {/* Active Projects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
                Active Projects
              </h2>
              <Link href="/projects" className="text-xs font-bold text-gray-400 hover:text-crimson transition-colors uppercase tracking-widest">
                Browse Archive
              </Link>
            </div>
            
            {processedProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {processedProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : processedDrafts.length === 0 ? (
              <EmptyDashboardState />
            ) : (
              <div className="bg-canvas border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center">
                <p className="text-gray-500 font-body italic text-sm">No active projects yet. Publish a draft to see it here!</p>
              </div>
            )}
          </div>

          {/* AI Quick Actions (Anti-AI feel) */}
          <div className="bg-canvas border-2 border-teal/20 rounded-2xl p-8 relative overflow-hidden group">
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                   <div className="mt-1">
                      <AISparkleIcon className="scale-125" />
                   </div>
                   <div>
                      <h3 className="text-xl font-heading font-extrabold text-gray-900">Need a spark?</h3>
                      <p className="text-gray-500 text-sm max-w-[320px] font-body">The Guide can help you brainstorm actionable topics based on your research interests.</p>
                   </div>
                </div>
                <Link href="/capstone-assistant">
                  <Button variant="ai" className="-rotate-1 hover:rotate-0">
                    Summon Brainstormer
                  </Button>
                </Link>
             </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-10">
          <section>
            <DeadlineWidget deadlines={deadlines} />
          </section>

          <section>
            <ActivityFeed activities={activities as any} />
          </section>
        </div>
      </div>
    </div>
  );
}

