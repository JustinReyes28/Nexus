import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCreditLimitForTier } from "@/lib/creditLimits";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Password strength validation
    const isPasswordStrong = (password: string): boolean => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasDigit &&
        hasSpecialChar
      );
    };

    if (!isPasswordStrong(password)) {
      return new NextResponse(
        "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character",
        { status: 400 }
      );
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

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tier: 'FREE', // Default tier for new users
        aiCreditsLimit: getCreditLimitForTier('FREE'), // Set appropriate credit limit based on tier
      },
    });

    // Create safe user object without password
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
