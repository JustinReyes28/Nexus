import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
  
  if (rateLimiter.isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register");

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
  ],
};
