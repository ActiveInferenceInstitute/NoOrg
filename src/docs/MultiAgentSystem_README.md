# Multi-Agent System Documentation

## Overview

This documentation covers the multi-agent system architecture implemented in this project. The system enables the coordination of multiple specialized agents to work together on complex tasks through shared state, task management, and centralized coordination.

## Core Components

1. **MultiAgentCoordinator**: Central hub that manages agent interactions and task flow
2. **SharedStateManager**: Provides a common state accessible by all agents
3. **TaskManager**: Handles task creation, assignment, and tracking
4. **AgentRegistry**: Maintains information about available agents
5. **Agent Implementations**: Specialized agents for different tasks (Research, Creative Writing, etc.)

## Key Fixes Implemented

1. **MultiAgentCoordinator Constructor Access**
   - Changed the constructor from private to public to allow direct instantiation
   - Updated to accept configuration parameters for modular initialization

2. **Type Definitions**
   - Extended the `Task` interface to include additional properties:
     - `type`: Task categorization
     - `results`: Task output storage
     - `processingTime`: Performance tracking
     - `priority`: Task importance
     - `dependsOn`: Task dependencies
   - Updated `AgentConfig` interface to include:
     - `sharedState`: Access to shared state
     - `openAIClient`: Access to AI capabilities

3. **Capability Handling**
   - Improved conversion between string capabilities and `Capability` objects
   - Added type safety for agent registration and updates

4. **Task Status Alignment**
   - Added 'in-progress' to task status options
   - Aligned task and agent status types for consistent state management

## Remaining Challenges

Some issues still require attention in the codebase:

1. **Class Accessibility**
   - The `SharedStateManager` constructor is private, suggesting it might use a singleton pattern
   - The `TaskManager` and `AgentRegistry` classes may need similar treatment

2. **Agent Registration**
   - The types used in the example file don't fully match the required types for agent registration
   - Agent information structure should be aligned between the core system and agent implementations

3. **Example File Integration**
   - The example file (`multi_agent_workflow.ts`) needs further updates to match the corrected implementations
   - Mock implementations might be needed for demonstration purposes

4. **Task Creation Interface**
   - Current task creation has mismatches between the method parameters and what's passed in the example
   - The `title` property is used but may not be defined in the Task interface

## Usage Guidelines

### Setting Up a Multi-Agent System

```typescript
// Create required components
const sharedState = SharedStateManager.getInstance();
const taskManager = TaskManager.getInstance();
const agentRegistry = AgentRegistry.getInstance();
const openAIClient = new OpenAIClient(process.env.OPENAI_API_KEY);
const promptManager = new PromptManager('src/prompts');

// Initialize coordinator
const coordinator = new MultiAgentCoordinator(
  "My Coordinator", 
  {
    sharedStateManager: sharedState,
    taskManager: taskManager,
    agentRegistry: agentRegistry,
    openAIClient: openAIClient,
    promptManager: promptManager
  }
);

await coordinator.initialize();
```

### Creating and Registering Agents

```typescript
// Define capabilities
const capabilities = [
  {
    name: 'research',
    description: 'Web research capability',
    parameters: { depth: 'comprehensive' }
  }
];

// Register agent
const agentId = await coordinator.registerAgent({
  name: 'Research Agent',
  type: 'research',
  description: 'Specialized in research',
  capabilities: capabilities.map(c => c.name),
  status: 'available'
});
```

### Creating and Running Tasks

```typescript
// Create task
const taskId = await coordinator.createTask({
  name: 'Research Task',
  description: 'Research a specific topic',
  status: 'pending',
  type: 'research',
  priority: 'high',
  metadata: { topic: 'Quantum Computing' }
});

// Assign task
await coordinator.assignTask(taskId, agentId);

// Run task workflow
await coordinator.start();
```

## Development Recommendations

1. **Agent Implementation**
   - Ensure all agents implement a consistent interface
   - Use a common base class with required methods

2. **Error Handling**
   - Implement comprehensive error handling for agent failures
   - Add graceful degradation for missing or failed agents

3. **Testing**
   - Create mock implementations for testing agent interactions
   - Test with increasingly complex workflows

4. **Documentation**
   - Document all agent capabilities consistently
   - Create diagrams showing task workflows

## Technical Debt and Next Steps

1. Align interface implementations between components
2. Create proper mock implementations for example files
3. Implement remaining singleton instances with proper getInstance() methods
4. Complete documentation for all component types
5. Add automated tests for the multi-agent coordination system

## Troubleshooting Common Issues

### Type Errors with Capabilities

```typescript
// ❌ Incorrect - string capabilities directly
agent.capabilities = ['research', 'writing'];

// ✅ Correct - properly converting to Capability objects
agent.capabilities = convertCapabilities(['research', 'writing']);

// ✅ Correct - creating explicit Capability objects
agent.capabilities = [
  { name: 'research', description: 'Research capability', parameters: {} },
  { name: 'writing', description: 'Writing capability', parameters: {} }
];
```

### Task Assignment Issues

```typescript
// ❌ Incorrect - using the wrong task status
task.status = 'started'; // Invalid status

// ✅ Correct - using valid task status
task.status = 'in-progress'; // Valid status
```

### Agent Status Tracking

```typescript
// ❌ Incorrect - direct status string
agent.status = 'busy';

// ✅ Correct - using full status object
agent.status = {
  state: 'busy',
  lastUpdated: Date.now(),
  healthStatus: { isHealthy: true, errors: [], lastHeartbeat: Date.now() },
  metrics: {}
};
``` 