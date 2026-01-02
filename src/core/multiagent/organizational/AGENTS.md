# Organizational Multi-Agent System Technical Documentation

## Overview

Complete technical documentation for organizational multi-agent system classes and methods.

## AgentManager Class

### Constructor

```javascript
constructor()
```

Creates a new AgentManager instance.

### Methods

#### registerAgent()

```javascript
registerAgent(agent: UnitAgent): void
```

Registers an agent.

**Parameters:**
- `agent` (UnitAgent): Agent instance

**Returns:** `void`

**Throws:** Error if agent is not a UnitAgent instance

#### getAgentById()

```javascript
getAgentById(agentId: string): UnitAgent | undefined
```

Gets agent by ID.

**Parameters:**
- `agentId` (string): Agent ID

**Returns:** `UnitAgent | undefined` - Agent or undefined

#### getAgentForUnit()

```javascript
getAgentForUnit(unitId: string): UnitAgent | null
```

Gets agent for a unit.

**Parameters:**
- `unitId` (string): Unit ID

**Returns:** `UnitAgent | null` - Agent or null

#### getAllAgents()

```javascript
getAllAgents(): UnitAgent[]
```

Gets all registered agents.

**Returns:** `UnitAgent[]` - Array of agents

## WorkflowCoordinator Class

### Constructor

```javascript
constructor({
  unitDiscovery,
  agentManager,
  taskManager,
  sharedStateManager,
  llmClient
})
```

**Parameters:**
- `unitDiscovery` (UnitDiscovery): Unit discovery service
- `agentManager` (AgentManager): Agent manager
- `taskManager` (TaskManager): Task manager
- `sharedStateManager` (SharedStateManager): State manager
- `llmClient` (LLMClient): LLM client

### Methods

#### runCollaborativePlanning()

```javascript
async runCollaborativePlanning(config: {
  goal: string;
  workflowDefinition: Array<{
    unitName: string;
    taskDescription: string;
    outputSectionTitle: string;
  }>;
  initialPlanTitle: string;
}): Promise<object>
```

Runs collaborative planning workflow.

**Parameters:**
- `config` (object): Workflow configuration

**Returns:** `Promise<object>` - Final plan document and simulation log

#### logEvent()

```javascript
logEvent(type: string, message: string, details?: object): void
```

Logs workflow event.

**Parameters:**
- `type` (string): Event type
- `message` (string): Event message
- `details` (object, optional): Additional details

**Returns:** `void`

## LLMClient Class

### Methods

#### sendPrompt()

```javascript
async sendPrompt(prompt: string, options?: object): Promise<string>
```

Sends prompt to LLM.

**Parameters:**
- `prompt` (string): Prompt text
- `options` (object, optional): Configuration

**Returns:** `Promise<string>` - Response text

## SharedStateManager Class

### Methods

#### initializePlan()

```javascript
initializePlan(title: string): void
```

Initializes plan document.

**Parameters:**
- `title` (string): Plan title

**Returns:** `void`

#### getPlanDocument()

```javascript
getPlanDocument(): PlanDocument
```

Gets plan document.

**Returns:** `PlanDocument` - Plan document

## TaskManager Class

### Methods

#### createTask()

```javascript
createTask(taskData: object): Task
```

Creates a new task.

**Parameters:**
- `taskData` (object): Task data

**Returns:** `Task` - Created task

#### updateTask()

```javascript
updateTask(taskId: string, updates: object): void
```

Updates a task.

**Parameters:**
- `taskId` (string): Task ID
- `updates` (object): Updates

**Returns:** `void`

## UnitDiscovery Class

### Methods

#### discoverUnits()

```javascript
async discoverUnits(): Promise<OrganizationalUnit[]>
```

Discovers organizational units.

**Returns:** `Promise<OrganizationalUnit[]>` - Array of units

## Related Documentation

- [Organizational README](./README.md)
- [Multi-Agent Coordination](../README.md)
