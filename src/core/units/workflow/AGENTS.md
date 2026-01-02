# Unit Workflow System Technical Documentation

## Overview

Complete technical documentation for workflow interfaces, classes, and methods.

## Interfaces

### TaskStatus

```typescript
enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}
```

### WorkflowStatus

```typescript
enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}
```

### ConditionType

```typescript
enum ConditionType {
  TASK_SUCCESS = 'task_success',
  TASK_FAILURE = 'task_failure',
  TASK_COMPLETION = 'task_completion',
  EXPRESSION = 'expression',
  STATE_CONDITION = 'state_condition',
  ALWAYS = 'always'
}
```

### WorkflowTask

```typescript
interface WorkflowTask {
  id: string;
  name: string;
  description?: string;
  unitId: string;
  action: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  conditions?: TaskCondition[];
  timeout?: number;
  retries?: number;
  status: TaskStatus;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, any>;
  data?: Record<string, any>;
  dependencyResults?: Record<string, WorkflowTask>;
  output?: Record<string, any>;
}
```

### TaskCondition

```typescript
interface TaskCondition {
  type: ConditionType;
  value?: any;
  taskId?: string;
  expression?: string;
  statePath?: string;
  options?: Record<string, any>;
}
```

### Workflow

```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  tasks: WorkflowTask[];
  status: WorkflowStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  owner?: string;
  metadata?: Record<string, any>;
}
```

## WorkflowEngine Class

### Methods

#### createWorkflow()

```typescript
public async createWorkflow(workflowData: Partial<Workflow>): Promise<Workflow>
```

Creates a new workflow.

**Parameters:**
- `workflowData` (Partial<Workflow>): Workflow data

**Returns:** `Promise<Workflow>` - Created workflow

#### executeWorkflow()

```typescript
public async executeWorkflow(workflowId: string): Promise<Workflow>
```

Executes a workflow.

**Parameters:**
- `workflowId` (string): Workflow ID

**Returns:** `Promise<Workflow>` - Executed workflow

#### getWorkflow()

```typescript
public async getWorkflow(workflowId: string): Promise<Workflow | null>
```

Gets workflow by ID.

**Parameters:**
- `workflowId` (string): Workflow ID

**Returns:** `Promise<Workflow | null>` - Workflow or null

## WorkflowBuilder Class

### Methods

#### withName()

```typescript
public withName(name: string): WorkflowBuilder
```

Sets workflow name.

**Parameters:**
- `name` (string): Workflow name

**Returns:** `WorkflowBuilder` - Builder instance

#### withDescription()

```typescript
public withDescription(description: string): WorkflowBuilder
```

Sets workflow description.

**Parameters:**
- `description` (string): Description

**Returns:** `WorkflowBuilder` - Builder instance

#### withPlanningPhase()

```typescript
public withPlanningPhase(config: PlanningPhaseConfig): WorkflowBuilder
```

Adds planning phase.

**Parameters:**
- `config` (PlanningPhaseConfig): Phase configuration

**Returns:** `WorkflowBuilder` - Builder instance

#### withExecutionPhase()

```typescript
public withExecutionPhase(config: ExecutionPhaseConfig): WorkflowBuilder
```

Adds execution phase.

**Parameters:**
- `config` (ExecutionPhaseConfig): Phase configuration

**Returns:** `WorkflowBuilder` - Builder instance

#### build()

```typescript
public build(): UnitWorkflow
```

Builds the workflow.

**Returns:** `UnitWorkflow` - Built workflow

## Related Documentation

- [Workflow README](./README.md)
- [Units System](../../units/README.md)
