import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordActivity } from "@/lib/activities";
import { sanitizeProjectData, sanitizeProjectDataArray } from "@/lib/sanitize-project-data";

const templateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  daysAfterStart: z.number().int().nonnegative().optional().default(0),
});

const templateContentSchema = z.array(templateTaskSchema);

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  discipline: z.string().max(100).optional(),
  templateId: z.string().optional(),
  startDate: z.string().optional().nullable().refine((val) => {
    if (val === null || val === undefined || val === "") return true;
    return !isNaN(Date.parse(val));
  }, {
    message: "Invalid date format"
  }),
  deadline: z.string().optional().nullable().refine((val) => {
    if (val === null || val === undefined || val === "") return true;
    return !isNaN(Date.parse(val));
  }, {
    message: "Invalid date format"
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await db.project.findMany({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    
    return NextResponse.json(sanitizeProjectDataArray(projects));
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const validatedData = projectSchema.parse(body);

    const project = await db.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          discipline: validatedData.discipline,
          ownerId: session.user.id,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
          deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        }
      });

      if (validatedData.templateId) {
        const template = await tx.template.findUnique({
          where: {
           id: validatedData.templateId,
           // Add authorization check - only allow access to public templates or templates owned by the user
           OR: [
             { visibility: "PUBLIC" }, // Public templates
             { ownerId: session.user.id }, // Templates owned by the user
           ]
         }
       });

        if (template && template.content) {
          try {
            const parsedTasks = JSON.parse(template.content);
            const validatedTasks = templateContentSchema.parse(parsedTasks);
            const baseDate = validatedData.startDate ? new Date(validatedData.startDate) : new Date();

            await tx.task.createMany({
              data: validatedTasks.map((t) => ({
                title: t.title,
                description: t.description || "",
                priority: t.priority,
                projectId: newProject.id,
                dueDate: t.daysAfterStart
                  ? new Date(baseDate.getTime() + t.daysAfterStart * 24 * 60 * 60 * 1000)
                  : null,
              }))
            });

            await tx.template.update({
              where: { id: template.id },
              data: { usageCount: { increment: 1 } }
            });
          } catch (e) {
            // Rethrow the error to cause transaction rollback
            if (e instanceof z.ZodError) {
              throw new Error(`Template validation failed: ${e.message}`);
            }
            throw new Error(`Failed to parse template content or create tasks: ${e instanceof Error ? e.message : String(e)}`);
          }
        } else if (validatedData.templateId && !template) {
          // If a templateId was provided but template wasn't found or unauthorized, throw an error
          throw new Error("Template not found or unauthorized access to template");
        }
      }

      return newProject;
    });

    // Log activity
    try {
      await recordActivity({
        type: "PROJECT_CREATED",
        userId: session.user.id,
        projectId: project.id,
        targetId: project.id,
        targetName: project.title,
      });
    } catch (activityError) {
      console.error("[ACTIVITY_LOG]", activityError);
    }
    
    return NextResponse.json(sanitizeProjectData(project), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[PROJECTS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

