"use server";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { recordActivity } from "./activities";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const titleInput = formData.get("title");
  const descriptionInput = formData.get("description");
  const discipline = formData.get("discipline") as string | null;

  // Validate title and description
  if (!titleInput || typeof titleInput !== 'string' || titleInput.trim().length === 0) {
    throw new Error('Title is required');
  }
  
  if (!descriptionInput || typeof descriptionInput !== 'string' || descriptionInput.trim().length === 0) {
    throw new Error('Description is required');
  }

  const title = titleInput.trim();
  const description = descriptionInput.trim();

  const project = await db.project.create({
    data: {
      title,
      description,
      discipline,
      ownerId: session.user.id,
    },
  });

  // Log activity
  await recordActivity({
    type: "PROJECT_CREATED",
    userId: session.user.id,
    projectId: project.id,
    targetId: project.id,
    targetName: project.title,
  });

  redirect(`/projects/${project.id}`);
}