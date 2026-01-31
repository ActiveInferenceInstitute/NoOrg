# Organizational Multi-Agent System

This directory contains JavaScript implementations for organizational unit management and workflow coordination.

## Overview

This directory provides:
- **Agent Management**: Managing agents for organizational units
- **LLM Client**: Language model client for agents
- **Shared State Management**: State synchronization across units
- **Task Management**: Task coordination for units
- **Unit Discovery**: Discovering organizational units
- **Workflow Coordination**: Coordinating workflows across units

## Components

### AgentManager

Manages agents associated with organizational units.

**Key Features:**
- Agent registration
- Unit-agent mapping
- Agent retrieval

### LLMClient

Client for language model interactions.

**Key Features:**
- Prompt sending
- Response handling
- Model configuration

### SharedStateManager

Manages shared state for organizational units.

**Key Features:**
- State synchronization
- Plan document management
- State persistence

### TaskManager

Manages tasks for organizational units.

**Key Features:**
- Task creation
- Task assignment
- Task status tracking

### UnitDiscovery

Discovers organizational units.

**Key Features:**
- Unit structure discovery
- Unit relationship discovery

### WorkflowCoordinator

Coordinates workflows across organizational units.

**Key Features:**
- Collaborative planning
- Sequential workflow execution
- Result aggregation

## Usage

### Agent Management

```javascript
const agentManager = new AgentManager();

agentManager.registerAgent(agent);
const agent = agentManager.getAgentById('agent-001');
```text

### Workflow Coordination

```javascript
const coordinator = new WorkflowCoordinator({
  unitDiscovery,
  agentManager,
  taskManager,
  sharedStateManager,
  llmClient
});

const result = await coordinator.runCollaborativePlanning({
  goal: 'Develop new product',
  workflowDefinition: [...],
  initialPlanTitle: 'Product Development Plan'
});
```text

## Related Documentation

- [Organizational AGENTS.md](./AGENTS.md)
- [Multi-Agent Coordination](../README.md)
