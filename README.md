# NoOrg 

A modular framework for building resilient, scalable, and distributed multiagent systems.

https://github.com/ActiveInferenceInstitute/NoOrg

## Architecture Overview

This framework provides the core building blocks for creating systems where multiple agents can discover, communicate, and collaborate with each other to accomplish complex tasks. The architecture is designed with resilience and scalability in mind, making it suitable for production environments.

### Core Components

![Architecture Diagram](docs/architecture.png)

The framework consists of several key components:

1. **[Integration Patterns](docs/core/integration/patterns/README.md)**: Resilience-focused patterns that provide reliability for interactions between components.
2. **[Event System](docs/core/index.md#event-system)**: A central pub/sub infrastructure for communication across the system.
3. **[Storage System](docs/core/index.md#storage-system)**: Persistent and in-memory storage mechanisms for system state.
4. **[Multi-agent Framework](docs/agents/multiagent-system.md)**:
   - **[Discovery](docs/agents/modules/core/discovery.md)**: Mechanisms for agents to find each other in the system.
   - **[Orchestration](docs/agents/modules/core/orchestration.md)**: Coordination of tasks across available agents.
   - **[Relationships](docs/agents/modules/core/relationships.md)**: Management of agent connections and collaborations.
   - **[Workflow](docs/agents/modules/core/workflow.md)**: Execution of multi-step processes across agents.

## Integration Patterns

The framework includes several resilience patterns for robust communication:

- **[Circuit Breaker](docs/core/integration/patterns/README.md#circuit-breaker-pattern)**: Prevents cascading failures by stopping operations when a service is failing.
- **[Bulkhead](docs/core/integration/patterns/README.md#bulkhead-pattern)**: Isolates components to contain failures within specific boundaries.
- **[Timeout](docs/core/integration/patterns/README.md#timeout-pattern)**: Ensures operations complete within a specific time frame.
- **[Retry](docs/core/integration/patterns/README.md#retry-pattern)**: Automatically retries failed operations with configurable backoff.
- **[Rate Limiter](docs/core/integration/patterns/README.md#rate-limiter-pattern)**: Controls the rate of operations to prevent overwhelming services.
- **[Request-Response](docs/core/integration/patterns/README.md#request-response-pattern)**: Structured pattern for request handling with metadata.

For detailed documentation, see [Integration Patterns](docs/core/integration/patterns/README.md).

## Multi-agent Components

### Discovery Service

The `AgentDiscoveryService` allows agents to register themselves and discover other agents based on capabilities and status. Features include:

- [Agent registration and deregistration](docs/agents/modules/core/discovery.md#registration)
- [Capability-based discovery](docs/agents/modules/core/discovery.md#capability-matching)
- [Heartbeat mechanisms](docs/agents/modules/core/discovery.md#heartbeat)
- [Status tracking](docs/agents/modules/core/discovery.md#status-management)

### Orchestration

The `AgentOrchestrator` coordinates task assignment and execution across agents:

- [Priority-based task queue](docs/agents/modules/core/orchestration.md#task-prioritization)
- [Capability matching for task assignment](docs/agents/modules/core/orchestration.md#capability-matching)
- [Circuit breaking for unreliable agents](docs/agents/modules/core/orchestration.md#circuit-breaking)
- [Task lifecycle management](docs/agents/modules/core/orchestration.md#lifecycle)
- [Failure handling and recovery](docs/agents/modules/core/orchestration.md#failure-recovery)

### Units and Organization

The system includes organizational structures for defining hierarchies and relationships between agents, as detailed in the [Multiagent Coordination System](docs/agents/multiagent-coordination-system.md). This enables:

- [Flexible team structures](docs/agents/multiagent-coordination-system.md#coordination-engine)
- [Role-based coordination](docs/agents/multiagent-coordination-system.md#agent-registry)
- [Specialized agent groups](docs/agents/multiagent-coordination-system.md#coalition-formation)
- [Delegation patterns](docs/agents/multiagent-coordination-system.md#task-distribution)

## Event and Messaging Systems

The framework provides robust event and messaging capabilities:

- [Event emission and handling](docs/core/index.md#event-system)
- [Event persistence and history](docs/core/core-documentation.md#event-system)
- [Topic-based publish/subscribe](docs/core/index.md#operations)
- [Message metadata support](docs/core/core-documentation.md#message-system)

## Storage and State Management

For data persistence and state management, the framework includes:

- [In-memory and disk persistence](docs/core/index.md#storage-system)
- [Cache management with TTL](docs/core/core-documentation.md#storage-system)
- [Transaction support](examples/1-event-storage-example.ts)
- [Query capabilities](docs/core/core-documentation.md#storage-system)

## Monitoring and Observability

The framework provides comprehensive monitoring features:

- [Metric recording and retrieval](docs/core/README.md#monitoring-system)
- [Alert definition and management](docs/core/core-documentation.md#monitoring-system)
- [Real-time monitoring](docs/monitoring/README.md)
- [System health dashboards](docs/operations/monitoring.md)

## Getting Started

### Installation

```bash
npm install
```

### Running Examples

```bash
# Run the resilient API client example
npm run example:api-client

# Run a multi-agent workflow example
npm run example:workflow

# Run event and storage integration example
npm run example:event-storage

# Run state management example
npm run example:state
```

For a full list of examples, see the [examples directory](examples/) which includes:

1. [Event Storage Integration](examples/1-event-storage-example.ts)
2. [Relationship Management](examples/2-relationship-management-example.ts)
3. [State Management](examples/3-state-management-example.ts)
4. [Workflow Engine](examples/4-workflow-engine-example.ts)
5. [Integrated Operations](examples/5-integrated-operations-example.ts)
6. [OpenAI Agent](examples/6-openai-agent-example.ts)
7. [Multi-Unit LLM Flow](examples/7-multi-unit-llm-flow-example.ts)
8. [Hybrid Agent Workflow](examples/8-hybrid-agent-workflow-example.ts)
9. [Active Inference POMDP](examples/9-active-inference-pomdp-example.ts)

### Basic Usage

```typescript
import { 
  CircuitBreaker, 
  Retry, 
  AgentDiscoveryService, 
  AgentOrchestrator 
} from './src/core';

// Setup discovery service
const discovery = AgentDiscoveryService.getInstance();

// Register an agent
await discovery.registerAgent({
  id: 'agent-1',
  name: 'Data Processing Agent',
  capabilities: ['data-processing', 'transformation'],
  status: 'active',
  metadata: { maxConcurrent: 5 }
});

// Set up orchestrator
const orchestrator = AgentOrchestrator.getInstance();

// Submit a task
const task = await orchestrator.submitTask({
  id: 'task-1',
  type: 'data-processing',
  priority: 5,
  params: { dataUrl: 'https://example.com/data.json' },
  requiredCapabilities: ['data-processing'],
  timeout: 30000
});

// Get task status
const status = orchestrator.getTaskStatus('task-1');
console.log(`Task status: ${status.status}`);
```

## Development

### Project Structure

```
src/
├── core/
│   ├── events/         - Event system
│   ├── integration/    - Integration patterns
│   │   └── patterns/   - Resilience patterns
│   ├── messaging/      - Message formats and protocols
│   ├── monitoring/     - System monitoring
│   ├── multiagent/     - Agent interfaces and base classes
│   ├── storage/        - Storage mechanisms
│   └── units/          - Organizational units
│       ├── agents/     - Agent implementations
│       ├── discovery/  - Agent discovery
│       ├── orchestration/ - Task coordination
│       ├── relationships/ - Agent relationships
│       ├── state/      - State management
│       └── workflow/   - Workflow execution
├── examples/           - Example implementations
└── utils/              - Utility functions
```

For a complete architectural overview, see the [System Architecture Documentation](docs/architecture/system-architecture.md).

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Discovery"
```

For detailed testing documentation, see [Testing Strategy](docs/testing/README.md).

### Advanced Patterns

The framework supports advanced patterns and use cases:

- [Active Inference and POMDP models](docs/agents/architectures/active-inference.md)
- [LLM-powered agents](docs/agents/architectures/llm-agents.md)
- [Hybrid workflows](docs/agents/operations/hybrid-workflows.md)
- [Stigmergic coordination](docs/agents/multiagent-coordination-system.md#stigmergic-environment)

## Documentation

Comprehensive documentation is available:

- [Master Documentation Index](docs/master-index.md)
- [Core Documentation](docs/core/index.md)
- [Architecture Documentation](docs/architecture/system-architecture.md)
- [Agent Operations](docs/agents/operations/README.md)
- [Integration Guides](docs/integrations/README.md)

## Roadmap

- [ ] Complete agent relationship management
- [ ] Implement workflow execution engine
- [ ] Add security layers for agent authentication
- [ ] Develop monitoring dashboard
- [ ] Create deployment tools

For a complete view of planned features, see the [Development Roadmap](docs/development/roadmap.md).

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](docs/development/contributing.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.