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

  // Validate and parse startDateInput
  let startDate: Date;
  if (startDateInput) {
    const parsedDate = new Date(startDateInput);
    startDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  } else {
    startDate = new Date();
  }

  // Create project within a transaction to ensure tasks are also created
  const project = await db.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        title,
        description,
        discipline,
        ownerId: session.user.id,
        startDate,
      },
    });

    if (templateId) {
      const template = await tx.template.findUnique({
        where: { id: templateId }
      });

if (template && template.content) {
        try {
          const parsedTasks = JSON.parse(template.content);
          
          // Validate that tasks is an array
          if (!Array.isArray(parsedTasks)) {
            throw new Error("Template content must be an array of tasks");
          }

          // Filter and validate tasks
          const validTasks = parsedTasks.filter((t: any) => {
            return t && typeof t.title === 'string' && t.title.trim().length > 0;
          });

          if (validTasks.length === 0 && parsedTasks.length > 0) {
            throw new Error("No valid tasks found in template - all tasks missing titles");
          }

          // Create tasks with validated data
          await tx.task.createMany({
            data: validTasks.map((t: any) => {
              const daysAfterStart = typeof t.daysAfterStart === 'number' ? t.daysAfterStart : null;
              return {
                title: t.title.trim(),
                description: t.description ? t.description.toString() : null,
                priority: t.priority || "MEDIUM",
                projectId: newProject.id,
                dueDate: daysAfterStart !== null 
                  ? new Date(startDate.getTime() + daysAfterStart * 24 * 60 * 60 * 1000)
                  : null,
              };
            })
          });
          
          // Increment usage count
          await tx.template.update({
            where: { id: template.id },
            data: { usageCount: { increment: 1 } }
          });
        } catch (e) {
          throw new Error(`Failed to process template: ${e instanceof Error ? e.message : 'Unknown error'}`);
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