import { z } from "zod";

export const ideaGeneratorSchema = z.object({
  discipline: z.string().min(1, "Discipline is required").max(100),
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500),
  constraints: z.string().max(1000).optional(),
});

export const researchSchema = z.object({
  topic: z.string().min(3, "Topic is required").max(500),
  focusAreas: z.array(z.string()).optional(),
});

export const proposalSchema = z.object({
  section: z.string().min(1, "Section type is required"),
  context: z.string().min(10, "Context must be more descriptive"),
  discipline: z.string().optional(),
});

export const methodologySchema = z.object({
  researchType: z.string().min(1, "Research type is required"),
  discipline: z.string().min(1, "Discipline is required"),
  problemStatement: z.string().min(20, "Problem statement should be detailed"),
});

export const progressSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  currentStatus: z.string().optional(),
});

export const writingSchema = z.object({
  content: z.string().min(10, "Content is too short"),
  style: z.enum(["academic", "professional", "simplified"]).default("academic"),
  type: z.enum(["grammar", "tone", "summarize", "expand"]).default("grammar"),
});
