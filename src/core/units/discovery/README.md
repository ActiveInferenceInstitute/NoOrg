# Unit Discovery System

The Unit Discovery System provides mechanisms for agents and organizational units to discover each other in the distributed system.

## Overview

This directory contains services for:
- **Agent Discovery**: Finding and tracking agents by capabilities
- **Unit Discovery**: Discovering organizational units and their relationships
- **Unit Parsing**: Parsing and understanding unit structures

## Components

### AgentDiscoveryService

Service for agent registration and discovery based on capabilities.

**Key Features:**
- Agent registration and deregistration
- Capability-based agent discovery
- Heartbeat mechanisms for agent health
- Agent status tracking
- Persistent agent registry

### UnitDiscovery

Service for discovering organizational units and their structures.

**Key Features:**
- Unit structure discovery
- Unit relationship discovery
- Unit capability discovery
- Hierarchical unit navigation

### UnitParser

Utility for parsing and understanding unit structures.

**Key Features:**
- Unit structure parsing
- Unit metadata extraction
- Unit relationship parsing

## Usage

### Agent Discovery

```typescript
import { AgentDiscoveryService } from './AgentDiscoveryService';

const discovery = AgentDiscoveryService.getInstance();

// Register an agent
await discovery.registerAgent({
  id: 'agent-001',
  name: 'Data Analyst',
  capabilities: ['data-analysis', 'statistics'],
  status: 'active',
  metadata: { maxConcurrent: 5 }
});

// Discover agents by capability
const analysts = await discovery.findAgentsByCapability('data-analysis');
```

### Unit Discovery

```typescript
import { UnitDiscovery } from './UnitDiscovery';

const unitDiscovery = new UnitDiscovery();

// Discover units
const units = await unitDiscovery.discoverUnits();
```

## Integration

The discovery system integrates with:
- **Event System**: Publishes discovery events
- **Storage System**: Persists agent and unit information
- **Orchestration**: Provides agents for task assignment

## Related Documentation

- [Discovery AGENTS.md](./AGENTS.md)
- [Orchestration System](../orchestration/README.md)
- [Units System](../../units/README.md)
