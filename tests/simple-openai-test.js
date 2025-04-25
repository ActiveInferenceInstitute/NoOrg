#!/usr/bin/env node

/**
 * Simple test script for OpenAI integration
 * This avoids TypeScript complexities and directly tests the OpenAI API
 */

// Load environment variables
require('dotenv').config();

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables or .env file');
  console.error('Please set your OpenAI API key in the .env file or as an environment variable');
  process.exit(1);
}

console.log('✅ Found OpenAI API key');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Imports
const axios = require('axios');

// Utility to count words
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Function to send a prompt to OpenAI
async function sendPrompt(prompt) {
  console.log(`\n📤 Sending prompt to OpenAI (${countWords(prompt)} words)`);
  console.log(`Using model: ${OPENAI_MODEL}`);
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    const result = response.data.choices[0].message.content;
    
    console.log(`\n📥 Received response (${countWords(result)} words):`);
    console.log('----------------------------------');
    console.log(result);
    console.log('----------------------------------');
    
    console.log('\n📊 Usage statistics:');
    console.log(`- Prompt tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`- Completion tokens: ${response.data.usage.completion_tokens}`);
    console.log(`- Total tokens: ${response.data.usage.total_tokens}`);
    
    return {
      content: result,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Test prompts
const prompts = [
  'What are three key benefits of multi-agent systems?',
  'How would you implement a task coordination system between multiple AI agents?',
  'Give an example of how LLMs can be used for complex problem solving'
];

// Run tests
async function runTests() {
  console.log('🔍 Running OpenAI integration tests...\n');
  
  for (const [index, prompt] of prompts.entries()) {
    console.log(`\n🧪 Test ${index + 1} of ${prompts.length}`);
    
    try {
      await sendPrompt(prompt);
      console.log(`\n✅ Test ${index + 1} completed successfully`);
    } catch (error) {
      console.error(`\n❌ Test ${index + 1} failed:`, error.message);
    }
  }
  
  console.log('\n🏁 All tests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}); 