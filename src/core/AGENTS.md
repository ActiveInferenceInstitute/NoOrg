# Core Systems - Technical Documentation

The Core Systems directory provides the fundamental infrastructure components for the NoOrg multi-agent operations framework. This module contains all essential building blocks for agent coordination, communication, monitoring, and data management.

## Core Architecture Overview

### System Components Hierarchy
```
Core Systems
├── Events & Messaging
│   ├── EventSystem
│   └── MessageSystem
├── Monitoring & Health
│   ├── MonitoringSystem
│   └── HealthCheckManager
├── Storage & Persistence
│   └── StorageSystem
├── Multi-Agent Coordination
│   ├── MultiAgentCoordinator
│   ├── AgentRegistry
│   ├── SharedStateManager
│   ├── TaskManager
│   └── PromptManager
├── Integration Patterns
│   ├── CircuitBreaker
│   ├── Retry
│   ├── Timeout
│   ├── Bulkhead
│   ├── RateLimiter
│   ├── CacheAside
│   ├── Saga
│   └── RequestResponsePattern
└── Units & Organization
    ├── OrganizationalStructureManager
    ├── OrganizationalCompositionManager
    ├── UnitDeploymentManager
    ├── UnitStateManager
    ├── RelationshipManager
    ├── AgentDiscoveryService
    ├── UnitDiscovery
    ├── TaskOrchestrator
    ├── AgentOrchestrator
    ├── WorkflowEngine
    ├── WorkflowBuilder
    └── UnitAgentFactory
```

## Event & Messaging Systems

### EventSystem (`events/EventSystem.ts`)
```typescript
export class EventSystem {
    static getInstance(): EventSystem

    async publish(eventType: string, data: any, options?: EventPersistenceOptions): Promise<void>
    async subscribe(eventType: string, handler: EventHandler, options?: EventSubscriptionOptions): Promise<string>
    async unsubscribe(subscriptionId: string): Promise<void>
    async getEventHistory(eventType?: string, filter?: EventFilter): Promise<any[]>
    async clearEventHistory(eventType?: string): Promise<void>
}

export interface EventDefinition {
    type: string
    data: any
    timestamp: number
    source?: string
    correlationId?: string
}

export interface EventFilter {
    type?: string
    source?: string
    correlationId?: string
    startTime?: number
    endTime?: number
}

export interface EventSubscriptionOptions {
    priority?: number
    once?: boolean
    filter?: EventFilter
}

export interface EventPersistenceOptions {
    persist?: boolean
    ttl?: number
}
```

### MessageSystem (`messaging/MessageSystem.ts`)
```typescript
export class MessageSystem {
    static getInstance(): MessageSystem

    async sendMessage(message: Message): Promise<string>
    async getMessage(messageId: string): Promise<Message | null>
    async getMessages(filter?: MessageFilter): Promise<Message[]>
    async acknowledgeMessage(messageId: string): Promise<void>
    async rejectMessage(messageId: string, reason?: string): Promise<void>
    async getMessageQueueLength(): Promise<number>
}

export interface Message {
    id: string
    type: string
    from: string
    to: string
    subject: string
    body: any
    timestamp: number
    correlationId?: string
    replyTo?: string
    headers?: Record<string, any>
}
```

## Monitoring & Health Systems

### MonitoringSystem (`monitoring/MonitoringSystem.ts`)
```typescript
export class MonitoringSystem {
    static getInstance(): MonitoringSystem

    recordMetric(name: string, value: number, tags?: Record<string, string>): void
    incrementCounter(name: string, tags?: Record<string, string>): void
    recordHistogram(name: string, value: number, tags?: Record<string, string>): void
    getMetrics(): Promise<MetricsSnapshot>
    registerHealthCheck(name: string, check: () => Promise<HealthStatus>): void
    unregisterHealthCheck(name: string): void
    getHealthStatus(): Promise<SystemHealth>
}

export interface MetricsSnapshot {
    counters: Record<string, number>
    histograms: Record<string, HistogramData>
    gauges: Record<string, number>
    timestamp: number
}
```

### HealthCheckManager (`monitoring/HealthCheckManager.ts`)
```typescript
export class HealthCheckManager {
    constructor(config?: HealthCheckManagerConfig)

    registerCheck(name: string, check: HealthCheck): void
    unregisterCheck(name: string): void
    async runCheck(name: string): Promise<HealthCheckResult>
    async runAllChecks(): Promise<HealthStatus>
    getCheckStatus(name: string): HealthCheckResult | null
    getAllCheckStatuses(): Record<string, HealthCheckResult>
}

export interface HealthCheck {
    name: string
    description?: string
    critical?: boolean
    timeout?: number
    interval?: number
    check: () => Promise<boolean | HealthCheckResult>
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, HealthCheckResult>
    timestamp: number
}

export interface HealthCheckResult {
    status: 'pass' | 'fail' | 'warn'
    message?: string
    details?: any
    timestamp: number
    duration?: number
}
```

## Storage System

### StorageSystem (`storage/StorageSystem.ts`)
```typescript
export class StorageSystem {
    static getInstance(): StorageSystem

    async initialize(options?: StorageOptions): Promise<void>
    async set<T>(key: string, value: T, options?: StorageOptions): Promise<void>
    async get<T>(key: string): Promise<T | null>
    async delete(key: string): Promise<boolean>
    async exists(key: string): Promise<boolean>
    async list(prefix?: string): Promise<string[]>
    async clear(): Promise<void>
    async query<T>(query: QueryOptions): Promise<T[]>
    async getStats(): Promise<StorageStats>
}

export interface StorageItem<T> {
    key: string
    value: T
    timestamp: number
    ttl?: number
    metadata?: Record<string, any>
}

export interface QueryOptions {
    prefix?: string
    limit?: number
    offset?: number
    filter?: (item: StorageItem<any>) => boolean
    sortBy?: 'key' | 'timestamp'
    sortOrder?: 'asc' | 'desc'
}

export interface StorageBackend {
    set<T>(key: string, value: T, options?: any): Promise<void>
    get<T>(key: string): Promise<T | null>
    delete(key: string): Promise<boolean>
    exists(key: string): Promise<boolean>
    list(prefix?: string): Promise<string[]>
    clear(): Promise<void>
    query?<T>(query: QueryOptions): Promise<T[]>
    getStats(): Promise<StorageStats>
}
```

## Multi-Agent Coordination System

### MultiAgentCoordinator (`multiagent/MultiAgentCoordinator.ts`)
```typescript
export class MultiAgentCoordinator {
    static getInstance(): MultiAgentCoordinator

    async initialize(): Promise<boolean>
    async start(): Promise<boolean>
    async stop(): Promise<void>
    async registerAgent(agent: AbstractAgent): Promise<boolean>
    async unregisterAgent(agentId: string): Promise<boolean>
    async getAgent(agentId: string): Promise<AbstractAgent | null>
    async listAgents(): Promise<AbstractAgent[]>
    async submitTask(task: Task): Promise<string>
    async getTaskStatus(taskId: string): Promise<TaskStatus>
    async cancelTask(taskId: string): Promise<boolean>
    async getCoordinatorStatus(): Promise<CoordinatorStatus>
}
```

### AgentRegistry (`multiagent/AgentRegistry.ts`)
```typescript
export class AgentRegistry implements IAgentRegistry {
    static getInstance(): AgentRegistry
    constructor(stateManager?: SharedStateManager)

    async registerAgent(agent: Agent): Promise<boolean>
    async unregisterAgent(agentId: string): Promise<boolean>
    async updateAgent(agentId: string, updates: Partial<Agent>): Promise<boolean>
    async getAgent(agentId: string): Promise<Agent | null>
    async listAgents(filter?: AgentFilter): Promise<AgentType[]>
    async findAgentsByCapability(capability: string): Promise<Agent[]>
    async findAgentsByType(type: string): Promise<Agent[]>
    async getAgentCapabilities(agentId: string): Promise<string[]>
    async updateAgentStatus(agentId: string, status: string): Promise<boolean>
    async updateAgentCapabilities(agentId: string, capabilities: string[]): Promise<boolean>
    async getAgentCountsByStatus(): Promise<Record<AgentStatus['state'], number>>
}
```

### SharedStateManager (`multiagent/SharedStateManager.ts`)
```typescript
export class SharedStateManager implements ISharedStateManager {
    static getInstance(persistencePath?: string, autoSave?: boolean, saveInterval?: number): SharedStateManager
    private constructor(persistencePath?: string, autoSave?: boolean, saveInterval?: number)

    async getState(path: string): Promise<unknown>
    async setState(path: string, value: unknown, options?: StateUpdateOptions): Promise<void>
    getFullState(): Record<string, unknown>
    async clearState(): Promise<void>
    async loadState(): Promise<void>
    async saveState(): Promise<void>
    subscribe(path: string, callback: StateChangeCallback): string
    unsubscribe(subscriptionId: string): void
    async registerAgent(name: string, agentInfo: Record<string, unknown>): Promise<boolean>
    async updateAgentStatus(name: string, status: string): Promise<void>
    configurePersistence(path?: string, autoSave?: boolean, saveInterval?: number): void
    watchState(path: string, callback: StateChangeCallback): void
    unwatchState(path: string, callback: StateChangeCallback): void
    syncState(externalState: Record<string, any>, strategy: ConflictResolutionStrategy | ((local: any, external: any) => any)): void
    resolveConflicts(localValue: any, externalValue: any, strategy: ConflictResolutionStrategy | ((local: any, external: any) => any)): any
    persistState(path: string): void
    loadPersistedState(state: Record<string, any>): void
    clearEphemeralState(): void
}
```

### TaskManager (`multiagent/TaskManager.ts`)
```typescript
export class TaskManager implements ITaskManager {
    static getInstance(): TaskManager
    constructor(stateManager?: SharedStateManager)

    async createTask(taskData: Partial<Task>): Promise<string>
    async getTask(taskId: string): Promise<Task | undefined>
    async updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void>
    async listTasks(filter?: TaskFilter): Promise<Task[]>
    async assignTask(taskId: string, agentId: string): Promise<void>
    async unassignTask(taskId: string): Promise<void>
    async reassignTask(taskId: string, newAgentId: string): Promise<void>
    async startTask(taskId: string): Promise<void>
    async completeTask(taskId: string, result: TaskResult | { outcome?: string; data?: any }): Promise<void>
    async failTask(taskId: string, error: Error | { message: string; details?: any }): Promise<void>
    async cancelTask(taskId: string, reason?: string): Promise<void>
    async areDependenciesSatisfied(taskId: string): Promise<boolean>
    async getReadyTasks(): Promise<Task[]>
    async countTasksByStatus(): Promise<Record<TaskStatus, number>>
    async getTaskHistory(taskId: string): Promise<TaskHistory[]>
    async estimateTaskDuration(task: Task): Promise<number>
    async getTaskStatistics(): Promise<TaskStatistics>
    async cleanupOldTasks(olderThan: number): Promise<number>
}
```

### PromptManager (`multiagent/PromptManager.ts`)
```typescript
export class PromptManager implements IPromptManager {
    constructor()

    async getPrompt(templateName: string, variables?: Record<string, any>): Promise<string>
    async setPrompt(templateName: string, template: string): Promise<void>
    async listPrompts(): Promise<string[]>
    async deletePrompt(templateName: string): Promise<void>
    async validatePrompt(template: string): Promise<ValidationResult>
    async analyzePrompt(template: string): Promise<PromptAnalysis>
}
```

## Integration Patterns

### CircuitBreaker (`integration/patterns/CircuitBreaker.ts`)
```typescript
export class CircuitBreaker {
    constructor(config: CircuitBreakerConfig)

    async execute<T>(operation: () => Promise<T>): Promise<T>
    getState(): CircuitBreakerState
    reset(): void
    getMetrics(): CircuitBreakerMetrics
}

export interface CircuitBreakerConfig {
    failureThreshold: number
    recoveryTimeout: number
    monitoringPeriod: number
    name?: string
}

export interface CircuitBreakerState {
    state: 'closed' | 'open' | 'half-open'
    failures: number
    lastFailureTime?: number
    nextAttemptTime?: number
}
```

### Retry (`integration/patterns/Retry.ts`)
```typescript
export class Retry {
    constructor(config: RetryConfig)

    async execute<T>(operation: () => Promise<T>): Promise<T>
    getMetrics(): RetryMetrics
    reset(): void
}

export interface RetryConfig {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
    backoffFactor: number
    retryCondition?: (error: Error) => boolean
}
```

### Timeout (`integration/patterns/Timeout.ts`)
```typescript
export class Timeout {
    constructor(config: TimeoutConfig)

    async execute<T>(operation: () => Promise<T>): Promise<T>
    getMetrics(): TimeoutMetrics
    reset(): void
}

export interface TimeoutConfig {
    duration: number
    name?: string
}
```

### Bulkhead (`integration/patterns/Bulkhead.ts`)
```typescript
export class Bulkhead {
    constructor(config: BulkheadConfig)

    async execute<T>(operation: () => Promise<T>): Promise<T>
    getMetrics(): BulkheadMetrics
    getQueueLength(): number
    getActiveCount(): number
}

export interface BulkheadConfig {
    maxConcurrentCalls: number
    maxQueueSize: number
    queueTimeout: number
}
```

### RateLimiter (`integration/patterns/RateLimiter.ts`)
```typescript
export class RateLimiter {
    constructor(config: RateLimiterConfig)

    async acquire(): Promise<void>
    tryAcquire(): boolean
    getMetrics(): RateLimiterMetrics
    reset(): void
}

export interface RateLimiterConfig {
    requestsPerSecond: number
    burstSize?: number
    name?: string
}
```

### CacheAside (`integration/patterns/CacheAside.ts`)
```typescript
export class CacheAsidePattern {
    constructor(config: CacheConfig)

    async get<T>(key: string, loader: () => Promise<T>): Promise<T>
    async set<T>(key: string, value: T): Promise<void>
    async invalidate(key: string): Promise<void>
    async clear(): Promise<void>
    getStats(): CacheStats
}

export interface CacheConfig {
    ttl: number
    maxSize?: number
    name?: string
}
```

### Saga Pattern (`integration/patterns/Saga.ts`)
```typescript
export class SagaPattern<T = any> {
    constructor(config: SagaConfig)

    async execute(context: T): Promise<SagaResult<T>>
    addStep(step: SagaStep<T>): this
    addCompensation(step: SagaStep<T>): this
}

export interface SagaStep<T = any> {
    name: string
    execute: (context: T) => Promise<any>
    compensate?: (context: T) => Promise<any>
}

export interface SagaConfig {
    name?: string
    timeout?: number
    autoCompensate?: boolean
}
```

### RequestResponsePattern (`integration/patterns/RequestResponsePattern.ts`)
```typescript
export class RequestResponsePattern {
    constructor()

    registerHandler<TReq, TRes>(type: string, handler: RequestHandler<TReq, TRes>): void
    async sendRequest<TReq, TRes>(request: Request<TReq>): Promise<Response<TRes>>
    async processRequest<TReq, TRes>(request: Request<TReq>): Promise<Response<TRes>>
}

export interface Request<T = any> {
    id: string
    type: string
    payload: T
    timeout?: number
    headers?: Record<string, any>
}

export interface Response<T = any> {
    id: string
    requestId: string
    success: boolean
    payload?: T
    error?: string
    timestamp: number
}
```

## Units & Organization Systems

### OrganizationalStructureManager (`units/OrganizationalStructureManager.ts`)
```typescript
export class DefaultOrganizationalStructureManager implements OrganizationalStructureManager {
    constructor()

    async createUnit(name: string, description: string, config?: UnitConfig): Promise<OrganizationalUnit>
    async getUnit(unitId: string): Promise<OrganizationalUnit | null>
    async updateUnit(unitId: string, updates: Partial<OrganizationalUnit>): Promise<void>
    async deleteUnit(unitId: string): Promise<void>
    async listUnits(parentId?: string): Promise<OrganizationalUnit[]>
    async moveUnit(unitId: string, newParentId: string | null): Promise<void>
    async getUnitHierarchy(unitId: string): Promise<OrganizationalUnit[]>
}
```

### UnitStateManager (`units/state/UnitStateManager.ts`)
```typescript
export class UnitStateManager {
    constructor(eventSystem: EventSystem)

    async initialize(): Promise<void>
    async getState<T>(unitId: string, key: string): Promise<T | null>
    async setState<T>(unitId: string, key: string, value: T, options?: StateUpdateOptions): Promise<void>
    async updateState<T>(unitId: string, key: string, updater: (current: T | null) => T): Promise<T>
    async deleteState(unitId: string, key: string): Promise<boolean>
    async subscribeToState(unitId: string, key: string, callback: StateUpdateCallback, options?: StateSubscriptionOptions): Promise<string>
    async unsubscribeFromState(subscriptionId: string): Promise<void>
}
```

### RelationshipManager (`units/relationships/RelationshipManager.ts`)
```typescript
export class RelationshipManager {
    constructor()

    async createRelationship(fromUnitId: string, toUnitId: string, config: RelationshipConfig): Promise<string>
    async getRelationship(relationshipId: string): Promise<UnitRelationship | null>
    async updateRelationship(relationshipId: string, updates: Partial<UnitRelationship>): Promise<void>
    async deleteRelationship(relationshipId: string): Promise<void>
    async getRelationshipsForUnit(unitId: string, direction?: 'from' | 'to' | 'both'): Promise<UnitRelationship[]>
    async queryRelationships(query: RelationshipQueryOptions): Promise<UnitRelationship[]>
    async validateRelationship(fromUnitId: string, toUnitId: string, type: string): Promise<boolean>
}
```

### WorkflowEngine (`units/workflow/WorkflowEngine.ts`)
```typescript
export class WorkflowEngine {
    constructor(logger?: ILogger)

    async executeWorkflow(workflow: Workflow, context?: any): Promise<TaskExecutionResult[]>
    async executeTask(task: WorkflowTask, context?: any): Promise<TaskExecutionResult>
    async validateWorkflow(workflow: Workflow): Promise<ValidationResult>
    async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>
    async cancelWorkflow(workflowId: string): Promise<void>
    async pauseWorkflow(workflowId: string): Promise<void>
    async resumeWorkflow(workflowId: string): Promise<void>
}
```

### TaskOrchestrator (`units/orchestration/TaskOrchestrator.ts`)
```typescript
export class TaskOrchestrator {
    constructor(config?: OrchestratorConfig)

    async submitTask(task: UnitTask): Promise<string>
    async getTaskStatus(taskId: string): Promise<TaskStatus>
    async cancelTask(taskId: string): Promise<boolean>
    async getTaskResult(taskId: string): Promise<TaskExecutionResult | null>
    async listTasks(filter?: TaskFilter): Promise<UnitTask[]>
    async getQueueLength(): Promise<number>
    async getActiveTasks(): Promise<UnitTask[]>
}

export interface UnitTask {
    id?: string
    type: string
    payload: any
    priority?: number
    timeout?: number
    retries?: number
    dependencies?: string[]
    unitId?: string
}
```

## Performance Characteristics

### Throughput Benchmarks
- **Event System**: 10,000+ events/second
- **Message System**: 1,000+ messages/second
- **Storage Operations**: 5,000+ operations/second
- **Task Processing**: 500+ concurrent tasks

### Memory Usage
- **Base Memory**: ~50MB for core systems
- **Per Agent**: ~2-5MB additional
- **Storage Cache**: Configurable up to system limits

### Scalability Limits
- **Concurrent Agents**: 100+ active agents
- **Task Queue**: 10,000+ queued tasks
- **State Size**: Limited by available memory/disk

## Error Handling

### Error Types
- **SystemError**: Infrastructure failures
- **ValidationError**: Input validation failures
- **TimeoutError**: Operation timeouts
- **ResourceError**: Resource exhaustion
- **ConfigurationError**: Configuration issues

### Recovery Mechanisms
- **Circuit Breaker**: Automatic failure isolation
- **Retry Logic**: Configurable retry strategies
- **Fallback Systems**: Graceful degradation
- **Health Checks**: Proactive monitoring

## Configuration Options

### Environment Variables
```bash
# Core systems
NODE_ENV=production
LOG_LEVEL=info

# Event system
EVENT_PERSISTENCE_ENABLED=true
EVENT_HISTORY_SIZE=10000

# Storage
STORAGE_BACKEND=memory
STORAGE_MAX_SIZE=1GB

# Monitoring
ENABLE_METRICS=true
METRICS_RETENTION=7d
```

### Programmatic Configuration
```typescript
const coreConfig = {
  eventSystem: {
    persistence: true,
    historySize: 10000
  },
  storage: {
    backend: 'memory',
    maxSize: '1GB'
  },
  monitoring: {
    enabled: true,
    retention: '7d'
  }
};
```

## Security Considerations

### Access Control
- **Agent Authentication**: Required for registration
- **Task Authorization**: Permission-based task execution
- **State Access Control**: Unit-based state isolation
- **Audit Logging**: Complete operation tracking

### Data Protection
- **Encryption**: At-rest and in-transit encryption
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: Configurable request throttling
- **Resource Limits**: Prevent resource exhaustion attacks

## Testing Infrastructure

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-component interaction
- **Performance Tests**: Load and scalability testing
- **Security Tests**: Vulnerability assessment

### Test Utilities
- **Mock Agents**: Test agent implementations
- **Test Coordinators**: Isolated testing environments
- **Performance Harnesses**: Load testing frameworks
- **Security Scanners**: Automated vulnerability detection

## Dependencies

### Internal Dependencies
- **Event System**: Foundation for communication
- **Message System**: Structured messaging layer
- **Storage System**: Data persistence
- **Monitoring System**: Observability layer

### External Dependencies
- **Node.js**: Runtime environment
- **TypeScript**: Type safety and compilation
- **dotenv**: Environment configuration
- **OpenAI SDK**: LLM integration (optional)