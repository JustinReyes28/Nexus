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
  
  // Pagination parameters with defaults and limits
  const page = parseInt(searchParams.get("page") || "1");
  const pageSizeParam = searchParams.get("pageSize");
  const defaultPageSize = 10;
  const maxPageSize = 50;
  const pageSize = Math.min(
    parseInt(pageSizeParam || String(defaultPageSize)),
    maxPageSize
  );

  // Validate that page and pageSize are positive integers
  if (isNaN(page) || page < 1 || !Number.isInteger(page)) {
    return NextResponse.json({ error: "Invalid page parameter" }, { status: 400 });
  }
  if (isNaN(pageSize) || pageSize < 1 || !Number.isInteger(pageSize)) {
    return NextResponse.json({ error: "Invalid pageSize parameter" }, { status: 400 });
  }

  try {
    const skip = (page - 1) * pageSize;
    
    const templates = await db.template.findMany({
      where: discipline ? { discipline } : {},
      orderBy: { usageCount: "desc" },
      skip,
      take: pageSize
    });

    // Get total count for pagination metadata
    const totalCount = await db.template.count({
      where: discipline ? { discipline } : {}
    });
    
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      templates,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages,
        totalCount
      }
    });
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
