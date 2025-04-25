# Source Code Directory

This directory contains the core source code for the multi-agent operations framework. It's organized into several subdirectories, each with a specific purpose.

## Directory Structure

- **agents/**: Contains various agent implementations that serve different roles in the multi-agent system. All agents extend the `AbstractAgent` class.
- **core/**: Contains the core systems and fundamental infrastructure components needed for the operations platform, including event handling, messaging, storage, and monitoring capabilities.
- **diagrams/**: Utilities for generating diagrams and visualizations of the system.
- **docs/**: Documentation for the multi-agent system, including specifications and integration guides.
- **examples/**: Example implementations and demos showcasing how to use the framework.
- **prompts/**: Contains prompt templates used by agents for various tasks and communication patterns.
- **scripts/**: Utility scripts for maintenance, auditing, and other operational tasks.
- **utils/**: Common utility functions and helper classes used throughout the codebase.

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
```

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