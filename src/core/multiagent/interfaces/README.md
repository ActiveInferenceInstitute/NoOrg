# Multi-Agent Interfaces

This directory contains TypeScript interfaces that define contracts for multi-agent system components.

## Overview

These interfaces provide type-safe contracts for:
- Agent registration and discovery
- Task management
- Shared state management
- OpenAI client interactions
- Prompt template management

## Interfaces

### AgentRegistry

Interface for agent registration and discovery.

**Key Methods:**
- `registerAgent()` - Register a new agent
- `unregisterAgent()` - Remove an agent
- `getAgent()` - Get agent by ID
- `findAgentsByCapability()` - Find agents by capability
- `listAgents()` - List all agents with filtering

### TaskManager

Interface for task lifecycle management.

**Key Methods:**
- `createTask()` - Create a new task
- `assignTask()` - Assign task to agent
- `unassignTask()` - Unassign task from agent
- `reassignTask()` - Reassign task to different agent
- `updateTask()` - Update task properties
- `startTask()` - Start task execution
- `completeTask()` - Mark task as completed
- `failTask()` - Mark task as failed
- `cancelTask()` - Cancel a task
- `getTask()` - Get task by ID
- `listTasks()` - List tasks with filtering
- `getReadyTasks()` - Get tasks ready for execution
- `countTasksByStatus()` - Count tasks by status
- `areDependenciesSatisfied()` - Check task dependencies
- `getTaskHistory()` - Get task history
- `estimateTaskDuration()` - Estimate task duration
- `getTaskStatistics()` - Get task statistics
- `cleanupOldTasks()` - Clean up old tasks

### SharedStateManager

Interface for shared state management.

**Key Methods:**
- `setState()` - Set state value
- `getState()` - Get state value
- `getFullState()` - Get entire state object
- `subscribe()` - Subscribe to state changes
- `unsubscribe()` - Unsubscribe from state changes
- `watchState()` - Watch state changes (alias for subscribe)
- `unwatchState()` - Unwatch state changes (alias for unsubscribe)
- `syncState()` - Sync state from external source
- `resolveConflicts()` - Resolve state conflicts
- `persistState()` - Mark path as persisted
- `loadPersistedState()` - Load persisted state
- `clearEphemeralState()` - Clear non-persisted state
- `clearState()` - Clear all state
- `loadState()` - Load state from storage
- `saveState()` - Persist state to storage
- `registerAgent()` - Register agent in shared state
- `updateAgentStatus()` - Update agent status
- `configurePersistence()` - Configure persistence settings

### OpenAIClient

Interface for OpenAI API interactions.

**Key Methods:**
- `createCompletion()` - Create text completion

### PromptManager

Interface for prompt template management.

**Key Methods:**
- `getPrompt()` - Get prompt with variables
- `addPrompt()` - Add new prompt template
- `updatePrompt()` - Update existing template
- `deletePrompt()` - Delete prompt template

## Usage

These interfaces are implemented by concrete classes in the multiagent system:

```typescript
import { AgentRegistry } from './interfaces/AgentRegistry';
import { AgentRegistry as AgentRegistryImpl } from '../AgentRegistry';

const registry: AgentRegistry = new AgentRegistryImpl();
await registry.registerAgent(agent);
```text

## Related Documentation

- [Interfaces AGENTS.md](./AGENTS.md)
- [Multi-Agent Coordination](../README.md)
