import { z } from "zod";

// User Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  institution: z.string().max(100).optional(),
  program: z.string().max(100).optional(),
  year: z.string().max(10).optional(),
});

// Project Schemas
export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  discipline: z.string().max(100).optional(),
  status: z.enum(["IDEATION", "PROPOSAL", "RESEARCH", "DEVELOPMENT", "WRITING", "REVIEW", "COMPLETED"]).optional(),
  startDate: z.union([z.string().datetime(), z.date()]).optional(),
  deadline: z.union([z.string().datetime(), z.date()]).optional(),
});

// Task Schemas
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.union([z.string().datetime(), z.date()]).optional(),
  projectId: z.string().uuid("Project ID must be a valid UUID"),
});

// Utility for sanitization
/**
 * Strips angle brackets from a string.
 * WARNING: This only removes raw '<' and '>' characters and does not protect against
 * entities, javascript: URLs, event handlers, quote/backtick injection, or CSS attacks.
 * Ensure all call sites perform context-appropriate encoding (HTML-escape or URL-encode)
 * at render time instead of relying on this function for comprehensive XSS protection.
 */
export const stripAngleBrackets = (str: string) => {
  return str.trim().replace(/[<>]/g, "");
};

// Alias for backward compatibility - to be removed in future versions
export const sanitizeString = stripAngleBrackets;
