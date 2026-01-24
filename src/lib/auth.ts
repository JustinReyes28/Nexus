import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";

// Account lockout configuration
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
            failedLoginAttempts: true,
            accountLockedUntil: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if account is locked
        if (user.accountLockedUntil) {
          const now = new Date();
          const lockTimeRemaining = user.accountLockedUntil.getTime() - now.getTime();
          
          if (lockTimeRemaining > 0) {
            const minutesRemaining = Math.ceil(lockTimeRemaining / (60 * 1000));
            throw new Error(`Account temporarily locked. Try again in ${minutesRemaining} minutes.`);
          } else {
            // Lockout period has expired, reset attempts
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                accountLockedUntil: null,
              },
            });
          }
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          // Increment failed login attempts
          const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
          let updateData: any = { failedLoginAttempts: newFailedAttempts };

          if (newFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            // Lock the account
            const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            updateData.accountLockedUntil = lockoutUntil;
            await db.user.update({
              where: { id: user.id },
              data: updateData,
            });
            const minutesRemaining = Math.ceil(LOCKOUT_DURATION_MS / (60 * 1000));
            throw new Error(`Too many failed login attempts. Account locked for ${minutesRemaining} minutes.`);
          } else {
            await db.user.update({
              where: { id: user.id },
              data: updateData,
            });
          }
          
          const attemptsRemaining = MAX_FAILED_LOGIN_ATTEMPTS - newFailedAttempts;
          throw new Error(`Invalid credentials. ${attemptsRemaining} attempts remaining.`);
        }

        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0) {
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              accountLockedUntil: null,
            },
          });
        }

        // Return a sanitized user object without sensitive data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, check if email is verified before allowing sign-in
      if (account?.provider === "google" && profile) {
        // Type assertion to access email_verified property
        const googleProfile = profile as { email_verified?: boolean };
        // Only allow sign-in if the email is verified by Google
        const isEmailVerified = googleProfile.email_verified === true;
        
        if (!isEmailVerified) {
          // Optionally, you could redirect to an email verification page
          // or store this info for later verification
          return false; // Deny sign-in if email is not verified
        }
      }
      
      return true; // Allow sign-in
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

async function checkAccountLockoutStatus(userId: string): Promise<{ isLocked: boolean; lockoutTimeRemaining: number | null }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { accountLockedUntil: true, failedLoginAttempts: true },
  });

  if (!user?.accountLockedUntil) {
    return { isLocked: false, lockoutTimeRemaining: null };
  }

  const now = new Date();
  const lockTimeRemaining = user.accountLockedUntil.getTime() - now.getTime();

  if (lockTimeRemaining > 0) {
    return { isLocked: true, lockoutTimeRemaining: lockTimeRemaining };
  } else {
    // Lockout period has expired, reset the lockout
    await db.user.update({
      where: { id: userId },
      data: { 
        accountLockedUntil: null,
        failedLoginAttempts: 0,
      },
    });
    return { isLocked: false, lockoutTimeRemaining: null };
  }
}

async function incrementFailedLoginAttempts(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true, accountLockedUntil: true },
  });

  if (!user) return;

  const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
  let updateData: any = { failedLoginAttempts: newFailedAttempts };

  if (newFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    // Lock the account
    const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    updateData.accountLockedUntil = lockoutUntil;
  }

  await db.user.update({
    where: { id: userId },
    data: updateData,
  });
}

async function resetFailedLoginAttempts(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    },
  });
}

export default NextAuth(authOptions);
