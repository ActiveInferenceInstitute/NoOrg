/**
 * Jest Test Setup
 *
 * Global test configuration and setup for LexDAO workflow tests.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key-for-ci';
process.env.OUTPUT_DIR = './test-output';
process.env.LOG_LEVEL = 'error';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(60000);

// Global test utilities
global.testUtils = {
  // Helper to create mock workflow context
  createMockContext: (overrides = {}) => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn()
    },
    config: {
      OUTPUT_DIR: './test-output',
      OPENAI_API_KEY: 'test-key',
      PROJECT_ID: 'test-project',
      VERSION: '1.0.0'
    },
    outputs: {},
    startTime: Date.now(),
    metrics: {
      stageMetrics: {}
    },
    ...overrides
  }),

  // Helper to create mock agent
  createMockAgent: (overrides = {}) => ({
    id: 'test-agent',
    name: 'Test Agent',
    unitId: 'test-unit',
    unitName: 'Test Unit',
    description: 'Test agent for testing',
    process: jest.fn().mockResolvedValue({ success: true }),
    ...overrides
  }),

  // Helper to create mock workflow stage
  createMockStage: (overrides = {}) => ({
    id: 'test-stage',
    name: 'Test Stage',
    description: 'Test workflow stage',
    unit: {
      id: 'test-unit',
      name: 'Test Unit',
      description: 'Test organizational unit',
      agents: []
    },
    agent: global.testUtils.createMockAgent(),
    prepareInput: jest.fn().mockReturnValue({}),
    dependencies: [],
    outputKey: 'test_output',
    ...overrides
  }),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to create test data
  createTestData: {
    members: () => Array.from({ length: 10 }, (_, i) => ({
      address: `0x${i.toString().padStart(40, '0')}`,
      tokens: 1000,
      joined: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    })),

    proposals: () => [
      {
        title: 'Test Proposal 1',
        description: 'First test proposal',
        proposer: '0x123...abc',
        status: 'active',
        timestamp: new Date().toISOString()
      },
      {
        title: 'Test Proposal 2',
        description: 'Second test proposal',
        proposer: '0x456...def',
        status: 'executed',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],

    votes: () => [
      {
        proposalId: 'test_proposal_1',
        voter: '0x123...abc',
        support: true,
        votingPower: 1000,
        timestamp: new Date().toISOString()
      },
      {
        proposalId: 'test_proposal_1',
        voter: '0x456...def',
        support: false,
        votingPower: 1000,
        timestamp: new Date().toISOString()
      }
    ],

    treasury: () => ({
      eth: 5.3,
      dai: 12500,
      usdc: 8750,
      lastUpdated: new Date().toISOString()
    })
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Mock fetch for tests that might use it
global.fetch = jest.fn();

// Mock crypto for consistent hashing in tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: (size: number) => Buffer.from(Array(size).fill(0))
  }
});

// Set up memory monitoring for performance tests
if (process.env.NODE_ENV === 'test' && process.env.MONITOR_MEMORY) {
  const initialMemory = process.memoryUsage();

  afterAll(() => {
    const finalMemory = process.memoryUsage();
    const memoryDiff = {
      rss: finalMemory.rss - initialMemory.rss,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      external: finalMemory.external - initialMemory.external
    };

    console.log('Memory usage difference:', memoryDiff);
  });
}
