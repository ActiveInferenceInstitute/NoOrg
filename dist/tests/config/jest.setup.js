"use strict";
// Jest setup file for NoOrg tests
Object.defineProperty(exports, "__esModule", { value: true });
// Set test environment
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key-for-jest';
// Global test utilities
const globals_1 = require("@jest/globals");
// Increase timeout for integration tests
globals_1.jest.setTimeout(30000);
// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: globals_1.jest.fn(),
    info: globals_1.jest.fn(),
    warn: globals_1.jest.fn(),
    error: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
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
//# sourceMappingURL=jest.setup.js.map