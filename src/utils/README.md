# Utilities

This directory contains utility functions and helper classes that are used throughout the codebase. These utilities provide common functionality that can be reused across different components of the system.

## Available Utilities

### Logger (Logger.js)

A centralized logging utility that provides structured logging capabilities. It supports different log levels, formatting options, and output destinations.

```javascript
const logger = require('./Logger');

// Log at different levels
logger.info('This is an info message');
logger.debug('This is a debug message', { contextData: 'some data' });
logger.warn('This is a warning', { userId: 123 });
logger.error('An error occurred', new Error('Something went wrong'));
```

### OpenAI Client (OpenAIClient.js)

A client for interacting with the OpenAI API. It handles authentication, request formatting, and response parsing.

```javascript
const OpenAIClient = require('./OpenAIClient');

const client = new OpenAIClient({
  apiKey: 'your-api-key',
  defaultModel: 'gpt-4',
  timeout: 30000
});

async function generateResponse() {
  const response = await client.complete({
    prompt: 'Once upon a time',
    maxTokens: 100
  });
  
  console.log(response);
}
```

## Development Guidelines

When adding new utilities to this directory:

1. **Focused Functionality**: Each utility should have a clear, specific purpose.
2. **Documentation**: Include JSDoc comments that explain parameters, return values, and usage examples.
3. **Error Handling**: Implement robust error handling and provide meaningful error messages.
4. **Testing**: Create unit tests for all utility functions.
5. **Avoid Duplication**: Check existing utilities before adding new ones to prevent redundancy.

## Usage Best Practices

- Import utilities directly from their source files rather than using index files
- Prefer named imports to access specific functionality
- Handle potential errors thrown by utility functions
- Avoid modifying utility functions in place; create specialized versions if needed

## Related Documentation

- [Main Source Documentation](../README.md) 