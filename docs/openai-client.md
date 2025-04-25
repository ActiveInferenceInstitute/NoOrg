# OpenAI Client for Multi-Agent System

This document provides guidance on using the `OpenAIClient` class to interact with OpenAI's API within our multi-agent system.

## Overview

The `OpenAIClient` class provides a robust interface for communicating with OpenAI's API services, with built-in features for:

- Text completion using various models (GPT-3.5-turbo, GPT-4, etc.)
- Structured messaging with role-based content
- Token usage tracking and cost calculation
- Billing limit management
- Streaming responses
- Embedding generation
- Error handling and retry management

## Getting Started

### Installation

Make sure your environment has the necessary dependencies:

```bash
npm install axios dotenv
```

### Configuration

The client requires an OpenAI API key. You can set this up in two ways:

1. Environment Variables (recommended):
   - Create a `.env` file in your project root
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

2. Direct Configuration:
   - Pass the API key directly when creating a client instance

## Basic Usage

### Initializing the Client

```typescript
import { OpenAIClient } from './core/multiagent/OpenAIClient';

// Initialize with environment variables
const client = new OpenAIClient();

// Or with explicit configuration
const client = new OpenAIClient({
  apiKey: 'your_api_key_here',
  defaultModel: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.7,
  billingLimits: {
    maxMonthlySpend: 50,
    alertThreshold: 0.8
  }
});
```

### Simple Text Completion

```typescript
const response = await client.sendPrompt('Explain quantum computing briefly');
console.log(response.choices[0].message.content);
```

### Structured Messages

```typescript
const response = await client.sendPrompt([
  { role: 'system', content: 'You are a data science expert who explains concepts clearly.' },
  { role: 'user', content: 'What is feature engineering and why is it important?' }
]);

console.log(response.choices[0].message.content);
```

### Advanced Options

```typescript
const response = await client.sendPrompt(
  'Write a function to calculate prime numbers',
  {
    model: 'gpt-4',
    temperature: 0.2,
    max_tokens: 1000,
    top_p: 0.95,
    frequency_penalty: 0.5,
    presence_penalty: 0.5
  }
);
```

## Advanced Usage

### Streaming Responses

When working with longer outputs, streaming can provide a better user experience:

```typescript
// Create an async iterator that yields content as it's generated
const stream = client.streamResponse('Write a long technical article about AI safety');

// Process the stream
for await (const chunk of stream) {
  process.stdout.write(chunk); // Output chunks as they arrive
}
```

### Generating Embeddings

Embeddings are useful for semantic search, clustering, and similarity analysis:

```typescript
const embedding = await client.generateEmbedding('This is a sample text');
// embedding is an array of floating-point numbers
```

### Tracking Usage

Monitor your API usage and costs:

```typescript
// Get usage statistics for the past month
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 1);

const usageStats = await client.getUsageStats(startDate);
console.log(`Total tokens used: ${usageStats.totalTokens}`);
console.log(`Total cost: $${usageStats.totalCost.toFixed(2)}`);
```

### Model Information

Get details about available models:

```typescript
// Get a list of all available models
const models = await client.getAvailableModels();

// Get information about a specific model
const modelInfo = await client.getModelInfo('gpt-4');
console.log(`Max tokens: ${modelInfo.maxTokens}`);
console.log(`Context window: ${modelInfo.contextWindow}`);
```

## Error Handling

The client includes robust error handling. Errors from the OpenAI API are caught and rethrown with clear messages:

```typescript
try {
  const response = await client.sendPrompt('...');
  // Process response
} catch (error) {
  console.error('Error calling OpenAI API:', error.message);
  // Handle specific error cases if needed
}
```

## Billing Management

The client can help prevent unexpected charges:

```typescript
// Set billing limits
client.billingLimits = {
  maxMonthlySpend: 100, // Maximum monthly spend in USD
  alertThreshold: 0.8   // Alert at 80% of maximum
};
```

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive information like API keys.

2. **Error Handling**: Always wrap API calls in try/catch blocks to handle potential errors.

3. **Prompt Engineering**: Craft clear, specific prompts for better results and lower token usage.

4. **Model Selection**: Choose the appropriate model for your task:
   - Use smaller models (GPT-3.5-turbo) for simpler tasks to save costs.
   - Use larger models (GPT-4) for complex reasoning or code generation.

5. **Cost Management**: Monitor your usage statistics to avoid unexpected costs.

6. **Temperature Setting**: Lower temperature (0.1-0.3) for factual, deterministic responses; higher (0.7-0.9) for creative tasks.

## Multi-Agent System Integration

Within our multi-agent system, the `OpenAIClient` is used to:

1. Power individual agents with specific capabilities
2. Facilitate agent communication and coordination
3. Process complex tasks through multi-step reasoning
4. Enable agents to generate and evaluate task outputs

```typescript
// Example: Agent using OpenAIClient to process a task
async function processTask(task, agent) {
  const client = new OpenAIClient();
  
  const response = await client.sendPrompt([
    { role: 'system', content: agent.systemPrompt },
    { role: 'user', content: `Task: ${task.description}` }
  ]);
  
  return {
    result: response.choices[0].message.content,
    usage: response.usage
  };
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that your API key is correct
   - Verify environment variables are loading properly

2. **Rate Limiting**:
   - Implement exponential backoff for retries
   - Distribute requests across time when possible

3. **Token Limits**:
   - Check model context window limits
   - Implement chunking for long inputs

4. **Cost Management**:
   - Monitor usage regularly
   - Set appropriate billing limits

## Upcoming Features

- Integration with Azure OpenAI Service
- Additional model-specific optimizations
- Enhanced token usage estimation
- Smart caching for repeated requests 