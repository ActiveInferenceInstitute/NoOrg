# Examples Technical Documentation

## Overview

This directory contains comprehensive examples demonstrating the NoOrg multi-agent framework capabilities. These examples serve as practical references for implementing various multi-agent patterns and workflows.

## Example Categories

### Basic Coordination
- **basic_coordination.ts**: Simple agent registration and task assignment
- **thin_orchestration_example.ts**: Lightweight orchestration patterns

### Complex Workflows
- **multi_agent_workflow.ts**: Multi-step agent collaboration
- **complex_research_workflow.ts**: Research-oriented multi-agent processes
- **strategic-risk-innovation-workflow.ts**: Strategic planning with risk assessment

### Specialized Domains
- **organization-demo.ts**: Organizational unit simulations
- **organizationalUnitsDemo.js**: Legacy organizational unit examples
- **run_organizational_planning.js**: Organizational planning workflows

### Real-world Scenarios
- **parallel_research_workflow.ts**: Parallel processing research tasks
- **strategic-risk-innovation-workflow.js**: Innovation and risk management

## Example Structure

Each example follows a consistent pattern:

```typescript
import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { AnalysisAgent } from '../agents/AnalysisAgent';

async function runExample() {
  // Initialize coordinator
  const coordinator = new MultiAgentCoordinator();

  // Register agents
  await coordinator.registerAgent(new AnalysisAgent('analyst'));

  // Execute workflow
  const result = await coordinator.executeWorkflow({
    tasks: [
      { agent: 'analyst', action: 'analyze', data: exampleData }
    ]
  });

  console.log('Example completed:', result);
}
```text

## Key Patterns Demonstrated

### Agent Registration and Discovery
```typescript
// Register specialized agents
await coordinator.registerAgent(new ResearchAgent('researcher'));
await coordinator.registerAgent(new WritingAgent('writer'));

// Find agents by capability
const analysisAgents = await registry.findAgentsByCapability('analysis');
```text

### Task Coordination
```typescript
// Submit tasks with dependencies
await coordinator.submitTask({
  type: 'analysis',
  priority: 'high',
  dependsOn: ['data-collection']
});
```text

### Workflow Execution
```typescript
// Execute complex multi-agent workflows
const result = await coordinator.executeWorkflow({
  tasks: [
    { agent: 'ResearchAgent', action: 'research', data: topic },
    { agent: 'AnalysisAgent', action: 'analyze', data: researchResults },
    { agent: 'WritingAgent', action: 'write', data: analysisResults }
  ]
});
```text

### State Management
```typescript
// Shared state operations
await stateManager.setState('workflow.status', 'in-progress');
const currentState = await stateManager.getState('workflow.status');
```text

## Running Examples

### Prerequisites
```bash
# Install dependencies
npm install

# Set OpenAI API key
export OPENAI_API_KEY=your-api-key-here
```text

### Execute Individual Examples
```bash
# Run basic coordination example
npm run example:basic

# Run complex workflow
npm run example:workflow

# Run research workflow
npm run example:research

# Run all examples
npm run example:all
```text

### Programmatic Execution
```typescript
import { runExample } from './examples/basic_coordination';

// Execute example
await runExample();
```text

## Example Features

### Error Handling
Examples demonstrate proper error handling:
```typescript
try {
  const result = await coordinator.executeWorkflow(workflow);
  console.log('Success:', result);
} catch (error) {
  console.error('Workflow failed:', error);
  await coordinator.stop();
}
```text

### Resource Cleanup
Examples show proper cleanup patterns:
```typescript
// Ensure coordinator shutdown
await coordinator.stop();

// Close connections
await stateManager.clearState();
```text

### Performance Monitoring
Examples include performance tracking:
```typescript
const startTime = Date.now();
const result = await coordinator.executeWorkflow(workflow);
const duration = Date.now() - startTime;
console.log(`Workflow completed in ${duration}ms`);
```text

## Testing Examples

Examples serve as integration tests:
```bash
# Run example-based tests
npm test -- --testPathPattern=examples
```text

## Contributing Examples

When adding new examples:
1. Follow the established structure and patterns
2. Include comprehensive error handling
3. Add performance monitoring
4. Document the example purpose and usage
5. Test with both real and mock LLM clients

## Related Documentation

- **Framework Overview**: `../README.md`
- **Agent Documentation**: `../agents/README.md`
- **Core Systems**: `../core/README.md`
- **API Reference**: `../docs/`

## Best Practices

### Example Design
- Keep examples focused on single concepts
- Use realistic but simple data
- Demonstrate both success and error paths
- Include cleanup and resource management

### Code Quality
- Follow TypeScript best practices
- Include comprehensive JSDoc comments
- Use meaningful variable names
- Handle edge cases gracefully

### Documentation
- Explain the example's purpose
- Document prerequisites and setup
- Provide expected outputs
- Include troubleshooting tips