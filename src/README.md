# Source Code Directory

This directory contains the core source code for the multi-agent operations framework. It's organized into several subdirectories, each with a specific purpose and well-defined responsibilities.

## Directory Structure & Data Flow

```mermaid
graph TB
    subgraph "Entry Points"
        IDX[index.ts]
    end

    subgraph "Agent Layer"
        AG[agents/]
        AA[AbstractAgent.ts]
        SP[Specialized Agents]
    end

    subgraph "Core Infrastructure"
        CO[core/]
        EV[events/]
        MSG[messaging/]
        MON[monitoring/]
        STOR[storage/]
        MA[multiagent/]
        INT[integration/]
        UNITS[units/]
    end

    subgraph "Supporting Systems"
        CONF[config/]
        DIAG[diagrams/]
        DOCS[docs/]
        EX[examples/]
        PROMPTS[prompts/]
        SCRIPTS[scripts/]
        UTIL[utils/]
    end

    IDX --> AG
    IDX --> CO
    AG --> AA
    AA --> SP
    CO --> EV
    CO --> MSG
    CO --> MON
    CO --> STOR
    CO --> MA
    CO --> INT
    CO --> UNITS

    AG --> EV
    AG --> MSG
    AG --> MON
    AG --> STOR

    SP --> UTIL
    MA --> CONF
    DIAG --> UTIL
    EX --> AG
    EX --> CO
    PROMPTS --> AG

    style IDX fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style AG fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style CO fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style CONF fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
    style UTIL fill:#fff8e1,stroke:#f57f17,stroke-width:1px
```text

### Directory Descriptions

- **agents/**: Contains 16+ specialized agent implementations that serve different roles in the multi-agent system. All agents extend the `AbstractAgent` class and implement domain-specific capabilities.
- **core/**: Contains the fundamental infrastructure components including event handling, messaging, storage, monitoring, multi-agent coordination, integration patterns, and organizational units.
- **config/**: Configuration management and validation utilities for the framework.
- **diagrams/**: Utilities for generating Mermaid diagrams and system visualizations.
- **docs/**: Comprehensive documentation for the multi-agent system, specifications, and integration guides.
- **examples/**: Example implementations and demos showcasing framework usage patterns.
- **prompts/**: Contains prompt templates used by agents for various tasks and communication patterns.
- **scripts/**: Utility scripts for maintenance, auditing, and operational tasks.
- **utils/**: Common utility functions, helpers, and shared services used throughout the codebase.

## Key Components

### Agents Framework

The `agents/` directory implements various specialized agents like `ResearchAgent`, `PlanningAgent`, `AnalysisAgent`, etc. All agents inherit from the `AbstractAgent` class which provides core functionality like initialization, status management, and shared state access.

```typescript
// Example of creating a custom agent
import { AbstractAgent, AbstractAgentOptions } from './AbstractAgent';

export class CustomAgent extends AbstractAgent {
    constructor(options: AbstractAgentOptions) {
        super(options);
    }
    
    async executeTask(taskDetails: any, context?: any): Promise<any> {
        // Implementation of the task execution logic
    }
}
```text

### Core Systems

The core systems in `core/` provide fundamental infrastructure for the application:

- **events/**: Event bus for publishing and subscribing to events
- **messaging/**: Higher-level messaging system built on the event system
- **storage/**: Data persistence and retrieval
- **monitoring/**: System monitoring, metrics, and alerts
- **multiagent/**: Multi-agent coordination and shared state management
- **integration/**: Integration patterns and connectors for external systems
- **units/**: Organizational unit structures and management

See `core/README.md` for detailed information on each system.

### Examples

The `examples/` directory contains various usage examples and demos that can serve as starting points for new implementations:

- Basic agent coordination patterns
- Complex multi-agent workflows
- Organizational unit simulations
- Strategic and planning workflows

## Development Guidelines

1. **Agent Development**: When creating new agents, extend the `AbstractAgent` class and implement the required `executeTask` method.

2. **Core Systems Integration**: Use the provided core systems rather than creating new infrastructure components. Refer to `core/README.md` for usage examples.

3. **Type Safety**: Use TypeScript types and interfaces to ensure type safety throughout the codebase.

4. **Documentation**: Document all new components, classes, and functions using JSDoc comments.

5. **Examples**: Create examples for any new significant functionality to demonstrate usage patterns.

6. **Testing**: Write unit and integration tests for new components.

## Getting Started

To begin working with this codebase:

1. Explore the example implementations in `examples/`
2. Review the core systems documentation in `core/README.md`
3. Understand the agent structure in `agents/AbstractAgent.ts` and the specialized agents

## Related Documentation

- [Multi-Agent System Overview](./docs/MultiAgentSystem_README.md)
- [Multi-Agent Coordinator](./docs/MultiAgentCoordinator.md)
- [Organizational Collaboration Specification](./docs/organizational_collaboration_spec.md) 