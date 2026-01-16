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
      temperature: 0.9,
    });

    return {
      response: {
        text: () => response.choices[0].message?.content || ""
      },
      usage: response.usage
    };
  },
  generateResearchContent: async (prompt: string, webSearchEnabled?: boolean) => {
    try {
      const selectedModel = webSearchEnabled ? "mistral-small-latest" : "ministral-3b-2512";
      console.log(`[AI_SDK] Calling mistral with model: ${selectedModel}, webSearch: ${webSearchEnabled}`);
      
      const response = await client.chat.complete({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: prompt,
          }
        ],
        maxTokens: 2048,
        temperature: 0.7,
        // Disable tools for a moment to verify if it resolves the JSON issue
        // tools: webSearchEnabled ? [{ type: "web_search" }] : undefined,
      } as any);

      const text = response.choices && response.choices.length > 0 
        ? response.choices[0].message?.content || "" 
        : "";

      return {
        response: {
          text: () => text
        },
        usage: response.usage
      };
    } catch (error) {
      console.error("[MISTRAL_SDK_ERROR]", error);
      throw error;
    }
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
  const outputCredits = cTokens / 300;
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
