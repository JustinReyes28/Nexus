import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordActivity } from "@/lib/activities";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable().refine((val) => {
    if (val === null || val === undefined || val === "") return true;
    return !isNaN(Date.parse(val));
  }, {
    message: "Invalid date format"
  }),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await db.task.findMany({
      where: {
        projectId: params.id,
        project: { ownerId: session.user.id }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    const validatedData = taskSchema.parse(body);

    // Verify project ownership
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const task = await db.task.create({
      data: {
        ...validatedData,
        projectId: params.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      }
    });

    // Log activity
    await recordActivity({
      type: "TASK_CREATED",
      userId: session.user.id,
      projectId: params.id,
      targetId: task.id,
      targetName: task.title,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
