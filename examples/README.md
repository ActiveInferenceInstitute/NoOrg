# Examples and Demonstrations

This directory contains comprehensive examples and demonstrations of the NoOrg Multi-Agent Framework in action. Each example showcases different aspects of the framework's capabilities.

## Overview

The examples are organized to demonstrate:
- **Basic Usage**: Simple multi-agent workflows
- **Advanced Features**: Complex scenarios and integrations
- **Real-world Applications**: Practical business use cases
- **Performance**: Scalability and efficiency demonstrations
- **Integration**: External system integrations

## Available Examples

### Basic Examples

#### 1. Basic Coordination (`1-event-storage-example.ts`)
Demonstrates fundamental event and storage system integration.

**Features:**
- Event publishing and subscription
- Data persistence with storage system
- Basic agent coordination
- State management

**Usage:**
```bash
npm run example:basic
```text

#### 2. Relationship Management (`2-relationship-management-example.ts`)
Shows how agents can establish and manage relationships.

**Features:**
- Agent relationship creation
- Permission management
- Access control
- Relationship lifecycle

#### 3. State Management (`3-state-management-example.ts`)
Demonstrates shared state synchronization across agents.

**Features:**
- State synchronization
- Conflict resolution
- State persistence
- Multi-agent coordination

#### 4. Workflow Engine (`4-workflow-engine-example.ts`)
Illustrates complex workflow orchestration.

**Features:**
- Workflow definition
- Task dependencies
- Sequential and parallel execution
- Error handling and recovery

#### 5. Integrated Operations (`5-integrated-operations-example.ts`)
Shows full system integration with all components.

**Features:**
- End-to-end system integration
- Performance monitoring
- Error handling
- Scalability demonstration

### Advanced Examples

#### 6. OpenAI Agent (`6-openai-agent-example.ts`)
Demonstrates agent integration with OpenAI services.

**Features:**
- LLM integration
- Prompt engineering
- Response processing
- Error handling

#### 7. Multi-Unit LLM Flow (`7-multi-unit-llm-flow-example.ts`)
Shows complex multi-agent workflows with LLM integration.

**Features:**
- Multi-agent coordination
- LLM-powered agents
- Complex workflow patterns
- State management

#### 8. Hybrid Agent Workflow (`8-hybrid-agent-workflow-example.ts`)
Demonstrates hybrid agent architectures.

**Features:**
- Multiple agent types
- Workflow orchestration
- Performance optimization
- Scalability testing

#### 9. Active Inference POMDP (`9-active-inference-pomdp-example.ts`)
Shows advanced decision-making with POMDP models.

**Features:**
- Active inference algorithms
- POMDP modeling
- Uncertainty handling
- Complex reasoning

### Specialized Examples

#### Calm Tech (`calm_tech/`)
Demonstrates calm technology principles in agent design.

**Features:**
- User-centric design
- Ambient intelligence
- Privacy-preserving interactions
- Ergonomic interfaces

#### Cognicism (`cognicism/`)
Shows cognicist approaches to agent development.

**Features:**
- Cognitive modeling
- Mental state representation
- Intent recognition
- Adaptive behavior

#### Integration Patterns (`integration-patterns/`)
Demonstrates resilience patterns in distributed systems.

**Features:**
- Circuit breaker patterns
- Retry mechanisms
- Rate limiting
- Bulkhead isolation

#### LexDAO (`lexdao/`)
Shows decentralized autonomous organization patterns.

**Features:**
- DAO governance
- Smart contract integration
- Decentralized decision making
- Token-based coordination

### Comprehensive Example

#### Comprehensive Multi-Agent Workflow (`comprehensive-multi-agent-workflow.ts`)
Complete demonstration of the framework's full capabilities.

**Features:**
- 16 agent types working together
- 8-phase workflow execution
- Real-world business scenario
- Performance and scalability testing
- Error handling and recovery
- Monitoring and observability

## Running Examples

### Individual Examples
```bash
# Run basic examples
npm run example:basic
npm run example:workflow
npm run example:research

# Run specialized examples
npm run example:calm-tech
npm run example:cognicism
npm run example:lexdao

# Run comprehensive example
npm run example:comprehensive
```text

### All Examples
```bash
# Run all examples sequentially
npm run example:all
```text

### Development Mode
```bash
# Run examples with debug output
DEBUG=* npm run example:basic

# Run with performance monitoring
npm run example:performance
```text

## Example Structure

Each example follows a consistent structure:

```typescript
/**
 * Example Description
 *
 * This example demonstrates [specific functionality].
 *
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 */

import { /* Required imports */ } from '../src/core/...';

async function runExample() {
  console.log('🚀 Starting example...');

  try {
    // Setup
    const coordinator = new MultiAgentCoordinator();

    // Example logic
    const result = await coordinator.executeWorkflow({
      tasks: [/* task definitions */]
    });

    console.log('✅ Example completed successfully');
    return result;

  } catch (error) {
    console.error('❌ Example failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { runExample };

// Run if called directly
if (require.main === module) {
  runExample()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```text

## Learning from Examples

### For Beginners
- Start with basic examples to understand core concepts
- Progress to advanced examples for complex scenarios
- Study the comprehensive example for full understanding

### For Developers
- Use examples as starting points for custom implementations
- Study patterns and best practices
- Learn integration techniques

### For Researchers
- Analyze performance characteristics
- Study scalability patterns
- Understand error handling strategies

## Contributing Examples

### Adding New Examples
1. **Create Example File**: Follow the established structure
2. **Add Documentation**: Include comprehensive comments
3. **Add to Package Scripts**: Update package.json scripts
4. **Test Thoroughly**: Ensure examples work correctly
5. **Update README**: Add example to this documentation

### Example Guidelines
- **Clear Purpose**: Each example should demonstrate specific functionality
- **Comprehensive Documentation**: Include detailed comments and explanations
- **Error Handling**: Demonstrate proper error handling
- **Performance Awareness**: Show efficient patterns
- **Real-world Relevance**: Use practical, relatable scenarios

## Troubleshooting Examples

### Common Issues
- **Import Errors**: Check file paths and dependencies
- **API Key Issues**: Ensure OpenAI API key is configured
- **Timeout Issues**: Increase timeout for slow operations
- **Memory Issues**: Monitor memory usage for large datasets

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm run example:basic

# Run with verbose logging
LOG_LEVEL=debug npm run example:workflow
```text

## Performance Examples

Examples include performance demonstrations:
- **Concurrent Operations**: Multiple agents working simultaneously
- **Large Dataset Handling**: Processing substantial data volumes
- **Memory Management**: Efficient resource utilization
- **Scalability Testing**: Framework performance under load

## Related Documentation

- [Framework Overview](../README.md)
- [Agent Documentation](../README.md)
- [Core Systems](../README.md)
- [Testing Guide](../README.md)
- [API Reference](../docs/index.md)
