# Organizational Units Framework - Technical Documentation

The Organizational Units Framework provides a comprehensive system for creating, managing, and orchestrating hierarchical organizational structures that mirror real-world organizations. The framework enables multi-agent compositions with specialized agents working together in defined workflows.

## Architecture Overview

### Core Components Hierarchy
```
Organizational Units Framework
├── Structure Management
│   ├── OrganizationalStructureManager - Unit CRUD and hierarchy
│   └── OrganizationalCompositionManager - Unit compositions
├── Deployment & Execution
│   ├── UnitDeploymentManager - Agent deployment
│   └── UnitStateManager - State management
├── Orchestration & Workflow
│   ├── TaskOrchestrator - Task coordination
│   ├── AgentOrchestrator - Agent management
│   ├── WorkflowEngine - Workflow execution
│   └── WorkflowBuilder - Workflow construction
├── Discovery & Relationships
│   ├── AgentDiscoveryService - Agent discovery
│   ├── UnitDiscovery - Unit discovery
│   ├── RelationshipManager - Unit relationships
│   └── LLMAgent/UnitAgentFactory - Agent creation
└── State & Storage
    ├── UnitStateManager - Unit state management
    └── UnitInterface - Core interfaces
```

## Structure Management

### OrganizationalStructureManager (`OrganizationalStructureManager.ts`)
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
    async getUnitCapabilities(unitId: string): Promise<Capability[]>
    async addUnitCapability(unitId: string, capability: Capability): Promise<void>
    async removeUnitCapability(unitId: string, capabilityName: string): Promise<void>
}
```

### OrganizationalCompositionManager (`OrganizationalCompositionManager.ts`)
```typescript
export class DefaultOrganizationalCompositionManager implements OrganizationalCompositionManager {
    constructor(structureManager: OrganizationalStructureManager)

    async createComposition(name: string, description: string, unitIds: string[]): Promise<string>
    async getComposition(compositionId: string): Promise<OrganizationalComposition | null>
    async updateComposition(compositionId: string, updates: Partial<OrganizationalComposition>): Promise<void>
    async deleteComposition(compositionId: string): Promise<void>
    async addUnitToComposition(compositionId: string, unitId: string): Promise<void>
    async removeUnitFromComposition(compositionId: string, unitId: string): Promise<void>
    async listCompositions(): Promise<OrganizationalComposition[]>
    async getCompositionUnits(compositionId: string): Promise<OrganizationalUnit[]>
    async validateComposition(compositionId: string): Promise<boolean>
}
```

## Deployment & Execution

### UnitDeploymentManager (`UnitDeploymentManager.ts`)
```typescript
export class UnitDeploymentManager {
    constructor(
        structureManager: OrganizationalStructureManager,
        compositionManager: OrganizationalCompositionManager,
        agentRegistry: IAgentRegistry,
        coordinator: MultiAgentCoordinator,
        taskManager: ITaskManager
    )

    async deployComposition(config: DeploymentConfig): Promise<string>
    async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>
    async terminateDeployment(deploymentId: string): Promise<void>
    async listDeployments(): Promise<DeploymentStatus[]>
    async getDeploymentAgents(deploymentId: string): Promise<AbstractAgent[]>
    async updateDeploymentConfig(deploymentId: string, config: Partial<DeploymentConfig>): Promise<void>
}

export interface DeploymentConfig {
    compositionId: string
    name: string
    description?: string
    includeDefaultAgents?: boolean
    agentConfig?: Record<string, any>
    deploymentStrategy?: 'parallel' | 'sequential' | 'adaptive'
}

export interface DeploymentStatus {
    id: string
    compositionId: string
    name: string
    status: 'deploying' | 'active' | 'terminating' | 'terminated' | 'failed'
    createdAgents: string[]
    startTime: number
    endTime?: number
    error?: string
}
```

### UnitStateManager (`state/UnitStateManager.ts`)
```typescript
export class UnitStateManager {
    constructor(eventSystem: EventSystem)

    async initialize(): Promise<void>
    async getState<T>(unitId: string, key: string): Promise<T | null>
    async setState<T>(unitId: string, key: string, value: T, options?: StateUpdateOptions): Promise<T>
    async updateState<T>(unitId: string, key: string, updater: (current: T | null) => T): Promise<T>
    async deleteState(unitId: string, key: string): Promise<boolean>
    async subscribeToState(unitId: string, key: string, callback: StateUpdateCallback, options?: StateSubscriptionOptions): Promise<string>
    async unsubscribeFromState(subscriptionId: string): Promise<void>
    async listUnitStates(unitId: string): Promise<string[]>
    async clearUnitState(unitId: string): Promise<void>
    async getStateMetadata(unitId: string, key: string): Promise<StateMetadata | null>
}
```

## Orchestration & Workflow

### TaskOrchestrator (`orchestration/TaskOrchestrator.ts`)
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
    async updateTaskPriority(taskId: string, priority: number): Promise<void>
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
    workflowId?: string
}

export interface OrchestratorConfig {
    maxConcurrentTasks?: number
    taskTimeout?: number
    retryAttempts?: number
    queueSize?: number
}
```

### AgentOrchestrator (`orchestration/AgentOrchestrator.ts`)
```typescript
export class AgentOrchestrator {
    constructor(options?: OrchestratorOptions)

    async submitTask(taskDefinition: TaskDefinition): Promise<string>
    async getTaskStatus(taskId: string): Promise<TaskStatus>
    async cancelTask(taskId: string): Promise<boolean>
    async getTaskResult(taskId: string): Promise<any>
    async listActiveTasks(): Promise<TaskDefinition[]>
    async getAgentLoad(agentId: string): Promise<number>
    async redistributeTasks(): Promise<void>
}

export interface TaskDefinition {
    id?: string
    type: string
    payload: any
    requiredCapabilities?: string[]
    priority?: number
    timeout?: number
    assignedAgent?: string
}

export interface OrchestratorOptions {
    maxConcurrentTasks?: number
    loadBalancingStrategy?: 'round-robin' | 'least-loaded' | 'capability-match'
    taskTimeout?: number
    retryFailedTasks?: boolean
}
```

### WorkflowEngine (`workflow/WorkflowEngine.ts`)
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
    async getWorkflowMetrics(workflowId: string): Promise<WorkflowMetrics>
}

export interface WorkflowTask {
    id: string
    name: string
    description?: string
    type: 'agent' | 'system' | 'conditional' | 'parallel'
    config: any
    dependencies?: string[]
    timeout?: number
    retryPolicy?: RetryPolicy
}

export interface Workflow {
    id: string
    name: string
    description?: string
    tasks: WorkflowTask[]
    context?: any
    timeout?: number
    onError?: 'stop' | 'continue' | 'rollback'
}
```

### WorkflowBuilder (`workflow/WorkflowBuilder.ts`)
```typescript
export class WorkflowBuilder {
    constructor()

    addTask(task: WorkflowTask): this
    addDependency(fromTaskId: string, toTaskId: string): this
    setContext(context: any): this
    setTimeout(timeout: number): this
    setErrorHandler(handler: ErrorHandler): this
    build(): Workflow
    validate(): ValidationResult
    clone(): WorkflowBuilder
}

export interface PlanningPhaseConfig {
    objectives: string[]
    constraints?: string[]
    timeline?: string
    stakeholders?: string[]
}

export interface ExecutionPhaseConfig {
    steps: string[]
    resources?: string[]
    checkpoints?: string[]
}
```

## Discovery & Relationships

### AgentDiscoveryService (`discovery/AgentDiscoveryService.ts`)
```typescript
export class AgentDiscoveryService {
    constructor()

    async registerAgent(agentInfo: AgentInfo): Promise<void>
    async unregisterAgent(agentId: string): Promise<void>
    async discoverAgents(criteria?: DiscoveryOptions): Promise<AgentInfo[]>
    async getAgentInfo(agentId: string): Promise<AgentInfo | null>
    async updateAgentInfo(agentId: string, updates: Partial<AgentInfo>): Promise<void>
    async getAgentsByCapability(capability: string): Promise<AgentInfo[]>
    async getAgentsByUnit(unitId: string): Promise<AgentInfo[]>
}

export interface AgentInfo {
    id: string
    name: string
    type: string
    capabilities: string[]
    unitId?: string
    status: 'available' | 'busy' | 'offline'
    lastSeen: number
    metadata?: Record<string, any>
}

export interface DiscoveryOptions {
    capabilities?: string[]
    unitId?: string
    status?: string[]
    limit?: number
    sortBy?: 'name' | 'lastSeen' | 'status'
}
```

### UnitDiscovery (`discovery/UnitDiscovery.ts`)
```typescript
export class UnitDiscovery {
    constructor()

    async discoverUnits(criteria?: UnitDiscoveryCriteria): Promise<OrganizationalUnit[]>
    async getUnitById(unitId: string): Promise<OrganizationalUnit | null>
    async getUnitsByCapability(capability: string): Promise<OrganizationalUnit[]>
    async getUnitsByRelationship(unitId: string, relationshipType?: string): Promise<OrganizationalUnit[]>
    async searchUnits(query: string): Promise<OrganizationalUnit[]>
    async getUnitHierarchy(unitId: string): Promise<UnitHierarchy>
}

export interface UnitDiscoveryCriteria {
    parentId?: string
    capabilities?: string[]
    relationshipTypes?: string[]
    depth?: number
    includeInactive?: boolean
}
```

### RelationshipManager (`relationships/RelationshipManager.ts`)
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
    async getRelationshipGraph(unitId: string, depth?: number): Promise<RelationshipGraph>
}

export interface UnitRelationship {
    id: string
    fromUnitId: string
    toUnitId: string
    type: string
    properties: Record<string, any>
    createdAt: number
    updatedAt: number
}

export interface RelationshipConfig {
    type: string
    properties?: Record<string, any>
    bidirectional?: boolean
    permissions?: ResourcePermission[]
}
```

## Agent Creation & Management

### LLMAgent (`agents/LLMAgent.ts`)
```typescript
export class LLMAgent implements Agent {
    constructor(config: LLMAgentConfig)

    async initialize(): Promise<void>
    async execute(task: any): Promise<any>
    async getStatus(): Promise<AgentStatus>
    async updateStatus(status: AgentStatus): Promise<void>
    async getCapabilities(): Promise<string[]>
    async addCapability(capability: string): Promise<void>
    async removeCapability(capability: string): Promise<void>
}

export interface LLMAgentConfig {
    id: string
    name: string
    model: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    capabilities?: string[]
}
```

### UnitAgentFactory (`agents/UnitAgentFactory.ts`)
```typescript
export class UnitAgentFactory {
    constructor()

    async createAgentForUnit(unit: OrganizationalUnit, config?: UnitAgentConfig): Promise<AbstractAgent>
    async createAgentsForComposition(compositionId: string, config?: UnitAgentConfig): Promise<AbstractAgent[]>
    async createSpecializedAgent(unitId: string, specialization: string, config?: UnitAgentConfig): Promise<AbstractAgent>
    getSupportedAgentTypes(): string[]
    validateAgentConfig(config: UnitAgentConfig): ValidationResult
}

export interface UnitAgentConfig {
    agentType?: string
    capabilities?: string[]
    model?: string
    temperature?: number
    customPrompt?: string
    maxConcurrency?: number
}
```

## Core Interfaces

### UnitInterface (`UnitInterface.ts`)
```typescript
export interface OrganizationalUnit {
    id: string
    name: string
    description?: string
    parentId?: string
    children: string[]
    capabilities: Capability[]
    metadata: Record<string, any>
    createdAt: number
    updatedAt: number
    status: 'active' | 'inactive' | 'archived'
}

export interface UnitConfig {
    name: string
    description?: string
    parentId?: string
    capabilities?: Capability[]
    metadata?: Record<string, any>
}

export interface UnitRelationship {
    id: string
    fromUnitId: string
    toUnitId: string
    type: string
    properties: Record<string, any>
    createdAt: number
    updatedAt: number
}

export interface UnitWorkflow {
    id: string
    name: string
    description?: string
    phases: UnitWorkflowPhase[]
    status: 'draft' | 'active' | 'completed' | 'cancelled'
    createdAt: number
    updatedAt: number
}

export interface UnitWorkflowPhase {
    id: string
    name: string
    description?: string
    assignedUnits: string[]
    requiredCapabilities: string[]
    dependencies: string[]
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
}
```

### OrganizationalStructureManager Interface
```typescript
export interface OrganizationalStructureManager {
    createUnit(name: string, description: string, config?: UnitConfig): Promise<OrganizationalUnit>
    getUnit(unitId: string): Promise<OrganizationalUnit | null>
    updateUnit(unitId: string, updates: Partial<OrganizationalUnit>): Promise<void>
    deleteUnit(unitId: string): Promise<void>
    listUnits(parentId?: string): Promise<OrganizationalUnit[]>
    moveUnit(unitId: string, newParentId: string | null): Promise<void>
    getUnitHierarchy(unitId: string): Promise<OrganizationalUnit[]>
}
```

### OrganizationalCompositionManager Interface
```typescript
export interface OrganizationalCompositionManager {
    createComposition(name: string, description: string, unitIds: string[]): Promise<string>
    getComposition(compositionId: string): Promise<OrganizationalComposition | null>
    updateComposition(compositionId: string, updates: Partial<OrganizationalComposition>): Promise<void>
    deleteComposition(compositionId: string): Promise<void>
    addUnitToComposition(compositionId: string, unitId: string): Promise<void>
    removeUnitFromComposition(compositionId: string, unitId: string): Promise<void>
    listCompositions(): Promise<OrganizationalComposition[]>
    getCompositionUnits(compositionId: string): Promise<OrganizationalUnit[]>
}
```

## Configuration & Types

### Core Types (`agents/types.ts`, `UnitInterface.ts`)
```typescript
export interface Agent {
    id: string
    name: string
    capabilities: string[]
    status: 'idle' | 'busy' | 'error'
    execute(task: any): Promise<any>
}

export interface WorkflowContext {
    workflowId: string
    stepId: string
    inputs: Record<string, any>
    outputs: Record<string, any>
    metadata: Record<string, any>
}

export interface Capability {
    name: string
    level: number
    description?: string
    metadata?: Record<string, any>
}
```

## Performance Characteristics

### Benchmarks
- **Unit Creation**: < 10ms per unit
- **Composition Deployment**: < 100ms for small compositions (5-10 units)
- **Workflow Execution**: < 50ms per task for simple workflows
- **State Operations**: < 5ms for state get/set operations
- **Relationship Queries**: < 20ms for hierarchy traversals

### Scalability Limits
- **Units per Organization**: 10,000+ units
- **Relationships per Unit**: 100+ relationships
- **Concurrent Workflows**: 100+ active workflows
- **Agents per Deployment**: 50+ agents per composition

### Memory Usage
- **Per Unit**: ~1KB base + capabilities/metadata
- **Per Relationship**: ~500 bytes
- **Per Workflow**: ~5KB + task definitions
- **Per Agent**: ~10KB + model/context

## Error Handling

### Error Types
```typescript
class UnitNotFoundError extends Error {
    constructor(unitId: string)
}

class CompositionValidationError extends Error {
    constructor(compositionId: string, issues: string[])
}

class DeploymentError extends Error {
    constructor(deploymentId: string, reason: string)
}

class WorkflowExecutionError extends Error {
    constructor(workflowId: string, stepId: string, error: Error)
}
```

### Recovery Mechanisms
- **Automatic Retries**: Failed operations retry with backoff
- **Graceful Degradation**: Partial failures don't stop entire workflows
- **State Rollback**: Failed deployments can be rolled back
- **Circuit Breakers**: Prevent cascade failures in relationships

## Security Considerations

### Access Control
- **Unit Permissions**: Role-based access to unit operations
- **Composition Security**: Access controls for composition management
- **Agent Authorization**: Capability-based agent execution
- **Workflow Security**: Step-by-step authorization checks

### Data Protection
- **State Encryption**: Sensitive unit state data encrypted
- **Audit Logging**: Complete audit trail for all operations
- **Input Validation**: Comprehensive validation of all inputs
- **Resource Limits**: Prevent resource exhaustion attacks

## Testing Infrastructure

### Test Categories
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Cross-component workflows
- **Performance Tests**: Scalability and load testing
- **Organizational Tests**: Complex organizational scenarios

### Mock Components
```typescript
class MockOrganizationalStructureManager implements OrganizationalStructureManager {
    // Mock implementations for testing
}

class MockAgentRegistry implements IAgentRegistry {
    // Mock agent management for testing
}
```

## Configuration Options

### Environment Variables
```bash
# Units configuration
UNITS_MAX_HIERARCHY_DEPTH=10
UNITS_DEFAULT_TIMEOUT=30000
UNITS_MAX_RELATIONSHIPS_PER_UNIT=100

# Deployment settings
DEPLOYMENT_MAX_AGENTS_PER_COMPOSITION=50
DEPLOYMENT_DEFAULT_STRATEGY=parallel

# Workflow settings
WORKFLOW_MAX_STEPS=100
WORKFLOW_DEFAULT_TIMEOUT=3600000
```

### Programmatic Configuration
```typescript
const unitsConfig = {
    maxHierarchyDepth: 10,
    defaultTimeout: 30000,
    deployment: {
        maxAgentsPerComposition: 50,
        defaultStrategy: 'parallel'
    },
    workflow: {
        maxSteps: 100,
        defaultTimeout: 3600000
    }
};
```

## Integration Points

### Multi-Agent System Integration
- **Agent Registry**: Agent lifecycle management
- **Task Manager**: Task creation and assignment
- **Shared State Manager**: State synchronization
- **Event System**: Workflow and deployment events

### External System Integration
- **Database Systems**: Unit and relationship persistence
- **Message Queues**: Asynchronous task processing
- **Monitoring Systems**: Performance and health metrics
- **Authentication Systems**: User and agent authorization

## Monitoring & Observability

### Metrics Collection
```typescript
interface UnitsMetrics {
    totalUnits: number
    activeCompositions: number
    runningWorkflows: number
    deployedAgents: number
    averageDeploymentTime: number
    workflowCompletionRate: number
}
```

### Health Checks
```typescript
interface UnitsHealth {
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
        database: HealthStatus
        agentRegistry: HealthStatus
        workflowEngine: HealthStatus
        deploymentManager: HealthStatus
    }
}
```

## Dependencies

### Internal Dependencies
- **EventSystem**: Event publishing and subscription
- **MultiAgentCoordinator**: Agent coordination
- **SharedStateManager**: State management
- **TaskManager**: Task handling

### External Dependencies
- **TypeScript**: Type definitions and compilation
- **Node.js**: Runtime environment
- **OpenAI SDK**: LLM agent capabilities (optional)

## Related Components

### Complementary Frameworks
- **Integration Patterns**: Resilience patterns for unit communications
- **Monitoring System**: Health checks and metrics
- **Storage System**: Data persistence
- **Event System**: Inter-unit communication