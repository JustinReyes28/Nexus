# **Security, Privacy & Academic Integrity Requirements**

## **1. CRITICAL: Security Requirements (Implemented)**

### **1.1 Input Validation & Sanitization**

- Validate and sanitize **ALL** user inputs before processing using Zod schemas
- Input validation implemented with Zod for all API endpoints
- Validate **data types, ranges, and formats** with schema validation
- **XSS Protection**: Implemented with DOMPurify for HTML sanitization in React components
- URL validation and sanitization using custom validation functions
- **Escape output** based on context (React auto-escapes; DOMPurify used for raw HTML)

### **1.2 Authentication & Authorization**

- **Never hardcode** credentials, API keys, or secrets (stored in environment variables)
- Use **environment variables or secure secret management systems**
- **Authentication**: NextAuth.js with JWT strategy, Google OAuth, and email/password authentication
- **Secure password hashing** with bcrypt.js (passwords hashed with salt before storage)
- **Session Management**: Secure cookie settings with HttpOnly, Secure, SameSite flags
- Apply the **principle of least privilege** (API routes verify authorization)
- Verify **authorization checks** on every protected resource/action
- Rate limiting implemented on authentication endpoints

### **1.3 Data Protection**

- Encrypt **sensitive data at rest** (MongoDB Atlas encryption) and **in transit** (TLS 1.2+)
- Use **strong, modern cryptographic algorithms** (bcrypt for passwords)
- **Never roll your own crypto**—use established libraries
- **PII Removal**: Implemented with `sanitizeProjectData()` function to remove sensitive data (email addresses) before exposing publicly
- Proper **key management practices** (stored in environment variables)

### **1.4 Injection Prevention**

- **SQL Injection**: Prevented using Prisma ORM with parameterized queries
- **XSS**: Sanitized with React auto-escaping and DOMPurify for raw HTML
- **Command Injection**: Avoided by not using shell execution
- **Path Traversal**: Prevented by not accessing file system directly
- **NoSQL Injection**: Prevented with Prisma ORM and input validation

### **1.5 Error Handling & Logging**

- **Never expose sensitive information** in error messages (generic error messages shown to users)
- **Log security events** (failed API calls, validation errors) but **sanitize sensitive data**
- Implement **proper exception handling** (do not expose stack traces to users)
- Use **structured logging** with appropriate severity levels
- **PII Redaction**: Implemented in logging with functions to sanitize personal information before logging

### **1.6 Dependency & Configuration Security**

- Use **up-to-date, well-maintained libraries** (Next.js 14+, OpenAI SDK v4, bcrypt, DOMPurify, Zod)
- Avoid dependencies with known vulnerabilities (run `npm audit`)
- **Secure HTTP Headers**: Configured in middleware and NextAuth (HttpOnly, Secure, SameSite flags)
- Disable **unnecessary features and services**

### **1.7 Rate Limiting & DoS Protection**

- Implement **rate limiting on APIs and sensitive endpoints** (custom rate limiter with Vercel KV: 30 req/min per IP)
- Add **timeout mechanisms** for operations (AI API timeout set to 8s)
- Validate **resource consumption** (max request body size, cache key length limits)
- Protect against **resource exhaustion attacks**

### **1.8 Secure Defaults**

- **Fail securely** (deny access by default; return 403 for unauthorized requests)
- **Minimize attack surface** (debug modes disabled in production)
- Use **secure session cookies** (HttpOnly, Secure, SameSite=Strict flags)
- **HTTPS-only communication** enforced

## **2. Privacy & Data Handling**

### **2.1 User Data & AI Interactions**

- Provide a **clear privacy policy** regarding AI processing and data usage
- Ensure **opt-in consent** for data usage in training or model improvement
- **Do not store sensitive personal information** in prompts or logs (PII redaction implemented)
- Offer **user control over conversation history**
- **PII Sanitization**: Implemented for project data and AI prompts to remove sensitive information
- Ensure **transparency about AI limitations** in all interactions
- Include **clear attribution** that content is AI-assisted

### **2.2 Data Collection & Analytics**

- Use **anonymous usage analytics** where possible
- **AI Prompt Sanitization**: Implemented to clean user inputs before processing by AI models

## **3. Academic Integrity**

### **3.1 Plagiarism Prevention & Transparency**

- Apply **watermarking or disclosure** for AI-generated content to ensure transparency
- Provide **guidance on the proper use of AI assistance** in academic work
- Offer **citation recommendations** for AI-assisted sections
- Supply **educational resources on academic integrity**

### **3.2 Usage Monitoring**

- Maintain **advisor visibility into AI assistance usage** (with explicit student consent)
- Basic **logging of AI interactions** for transparency

## **4. IMPLEMENTED SECURITY FEATURES**

### **4.1 What's Actually Implemented**

- Authentication: NextAuth.js with JWT strategy, Google OAuth, and email/password authentication using bcrypt
- Input Validation: Zod schemas for validation, DOMPurify for HTML sanitization
- Rate Limiting: Custom rate limiter implementation
- Password Hashing: bcrypt.js for password hashing
- Data Sanitization: PII removal from project data, URL validation and sanitization
- Logging: Basic logging with redaction capabilities
- Session Security: Secure cookie settings with HttpOnly, Secure flags
- AI Prompt Sanitization: Input cleaning for AI models

### **4.2 What's Missing (Future Implementation)**

- Multi-factor authentication (MFA/2FA) - Not implemented
- Content Security Policy (CSP) - Not configured in next.config.js
- CSRF protection - Not explicitly implemented
- TLS 1.3 enforcement - Not explicitly configured
- GDPR compliance mechanisms - Basic data export/deletion not fully implemented
- Comprehensive audit trails - Basic logging exists but not comprehensive audit trails
- Argon2id - Only bcrypt is used (though bcrypt is still secure)

### **4.3 Security Best Practices Followed**

- Environment variable usage for secrets
- Parameterized queries via Prisma ORM
- Secure session management
- Input validation with Zod schemas
- Output sanitization with DOMPurify
- PII data redaction in logs
- Rate limiting to prevent abuse
- Proper error handling without information disclosure

## **5. PROHIBITED PRACTICES (NEVER DO THESE)**

- **String concatenation in SQL queries**.
- Using **`eval()` or similar dynamic code execution**.
- **Hardcoding credentials, API keys, or secrets**.
- **Storing passwords in plaintext**.
- **Exposing stack traces or detailed errors** to users.
- **Rolling your own cryptography**.
- **Trusting client-side validation alone**.
- Using **deprecated cryptographic algorithms** (MD5, SHA1 for passwords).
