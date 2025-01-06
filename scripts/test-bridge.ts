// scripts/test-bridge.ts

import { Mem0Bridge } from '../lib/memory/bridge';  // Updated path to correctly point to the bridge module

async function test() {
  try {
    // Initialize the bridge
    const bridge = new Mem0Bridge();
    console.log('Bridge initialized successfully');

    // Test adding memory
    const addResult = await bridge.addMemory(
      "Test memory content",
      "test-user-id",
      { metadata: "test" }
    );
    console.log('Add result:', addResult);

    // Test searching memory
    const searchResult = await bridge.searchMemories(
      "Test query",
      "test-user-id",
      5
    );
    console.log('Search result:', searchResult);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
test().catch(console.error);