import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get("discipline");

  try {
    const templates = await db.template.findMany({
      where: discipline ? { discipline } : {},
      orderBy: { usageCount: "desc" }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
