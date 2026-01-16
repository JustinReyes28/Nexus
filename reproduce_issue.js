
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

async function reproduce() {
    console.log("Checking for client.beta.agents.create...");
    try {
        if (client.beta && client.beta.agents) {
            console.log("Found client.beta.agents!");
            
            console.log("Attempting to create a websearch agent...");
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
            console.log("Agent created successfully! ID:", agent.id);
            
            console.log("Attempting completion with agent...");
            const response = await client.agents.complete({
                agentId: agent.id,
                messages: [{ role: "user", content: "DeepSeek's mHC" }]
            });
            console.log("Response received from agent:", JSON.stringify(response, null, 2));
        } else {
            console.log("client.beta.agents NOT found in this SDK version.");
            console.log("Client keys:", Object.keys(client));
            if (client.beta) console.log("Beta keys:", Object.keys(client.beta));
        }
    } catch (error) {
        console.error("Error in agents flow:", error.message);
        if (error.body) console.log("Error body:", JSON.stringify(error.body, null, 2));
    }
}

reproduce();
