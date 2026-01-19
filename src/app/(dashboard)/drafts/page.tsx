// Test
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProjectCard from "@/components/dashboard/ProjectCard";
import DraftActions from "@/components/dashboard/DraftActions";
import { Plus, Sparkles, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { ProjectStatus } from "@prisma/client";

// Define types based on the Prisma schema
interface Task {
  id: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  discipline: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tasks: Task[];
  _count: {
    tasks: number;
  };
}

interface ProcessedProject {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: Date | null;
  _count: {
    tasks: number;
  };
  completedTasks: number;
}

export default async function DraftsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Fetch drafts (projects with IDEATION status)
  const drafts: Project[] = await db.project.findMany({
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
    orderBy: { updatedAt: "desc" }
  });

  const processedDrafts: ProcessedProject[] = drafts.map((p) => ({
    ...p,
    completedTasks: p.tasks.length
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b-2 border-gray-100 border-dashed">
        <div>
          <div className="flex items-center gap-2 text-sunny font-handwritten text-xl mb-1">
             <Pencil className="w-5 h-5" />
             Workbench
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            My Drafts
            <WavyUnderline className="text-teal/20" />
          </h1>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="w-4 h-4" />} className="shadow-lg shadow-teal/10 rotate-1 hover:rotate-0" variant="secondary">
            New Draft
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {processedDrafts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedDrafts.map((draft) => (
              <div key={draft.id} className="flex flex-col">
                <ProjectCard project={draft} />
                <DraftActions projectId={draft.id} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-6 bg-paper shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-teal/10 flex items-center justify-center text-teal rotate-3 transition-all duration-500">
              <Pencil className="w-10 h-10" />
            </div>
            <div className="max-w-[400px]">
              <h3 className="text-2xl font-heading font-extrabold text-gray-900">No drafts found</h3>
              <p className="text-base text-gray-500 font-body italic mt-2">
                "Every great idea starts as a rough draft."
              </p>
            </div>
            <Link href="/projects/new">
              <Button className="shadow-lg shadow-teal/10 rotate-1 hover:rotate-0 px-8" variant="secondary">
                Start Drafting
              </Button>
            </Link>
          </div>
        )}

        {/* AI Quick Actions */}
        <div className="bg-canvas border-2 border-teal/20 rounded-2xl p-8 relative overflow-hidden group">
           <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                 <div className="mt-1">
                    <Sparkles className="w-8 h-8 text-sunny animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-xl font-heading font-extrabold text-gray-900">Ready to publish?</h3>
                    <p className="text-gray-500 text-sm max-w-[400px] font-body">Once you're happy with your draft, you can publish it to move it to your main dashboard and start collaborating.</p>
                 </div>
              </div>
              {processedDrafts.length > 0 && (
                <div className="flex gap-3">
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-teal text-teal hover:bg-teal/5">
                      View Published
                    </Button>
                  </Link>
                  <Link href={`/projects/${processedDrafts[0].id}`}>
                    <Button variant="ai">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Publish Draft
                    </Button>
                  </Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}