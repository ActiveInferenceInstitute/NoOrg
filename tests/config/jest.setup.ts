// Jest setup file for NoOrg tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key-for-jest';

// Global test utilities
import { jest } from '@jest/globals';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Setup test environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
  OPENAI_API_KEY: 'sk-test-key-for-jest-only',
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: '1000',
  TEMPERATURE: '0.7',
};

// Cleanup after all tests
afterAll(async () => {
  // Give time for async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});


