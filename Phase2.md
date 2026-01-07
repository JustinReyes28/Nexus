Phase 2: Authentication System (NextAuth.js)
[NEW]
auth.ts
Configure NextAuth.js with Credentials and Google providers
Implement JWT session strategy with Redis storage
Add email verification callback
Secure session management per Security.md requirements
[NEW]
middleware.ts
Protected route middleware
Rate limiting for auth endpoints
CSRF protection
[NEW] Auth Pages
app/(auth)/login/page.tsx - Email/password + Google OAuth login
app/(auth)/register/page.tsx - Registration with email verification
app/(auth)/reset-password/page.tsx - Password reset flow
app/(auth)/verify/page.tsx - Email verification code entry
Security Considerations (from Security.md):

✅ Bcrypt password hashing with salt
✅ Session tokens stored in HttpOnly, Secure, SameSite=Strict cookies
✅ Rate limiting on auth endpoints
✅ No hardcoded credentials (environment variables)
✅ CSRF protection via NextAuth.js
