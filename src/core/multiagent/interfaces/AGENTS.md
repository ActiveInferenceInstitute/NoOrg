# Multi-Agent Interfaces Technical Documentation

## Overview

Complete technical documentation for all interface definitions in the multi-agent system.

## AgentRegistry Interface

### Methods

#### registerAgent()

```typescript
registerAgent(agent: Agent): Promise<boolean>
```text

Registers a new agent.

**Parameters:**
- `agent` (Agent): Agent data

**Returns:** `Promise<boolean>` - Success status

#### unregisterAgent()

```typescript
unregisterAgent(agentId: string): Promise<boolean>
```text

Unregisters an agent.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<boolean>` - Success status

#### updateAgent()

```typescript
updateAgent(agentId: string, updates: Partial<Agent>): Promise<boolean>
```text

Updates an agent.

**Parameters:**
- `agentId` (string): Agent ID
- `updates` (Partial<Agent>): Partial agent data

**Returns:** `Promise<boolean>` - Success status

#### getAgent()

```typescript
getAgent(agentId: string): Promise<Agent | null>
```text

Gets agent by ID.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<Agent | null>` - Agent or null

#### listAgents()

```typescript
listAgents(filter?: AgentFilter): Promise<AgentType[]>
```text

Lists agents with optional filtering.

**Parameters:**
- `filter` (AgentFilter, optional): Filter criteria

**Returns:** `Promise<AgentType[]>` - Array of agents

#### findAgentsByCapability()

```typescript
findAgentsByCapability(capability: string): Promise<AgentType[]>
```text

Finds agents by capability.

**Parameters:**
- `capability` (string): Capability name

**Returns:** `Promise<AgentType[]>` - Array of matching agents

#### findAgentsByType()

```typescript
findAgentsByType(type: string): Promise<AgentType[]>
```text

Finds agents by type.

**Parameters:**
- `type` (string): Agent type

**Returns:** `Promise<AgentType[]>` - Array of matching agents

#### getAgentCapabilities()

```typescript
getAgentCapabilities(agentId: string): Promise<string[]>
```text

Gets capabilities for an agent.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `Promise<string[]>` - Array of capabilities

## TaskManager Interface

### Methods

#### createTask()

```typescript
createTask(taskData: Partial<Task>): Promise<string>
```text

Creates a new task.

**Parameters:**
- `taskData` (Partial<Task>): Task data

**Returns:** `Promise<string>` - Task ID

#### assignTask()

```typescript
assignTask(taskId: string, agentId: string): Promise<void>
```text

Assigns task to agent.

**Parameters:**
- `taskId` (string): Task ID
- `agentId` (string): Agent ID

**Returns:** `Promise<void>`

#### startTask()

```typescript
startTask(taskId: string): Promise<void>
```text

Starts task execution.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<void>`

#### completeTask()

```typescript
completeTask(taskId: string, result: TaskResult): Promise<void>
```text

Completes a task.

**Parameters:**
- `taskId` (string): Task ID
- `result` (TaskResult): Task result

**Returns:** `Promise<void>`

#### failTask()

```typescript
failTask(taskId: string, error: Error): Promise<void>
```text

Marks task as failed.

**Parameters:**
- `taskId` (string): Task ID
- `error` (Error): Error object

**Returns:** `Promise<void>`

#### cancelTask()

```typescript
cancelTask(taskId: string): Promise<void>
```text

Cancels a task.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<void>`

#### getTask()

```typescript
getTask(taskId: string): Promise<Task>
```text

Gets task by ID.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<Task>` - Task object

#### listTasks()

```typescript
listTasks(filter?: TaskFilter): Promise<Task[]>
```text

Lists tasks with optional filtering.

**Parameters:**
- `filter` (TaskFilter, optional): Filter criteria

**Returns:** `Promise<Task[]>` - Array of tasks

#### areDependenciesSatisfied()

```typescript
areDependenciesSatisfied(taskId: string): Promise<boolean>
```text

Checks if task dependencies are satisfied.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<boolean>` - True if dependencies satisfied

#### unassignTask()

```typescript
unassignTask(taskId: string): Promise<void>
```text

Unassigns a task from its current agent.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<void>`

#### reassignTask()

```typescript
reassignTask(taskId: string, newAgentId: string): Promise<void>
```text

Reassigns a task to a different agent.

**Parameters:**
- `taskId` (string): Task ID
- `newAgentId` (string): New agent ID

**Returns:** `Promise<void>`

#### updateTask()

```typescript
updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void>
```text

Updates task properties.

**Parameters:**
- `taskId` (string): Task ID
- `updates` (Partial<Omit<Task, 'id' | 'createdAt'>>): Task updates

**Returns:** `Promise<void>`

#### getReadyTasks()

```typescript
getReadyTasks(): Promise<Task[]>
```text

Gets tasks that are ready to be executed (dependencies satisfied).

**Returns:** `Promise<Task[]>` - Array of ready tasks

#### countTasksByStatus()

```typescript
countTasksByStatus(): Promise<Record<string, number>>
```text

Counts tasks by status.

**Returns:** `Promise<Record<string, number>>` - Object with counts for each status

#### getTaskHistory()

```typescript
getTaskHistory(taskId: string): Promise<any[]>
```text

Gets task history including all state changes.

**Parameters:**
- `taskId` (string): Task ID

**Returns:** `Promise<any[]>` - Array of history events

#### estimateTaskDuration()

```typescript
estimateTaskDuration(task: Task): Promise<number>
```text

Estimates task duration based on historical data.

**Parameters:**
- `task` (Task): Task to estimate

**Returns:** `Promise<number>` - Estimated duration in milliseconds

#### getTaskStatistics()

```typescript
getTaskStatistics(): Promise<any>
```text

Gets task statistics.

**Returns:** `Promise<any>` - Statistics object

#### cleanupOldTasks()

```typescript
cleanupOldTasks(olderThan: number): Promise<number>
```text

Cleans up old completed tasks.

**Parameters:**
- `olderThan` (number): Timestamp - remove tasks older than this

**Returns:** `Promise<number>` - Number of tasks removed

## SharedStateManager Interface

### Methods

#### setState()

```typescript
setState(
  path: string,
  value: unknown,
  options?: StateUpdateOptions
): Promise<void>
```text

Sets state value.

**Parameters:**
- `path` (string): Dot notation path
- `value` (unknown): Value to set
- `options` (StateUpdateOptions, optional): Update options

**Returns:** `Promise<void>`

#### getState()

```typescript
getState(path: string): Promise<unknown>
```text

Gets state value.

**Parameters:**
- `path` (string): Dot notation path

**Returns:** `Promise<unknown>` - State value

#### clearState()

```typescript
clearState(): Promise<void>
```text

Clears entire state.

**Returns:** `Promise<void>`

#### loadState()

```typescript
loadState(): Promise<void>
```text

Loads state from storage.

**Returns:** `Promise<void>`

#### saveState()

```typescript
saveState(): Promise<void>
```text

Saves state to storage.

**Returns:** `Promise<void>`

#### subscribe()

```typescript
subscribe(
  path: string,
  callback: (path: string, value: unknown) => void
): string
```text

Subscribes to state changes.

**Parameters:**
- `path` (string): Dot notation path
- `callback` (function): Change handler

**Returns:** `string` - Subscription ID

#### unsubscribe()

```typescript
unsubscribe(subscriptionId: string): void
```text

Unsubscribes from state changes.

**Parameters:**
- `subscriptionId` (string): Subscription ID

**Returns:** `void`

#### getFullState()

```typescript
getFullState(): Record<string, unknown>
```text

Gets entire state object.

**Returns:** `Record<string, unknown>` - Full state

#### registerAgent()

```typescript
registerAgent(
  name: string,
  agentInfo: Record<string, unknown>
): Promise<boolean>
```text

Registers agent in shared state.

**Parameters:**
- `name` (string): Agent name
- `agentInfo` (Record<string, unknown>): Agent information

**Returns:** `Promise<boolean>` - Success status

#### updateAgentStatus()

```typescript
updateAgentStatus(name: string, status: string): Promise<void>
```text

Updates agent status.

**Parameters:**
- `name` (string): Agent name
- `status` (string): New status

**Returns:** `Promise<void>`

#### watchState()

```typescript
watchState(
  path: string,
  callback: (path: string, value: unknown, metadata?: any) => void
): void
```text

Watches state changes at a specific path (alias for subscribe).

**Parameters:**
- `path` (string): Path to watch
- `callback` (function): Callback function

**Returns:** `void`

#### unwatchState()

```typescript
unwatchState(
  path: string,
  callback: (path: string, value: unknown, metadata?: any) => void
): void
```text

Unwatches state changes (alias for unsubscribe).

**Parameters:**
- `path` (string): Path to unwatch
- `callback` (function): Callback function to remove

**Returns:** `void`

#### syncState()

```typescript
syncState(
  externalState: Record<string, any>,
  strategy: string | ((local: any, external: any) => any)
): void
```text

Syncs state from external source with conflict resolution.

**Parameters:**
- `externalState` (Record<string, any>): External state to sync
- `strategy` (string | function): Resolution strategy ('last-write-wins', 'merge', or custom function)

**Returns:** `void`

#### resolveConflicts()

```typescript
resolveConflicts(
  localValue: any,
  externalValue: any,
  strategy: string | ((local: any, external: any) => any)
): any
```text

Resolves conflicts between local and external values.

**Parameters:**
- `localValue` (any): Local value
- `externalValue` (any): External value
- `strategy` (string | function): Resolution strategy

**Returns:** `any` - Resolved value

#### persistState()

```typescript
persistState(path: string): void
```text

Marks a path as persisted.

**Parameters:**
- `path` (string): Path to persist

**Returns:** `void`

#### loadPersistedState()

```typescript
loadPersistedState(state: Record<string, any>): void
```text

Loads persisted state.

**Parameters:**
- `state` (Record<string, any>): State object to load

**Returns:** `void`

#### clearEphemeralState()

```typescript
clearEphemeralState(): void
```text

Clears ephemeral (non-persisted) state.

**Returns:** `void`

## OpenAIClient Interface

### Methods

#### createCompletion()

```typescript
createCompletion(
  prompt: string,
  options?: Record<string, unknown>
): Promise<string>
```text

Creates text completion.

**Parameters:**
- `prompt` (string): Prompt text
- `options` (Record<string, unknown>, optional): Configuration

**Returns:** `Promise<string>` - Completion text

## PromptManager Interface

### Methods

#### getPrompt()

```typescript
getPrompt(
  name: string,
  variables?: Record<string, unknown>
): Promise<string>
```text

Gets prompt with variables populated.

**Parameters:**
- `name` (string): Prompt name
- `variables` (Record<string, unknown>, optional): Variables to substitute

**Returns:** `Promise<string>` - Populated prompt

#### addPrompt()

```typescript
addPrompt(name: string, template: string): Promise<void>
```text

Adds new prompt template.

**Parameters:**
- `name` (string): Prompt name
- `template` (string): Prompt template

**Returns:** `Promise<void>`

#### updatePrompt()

```typescript
updatePrompt(name: string, template: string): Promise<void>
```text

Updates existing prompt template.

**Parameters:**
- `name` (string): Prompt name
- `template` (string): New template

**Returns:** `Promise<void>`

#### deletePrompt()

```typescript
deletePrompt(name: string): Promise<void>
```text

Deletes prompt template.

**Parameters:**
- `name` (string): Prompt name

**Returns:** `Promise<void>`

#### createDefaultTemplates()

```typescript
createDefaultTemplates(): void
```text

Creates default prompt templates.

**Returns:** `void`

## Related Documentation

- [Interfaces README](./README.md)
- [Multi-Agent Coordination](../README.md)
