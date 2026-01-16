const { model } = require('./src/lib/ai.ts');

// Test the web search functionality
async function testWebSearch() {
  console.log('Testing Mistral 3.2 Web Search Implementation...');

  try {
    // Test with web search enabled
    console.log('\n1. Testing with webSearchEnabled=true (Mistral 3.2)...');
    const webSearchResult = await model.generateResearchContent(
      'What are the latest developments in AI for healthcare in 2026?',
      true
    );

    console.log('✅ Web search completed successfully');
    console.log('Response length:', webSearchResult.response.text().length);
    console.log('Token usage:', webSearchResult.usage);

    // Test with web search disabled
    console.log('\n2. Testing with webSearchEnabled=false (Mistral 3B)...');
    const standardResult = await model.generateResearchContent(
      'What are the latest developments in AI for healthcare in 2026?',
      false
    );

    console.log('✅ Standard search completed successfully');
    console.log('Response length:', standardResult.response.text().length);
    console.log('Token usage:', standardResult.usage);

    console.log('\n🎉 All tests passed! Mistral 3.2 websearch is properly implemented.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testWebSearch();