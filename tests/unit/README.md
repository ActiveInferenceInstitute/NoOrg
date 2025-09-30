# Unit Tests

This directory contains unit tests for the NoOrg Multi-Agent Framework. Unit tests focus on testing individual components and functions in isolation.

## Structure

### `/core/`
Tests for core infrastructure components:
- EventSystem
- MessageSystem
- MonitoringSystem
- StorageSystem

### `/agents/`
Tests for all agent implementations:
- AnalysisAgent
- CreativeWritingAgent
- CustomerSupportAgent
- DataAnalysisAgent
- DevelopmentAgent
- FinanceAgent
- HRAgent
- LegalAgent
- MarketingAgent
- And more...

### `/multiagent/`
Tests for multi-agent coordination components:
- MultiAgentCoordinator
- AgentRegistry
- TaskManager
- SharedStateManager

### `/integration/`
Tests for integration patterns:
- CircuitBreaker
- Retry
- RateLimiter
- Timeout
- Bulkhead

## Test Categories

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Focus on logic correctness
- Fast execution

### Integration Tests
- Test component interactions
- Use real dependencies where possible
- Focus on system integration
- Moderate execution time

### Performance Tests
- Test performance characteristics
- Measure execution time and memory usage
- Identify bottlenecks
- Longer execution time

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test suites
npm run test:agents
npm run test:core

# Run with coverage
npm run test:coverage

# Run specific test files
npm test tests/unit/core/test_event_system.ts

# Run tests in watch mode
npm run test:watch
```

## Test Guidelines

### Writing Tests
1. **Arrange, Act, Assert**: Follow the AAA pattern
2. **Descriptive Names**: Use descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Mock External Dependencies**: Use mocks for external APIs
5. **Test Edge Cases**: Include boundary conditions and error cases

### Test Organization
- Group related tests in describe blocks
- Use meaningful test file names
- Follow consistent naming conventions
- Include setup and teardown where needed

### Code Coverage
- Aim for >80% coverage for core components
- Focus on critical paths and error conditions
- Use coverage reports to identify gaps

## Test Utilities

### Test Helpers (`tests/utils/test-helpers.ts`)
- Common test setup functions
- Mock implementations
- Test data generators
- Assertion helpers

### Test Configuration
- Jest configuration in `jest.config.js`
- Test environment setup
- Coverage configuration

## Best Practices

1. **Isolated Tests**: Each test should be independent
2. **Fast Tests**: Keep tests fast for quick feedback
3. **Reliable Tests**: Avoid flaky tests
4. **Maintainable Tests**: Keep tests easy to understand and modify
5. **Comprehensive Coverage**: Test both happy path and error conditions

## Troubleshooting

### Common Issues
- **Test Timeout**: Increase timeout for slow operations
- **Mock Issues**: Ensure mocks are properly configured
- **Async Issues**: Use proper async/await patterns
- **Import Issues**: Check module resolution and paths

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with verbose output
npm test -- --verbose tests/unit/core/test_event_system.ts
```

## Related Documentation

- [Testing Strategy](../../../docs/testing/index.md)
- [Testing Standards](../../../docs/testing/testing-standards.md)
- [Performance Testing](../../../docs/testing/performance-testing.md)
- [Test Helpers](../../../tests/utils/README.md)
