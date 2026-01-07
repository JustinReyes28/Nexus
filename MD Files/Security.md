# **Security, Privacy & Academic Integrity Requirements**

## **1. CRITICAL: Security Requirements (Mandatory)**

### **1.1 Input Validation & Sanitization**

- Validate and sanitize **ALL** user inputs before processing.
- Use **parameterized queries/prepared statements** for all database operations (NEVER string concatenation).
- Validate **data types, ranges, and formats**:
  - Latitude/longitude bounds: ±90 / ±180
  - Location name length < 100 characters.
- Implement **allowlists over denylists** (e.g., only allow alphanumeric + spaces in location search).
- **Escape output** based on context (HTML escape in React; use DOMPurify for any raw HTML).

### **1.2 Authentication & Authorization**

- **Never hardcode** credentials, API keys, or secrets (store OpenAI key in Vercel environment variables).
- Use **environment variables or secure secret management systems**.
- Implement proper **session management** with secure tokens (stateless for MVP).
- Apply the **principle of least privilege** (API routes only accept POST/GET, no DELETE/PUT).
- Verify **authorization checks** on every protected resource/action (N/A for public MVP).
- **Secure password hashing** with bcrypt (for future authentication).
- Implement **CSRF protection** for state-changing operations (use Next.js built-in protection if forms are added).
- Apply **rate limiting on authentication endpoints**.

### **1.3 Data Protection**

- Encrypt **sensitive data at rest** (MongoDB Atlas encryption) and **in transit** (use TLS 1.2+, enforced by Vercel).
- Use **strong, modern cryptographic algorithms** (bcrypt for passwords; Argon2 considered for future).
- **Never roll your own crypto**—use established libraries (crypto-js for cache keys only).
- Implement proper **key management practices** (no persistent keys in MVP).
- **Hash passwords with salt** before storage (N/A for MVP, no user accounts).

### **1.4 Injection Prevention**

- **SQL Injection**: Use ORM or parameterized queries exclusively if a database is added.
- **XSS**: Sanitize and escape all dynamic content (React auto-escapes; use DOMPurify for raw HTML).
- **Command Injection**: Avoid shell execution; if necessary, use safe APIs with strict input validation.
- **Path Traversal**: Validate any future file paths with allowlists (no file system access in MVP).
- **NoSQL Injection**: Use safe APIs and input validation (Vercel KV with JSON schema validation).

### **1.5 Error Handling & Logging**

- **Never expose sensitive information** in error messages (show generic "Failed to generate insights" to users).
- **Log security events** (failed API calls, validation errors) but **sanitize sensitive data**.
- Implement **proper exception handling** (do not expose stack traces to users).
- Use **structured logging** with appropriate severity levels (Vercel logs with JSON structure).
- Maintain an **audit trail of AI interactions** for institutional transparency.

### **1.6 Dependency & Configuration Security**

- Use **up-to-date, well-maintained libraries** (Next.js 14+, OpenAI SDK v4).
- Avoid dependencies with known vulnerabilities (run `npm audit` in CI/CD).
- Implement **Content Security Policy (CSP)** for web applications (configured in next.config.js).
- Disable **unnecessary features and services** (no server actions enabled if unused).
- Set **secure HTTP headers** (X-Frame-Options, X-Content-Type-Options, HSTS via next.config.js).

### **1.7 Rate Limiting & DoS Protection**

- Implement **rate limiting on APIs and sensitive endpoints** (Vercel KV rate limiter: 30 req/min per IP).
- Add **timeout mechanisms** for operations (AI API timeout set to 8s).
- Validate **resource consumption** (max request body size 1MB, cache key length limits).
- Protect against **resource exhaustion attacks** (use streaming responses for large payloads).

### **1.8 Secure Defaults**

- **Fail securely** (deny access by default; return 403 for invalid lat/lon).
- **Minimize attack surface** (disable debug modes in production; `NODE_ENV=production`).
- Use **secure session cookies** (HttpOnly, Secure, SameSite=Strict flags for any future authentication).
- **HTTPS-only communication** enforced.

## **2. Privacy & Data Handling**

### **2.1 User Data & AI Interactions**

- Provide a **clear privacy policy** regarding AI processing and data usage.
- Ensure **opt-in consent** for data usage in training or model improvement.
- **Do not store sensitive personal information** in prompts or logs.
- Offer **user control over conversation history**.
- Provide **GDPR-compliant data export and deletion** mechanisms.
- Ensure **transparency about AI limitations** in all interactions.
- Include **clear attribution** that content is AI-assisted.

### **2.2 Data Collection & Analytics**

- Use **anonymous usage analytics** where possible.
- Implement **file upload validation and size limits** for any future upload features.

## **3. Academic Integrity**

### **3.1 Plagiarism Prevention & Transparency**

- Apply **watermarking or disclosure** for AI-generated content to ensure transparency.
- Provide **guidance on the proper use of AI assistance** in academic work.
- Offer **citation recommendations** for AI-assisted sections.
- Supply **educational resources on academic integrity**.

### **3.2 Usage Monitoring**

- Maintain **advisor visibility into AI assistance usage** (with explicit student consent).
- Log **AI interactions for audit purposes** to ensure institutional transparency.

## **4. PROHIBITED PRACTICES (NEVER DO THESE)**

- **String concatenation in SQL queries**.
- Using **`eval()` or similar dynamic code execution**.
- **Hardcoding credentials, API keys, or secrets**.
- **Storing passwords in plaintext**.
- **Exposing stack traces or detailed errors** to users.
- **Rolling your own cryptography**.
- **Trusting client-side validation alone**.
- Using **deprecated cryptographic algorithms** (MD5, SHA1 for passwords).
