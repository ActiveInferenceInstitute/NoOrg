# Source Code Agents Documentation

This document provides technical documentation for the key classes, interfaces, and functions in the `src/` directory of the NoOrg Multi-Agent Framework.

## Core Classes and Functions

### MultiAgentCoordinator

The central orchestration component that manages multi-agent coordination, task distribution, and system state.

#### Class Signature
```typescript
export class MultiAgentCoordinator {
  constructor(
    name?: string,
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
}
```

#### Key Methods

##### Instance Management
```typescript
static getInstance(): MultiAgentCoordinator
```
Returns the singleton instance of the coordinator.

##### Lifecycle Methods
```typescript
async initialize(): Promise<boolean>
async start(): Promise<boolean>
async stop(): Promise<boolean>
```
- `initialize()`: Sets up the coordinator with shared state, creates default prompt templates
- `start()`: Begins task processing and sets coordinator to running state
- `stop()`: Halts task processing and marks all agents as offline

##### Agent Management
```typescript
async registerAgent(agentData: Omit<Agent, 'id'>): Promise<string | null>
async unregisterAgent(agentId: string): Promise<boolean>
async getAgent(agentId: string): Promise<Agent | null>
async updateAgent(agentId: string, updates: Partial<AgentType>): Promise<boolean>
async listAgents(filter?: AgentFilter): Promise<AgentType[]>
```
Agent registration, lifecycle management, and status tracking.

##### Task Management
```typescript
async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string | null>
async getTask(taskId: string): Promise<Task | null>
async assignTask(taskId: string, agentId: string): Promise<void>
async updateTaskStatus(taskId: string, status: Task['status'], result?: TaskResult): Promise<boolean>
async listTasks(filter?: TaskFilter): Promise<Task[]>
```
Task creation, assignment, execution tracking, and status management.

##### State Persistence
```typescript
async saveState(filePath: string): Promise<boolean>
async loadState(filePath: string): Promise<boolean>
```
Coordinator state serialization and restoration from JSON files.

##### Component Accessors
```typescript
getAgentRegistry(): AgentRegistry
getSharedStateManager(): SharedStateManager
getTaskManager(): TaskManager
getOpenAIClient(): OpenAIClientInterface
getPromptManager(): PromptManagerInterface
```
Access to underlying framework components.

#### Execution Configuration
```typescript
private executionConfig: {
  maxConcurrentTasks: number;      // Default: 5
  enableAutoRetry: boolean;        // Default: true
  maxRetryAttempts: number;        // Default: 3
  taskPriorityQueue: boolean;      // Default: true
  useAgentSpecialization: boolean; // Default: true
  monitorAgentPerformance: boolean; // Default: true
};
```

### AbstractAgent

Base class for all specialized agents in the framework.

#### Class Signature
```typescript
export abstract class AbstractAgent {
  constructor(options: AbstractAgentOptions)
  abstract executeTask(taskDetails: any, context?: any): Promise<any>
}
```

#### Key Methods
```typescript
initialize(): Promise<void>
getStatus(): AgentStatus
updateStatus(status: Partial<AgentStatus>): void
getCapabilities(): string[]
hasCapability(capability: string): boolean
```

### Core Infrastructure Classes

#### SharedStateManager
Manages global state across the multi-agent system.

#### AgentRegistry
Maintains registry of all available agents and their capabilities.

#### TaskManager
Handles task creation, assignment, and lifecycle management.

#### EventSystem
Pub/sub messaging system for inter-agent communication.

#### Storage Systems
Multiple storage backends for data persistence:
- In-memory storage
- File-based storage
- Database storage (future)

### Integration Patterns

#### CircuitBreaker
Prevents cascading failures by temporarily stopping operations.

#### Bulkhead
Isolates components to contain failures within boundaries.

#### Timeout
Ensures operations complete within specified time limits.

#### Retry
Automatically retries failed operations with configurable backoff.

#### RateLimiter
Controls operation frequency to prevent resource exhaustion.

## Data Types and Interfaces

### Agent Types
```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: Capability[];
  status: AgentStatus;
  metadata: Record<string, any>;
  preferredModel: string;
  createdAt: number;
  lastActive: number;
}

interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'busy' | 'offline' | 'error';
  lastActive: number;
  capabilities: Capability[];
  metadata: Record<string, any>;
  state: 'available' | 'busy' | 'offline' | 'error';
  lastUpdated: number;
  healthStatus: HealthStatus;
  metrics: Record<string, any>;
}
```

### Task Types
```typescript
interface Task {
  id: string;
  name?: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dependsOn?: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  failedAt?: number;
  results?: any;
  error?: string;
}
```

### Capability System
```typescript
interface Capability {
  name: string;
  description: string;
  parameters: Record<string, any>;
}
```

## Key Functions and Utilities

### Conversion Functions
```typescript
function convertCapabilities(capabilities: string[]): Capability[]
function convertCapabilitiesToString(capabilities: Capability[]): string[]
function convertStatusToAgentStatus(status: AgentType['status']): AgentStatus
function convertStatusToString(status: AgentStatus): AgentType['status']
function convertAgentTypeToAgent(agentType: AgentType): Agent
function convertAgentToAgentType(agent: Agent): AgentType
```

### Task Processing
```typescript
private async processTaskQueue(): Promise<void>
private async executeTask(taskId: string): Promise<boolean>
private async findSuitableAgent(task: Task): Promise<Agent | null>
private async startTask(taskId: string): Promise<boolean>
```

## Architecture Patterns

### Singleton Pattern
Used for core infrastructure components (SharedStateManager, TaskManager, AgentRegistry).

### Observer Pattern
Event-driven communication through the EventSystem.

### Strategy Pattern
Multiple coordination strategies (centralized, decentralized, hybrid).

### Factory Pattern
Agent creation and capability-based task assignment.

### Resilience Patterns
Circuit breaker, retry, timeout, bulkhead, and rate limiting for robust operation.

## Error Handling

Comprehensive error handling with:
- Graceful degradation
- Automatic retry mechanisms
- Circuit breaking for unreliable components
- Detailed logging and monitoring
- State recovery capabilities

## Performance Considerations

- Concurrent task execution limits
- Agent specialization matching
- Priority-based task queuing
- Resource monitoring and health checks
- Optimized state persistence