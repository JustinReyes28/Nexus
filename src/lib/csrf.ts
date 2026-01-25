import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CSRF_SECRET environment variable is required in production");
}

// Stable in-process fallback secret for development
let DEV_CSRF_SECRET: string;
if (!CSRF_SECRET) {
  console.warn("Warning: CSRF_SECRET not set. Using temporary secret for development only.");
  DEV_CSRF_SECRET = crypto.randomBytes(32).toString("hex");
}

export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now().toString();
  const signature = createCsrfSignature(token, timestamp);
  return `${token}.${timestamp}.${signature}`;
}

export function verifyCsrfToken(token: string): boolean {
  try {
    const parts = token.split(".");
    // Validate token has exactly three parts
    if (parts.length !== 3) return false;
    
    const [tokenValue, timestamp, signature] = parts;
    
    // Validate timestamp is a valid number
    const tokenTime = parseInt(timestamp, 10);
    if (isNaN(tokenTime)) return false;
    
    // Check expiry (1 hour) and reject future timestamps
    const now = Date.now();
    if (tokenTime > now) return false; // Reject future timestamps
    if (now - tokenTime > 3600000) return false;
    
    // Compute expected signature
    const expectedSignature = createCsrfSignature(tokenValue, timestamp);
    
    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
    
    // Ensure equal length before comparison to prevent timing attacks
    if (signatureBuffer.length !== expectedSignatureBuffer.length) return false;
    
    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
  } catch (error) {
    return false;
  }
}

function createCsrfSignature(token: string, timestamp: string): string {
  const secret = CSRF_SECRET || DEV_CSRF_SECRET;
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
