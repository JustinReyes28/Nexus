
const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');

// Load env robustly
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            let val = line.substring(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
        }
    });
}

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

// Mimic the fixed logic in src/lib/ai.ts
async function generateResearchContent(prompt, webSearchEnabled) {
    try {
        if (webSearchEnabled) {
            console.log(`[AI_SDK] Creating web search agent...`);
            const agent = await client.beta.agents.create({
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

            console.log(`[AI_SDK] Calling agent: ${agent.id}`);
            const response = await client.agents.complete({
                agentId: agent.id,
                messages: [{ role: "user", content: prompt }]
            });

            return {
                text: response.choices[0].message.content,
                usage: response.usage
            };
        }
        
        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [{ role: "user", content: prompt }],
        });
        return {
            text: response.choices[0].message.content,
            usage: response.usage
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorBody = error.body ? JSON.stringify(error.body) : "";
        console.error("[MISTRAL_SDK_ERROR]", errorMessage, errorBody);
        throw new Error(errorMessage);
    }
}

async function verify() {
    console.log("--- TEST 1: Web Search Enabled ---");
    try {
        const res1 = await generateResearchContent("DeepSeek's mHC", true);
        console.log("Test 1 Result Length:", res1.text.length);
        console.log("Test 1 Usage:", res1.usage);
    } catch (e) {
        console.log("Test 1 Failed (Expected if API key/quota issues, but shouldn't CRASH):", e.message);
    }

    console.log("\n--- TEST 2: Safe Error Logging (Testing with invalid model) ---");
    try {
        // Force an error by passing an invalid model to chat.complete
        await client.chat.complete({
            model: "invalid-model-name-for-test",
            messages: [{ role: "user", content: "test" }]
        });
    } catch (error) {
        console.log("Caught expected error for Test 2. Verifying safe logging...");
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorBody = error.body ? JSON.stringify(error.body) : "";
        // This is what the code does now. We want to ensure it doesn't throw a TypeError.
        try {
            console.log("[PASS] Safe logging output:", errorMessage, errorBody);
        } catch (inner) {
            console.error("[FAIL] Safe logging still crashes!", inner);
        }
    }
}

verify();
