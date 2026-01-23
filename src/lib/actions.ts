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
  const templateId = formData.get("templateId") as string | null;
  const startDateInput = formData.get("startDate") as string | null;

  // Validate title and description
  if (!titleInput || typeof titleInput !== 'string' || titleInput.trim().length === 0) {
    throw new Error('Title is required');
  }
  
  if (!descriptionInput || typeof descriptionInput !== 'string' || descriptionInput.trim().length === 0) {
    throw new Error('Description is required');
  }

  const title = titleInput.trim();
  const description = descriptionInput.trim();

  // Create project within a transaction to ensure tasks are also created
  const project = await db.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        title,
        description,
        discipline,
        ownerId: session.user.id,
        startDate: startDateInput ? new Date(startDateInput) : new Date(),
      },
    });

    if (templateId) {
      const template = await tx.template.findUnique({
        where: { id: templateId }
      });

      if (template && template.content) {
        try {
          const tasks = JSON.parse(template.content);
          const baseDate = startDateInput ? new Date(startDateInput) : new Date();

          await tx.task.createMany({
            data: tasks.map((t: any) => ({
              title: t.title,
              description: t.description,
              priority: t.priority || "MEDIUM",
              projectId: newProject.id,
              dueDate: t.daysAfterStart 
                ? new Date(baseDate.getTime() + t.daysAfterStart * 24 * 60 * 60 * 1000)
                : null,
            }))
          });
          
          // Increment usage count
          await tx.template.update({
            where: { id: template.id },
            data: { usageCount: { increment: 1 } }
          });
        } catch (e) {
          console.error("Failed to parse template content or create tasks", e);
        }
      }
    }

    return newProject;
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