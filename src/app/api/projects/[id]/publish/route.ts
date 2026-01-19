// Test
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const project = await db.project.findUnique({
      where: { id, ownerId: session.user.id }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "IDEATION") {
      return NextResponse.json({ error: "Project is already published" }, { status: 400 });
    }

    const updatedProject = await db.project.update({
      where: { id, ownerId: session.user.id },
      data: {
        status: "PROPOSAL"
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_PUBLISH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
