"use server";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const discipline = formData.get("discipline") as string | null;
  const userId = formData.get("userId") as string;

  const project = await db.project.create({
    data: {
      title,
      description,
      discipline,
      ownerId: userId,
    },
  });

  redirect(`/projects/${project.id}`);
}