import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
  }
});

/**
 * Sanitizes input for AI prompts to prevent prompt injection 
 * and ensure clean data.
 */
export function sanitizePrompt(input: string): string {
  // Basic sanitization: remove potential control characters and trim
  return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
}

/**
 * Estimates token usage for a given string.
 * This is a rough estimation (approx 4 chars per token).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
