import { z } from "zod";

export const ideaGeneratorSchema = z.object({
  discipline: z.string().min(1, "Discipline is required").max(100),
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500),
  constraints: z.string().max(1000).optional(),
});

export const researchSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500),
  focusAreas: z.array(z.string().min(1, "Focus area must not be empty").max(200, "Focus area too long")).min(1, "At least one focus area required").max(10, "No more than 10 focus areas").optional(),
  webSearchEnabled: z.boolean().optional(),
});

export const proposalSchema = z.object({
  section: z.string().min(1, "Section is required").max(100, "Section must be at most 100 characters"),
  context: z.string().min(10, "Context must be at least 10 characters").max(2000, "Context must be at most 2000 characters"),
  discipline: z.string().max(100, "Discipline must be at most 100 characters").optional(),
  templateLevel: z.enum(["Standard", "Advanced", "Academic"]).default("Standard"),
});

export const methodologySchema = z.object({
  researchType: z.enum([
    "quantitative",
    "qualitative",
    "mixed-methods",
    "experimental",
    "observational",
    "survey",
    "case-study",
    "ethnographic",
    "phenomenological",
    "grounded-theory",
    "action-research"
  ]).default("quantitative"),
  discipline: z.enum([
    "computer-science",
    "biology",
    "chemistry",
    "physics",
    "mathematics",
    "psychology",
    "sociology",
    "economics",
    "education",
    "medicine",
    "engineering",
    "environmental-science",
    "political-science",
    "anthropology",
    "linguistics",
    "philosophy",
    "history",
    "literature",
    "business",
    "marketing",
    "finance",
    "management",
    "law",
    "public-health",
    "nursing",
    "agriculture",
    "veterinary-science",
    "architecture",
    "urban-planning",
    "geography",
    "geology",
    "astronomy",
    "materials-science",
    "nanotechnology",
    "biotechnology",
    "biochemistry",
    "microbiology",
    "genetics",
    "immunology",
    "neuroscience",
    "cognitive-science",
    "data-science",
    "artificial-intelligence",
    "machine-learning",
    "deep-learning",
    "natural-language-processing",
    "computer-vision",
    "cybersecurity",
    "software-engineering",
    "human-computer-interaction",
    "information-systems",
    "theoretical-physics",
    "applied-physics",
    "organic-chemistry",
    "inorganic-chemistry",
    "physical-chemistry",
    "analytical-chemistry",
    "social-psychology",
    "developmental-psychology",
    "clinical-psychology",
    "cognitive-psychology",
    "behavioral-economics",
    "international-relations",
    "comparative-politics",
    "public-policy",
    "environmental-sociology",
    "criminology",
    "demography",
    "epidemiology",
    "biostatistics",
    "pharmacology",
    "toxicology",
    "pathology",
    "anatomy",
    "physiology"
  ]).default("computer-science"),
  problemStatement: z.string().min(20, "Problem statement should be at least 20 characters").max(2000, "Problem statement should be at most 2000 characters"),
});

export const progressSchema = z.object({
  projectId: z.string().min(1, "Project ID must be at least 1 character").max(255, "Project ID must be at most 255 characters"),
  currentStatus: z.string().min(1, "Current status must be at least 1 character").max(100, "Current status must be at most 100 characters").optional(),
});

export const writingSchema = z.object({
  content: z.string().min(10, "Content is too short").max(5000, "Content is too long"),
  style: z.enum(["academic", "professional", "simplified"]).default("academic"),
  type: z.enum(["grammar", "tone", "summarize", "expand"]).default("grammar"),
});

export const chatSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic is too long"),
  discipline: z.string().max(100, "Discipline must be at most 100 characters").optional(),
});
