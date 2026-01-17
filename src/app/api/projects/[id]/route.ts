import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const projectUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  discipline: z.string().max(100).optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum([
    "IDEATION",
    "PROPOSAL",
    "RESEARCH",
    "DEVELOPMENT",
    "WRITING",
    "REVIEW",
    "COMPLETED",
  ]).optional(),
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
    const project = await db.project.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true, documents: true }
        },
        tasks: {
          orderBy: { updatedAt: "desc" },
          take: 5
        }
      }
    });

    if (!project) {
      // Fail secure: don't reveal if it exists but belongs to someone else
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = projectUpdateSchema.parse(body);

    const project = await db.project.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedData: any = { ...validatedData };
    if (validatedData.deadline !== undefined) {
      updatedData.deadline = validatedData.deadline ? new Date(validatedData.deadline) : null;
    }

    const updatedProject = await db.project.update({
      where: { id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }
    console.error("[PROJECT_PATCH]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const project = await db.project.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Since we don't have cascade delete in schema yet, we'll delete tasks first 
    // to avoid potential orphan records or constraint issues.
    // In a real production app, we should update the schema.
    await db.task.deleteMany({
      where: { projectId: params.id }
    });
    
    await db.document.deleteMany({
      where: { projectId: params.id }
    });

    await db.aIConversation.deleteMany({
      where: { projectId: params.id }
    });

    await db.teamMember.deleteMany({
      where: { projectId: params.id }
    });

    await db.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
