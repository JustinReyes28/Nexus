import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is required");
}

const client = new Mistral({ apiKey });

let cachedAgent: any = null;

export const model = {
  generateContent: async (prompt: string) => {
    console.log("[AI_SDK] Calling Mistral API with model: mistral-small-latest");
    try {
      const response = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
          {
            role: "user",
            content: prompt,
          }
        ],
        maxTokens: 2048,
        temperature: 0.9,
      });
      console.log("[AI_SDK_SUCCESS] Response metadata:", {
        id: response.id,
        model: response.model,
        totalTokens: response.usage?.totalTokens,
        promptTokens: response.usage?.promptTokens,
        completionTokens: response.usage?.completionTokens
      });

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
      console.error("[AI_SDK_ERROR]", error);
      throw error;
    }
  },
  generateResearchContent: async (prompt: string, webSearchEnabled?: boolean) => {
    try {
      if (webSearchEnabled) {
        console.log(`[AI_SDK] Creating web search agent with model: mistral-small-2506`);
        // Use Agents API for web search as required by Mistral for this tool
        if (!cachedAgent) {
          try {
            cachedAgent = await (client as any).beta.agents.create({
              model: "mistral-small-2506",
              description: "Agent able to search information over the web",
              name: "Websearch Agent",
              instructions: "You have the ability to perform web searches with `web_search` to find up-to-date information.",
              tools: [{ type: "web_search" }],
              completionArgs: {
                temperature: 0.3,
                topP: 0.95,
              }
            });
          } catch (error) {
            console.error("Failed to create agent, clearing cache:", error);
            cachedAgent = null;
            throw error;
          }
        }

        console.log(`[AI_SDK] Calling agent: ${cachedAgent.id}`);
        const response = await (client as any).agents.complete({
          agentId: cachedAgent.id,
          messages: [{ role: "user", content: prompt }]
        });

        console.log("[AI_SDK_SUCCESS] Research agent response metadata:", {
          id: response.id,
          model: response.model,
          totalTokens: response.usage?.totalTokens,
          promptTokens: response.usage?.promptTokens,
          completionTokens: response.usage?.completionTokens
        });

        const text = response.choices && response.choices.length > 0
          ? response.choices[0].message?.content || ""
          : "";

        return {
          response: {
            text: () => text
          },
          usage: response.usage
        };
      }

      // Default path without web search
      console.log(`[AI_SDK] Calling mistral with model: mistral-small-latest`);
      const response = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 2048,
        temperature: 0.7,
      });

      console.log("[AI_SDK_SUCCESS] Research response metadata:", {
        id: response.id,
        model: response.model,
        totalTokens: response.usage?.totalTokens,
        promptTokens: response.usage?.promptTokens,
        completionTokens: response.usage?.completionTokens
      });

      const text = response.choices && response.choices.length > 0
        ? response.choices[0].message?.content || ""
        : "";

      return {
        response: {
          text: () => text
        },
        usage: response.usage
      };
    } catch (error: any) {
      // Safe error logging to prevent TypeError: Cannot read properties of undefined (reading 'value')
      // occurring during util.inspect(error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorBody = error.body ? JSON.stringify(error.body) : "";
      console.error("[MISTRAL_SDK_ERROR]", errorMessage, errorBody);
      throw new Error(errorMessage, { cause: error });
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
  const outputCredits = cTokens / 500;
  return Number((inputCredits + outputCredits).toFixed(4));
}

/**
 * Sanitizes control characters and trims input to produce a clean string for prompts.
 * Note: This does not prevent semantic prompt injection attacks.
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
