import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exists = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (exists) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Import credit limits to set appropriate default
    const creditLimitsModule = await import('@/lib/creditLimits');
    const getCreditLimitForTier = creditLimitsModule.getCreditLimitForTier;
    
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tier: 'FREE', // Default tier for new users
        aiCreditsLimit: getCreditLimitForTier('FREE'), // Set appropriate credit limit based on tier
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
