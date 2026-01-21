import { emailLayout } from "./src/lib/email";

const testContent = `
  <h2>Test Email</h2>
  <p>This is a test of the new Nexus email design.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://nexus-app.com/dashboard" class="button">Go to Dashboard</a>
  </div>
`;

const rendered = emailLayout(testContent);

console.log("=== RENDERED EMAIL START ===");
console.log(rendered);
console.log("=== RENDERED EMAIL END ===");

if (rendered.includes("${content}")) {
  console.error("FAIL: ${content} found in rendered output!");
  process.exit(1);
} else {
  console.log("SUCCESS: ${content} interpolated correctly.");
}

if (rendered.includes("${new Date().getFullYear()}")) {
  console.error("FAIL: ${new Date().getFullYear()} found in rendered output!");
  process.exit(1);
} else {
  console.log("SUCCESS: Date interpolated correctly.");
}

if (rendered.includes("#b30909")) {
  console.log("SUCCESS: Crimson color found in CSS.");
} else {
  console.error("FAIL: Crimson color missing from CSS!");
  process.exit(1);
}
