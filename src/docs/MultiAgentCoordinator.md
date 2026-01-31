# MultiAgentCoordinator Documentation

## Overview

The `MultiAgentCoordinator` is a central component of the multi-agent system architecture, responsible for coordinating interactions between multiple agents, managing shared state, and delegating tasks. It orchestrates workflows by assigning tasks to specialized agents based on their capabilities.

## Key Components

- **Agent Management**: Register, track, and update agents in the system
- **Task Management**: Create, assign, complete, and monitor tasks
- **Shared State**: Maintain a shared state that all agents can access
- **Coordination Strategies**: Implement different coordination approaches (centralized, decentralized, hybrid)
- **Execution Monitoring**: Track task and agent performance metrics

## Class Structure

```typescript
class MultiAgentCoordinator {
  constructor(
    name: string = 'Default Coordinator',
    options?: {
      sharedStateManager?: SharedStateManager;
      taskManager?: TaskManager;
      agentRegistry?: AgentRegistry;
      openAIClient?: OpenAIClient;
      promptManager?: PromptManager;
      stateFilePath?: string;
      executionConfig?: object;
      coordinationStrategy?: string;
    }
  )
  
  // Core methods
  async initialize(): Promise<boolean>
  async start(): Promise<boolean>
  async stop(): Promise<boolean>
  
  // Agent management
  async registerAgent(agentData: object): Promise<string | null>
  async unregisterAgent(agentId: string): Promise<boolean>
  async getAgent(agentId: string): Promise<Agent | null>
  async updateAgent(agentId: string, updates: object): Promise<boolean>
  async listAgents(filter?: object): Promise<Agent[]>
  
  // Task management
  async createTask(taskData: object): Promise<string | null>
  async assignTask(taskId: string, agentId: string): Promise<void>
  async getTask(taskId: string): Promise<Task | null>
  async updateTaskStatus(taskId: string, status: string, result?: object): Promise<boolean>
  async listTasks(filter?: object): Promise<Task[]>
  
  // Other methods
  async saveState(filePath: string): Promise<boolean>
  async loadState(filePath: string): Promise<boolean>
}
```text

## Usage Examples

### Basic Initialization

```typescript
import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { TaskManager } from '../core/multiagent/TaskManager';
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { PromptManager } from '../core/multiagent/PromptManager';

// Initialize shared components
const sharedState = new SharedStateManager();
const taskManager = new TaskManager();
const agentRegistry = new AgentRegistry();
const openAIClient = new OpenAIClient();
const promptManager = new PromptManager('src/prompts');

// Create the coordinator
const coordinator = new MultiAgentCoordinator(
  "Multi-Agent Workflow Coordinator", 
  {
    sharedStateManager: sharedState,
    taskManager: taskManager,
    agentRegistry: agentRegistry,
    openAIClient: openAIClient,
    promptManager: promptManager
  }
);

// Initialize the coordinator
await coordinator.initialize();
```text

### Agent Registration

```typescript
// Register a research agent
const researchAgentId = await coordinator.registerAgent({
  name: 'Research Assistant',
  type: 'research',
  description: 'Specialized in gathering and analyzing information',
  capabilities: ['research', 'information-extraction', 'fact-checking'],
  status: 'available',
  preferredModel: 'o3-mini'
});
```text

### Task Creation and Assignment

```typescript
// Create a research task
const researchTaskId = await coordinator.createTask({
  title: 'Research quantum computing',
  description: 'Gather information about quantum computing and its applications',
  priority: 'high',
  metadata: {
    topic: 'quantum computing'
  }
});

// Assign the task to an agent
await coordinator.assignTask(researchTaskId, researchAgentId);
```text

### Task Completion

```typescript
// Mark a task as complete
await coordinator.updateTaskStatus(researchTaskId, 'completed', {
  success: true,
  data: {
    findings: 'Quantum computing uses quantum bits...',
    sources: [
      { title: 'Introduction to Quantum Computing', url: '...' }
    ]
  }
});
```text

## Type Definitions

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: Capability[];
  status: AgentStatus;
  metadata: Record<string, unknown>;
  preferredModel: string;
  createdAt: number;
  lastActive: number;
}
```text

### Capability

```typescript
interface Capability {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}
```text

### Task

```typescript
interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  failedAt?: number;
  error?: string;
  metadata: Record<string, unknown>;
  type?: string;
  results?: any;
  processingTime?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependsOn?: string[];
}
```text

## Implementation Notes

### Recent Fixes

1. **Constructor Access**: The `MultiAgentCoordinator` constructor is now public instead of private, allowing direct instantiation. Previously, it could only be accessed through the singleton `getInstance()` method.

2. **Type Conversion**: Added proper type conversion between string capabilities and `Capability` objects, ensuring correct typing for agent registrations and updates.

3. **Task Interface Enhancement**: Extended the `Task` interface to include additional properties:
   - `type`: Task type description
   - `results`: Storage for task execution results
   - `processingTime`: Execution time measurement
   - `priority`: Task importance level
   - `dependsOn`: Task dependencies

4. **Status Types**: Updated task status values to include 'in-progress' and align with agent status types.

5. **Agent Configuration**: Enhanced the `AgentConfig` interface to accept `sharedState` and `openAIClient` parameters.

### Best Practices

- **Error Handling**: All methods have comprehensive error handling that logs errors and returns appropriate status values.
- **State Persistence**: The coordinator can save and load its state from a file for persistence across runs.
- **Type Safety**: Strong TypeScript typing ensures correct usage across the codebase.
- **Extensibility**: The coordinator is designed to be extensible with different coordination strategies.

## Dependency Diagram

```text
┌─────────────────────┐
│                     │
│ MultiAgentCoordinator │
│                     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│                     │
│  SharedStateManager  │◄─────┐
│                     │      │
└─────────────────────┘      │
                             │
┌─────────────────────┐      │
│                     │      │
│    TaskManager      │◄─────┤
│                     │      │
└─────────────────────┘      │
                             │
┌─────────────────────┐      │
│                     │      │
│    AgentRegistry    │◄─────┼───────┐
│                     │      │       │
└─────────────────────┘      │       │
                             │       │
┌─────────────────────┐      │       │
│                     │      │       │
│    PromptManager    │◄─────┘       │
│                     │              │
└─────────────────────┘              │
                                     │
┌─────────────────────┐              │
│                     │              │
│     Agent Types     │◄─────────────┘
│                     │
└─────────────────────┘
```text 