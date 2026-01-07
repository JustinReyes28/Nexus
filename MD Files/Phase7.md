Phase 7: Security Implementation
[MODIFY]
next.config.mjs
Add security headers:

Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security
Referrer-Policy
[NEW]
rate-limiter.ts
Middleware or MongoDB-based rate limiting
Per-endpoint configuration
Graceful degradation
[NEW]
validation.ts
Zod schemas for all inputs
Sanitization utilities
Type guards
