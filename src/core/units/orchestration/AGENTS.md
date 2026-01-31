# Unit Orchestration System Technical Documentation

## Overview

Complete technical documentation for orchestration interfaces, classes, and methods.

## AgentOrchestrator

### Interfaces

#### TaskDefinition

```typescript
interface TaskDefinition {
  id: string;
  type: string;
  priority: number;
  params: Record<string, any>;
  requiredCapabilities: string[];
  metadata?: Record<string, any>;
  timeout?: number;
  createTime: number;
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'canceled';
  assignedTo?: string;
  result?: any;
  error?: string;
}
```text

#### OrchestratorOptions

```typescript
interface OrchestratorOptions {
  taskAssignmentInterval?: number;
  maxRetries?: number;
  circuitBreakerFailureThreshold?: number;
}
```text

### AgentOrchestrator Class

#### Static Methods

##### getInstance()

```typescript
public static getInstance(options?: OrchestratorOptions): AgentOrchestrator
```text

Gets singleton instance.

**Parameters:**
- `options` (OrchestratorOptions, optional): Configuration

**Returns:** `AgentOrchestrator` - Singleton instance

#### Instance Methods

##### submitTask()

```typescript
public async submitTask(
  task: Omit<TaskDefinition, 'createTime' | 'status'>
): Promise<TaskDefinition>
```text

Submits a task for execution.

**Parameters:**
- `task` (Omit<TaskDefinition, 'createTime' | 'status'>): Task definition

**Returns:** `Promise<TaskDefinition>` - Created task

##### cancelTask()

```typescript
public async cancelTask(id: string): Promise<boolean>
```text

Cancels a task.

**Parameters:**
- `id` (string): Task ID

**Returns:** `Promise<boolean>` - Success status

##### getTaskStatus()

```typescript
public getTaskStatus(id: string): TaskDefinition | null
```text

Gets task status.

**Parameters:**
- `id` (string): Task ID

**Returns:** `TaskDefinition | null` - Task or null

## TaskOrchestrator

### TaskOrchestrator Class

#### Methods

##### executeTask()

```typescript
public async executeTask(task: TaskDefinition): Promise<any>
```text

Executes a task.

**Parameters:**
- `task` (TaskDefinition): Task to execute

**Returns:** `Promise<any>` - Task result

## Related Documentation

- [Orchestration README](./README.md)
- [Units System](../../units/README.md)
