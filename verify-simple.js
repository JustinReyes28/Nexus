const emailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus</title>
  <style>
    /* Reset & Typography */
    body { 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand">Nexus</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Nexus. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const testContent = "<h2>Hello World</h2>";
const rendered = emailLayout(testContent);

console.log("Rendered Sample:");
console.log(rendered);

if (rendered.includes("${content}")) {
  console.log("FAIL: Literal found");
} else if (rendered.includes("<h2>Hello World</h2>")) {
  console.log("SUCCESS: Content interpolated");
}

if (rendered.includes("${new Date().getFullYear()}")) {
  console.log("FAIL: Date literal found");
} else {
  console.log("SUCCESS: Date interpolated: " + new Date().getFullYear());
}
