import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CSRF_SECRET environment variable is required in production");
}

if (!CSRF_SECRET) {
  console.warn("Warning: CSRF_SECRET not set. Using temporary secret for development only.");
}

export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const signature = createCsrfSignature(token, timestamp);
  return `${token}.${timestamp}.${signature}`;
}

export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenValue, timestamp, signature] = token.split(".");
    const now = Date.now();
    const tokenTime = parseInt(timestamp, 10);
    if (now - tokenTime > 3600000) return false;
    const expectedSignature = createCsrfSignature(tokenValue, timestamp);
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

function createCsrfSignature(token: string, timestamp: string): string {
  const secret = CSRF_SECRET || crypto.randomBytes(32).toString("hex");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${token}.${timestamp}`);
  return hmac.digest("hex");
}

export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-csrf-token") || req.headers.get("x-xsrf-token");
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;
  if (request.nextUrl.pathname.startsWith("/api/auth")) return null;
  
  const csrfToken = getCsrfTokenFromRequest(request);
  if (!csrfToken || !verifyCsrfToken(csrfToken)) {
    return new NextResponse("Invalid CSRF token", { status: 403 });
  }
  return null;
}

export function getCsrfTokenForClient(): string {
  return generateCsrfToken();
}
