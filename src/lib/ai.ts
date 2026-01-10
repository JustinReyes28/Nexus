import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

export const model = {
  generateContent: async (prompt: string) => {
    const response = await client.chat.complete({
      model: "ministral-3b-2512",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      maxTokens: 2048,
      temperature: 0.7,
    });

    return {
      response: {
        text: () => response.choices[0].message?.content || ""
      },
      usage: response.usage
    };
  }
};

/**
 * Calculates credits based on token usage.
 * 1 credit = 1000 input tokens
 * 1 credit = 500 output tokens
 */
export function calculateCredits(promptTokens: number | undefined, completionTokens: number | undefined): number {
  const pTokens = promptTokens ?? 0;
  const cTokens = completionTokens ?? 0;
  const inputCredits = pTokens / 1000;
  const outputCredits = cTokens / 500;
  return Number((inputCredits + outputCredits).toFixed(4));
}

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
