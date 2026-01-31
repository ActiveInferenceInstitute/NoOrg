# Multi-Agent Workflow System Documentation

## Overview
The Multi-Agent Workflow System is a framework for coordinating multiple AI agents to work together on complex tasks. It provides a flexible architecture for creating multi-stage workflows where agents can collaborate, share state, and build upon each other's work.

## Core Components

### 1. MultiAgentCoordinator
The central orchestrator that manages the workflow and coordinates between agents.

Key responsibilities:
- Agent registration and management
- Task distribution and scheduling
- State synchronization
- Workflow execution control

### 2. SharedStateManager
Manages shared state between agents during workflow execution.

Features:
- Thread-safe state management
- Hierarchical state structure
- State persistence
- State synchronization between agents

### 3. TaskManager
Handles task creation, assignment, and tracking.

Capabilities:
- Task dependency management
- Task status tracking
- Agent assignment
- Task execution monitoring

### 4. AgentRegistry
Maintains a registry of available agents and their capabilities.

Features:
- Agent registration
- Capability tracking
- Agent status management
- Agent discovery

### 5. OpenAIClient
Manages interactions with the OpenAI API.

Features:
- Model selection
- Token management
- Response handling
- Error management

### 6. PromptManager
Manages prompt templates and their variations.

Features:
- Template loading
- Dynamic prompt generation
- Context management
- Template versioning

## Creating a New Workflow Example

### 1. Basic Structure
```typescript
import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { TaskManager } from '../core/multiagent/TaskManager';
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { PromptManager } from '../core/multiagent/PromptManager';

async function runWorkflow() {
  // Initialize components
  const sharedState = new SharedStateManager();
  const taskManager = new TaskManager();
  const agentRegistry = new AgentRegistry();
  const openAIClient = new OpenAIClient();
  const promptManager = new PromptManager('src/prompts');

  // Create coordinator
  const coordinator = new MultiAgentCoordinator(
    "Workflow Coordinator",
    {
      sharedStateManager: sharedState,
      taskManager: taskManager,
      agentRegistry: agentRegistry,
      openAIClient: openAIClient,
      promptManager: promptManager
    }
  );

  // Initialize coordinator
  await coordinator.initialize();

  // Create and initialize agents
  // ... agent creation code ...

  // Create tasks
  // ... task creation code ...

  // Execute workflow
  // ... workflow execution code ...
}
```text

### 2. Creating Custom Agents
```typescript
class CustomAgent extends BaseAgent {
  constructor(name: string, config: AgentConfig) {
    super(name, config);
  }

  async initialize() {
    // Agent initialization logic
  }

  async executeTask(task: Task) {
    // Task execution logic
  }

  async shutdown() {
    // Cleanup logic
  }
}
```text

### 3. Task Management
```typescript
// Create a task
const taskId = uuidv4();
await taskManager.createTask({
  id: taskId,
  type: 'custom_task',
  title: 'Task Title',
  description: 'Task Description',
  status: 'pending',
  priority: 'high',
  metadata: {
    // Custom metadata
  }
});

// Assign task to agent
await taskManager.assignTask(taskId, agentId);

// Start task
await taskManager.startTask(taskId);

// Complete task
await taskManager.completeTask(taskId, {
  success: true,
  data: {
    // Task results
  }
});
```text

### 4. State Management
```typescript
// Store state
sharedState.setState('path.to.state', value);

// Retrieve state
const value = sharedState.getState('path.to.state');

// Update state
sharedState.updateState('path.to.state', (current) => {
  // Update logic
  return updatedValue;
});
```text

## Advanced Workflow Patterns

### 1. Multi-Stage Workflow
```typescript
// Create multiple stages
const stages = [
  {
    id: 'research',
    type: 'research',
    title: 'Initial Research',
    description: 'Gather information about the topic'
  },
  {
    id: 'analysis',
    type: 'analysis',
    title: 'Data Analysis',
    description: 'Analyze research findings',
    dependsOn: ['research']
  },
  {
    id: 'synthesis',
    type: 'synthesis',
    title: 'Content Synthesis',
    description: 'Create final content',
    dependsOn: ['analysis']
  }
];

// Execute stages sequentially
for (const stage of stages) {
  if (await taskManager.areDependenciesSatisfied(stage.id)) {
    await executeStage(stage);
  }
}
```text

### 2. Parallel Task Execution
```typescript
// Create independent tasks
const parallelTasks = [
  createTask('task1'),
  createTask('task2'),
  createTask('task3')
];

// Execute tasks in parallel
await Promise.all(parallelTasks.map(task => executeTask(task)));
```text

### 3. Conditional Workflow
```typescript
// Create conditional tasks
const conditionalTask = {
  id: 'conditional',
  type: 'conditional',
  title: 'Conditional Processing',
  description: 'Process based on conditions',
  conditions: {
    // Define conditions
  }
};

// Check conditions before execution
if (await checkConditions(conditionalTask.conditions)) {
  await executeTask(conditionalTask);
}
```text

## Best Practices

1. **State Management**
   - Use clear, hierarchical state paths
   - Implement proper state cleanup
   - Handle state conflicts appropriately

2. **Error Handling**
   - Implement proper error handling at each stage
   - Provide meaningful error messages
   - Implement retry mechanisms when appropriate

3. **Task Dependencies**
   - Clearly define task dependencies
   - Handle circular dependencies
   - Implement proper dependency resolution

4. **Agent Communication**
   - Use shared state for agent communication
   - Implement proper message passing
   - Handle agent coordination effectively

5. **Resource Management**
   - Implement proper cleanup
   - Handle resource limits
   - Monitor system resources

## Example: Complex Multi-Stage Project

Here's an example of a more complex multi-stage project:

```typescript
async function runComplexWorkflow() {
  // Initialize system components
  const coordinator = await initializeCoordinator();
  
  // Create specialized agents
  const researchAgent = new ResearchAgent('Research Specialist', {...});
  const analysisAgent = new AnalysisAgent('Data Analyst', {...});
  const writingAgent = new WritingAgent('Content Writer', {...});
  const reviewAgent = new ReviewAgent('Content Reviewer', {...});
  
  // Define workflow stages
  const stages = [
    {
      id: 'initial_research',
      agent: researchAgent,
      task: createResearchTask(),
      next: ['data_analysis']
    },
    {
      id: 'data_analysis',
      agent: analysisAgent,
      task: createAnalysisTask(),
      next: ['content_creation']
    },
    {
      id: 'content_creation',
      agent: writingAgent,
      task: createWritingTask(),
      next: ['content_review']
    },
    {
      id: 'content_review',
      agent: reviewAgent,
      task: createReviewTask(),
      next: []
    }
  ];
  
  // Execute workflow
  for (const stage of stages) {
    await executeStage(stage);
    
    // Handle stage-specific logic
    if (stage.id === 'content_review') {
      const reviewResults = await stage.agent.getResults();
      if (reviewResults.needsRevision) {
        // Handle revision cycle
        await handleRevisionCycle(stage);
      }
    }
  }
  
  // Generate final report
  await generateFinalReport();
}
```text

This example demonstrates:
- Multiple specialized agents
- Complex task dependencies
- Conditional workflow paths
- Revision cycles
- Final report generation

## Environment Setup

1. Required environment variables:
```env
OPENAI_API_KEY=your_api_key
DEFAULT_MODEL=model_name
MAX_TOKENS=4096
TEMPERATURE=0.7
LOG_LEVEL=info
STORAGE_PATH=./data
```text

2. Dependencies:
```json
{
  "dependencies": {
    "axios": "^1.8.4",
    "dotenv": "^16.4.7",
    "openai": "^4.91.1",
    "uuid": "^9.0.1"
  }
}
```text

## Conclusion

The Multi-Agent Workflow System provides a robust foundation for creating complex, multi-stage AI workflows. By following these patterns and best practices, you can create sophisticated workflows that leverage multiple AI agents working together to accomplish complex tasks. 