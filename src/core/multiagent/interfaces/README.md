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
- `startTask()` - Start task execution
- `completeTask()` - Mark task as completed
- `failTask()` - Mark task as failed
- `getTask()` - Get task by ID

### SharedStateManager

Interface for shared state management.

**Key Methods:**
- `setState()` - Set state value
- `getState()` - Get state value
- `subscribe()` - Subscribe to state changes
- `clearState()` - Clear all state
- `saveState()` - Persist state

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
```

## Related Documentation

- [Interfaces AGENTS.md](./AGENTS.md)
- [Multi-Agent Coordination](../README.md)
