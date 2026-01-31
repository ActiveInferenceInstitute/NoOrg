# Unit Orchestration System

The Unit Orchestration System provides task coordination and execution across organizational units and agents.

## Overview

This directory contains orchestrators for:
- **Agent Orchestration**: Coordinating tasks across multiple agents
- **Task Orchestration**: Managing task lifecycle and execution

## Components

### AgentOrchestrator

Orchestrates task assignment and execution across agents.

**Key Features:**
- Priority-based task queue
- Capability matching for task assignment
- Circuit breaker for unreliable agents
- Task lifecycle management
- Failure handling and recovery

### TaskOrchestrator

Manages task execution and coordination.

**Key Features:**
- Task scheduling
- Dependency management
- Task state tracking
- Result aggregation

## Usage

### Agent Orchestration

```typescript
import { AgentOrchestrator } from './AgentOrchestrator';

const orchestrator = AgentOrchestrator.getInstance();

// Submit task
const task = await orchestrator.submitTask({
  id: 'task-001',
  type: 'data-analysis',
  priority: 5,
  params: { dataset: 'sales-data' },
  requiredCapabilities: ['data-analysis']
});

// Get task status
const status = orchestrator.getTaskStatus('task-001');
```text

## Integration

The orchestration system integrates with:
- **Discovery Service**: Finds agents by capability
- **Event System**: Publishes orchestration events
- **Storage System**: Persists task state
- **Integration Patterns**: Uses circuit breaker and retry

## Related Documentation

- [Orchestration AGENTS.md](./AGENTS.md)
- [Discovery System](../discovery/README.md)
- [Units System](../../units/README.md)
