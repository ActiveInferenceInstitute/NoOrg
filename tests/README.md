# Test Suite

Comprehensive test suite for the NoOrg Multi-Agent Framework, providing extensive coverage for all components, agents, and integration scenarios.

## Overview

The test suite is organized into multiple categories to ensure comprehensive coverage of the entire framework:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions and workflows
- **System Tests**: Test end-to-end scenarios and full workflows
- **Performance Tests**: Test scalability and efficiency
- **Security Tests**: Test security features and vulnerability detection

## Test Structure

### `/unit/`
Unit tests for individual components and functions.

#### `/core/`
Tests for core infrastructure:
- **EventSystem**: Event publishing, subscription, and routing
- **MessageSystem**: Message passing, routing, and processing
- **MonitoringSystem**: Metrics collection, health checks, and alerting
- **StorageSystem**: Data persistence, transactions, and queries

#### `/agents/`
Tests for all agent implementations:
- **AnalysisAgent**: Data analysis, visualization, and reporting
- **CreativeWritingAgent**: Content generation, refinement, and styling
- **CustomerSupportAgent**: Inquiry response, troubleshooting, and sentiment analysis
- **DataAnalysisAgent**: Advanced data processing and insights
- **DevelopmentAgent**: Code generation, review, and architecture design
- **FinanceAgent**: Financial analysis, budgeting, and forecasting
- **HRAgent**: HR tasks, job descriptions, and onboarding
- **LegalAgent**: Legal document generation, review, and research
- **MarketingAgent**: Marketing strategy, audience analysis, and campaigns
- **ActiveInferencePOMDPAgent**: Advanced decision making with POMDP
- **FinalReviewAgent**: Quality assurance and content review
- **PlanningAgent**: Strategic planning and project management
- **ResearchAgent**: Information gathering and fact-checking
- **ReviewAgent**: Content evaluation and feedback
- **RevisionAgent**: Content improvement and refinement
- **WritingAgent**: Professional writing and documentation

#### `/multiagent/`
Tests for multi-agent coordination:
- **MultiAgentCoordinator**: Agent registration, task distribution, and workflow execution
- **AgentRegistry**: Agent discovery, capability tracking, and health monitoring
- **TaskManager**: Task creation, assignment, and lifecycle management
- **SharedStateManager**: State synchronization and coordination

#### `/integration/`
Tests for integration patterns:
- **CircuitBreaker**: Failure prevention and recovery
- **Retry**: Automatic retry with backoff strategies
- **RateLimiter**: Request rate control and throttling
- **Timeout**: Operation timeout management
- **Bulkhead**: Component isolation and resource management

### `/integration/`
Integration tests for component interactions and workflows.

### `/system/`
System-level tests for end-to-end scenarios and full workflows.

### `/performance/`
Performance tests for scalability, efficiency, and resource usage.

## Test Execution

### Running All Tests
```bash
# Run the complete test suite
npm test

# Run with coverage reporting
npm run test:coverage

# Run in CI mode (faster, no watch mode)
npm run test:ci
```

### Running Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# System tests only
npm run test:system

# Performance tests only
npm run test:performance

# Agent tests only
npm run test:agents

# Core system tests only
npm run test:core
```

### Running Individual Test Files
```bash
# Run specific test file
npm test tests/unit/core/test_event_system.ts

# Run with verbose output
npm test -- --verbose tests/unit/agents/test_analysis_agent.ts

# Run with debug output
DEBUG=* npm test tests/integration/test_comprehensive_system_integration.ts
```

## Test Configuration

### Jest Configuration
The test suite uses Jest with the following configuration:
- **Test Environment**: Node.js
- **Coverage Collection**: Source files with detailed reporting
- **Timeout**: 30 seconds per test
- **Setup**: Custom test helpers and mocks

### Test Environment Setup
Tests are configured with:
- Mock implementations for external dependencies
- Test data generators and fixtures
- Comprehensive error handling
- Performance monitoring

## Test Categories

### Unit Tests
- **Scope**: Individual functions, methods, and classes
- **Dependencies**: Mocked external dependencies
- **Speed**: Fast execution (< 1 second per test)
- **Coverage**: High coverage of code paths

### Integration Tests
- **Scope**: Component interactions and workflows
- **Dependencies**: Real or partially mocked
- **Speed**: Moderate execution time
- **Coverage**: Interface and integration validation

### System Tests
- **Scope**: End-to-end workflows and scenarios
- **Dependencies**: Real system components
- **Speed**: Slower execution with real operations
- **Coverage**: Complete system functionality

### Performance Tests
- **Scope**: Scalability, efficiency, and resource usage
- **Dependencies**: Real system with load testing
- **Speed**: Longer execution for thorough testing
- **Coverage**: Performance characteristics and limits

## Test Best Practices

### Writing Tests
1. **Arrange, Act, Assert**: Follow the AAA pattern
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Mock External Dependencies**: Use mocks for APIs and external services
5. **Test Edge Cases**: Include boundary conditions and error scenarios

### Test Organization
- Group related tests in `describe` blocks
- Use meaningful test file names
- Follow consistent naming conventions
- Include setup and teardown where needed

### Error Handling
- Test error conditions and exception handling
- Verify proper error messages and logging
- Test recovery mechanisms and fallbacks

## Test Utilities

### Test Helpers (`tests/utils/test-helpers.ts`)
```typescript
// Common test setup
export function createTestFixture() {
  return {
    coordinator: new MultiAgentCoordinator(),
    eventSystem: EventSystem.getInstance(),
    storage: StorageSystem.getInstance()
  };
}

// Mock implementations
export function createMockOpenAIClient() {
  return {
    sendPrompt: async () => ({ choices: [{ message: { content: 'mock response' } }] })
  };
}

// Test data generators
export function createTestDataset() {
  return Array.from({ length: 100 }, (_, i) => ({ id: i, value: Math.random() }));
}
```

## Coverage Goals

### Target Coverage
- **Core Systems**: > 90% coverage
- **Agent Implementations**: > 85% coverage
- **Integration Points**: > 80% coverage
- **Error Paths**: > 70% coverage

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html

# Generate coverage summary
npm run coverage:summary
```

## Performance Testing

### Load Testing
```typescript
// Test concurrent operations
describe('Performance Tests', () => {
  it('should handle 1000 concurrent requests', async () => {
    const requests = Array.from({ length: 1000 }, () =>
      agent.analyzeData(testData)
    );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // < 10 seconds
    expect(results).toHaveLength(1000);
  });
});
```

### Memory Testing
```typescript
// Test memory usage
it('should not leak memory during extended operations', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Run intensive operations
  for (let i = 0; i < 100; i++) {
    await agent.processLargeDataset(largeData);
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB increase
});
```

## Debugging Tests

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with verbose logging
npm test -- --verbose tests/unit/agents/test_analysis_agent.ts

# Run with inspector for debugging
node --inspect-brk node_modules/.bin/jest tests/unit/core/test_event_system.ts
```

### Test Logging
```typescript
// Enable detailed logging in tests
const logger = createTestLogger();
logger.info('Starting test execution');

// Log test data and expectations
logger.debug('Test data:', testData);
logger.debug('Expected result:', expectedResult);
```

## Continuous Integration

### CI Pipeline
The test suite is integrated with GitHub Actions:
- **Automated Testing**: All tests run on every push and PR
- **Coverage Reporting**: Coverage reports generated and uploaded
- **Performance Monitoring**: Performance tests run on schedule
- **Security Scanning**: Dependency and code security checks

### CI Configuration
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:coverage
```

## Troubleshooting

### Common Issues
- **Test Timeout**: Increase timeout for slow operations
- **Mock Issues**: Ensure mocks are properly configured
- **Async Issues**: Use proper async/await patterns
- **Import Issues**: Check module resolution and paths

### Debug Strategies
1. **Add Logging**: Use console.log or debug libraries
2. **Isolate Tests**: Run individual tests to identify issues
3. **Mock Verification**: Verify mocks are working correctly
4. **Environment Issues**: Check test environment configuration

## Related Documentation

- [Testing Strategy](../../../docs/testing/index.md)
- [Testing Standards](../../../docs/testing/testing-standards.md)
- [Performance Testing](../../../docs/testing/performance-testing.md)
- [Test Helpers](../../../tests/utils/README.md)
- [CI/CD Pipeline](../../../.github/workflows/ci.yml)