# Agent Test Suite Documentation

This directory contains comprehensive unit tests for all agent implementations in the NoOrg Multi-Agent Framework.

## Overview

The agent test suite provides thorough testing coverage for all 16 specialized agents, ensuring each agent functions correctly in isolation and handles edge cases properly.

## Test Coverage

### Individual Agent Tests

| Agent Type | Test File | Coverage Areas |
|------------|-----------|---------------|
| **AbstractAgent** | `test_abstract_agent.ts` | Base class functionality, lifecycle management |
| **ActiveInferencePOMDPAgent** | `test_active_inference_pomdp_agent.ts` | POMDP modeling, belief updates, decision making |
| **AnalysisAgent** | `test_analysis_agent.ts` | Data analysis, visualization, reporting |
| **CreativeWritingAgent** | `test_creative_writing_agent.ts` | Content generation, refinement, styling |
| **CustomerSupportAgent** | `test_customer_support_agent.ts` | Inquiry response, troubleshooting, sentiment analysis |
| **DataAnalysisAgent** | `test_data_analysis_agent.ts` | Advanced data processing, statistical analysis |
| **DevelopmentAgent** | `test_development_agent.ts` | Code generation, review, architecture design |
| **FinalReviewAgent** | `test_final_review_agent.ts` | Quality assurance, content review |
| **FinanceAgent** | `test_finance_agent.ts` | Financial analysis, budgeting, forecasting |
| **HRAgent** | `test_hr_agent.ts` | HR tasks, job descriptions, onboarding |
| **LegalAgent** | `test_legal_agent.ts` | Legal document generation, review, research |
| **MarketingAgent** | `test_marketing_agent.ts` | Marketing strategy, audience analysis |
| **PlanningAgent** | `test_planning_agent.ts` | Strategic planning, project management |
| **ResearchAgent** | `test_research_agent.ts` | Information gathering, fact-checking |
| **ReviewAgent** | `test_review_agent.ts` | Content evaluation, feedback |
| **RevisionAgent** | `test_revision_agent.ts` | Content improvement, refinement |
| **WritingAgent** | `test_writing_agent.ts` | Professional writing, documentation |

## Test Categories

### Unit Tests
- **Functionality Testing**: Verify core agent capabilities
- **Error Handling**: Test error conditions and recovery
- **Edge Cases**: Handle boundary conditions and invalid inputs
- **Performance**: Measure execution time and resource usage
- **Integration**: Test agent interaction with core systems

### Test Structure
```typescript
describe('AgentName', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Core Functionality', () => {
    it('should perform primary function', async () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs', async () => {
      // Test error scenarios
    });
  });
});
```text

## Running Agent Tests

### Individual Agent Tests
```bash
# Test specific agent
npm test tests/unit/agents/test_analysis_agent.ts

# Test all agents
npm run test:agents

# Test with coverage
npm run test:coverage
```text

### Test Configuration
- **Timeout**: 30 seconds per test
- **Environment**: Node.js with TypeScript
- **Coverage**: Source code coverage tracking
- **Mocking**: External dependencies mocked for isolation

## Test Best Practices

### Writing Tests
1. **Arrange, Act, Assert**: Follow AAA pattern
2. **Single Responsibility**: Each test validates one behavior
3. **Descriptive Names**: Clear, meaningful test names
4. **Mock Dependencies**: Isolate unit under test
5. **Edge Case Coverage**: Test boundary conditions

### Test Organization
- Group related tests in describe blocks
- Use consistent naming conventions
- Include setup and teardown where needed
- Document complex test scenarios

## Common Test Patterns

### Agent Lifecycle Testing
```typescript
it('should initialize and shutdown correctly', async () => {
  const result = await agent.initialize();
  expect(result).to.be.true;

  const shutdownResult = await agent.shutdown();
  expect(shutdownResult).to.be.true;
});
```text

### Task Execution Testing
```typescript
it('should execute tasks correctly', async () => {
  const taskDetails = { type: 'test-task', data: testData };
  const result = await agent.executeTask(taskDetails);
  expect(result).to.be.an('object');
});
```text

### Error Handling Testing
```typescript
it('should handle errors gracefully', async () => {
  try {
    await agent.executeTask(invalidTask);
    expect.fail('Should have thrown error');
  } catch (error) {
    expect(error.message).to.be.a('string');
  }
});
```text

## Performance Testing

### Response Time Testing
```typescript
it('should complete within performance requirements', async () => {
  const startTime = Date.now();
  await agent.performOperation(testData);
  const duration = Date.now() - startTime;

  expect(duration).to.be.below(5000); // 5 second limit
});
```text

### Memory Usage Testing
```typescript
it('should not leak memory', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Perform operations
  for (let i = 0; i < 100; i++) {
    await agent.processData(testData);
  }

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).to.be.below(50 * 1024 * 1024); // < 50MB
});
```text

## Integration Testing

### Cross-Agent Communication
```typescript
it('should communicate with other agents', async () => {
  const message = { type: 'coordination', data: testData };
  const response = await agent.sendMessage(message);

  expect(response).to.have.property('status');
  expect(response.status).to.equal('success');
});
```text

### Workflow Integration
```typescript
it('should integrate with workflow engine', async () => {
  const workflow = createTestWorkflow();
  const result = await workflow.executeWithAgent(agent);

  expect(result).to.be.an('object');
  expect(result.success).to.be.true;
});
```text

## Debugging Tests

### Debug Mode
```bash
# Run tests with debug output
DEBUG=* npm test tests/unit/agents/test_analysis_agent.ts

# Run with verbose logging
npm test -- --verbose tests/unit/agents/test_analysis_agent.ts

# Run with inspector for debugging
node --inspect-brk node_modules/.bin/jest tests/unit/agents/test_analysis_agent.ts
```text

### Test Logging
```typescript
// Enable detailed logging in tests
const logger = createTestLogger();
logger.info('Starting agent test');
logger.debug('Test data:', testData);
```text

## Coverage Goals

### Target Coverage
- **Core Functionality**: > 90% coverage
- **Error Paths**: > 80% coverage
- **Edge Cases**: > 70% coverage
- **Performance**: > 60% coverage

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html
```text

## Troubleshooting

### Common Issues
- **Test Timeout**: Increase timeout for slow operations
- **Mock Issues**: Verify mock configurations
- **Async Issues**: Use proper async/await patterns
- **Import Issues**: Check module resolution

### Debug Strategies
1. **Add Logging**: Use console.log or debug libraries
2. **Isolate Tests**: Run individual tests to identify issues
3. **Mock Verification**: Ensure mocks return expected values
4. **Environment Issues**: Check test environment setup

## Related Documentation

- [Testing Strategy](../../../docs/testing/index.md)
- [Agent Framework](../../../src/agents/README.md)
- [Core Systems](../../../src/core/README.md)
- [Test Utilities](../../../tests/utils/README.md)
