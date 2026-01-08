import { z } from "zod";

// User Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  startDate: z.string().datetime().optional().or(z.date().optional()),
  deadline: z.string().datetime().optional().or(z.date().optional()),
});

// Task Schemas
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  projectId: z.string().min(1, "Project ID is required"),
});

// Utility for sanitization
export const sanitizeString = (str: string) => {
  return str.trim().replace(/[<>]/g, ""); // Basic XSS prevention for raw strings
};
