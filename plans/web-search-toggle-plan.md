# Plan: Web Search Toggle for Research Assistant

Add a toggle to enable/disable web search in the Research Assistant feature of the Capstone Assistant. This will leverage the Mistral `web_search` tool and the `mistral-small-2506` model as requested.

## 1. Data Validation
- Update `researchSchema` in [`src/lib/validations/ai.ts`](src/lib/validations/ai.ts:9) to include `webSearchEnabled: z.boolean().optional()`.

## 2. Frontend Changes
- **File**: [`src/components/ai/ResearchAssistantView.tsx`](src/components/ai/ResearchAssistantView.tsx)
- **Changes**:
    - Add `const [webSearchEnabled, setWebSearchEnabled] = useState(false);`
    - Add a toggle UI component in the research form. Use the existing `Checkbox` component but style it as a "Live Research Mode" or "Web Search" option.
    - Add a `Globe` icon (from `lucide-react`) to represent web search.
    - Pass `webSearchEnabled` into the `additionalData` prop of the `ChatInterface`.

## 3. Library/Utility Changes
- **File**: [`src/lib/ai.ts`](src/lib/ai.ts)
- **Changes**:
    - Add a new method to the `model` object (e.g., `generateResearchContent`) that accepts a `webSearchEnabled` flag.
    - If `webSearchEnabled` is true:
        - Use `mistral-small-2506`.
        - Implement the search logic. Since the user provided a specific "Agents" beta snippet, I will attempt to use the equivalent TypeScript Beta SDK features if available, or fall back to standard `chat.complete` with the `web_search` tool enabled if that's more stable in the TS environment.
    - If false:
        - Continue using the standard `ministral-3b-2512` model (or as currently configured).

## 4. API Route Changes
- **File**: [`src/app/api/ai/research/route.ts`](src/app/api/ai/research/route.ts)
- **Changes**:
    - Extract `webSearchEnabled` from the request body.
    - Call the updated library function with this flag.
    - Ensure tokens and credits are still calculated correctly.

## 5. Verification
- Test with toggle OFF: Ensure normal academic literature review response.
- Test with toggle ON: Ensure response mentions "searching the web" or provides up-to-date data (e.g., 2024/2025 trends).

---
**Note on Mistral TS SDK**: I will check the available methods on the `Mistral` client to match the user's Python logic (`beta.agents` and `beta.conversations`).
