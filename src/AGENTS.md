# Source Code Architecture Technical Documentation

## Overview

This directory contains the complete source code implementation of the NoOrg multi-agent framework. The architecture is organized into logical modules providing comprehensive multi-agent coordination, state management, and distributed computing capabilities.

## Directory Structure

```
src/
├── index.ts              # Main entry point
├── agents/               # Agent implementations
├── core/                 # Core infrastructure
├── prompts/              # Prompt templates
├── examples/             # Usage examples
├── utils/                # Utility functions
├── scripts/              # Build and maintenance scripts
├── docs/                 # Documentation
├── diagrams/             # Diagram generation utilities
├── config/               # Configuration management
└── AGENTS.md            # This file
```

## Core Components

### Entry Point (`index.ts`)

Main application entry point providing:
- Coordinator initialization
- Health check endpoints
- Graceful shutdown handling

```typescript
import { MultiAgentCoordinator } from './core/multiagent/MultiAgentCoordinator';

async function main() {
  const coordinator = MultiAgentCoordinator.getInstance();
  await coordinator.initialize();
  await coordinator.start();
}
```

### Agent Framework (`agents/`)

16+ specialized agent implementations:
- **AbstractAgent**: Base class for all agents
- **Domain Agents**: Research, Analysis, Writing, Development, etc.
- **Specialized Agents**: Active Inference, Customer Support, etc.

#### Key Interfaces
```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: string;
  metadata?: Record<string, any>;
  preferredModel?: string;
  lastActive: number;
  createdAt: number;
}
```

### Core Infrastructure (`core/`)

#### Multi-Agent Coordination (`multiagent/`)
- **MultiAgentCoordinator**: Main coordination engine
- **AgentRegistry**: Agent registration and discovery
- **TaskManager**: Task scheduling and execution
- **SharedStateManager**: Distributed state management

#### Event System (`events/`)
- **EventSystem**: Publish/subscribe event infrastructure
- **EventDefinition**: Structured event format
- **EventFilter**: Query and filter events

#### Communication (`messaging/`)
- **MessageSystem**: Inter-agent communication protocols
- **LLMClientInterface**: Standardized LLM integration

#### Monitoring (`monitoring/`)
- **MonitoringSystem**: System health and metrics
- **HealthCheckManager**: Automated health checks

#### Storage (`storage/`)
- **StorageSystem**: Persistent data storage
- **File-based and in-memory backends**

#### Integration Patterns (`integration/`)
- **CircuitBreaker**: Fault tolerance patterns
- **Retry**: Automatic retry mechanisms
- **RateLimiter**: Request rate limiting
- **Bulkhead**: Resource isolation

#### Units (`units/`)
- **Organizational Units**: Hierarchical agent organization
- **Unit Discovery**: Automatic unit detection
- **Relationship Management**: Inter-unit relationships

### Utility Systems (`utils/`)

#### Internationalization (`internationalization/`)
- **i18n**: Multi-language support utilities

#### Visualization (`visualization/`)
- **WorkflowVisualizer**: Process flow visualization
- **DataVisualization**: Analytics and reporting

### Configuration (`config/`)
- **Configuration validation**
- **Environment variable management**
- **Runtime configuration**

## Key APIs

### Coordinator API

```typescript
interface MultiAgentCoordinator {
  // Lifecycle
  initialize(): Promise<boolean>;
  start(): Promise<boolean>;
  stop(): Promise<boolean>;

  // Agent Management
  registerAgent(agent: Agent): Promise<string | null>;
  unregisterAgent(agentId: string): Promise<boolean>;

  // Task Management
  submitTask(task: Partial<Task>): Promise<string>;
  getTask(taskId: string): Promise<Task | null>;
  completeTask(taskId: string, agentId: string): Promise<void>;

  // Workflow Execution
  executeWorkflow(workflow: WorkflowDefinition): Promise<any>;
}
```

### Agent Registry API

```typescript
interface AgentRegistry {
  registerAgent(agent: Agent): Promise<boolean>;
  unregisterAgent(agentId: string): Promise<boolean>;
  findAgentsByCapability(capability: string): Promise<Agent[]>;
  findAgentsByType(type: string): Promise<Agent[]>;
  getAgent(agentId: string): Promise<Agent | null>;
}
```

### Shared State API

```typescript
interface SharedStateManager {
  getState(path: string): Promise<unknown>;
  setState(path: string, value: unknown, options?: StateUpdateOptions): Promise<void>;
  subscribe(path: string, callback: StateChangeCallback): () => void;
  clearState(): Promise<void>;
}
```

### Event System API

```typescript
interface EventSystem {
  emit(type: string, payload: any, options?: EventOptions): EventDefinition;
  publish(type: string, payload: any, options?: EventOptions): EventDefinition;
  on(type: string, handler: EventHandler): void;
  subscribe(options: EventSubscriptionOptions, handler: EventHandler): () => void;
  getEventHistory(type: string): EventDefinition[];
  findEvents(filter: EventFilter): EventDefinition[];
}
```

## Architecture Patterns

### Singleton Pattern
Core services use singleton pattern for consistency:
```typescript
class SharedStateManager {
  private static instance: SharedStateManager;
  public static getInstance(): SharedStateManager {
    if (!SharedStateManager.instance) {
      SharedStateManager.instance = new SharedStateManager();
    }
    return SharedStateManager.instance;
  }
}
```

### Observer Pattern
Event system implements publish/subscribe:
```typescript
eventSystem.on('task.completed', (event) => {
  console.log('Task completed:', event.payload);
});
```

### Strategy Pattern
Multiple coordination strategies:
```typescript
interface CoordinationStrategy {
  execute(context: StrategyContext): Promise<StrategyResult>;
}
```

### Factory Pattern
Agent creation and management:
```typescript
class AgentFactory {
  static createAgent(type: string, config: AgentConfig): Agent {
    switch (type) {
      case 'research': return new ResearchAgent(config);
      case 'analysis': return new AnalysisAgent(config);
      // ...
    }
  }
}
```

## Data Flow

### Task Execution Flow
1. **Task Submission**: Client submits task to coordinator
2. **Agent Discovery**: Coordinator finds suitable agents
3. **Task Assignment**: Task assigned to available agent
4. **Execution**: Agent processes task using LLM
5. **State Updates**: Results stored in shared state
6. **Event Emission**: Completion events published
7. **Response**: Results returned to client

### Agent Communication Flow
1. **Registration**: Agents register with coordinator
2. **Discovery**: Agents discover each other via registry
3. **Coordination**: Agents coordinate via shared state
4. **Event Exchange**: Agents communicate via event system
5. **Task Handover**: Agents pass work via task system

## Performance Characteristics

### Scalability
- **Horizontal Scaling**: Multiple coordinator instances
- **Agent Pool**: Dynamic agent registration/deregistration
- **Load Balancing**: Automatic task distribution

### Reliability
- **Fault Tolerance**: Circuit breakers and retries
- **State Persistence**: Durable state management
- **Health Monitoring**: Automated failure detection

### Efficiency
- **Caching**: Request and response caching
- **Connection Pooling**: Optimized external API usage
- **Async Processing**: Non-blocking operations

## Security Considerations

### Input Validation
- All external inputs validated and sanitized
- Type-safe interfaces prevent injection attacks
- Parameter validation at API boundaries

### Access Control
- Agent authentication and authorization
- Task execution permissions
- State access controls

### Secure Communication
- Encrypted data transmission
- Secure API key management
- Audit logging for sensitive operations

## Development Guidelines

### Code Organization
- **Modular Architecture**: Clear separation of concerns
- **Type Safety**: Comprehensive TypeScript usage
- **Documentation**: Inline JSDoc and external docs

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Multi-component workflows
- **End-to-End Tests**: Complete system validation

### Error Handling
- **Graceful Degradation**: Failures don't crash system
- **Comprehensive Logging**: Detailed error reporting
- **Recovery Mechanisms**: Automatic error recovery

## Build and Deployment

### Build Process
```bash
npm run build        # TypeScript compilation
npm run type-check   # Type validation
npm run lint         # Code quality checks
npm test            # Test execution
```

### Production Deployment
```bash
npm run build
NODE_ENV=production npm start
```

### Docker Deployment
```bash
docker build -t noorg/multiagent-framework .
docker run -p 3000:3000 noorg/multiagent-framework
```

## Monitoring and Observability

### Metrics Collection
- **Performance Metrics**: Response times, throughput
- **Health Metrics**: System status, error rates
- **Business Metrics**: Task completion rates

### Logging
- **Structured Logging**: JSON format with context
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Rotation**: Automatic log file management

### Alerting
- **Health Check Alerts**: System health monitoring
- **Performance Alerts**: Threshold-based notifications
- **Error Alerts**: Critical error notifications

## Related Documentation

- **User Guide**: `../README.md`
- **API Reference**: `../docs/`
- **Architecture**: `../docs/architecture/`
- **Examples**: `./examples/README.md`
- **Contributing**: `../CONTRIBUTING.md`