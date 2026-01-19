// Test
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from '@prisma/client';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, institution, program, year } = await req.json();

    // Validate input - ensure we only accept the expected fields
    if (
      (name !== undefined && typeof name !== 'string') ||
      (institution !== undefined && typeof institution !== 'string') ||
      (program !== undefined && typeof program !== 'string') ||
      (year !== undefined && typeof year !== 'string')
    ) {
      return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
    }

    // Length validation for fields other than tier
    if (
      (name && name.length > 100) ||
      (institution && institution.length > 100) ||
      (program && program.length > 100) ||
      (year && year.length > 20)
    ) {
      return NextResponse.json({ error: "Input fields too long" }, { status: 400 });
    }
    

    // Update user profile
    const updateData: Prisma.UserUpdateInput = {};
    
    if (name !== undefined) updateData.name = name;
    if (institution !== undefined) updateData.institution = institution;
    if (program !== undefined) updateData.program = program;
    if (year !== undefined) updateData.year = year;

    // Check if updateData is empty and return early if no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        error: "No valid fields to update"
      }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Return success response with updated user data
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        institution: updatedUser.institution,
        program: updatedUser.program,
        year: updatedUser.year,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        program: true,
        year: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}