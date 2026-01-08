export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, { count: number; lastReset: number }>;
  private readonly limit: number = 30;
  private readonly interval: number = 60 * 1000; // 1 minute

  private constructor() {
    this.requests = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isRateLimited(ip: string): boolean {
    const now = Date.now();
    const clientData = this.requests.get(ip);

    if (!clientData) {
      this.requests.set(ip, { count: 1, lastReset: now });
      return false;
    }

    if (now - clientData.lastReset > this.interval) {
      this.requests.set(ip, { count: 1, lastReset: now });
      return false;
    }

    if (clientData.count >= this.limit) {
      return true;
    }

    clientData.count++;
    return false;
  }
}

export const rateLimiter = RateLimiter.getInstance();

export function checkRateLimit(request: Request) {
  // Get IP from headers (standard for Vercel/Next.js)
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  
  if (rateLimiter.isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again in a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return null;
}
