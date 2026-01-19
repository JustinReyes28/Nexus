import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Improved IP extraction logic
  let ip: string | null = null;
  const forwarded = request.headers.get("x-forwarded-for");
  
  if (forwarded) {
    const ips = forwarded.split(",").map(i => i.trim());
    const validIp = ips.find(i => i && !i.startsWith("unknown"));
    if (validIp) ip = validIp;
  }
  
  if (!ip) ip = request.ip ?? null;
  if (!ip) ip = request.headers.get("x-real-ip");
  
  // As a last resort, use a non-shared placeholder to avoid shared rate-limit buckets
  const finalIp = ip || `unknown-${crypto.randomUUID()}`;

  if (rateLimiter.isRateLimited(finalIp)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register") ||
                     request.nextUrl.pathname.startsWith("/reset-password") ||
                     request.nextUrl.pathname.startsWith("/verify");

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!token && !request.nextUrl.pathname.startsWith("/api/auth")) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/ai-tools/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/reset-password/:path*",
    "/verify/:path*",
  ],
};
