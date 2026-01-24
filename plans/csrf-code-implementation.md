// src/lib/csrf.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CSRF Token Secret - should be in environment variable
const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const signature = createCsrfSignature(token, timestamp);
  return `${token}.${timestamp}.${signature}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenValue, timestamp, signature] = token.split('.');
    
    // Check if token is expired (1 hour timeout)
    const now = Date.now();
    const tokenTime = parseInt(timestamp, 10);
    if (now - tokenTime > 3600000) {
      return false;
    }
    
    // Verify signature
    const expectedSignature = createCsrfSignature(tokenValue, timestamp);
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

/**
 * Create CSRF signature
 */
function createCsrfSignature(token: string, timestamp: string): string {
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(`${token}.${timestamp}`);
  return hmac.digest('hex');
}

/**
 * Get CSRF token from request header
 */
export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-csrf-token') || req.headers.get('x-xsrf-token');
}

/**
 * CSRF middleware for API routes
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null;
  }
  
  // Skip CSRF check for auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return null;
  }
  
  const csrfToken = getCsrfTokenFromRequest(request);
  
  if (!csrfToken || !verifyCsrfToken(csrfToken)) {
    return new NextResponse('Invalid CSRF token', { status: 403 });
  }
  
  return null;
}

/**
 * Get CSRF token for client-side use
 */
export function getCsrfTokenForClient(): string {
  return generateCsrfToken();
}