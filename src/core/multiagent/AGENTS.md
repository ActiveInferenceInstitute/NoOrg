# Multi-Agent Coordination System Technical Documentation

## Overview

Complete technical documentation for all interfaces, classes, and methods in the Multi-Agent Coordination System.

## MultiAgentCoordinator

### Constructor

```typescript
constructor(
  name: string = 'Default Coordinator',
  options?: {
    sharedStateManager?: SharedStateManager;
    taskManager?: TaskManager;
    agentRegistry?: AgentRegistry;
    openAIClient?: OpenAIClient;
    promptManager?: PromptManager;
    stateFilePath?: string;
    executionConfig?: Partial<MultiAgentCoordinator['executionConfig']>;
    coordinationStrategy?: 'centralized' | 'decentralized' | 'hybrid';
  }
)
```

**Parameters:**
- `name` (string, optional): Coordinator name (default: 'Default Coordinator')
- `options` (object, optional): Configuration options

### Static Methods

#### getInstance()

```typescript
public static getInstance(): MultiAgentCoordinator
```

Gets singleton instance.

**Returns:** `MultiAgentCoordinator` - Singleton instance

### Instance Methods

#### initialize()

```typescript
public async initialize(): Promise<boolean>
```

Initializes the coordinator.

**Returns:** `Promise<boolean>` - Success status

**Behavior:**
- Loads state from file if stateFilePath is set
- Initializes shared state
- Creates default prompt templates
- Marks as initialized

#### start()

```typescript
public async start(): Promise<boolean>
```

Starts the coordinator.

**Returns:** `Promise<boolean>` - Success status

**Behavior:**
- Initializes if not already initialized
- Starts task processing loop
- Sets status to 'running'

#### stop()

```typescript
public async stop(): Promise<boolean>
```

Stops the coordinator.

**Returns:** `Promise<boolean>` - Success status

**Behavior:**
- Stops task processing
- Marks all agents as offline
- Sets status to 'stopped'

#### registerAgent()

```typescript
public async registerAgent(
  agentData: Omit<Agent, 'id'>
): Promise<string | null>
```

Registers a new agent.

**Parameters:**
- `agentData` (Omit<Agent, 'id'>): Agent data

**Returns:** `Promise<string | null>` - Agent ID or null

#### unregisterAgent()

```typescript
public async unregisterAgent(agentId: string): Promise<boolean>
```

Unregisters an agent.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<boolean>` - Success status

#### submitTask()

```typescript
public async submitTask(
  taskData: Partial<Task>
): Promise<string>
```

Submits a task for execution.

**Parameters:**
- `taskData` (Partial<Task>): Task data

**Returns:** `Promise<string>` - Task ID

#### getTask()

```typescript
public async getTask(taskId: string): Promise<Task | null>
```

Gets task by ID.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<Task | null>` - Task or null

#### completeTask()

```typescript
public async completeTask(
  taskId: string,
  agentId: string
): Promise<void>
```

Completes a task.

**Parameters:**
- `taskId` (string): Task ID
- `agentId` (string): Agent ID

**Returns:** `Promise<void>`

#### failTask()

```typescript
public async failTask(
  taskId: string,
  agentId: string,
  error: string
): Promise<void>
```

Marks task as failed.

**Parameters:**
- `taskId` (string): Task ID
- `agentId` (string): Agent ID
- `error` (string): Error message

**Returns:** `Promise<void>`

#### executeWorkflow()

```typescript
public async executeWorkflow(
  workflow: {
    tasks: Array<{
      agent: string;
      action: string;
      data: any;
    }>;
  }
): Promise<any>
```

Executes a workflow.

**Parameters:**
- `workflow` (object): Workflow definition

**Returns:** `Promise<any>` - Workflow result

## AgentRegistry

### Static Methods

#### getInstance()

```typescript
public static getInstance(): AgentRegistry
```

Gets singleton instance.

**Returns:** `AgentRegistry` - Singleton instance

### Instance Methods

#### registerAgent()

```typescript
public async registerAgent(agent: Agent): Promise<boolean>
```

Registers an agent.

**Parameters:**
- `agent` (Agent): Agent data

**Returns:** `Promise<boolean>` - Success status

#### unregisterAgent()

```typescript
public async unregisterAgent(agentId: string): Promise<boolean>
```

Unregisters an agent.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<boolean>` - Success status

#### updateAgent()

```typescript
public async updateAgent(
  agentId: string,
  updates: Partial<Agent>
): Promise<boolean>
```

Updates an agent.

**Parameters:**
- `agentId` (string): Agent ID
- `updates` (Partial<Agent>): Updates

**Returns:** `Promise<boolean>` - Success status

#### getAgent()

```typescript
public async getAgent(agentId: string): Promise<Agent | null>
```

Gets agent by ID.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<Agent | null>` - Agent or null

#### listAgents()

```typescript
public async listAgents(filter?: AgentFilter): Promise<AgentType[]>
```

Lists agents with optional filtering.

**Parameters:**
- `filter` (AgentFilter, optional): Filter criteria

**Returns:** `Promise<AgentType[]>` - Array of agents

#### findAgentsByCapability()

```typescript
public async findAgentsByCapability(capability: string): Promise<AgentType[]>
```

Finds agents by capability.

**Parameters:**
- `capability` (string): Capability name

**Returns:** `Promise<AgentType[]>` - Array of matching agents

#### findAgentsByType()

```typescript
public async findAgentsByType(type: string): Promise<AgentType[]>
```

Finds agents by type.

**Parameters:**
- `type` (string): Agent type

**Returns:** `Promise<AgentType[]>` - Array of matching agents

#### getAgentCapabilities()

```typescript
public async getAgentCapabilities(agentId: string): Promise<string[]>
```

Gets capabilities for an agent.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<string[]>` - Array of capabilities

## TaskManager

### Static Methods

#### getInstance()

```typescript
public static getInstance(): TaskManager
```

Gets singleton instance.

**Returns:** `TaskManager` - Singleton instance

### Instance Methods

#### createTask()

```typescript
public async createTask(taskData: Partial<Task>): Promise<string>
```

Creates a new task.

**Parameters:**
- `taskData` (Partial<Task>): Task data

**Returns:** `Promise<string>` - Task ID

#### assignTask()

```typescript
public async assignTask(taskId: string, agentId: string): Promise<void>
```

Assigns task to agent.

**Parameters:**
- `taskId` (string): Task ID
- `agentId` (string): Agent ID

**Returns:** `Promise<void>`

#### startTask()

```typescript
public async startTask(taskId: string): Promise<void>
```

Starts task execution.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<void>`

#### completeTask()

```typescript
public async completeTask(taskId: string, result: TaskResult): Promise<void>
```

Completes a task.

**Parameters:**
- `taskId` (string): Task ID
- `result` (TaskResult): Task result

**Returns:** `Promise<void>`

#### failTask()

```typescript
public async failTask(taskId: string, error: Error): Promise<void>
```

Marks task as failed.

**Parameters:**
- `taskId` (string): Task ID
- `error` (Error): Error object

**Returns:** `Promise<void>`

#### cancelTask()

```typescript
public async cancelTask(taskId: string): Promise<void>
```

Cancels a task.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<void>`

#### getTask()

```typescript
public async getTask(taskId: string): Promise<Task>
```

Gets task by ID.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<Task>` - Task object

#### listTasks()

```typescript
public async listTasks(filter?: TaskFilter): Promise<Task[]>
```

Lists tasks with optional filtering.

**Parameters:**
- `filter` (TaskFilter, optional): Filter criteria

**Returns:** `Promise<Task[]>` - Array of tasks

#### areDependenciesSatisfied()

```typescript
public async areDependenciesSatisfied(taskId: string): Promise<boolean>
```

Checks if task dependencies are satisfied.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<boolean>` - True if dependencies satisfied

## SharedStateManager

### Static Methods

#### getInstance()

```typescript
public static getInstance(
  persistencePath?: string,
  autoSave?: boolean,
  saveInterval?: number
): SharedStateManager
```

Gets singleton instance.

**Parameters:**
- `persistencePath` (string, optional): Path for state persistence
- `autoSave` (boolean, optional): Enable auto-save
- `saveInterval` (number, optional): Auto-save interval in ms

**Returns:** `SharedStateManager` - Singleton instance

### Instance Methods

#### setState()

```typescript
public async setState(
  path: string,
  value: unknown,
  options?: StateUpdateOptions
): Promise<void>
```

Sets state value.

**Parameters:**
- `path` (string): Dot notation path
- `value` (unknown): Value to set
- `options` (StateUpdateOptions, optional): Update options

**Returns:** `Promise<void>`

#### getState()

```typescript
public async getState(path: string): Promise<unknown>
```

Gets state value.

**Parameters:**
- `path` (string): Dot notation path

**Returns:** `Promise<unknown>` - State value

#### clearState()

```typescript
public async clearState(): Promise<void>
```

Clears entire state.

**Returns:** `Promise<void>`

#### loadState()

```typescript
public async loadState(): Promise<void>
```

Loads state from storage.

**Returns:** `Promise<void>`

#### saveState()

```typescript
public async saveState(): Promise<void>
```

Saves state to storage.

**Returns:** `Promise<void>`

#### subscribe()

```typescript
public subscribe(
  path: string,
  callback: (path: string, value: unknown) => void
): string
```

Subscribes to state changes.

**Parameters:**
- `path` (string): Dot notation path
- `callback` (function): Change handler

**Returns:** `string` - Subscription ID

#### unsubscribe()

```typescript
public unsubscribe(subscriptionId: string): void
```

Unsubscribes from state changes.

**Parameters:**
- `subscriptionId` (string): Subscription ID

**Returns:** `void`

#### getFullState()

```typescript
public getFullState(): Record<string, unknown>
```

Gets entire state object.

**Returns:** `Record<string, unknown>` - Full state

#### registerAgent()

```typescript
public async registerAgent(
  name: string,
  agentInfo: Record<string, unknown>
): Promise<boolean>
```

Registers agent in shared state.

**Parameters:**
- `name` (string): Agent name
- `agentInfo` (Record<string, unknown>): Agent information

**Returns:** `Promise<boolean>` - Success status

#### updateAgentStatus()

```typescript
public async updateAgentStatus(name: string, status: string): Promise<void>
```

Updates agent status.

**Parameters:**
- `name` (string): Agent name
- `status` (string): New status

**Returns:** `Promise<void>`

#### configurePersistence()

```typescript
public configurePersistence(
  path?: string,
  autoSave: boolean = false,
  saveInterval: number = 60000
): void
```

Configures persistence settings.

**Parameters:**
- `path` (string, optional): File path for persistence
- `autoSave` (boolean, optional): Enable auto-save (default: false)
- `saveInterval` (number, optional): Auto-save interval in ms (default: 60000)

**Returns:** `void`

## OpenAIClient

### Methods

#### createCompletion()

```typescript
public async createCompletion(
  prompt: string,
  options?: Record<string, unknown>
): Promise<string>
```

Creates text completion.

**Parameters:**
- `prompt` (string): Prompt text
- `options` (Record<string, unknown>, optional): Configuration

**Returns:** `Promise<string>` - Completion text

#### sendPrompt()

```typescript
public async sendPrompt(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<any>
```

Sends prompt to OpenAI API.

**Parameters:**
- `prompt` (string): Prompt text
- `options` (object, optional): Configuration

**Returns:** `Promise<any>` - API response

## PromptManager

### Static Methods

#### getInstance()

```typescript
public static getInstance(promptsDir?: string): PromptManager
```

Gets singleton instance.

**Parameters:**
- `promptsDir` (string, optional): Prompts directory

**Returns:** `PromptManager` - Singleton instance

### Instance Methods

#### getPrompt()

```typescript
public async getPrompt(
  name: string,
  variables?: Record<string, unknown>
): Promise<string>
```

Gets prompt with variables populated.

**Parameters:**
- `name` (string): Prompt name
- `variables` (Record<string, unknown>, optional): Variables to substitute

**Returns:** `Promise<string>` - Populated prompt

#### addPrompt()

```typescript
public async addPrompt(name: string, template: string): Promise<void>
```

Adds new prompt template.

**Parameters:**
- `name` (string): Prompt name
- `template` (string): Prompt template

**Returns:** `Promise<void>`

#### updatePrompt()

```typescript
public async updatePrompt(name: string, template: string): Promise<void>
```

Updates existing prompt template.

**Parameters:**
- `name` (string): Prompt name
- `template` (string): New template

**Returns:** `Promise<void>`

#### deletePrompt()

```typescript
public async deletePrompt(name: string): Promise<void>
```

Deletes prompt template.

**Parameters:**
- `name` (string): Prompt name

**Returns:** `Promise<void>`

#### createDefaultTemplates()

```typescript
public createDefaultTemplates(): void
```

Creates default prompt templates.

**Returns:** `void`

## BaseAgent

### Methods

#### initialize()

```typescript
public async initialize(): Promise<boolean>
```

Initializes the agent.

**Returns:** `Promise<boolean>` - Success status

#### executeTask()

```typescript
public async executeTask(
  taskDetails: any,
  context?: any
): Promise<any>
```

Executes a task.

**Parameters:**
- `taskDetails` (any): Task details
- `context` (any, optional): Execution context

**Returns:** `Promise<any>` - Task result

#### shutdown()

```typescript
public async shutdown(): Promise<boolean>
```

Shuts down the agent.

**Returns:** `Promise<boolean>` - Success status

#### getAgentInfo()

```typescript
public getAgentInfo(): Agent
```

Gets agent information.

**Returns:** `Agent` - Agent information

#### updateStatus()

```typescript
public updateStatus(status: Agent['status']): void
```

Updates agent status.

**Parameters:**
- `status` (Agent['status']): New status

**Returns:** `void`

## AgentHealthMonitor

### Methods

#### checkHealth()

```typescript
public async checkHealth(agentId: string): Promise<HealthStatus>
```

Checks agent health.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<HealthStatus>` - Health status

#### monitorAgent()

```typescript
public monitorAgent(agentId: string, interval: number): void
```

Starts monitoring an agent.

**Parameters:**
- `agentId` (string): Agent ID
- `interval` (number): Check interval in ms

**Returns:** `void`

## Related Documentation

- [Multi-Agent Coordination README](./README.md)
- [Interfaces Documentation](./interfaces/AGENTS.md)
- [Core Systems Documentation](../README.md)
