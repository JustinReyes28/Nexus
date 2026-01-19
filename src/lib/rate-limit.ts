export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, { count: number; lastReset: number }>;
  private readonly limit: number = 5;
  private readonly interval: number = 60 * 1000; // 1 minute
  private readonly ttl: number = 5 * 60 * 1000; // 5 minutes TTL for cleanup
  private readonly cleanupInterval: number = 60 * 1000; // Run cleanup every minute
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.requests = new Map();
    this.startCleanup();
    
    // Clean up on process termination (for Node.js environments)
    process.on('beforeExit', () => {
      this.stopCleanup();
    });
    process.on('SIGINT', () => {
      this.stopCleanup();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.stopCleanup();
      process.exit(0);
    });
  }

  /**
   * Start periodic cleanup of expired entries
   * @note This is a stopgap solution for memory management. For production/serverless environments,
   * consider switching to an external store (Redis/Upstash) for rate limiting.
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupInterval);
  }

  /**
   * Stop the cleanup interval
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Remove entries that are older than TTL
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const ipsToDelete: string[] = [];
    
    // Use Array.from to avoid iteration issues
    const entries = Array.from(this.requests.entries());
    for (const [ip, data] of entries) {
      if (now - data.lastReset > this.ttl) {
        ipsToDelete.push(ip);
      }
    }
    
    for (const ip of ipsToDelete) {
      this.requests.delete(ip);
    }
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

// Helper function to generate a stable hash of a string
function generateStableHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8); // Return short alphanumeric hash
}

export function checkRateLimit(request: Request) {
  // Extract client IP by checking headers in order of preference
  let clientIp = "";
  
  // Check x-forwarded-for header (take the first IP if there are multiple)
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    clientIp = xForwardedFor.split(',')[0].trim();
  }
  
  // If x-forwarded-for didn't yield an IP, check x-real-ip
  if (!clientIp && request.headers.get("x-real-ip")) {
    clientIp = request.headers.get("x-real-ip")!.trim();
  }
  
  // If still no IP, check cf-connecting-ip (Cloudflare)
  if (!clientIp && request.headers.get("cf-connecting-ip")) {
    clientIp = request.headers.get("cf-connecting-ip")!.trim();
  }
  
  // If no reliable IP found, create a stable fallback key based on other request attributes
  if (!clientIp) {
    const userAgent = request.headers.get("user-agent") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";
    const combinedHeaders = `${userAgent}-${acceptLanguage}`;
    clientIp = `unknown-${generateStableHash(combinedHeaders)}`;
  }
  
  if (rateLimiter.isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again in a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return null;
}
