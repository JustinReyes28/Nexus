const fs = require('fs');
const http = require('http');

async function test() {
  console.log("Checking if API route is responsive...");
  // Note: This won't work easily with NextAuth session, but we can check if it returns 401 correctly
  // If it returns 401 JSON, then the route logic is at least reachable.
  try {
    const res = await fetch('http://localhost:3000/api/ai/research', {
      method: 'POST',
      body: JSON.stringify({ topic: 'test' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (e) {
    console.log("Error:", e.message);
  }
}

test();
