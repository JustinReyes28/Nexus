// Test
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProjectDetailHeader from "@/components/project/ProjectDetailHeader";
import ProjectProgress from "@/components/project/ProjectProgress";
import ProjectManagement from "@/components/project/ProjectManagement";
import { BookOpen, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

import TeamSection from "@/components/project/TeamSection";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const project = await db.project.findUnique({
    where: {
      id: params.id,
    },
    include: {
      _count: {
        select: { tasks: true, documents: true }
      },
      tasks: {
        orderBy: { updatedAt: "desc" },
        take: 5
      },
      team: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        }
      },
      invitations: {
        where: {
          used: false
        }
      }
    }
  });

  if (!project) {
    notFound();
  }

  // Check if user is owner or team member
  const isOwner = project.ownerId === session.user.id;
  const isTeamMember = project.team.some(tm => tm.userId === session.user.id);

  if (!isOwner && !isTeamMember) {
    notFound();
  }

  const statusCounts = await db.task.groupBy({
    by: ['status'],
    where: { projectId: project.id },
    _count: { status: true }
  });

  const statusMap = new Map<string, number>();
  let totalTasks = 0;
  statusCounts.forEach(group => {
    statusMap.set(group.status, group._count.status);
    totalTasks += group._count.status;
  });

  const taskStats = {
    totalTasks: totalTasks,
    completedTasks: statusMap.get("COMPLETED") || 0,
    todoTasks: statusMap.get("TODO") || 0,
    inProgressTasks: statusMap.get("IN_PROGRESS") || 0,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <ProjectDetailHeader project={project} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Overview Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal" />
              Project Blueprint
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
               <p className="text-lg text-gray-600 font-body italic leading-relaxed relative z-10">
                "{project.description || "No description provided for this ambitious journey."}"
               </p>
            </div>
          </section>

          {/* Progress Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sunny" />
              Momentum Tracker
            </h2>
            <ProjectProgress stats={taskStats} deadline={project.deadline} />
          </section>

          {/* Recent Tasks Preview */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-extrabold text-gray-900 flex items-center gap-2">
                Recent Milestones
              </h2>
              <Link href={`/projects/${project.id}/tasks`} className="text-xs font-bold text-gray-400 hover:text-crimson transition-colors uppercase tracking-widest flex items-center gap-1">
                Full Board <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {project.tasks.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                       <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{task.title}</span>
                        <Badge variant={task.status === "COMPLETED" ? "success" : "info"} className="scale-90">
                          {task.status.replaceAll("_", " ")}
                        </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 font-body italic">
                  No tasks recorded yet. Start by defining your first milestone!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-10">
          <TeamSection 
            projectId={project.id}
            projectName={project.title}
            initialMembers={project.team}
            initialInvitations={project.invitations}
            isOwner={isOwner}
          />

          <ProjectManagement project={project} />
          
          <section className="space-y-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               AI Strategic Advisor
             </h3>
             <div className="bg-teal p-6 rounded-2xl text-white relative overflow-hidden group shadow-lg shadow-teal/10">
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <MessageSquare className="w-8 h-8 mb-4 opacity-50" />
                <h4 className="text-lg font-heading font-extrabold mb-2">Need guidance?</h4>
                <p className="text-teal-50 text-xs mb-4 leading-relaxed">Let The Guide analyze this project's scope and suggest the next best steps for your academic success.</p>
                <Link href="/capstone-assistant">
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-teal border-b-2">
                    Summon Advisor
                  </Button>
                </Link>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
