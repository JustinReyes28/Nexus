import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

interface TaskStatGroup {
  status: string;
  _count: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [projectCount, taskStats, upcomingTasks] = await Promise.all([
      db.project.count({
        where: { ownerId: session.user.id }
      }),
      db.task.groupBy({
        by: ["status"],
        where: {
          project: { ownerId: session.user.id }
        },
        _count: true
      }),
      db.task.findMany({
        where: {
          project: { ownerId: session.user.id },
          status: { not: "COMPLETED" },
          dueDate: {
            not: null,
            gt: new Date()
          }
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          assigneeId: true
        }
      })
    ]);

    return NextResponse.json({
      projectCount,
      taskStats: taskStats.reduce((acc: Record<string, number>, curr: TaskStatGroup) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      upcomingTasks
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
