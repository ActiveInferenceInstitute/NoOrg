# Core Systems

The Core Systems provide the fundamental infrastructure for the NoOrg Multi-Agent Framework. This directory contains the essential building blocks that enable agent coordination, communication, monitoring, and data management.

## Overview

The core systems are designed to be:
- **Modular**: Each system can function independently
- **Scalable**: Built for high-performance, distributed operations
- **Resilient**: Include comprehensive error handling and recovery
- **Observable**: Provide extensive monitoring and metrics
- **Secure**: Include security measures and access controls

## Core Components Architecture

```mermaid
graph TB
    subgraph "Core Systems"
        EV[Event System]
        MSG[Message System]
        MON[Monitoring System]
        STOR[Storage System]
        MA[Multi-Agent Coordination]
        UNITS[Units System]
    end

    subgraph "Integration Patterns"
        CB[Circuit Breaker]
        RETRY[Retry]
        TIMEOUT[Timeout]
        BULK[Bulkhead]
        RATE[Rate Limiter]
        CACHE[Cache Aside]
        SAGA[Saga]
        RR[Request-Response]
    end

    subgraph "Data Flow"
        AGENTS[Agents] --> MA
        MA --> EV
        MA --> MSG
        MA --> STOR
        EV --> MON
        MSG --> MON
        STOR --> MON
        MA --> MON
        UNITS --> MA

        MA --> CB
        MA --> RETRY
        MA --> TIMEOUT
        MA --> BULK
        MA --> RATE
        MA --> CACHE
        MA --> SAGA
        MA --> RR
    end

    style MA fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style EV fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style MSG fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style MON fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    style STOR fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    style UNITS fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```text

### Core Components

#### Event System (`events/`)
Publish/subscribe messaging infrastructure for decoupled communication.

**Key Features:**
- Topic-based event routing
- Asynchronous event delivery
- Event persistence and history
- Subscriber management
- Error handling and recovery

**Usage:**
```typescript
import { EventSystem } from './events/EventSystem';

const eventSystem = EventSystem.getInstance();

// Subscribe to events
eventSystem.subscribe('task.completed', (event) => {
  console.log('Task completed:', event.data);
});

// Publish events
eventSystem.publish('task.started', {
  taskId: '123',
  timestamp: Date.now()
});
```text

### Message System (`messaging/`)
Structured message passing for sophisticated communication patterns.

**Key Features:**
- Structured message formats
- Request-response patterns
- Message routing and delivery
- Message persistence and queuing
- Transformation and filtering

**Usage:**
```typescript
import { MessageSystem } from './messaging/MessageSystem';

const messageSystem = MessageSystem.getInstance();

// Send structured messages
await messageSystem.sendMessage({
  id: 'msg-123',
  type: 'task.request',
  from: 'agent-001',
  to: 'coordinator',
  subject: 'Process Task',
  body: { taskId: 'task-456' }
});
```text

### Monitoring System (`monitoring/`)
Comprehensive observability and alerting system.

**Key Features:**
- Real-time metrics collection
- Health check automation
- Alert definition and management
- Performance monitoring
- System health dashboards

**Usage:**
```typescript
import { MonitoringSystem } from './monitoring/MonitoringSystem';

const monitoring = MonitoringSystem.getInstance();

// Record metrics
monitoring.recordMetric('agent.response.time', 150);

// Set up health checks
monitoring.registerHealthCheck('database', async () => {
  return await checkDatabaseHealth();
});
```text

### Storage System (`storage/`)
Flexible data persistence with multiple backend support.

**Key Features:**
- Multiple storage backends (memory, file, database)
- Data serialization and compression
- Cache management with TTL
- Transaction support
- Query capabilities

**Usage:**
```typescript
import { StorageSystem } from './storage/StorageSystem';

const storage = StorageSystem.getInstance();

// Store and retrieve data
await storage.set('user.profile', userData);
const profile = await storage.get('user.profile');
```text

### Multi-Agent Coordination (`multiagent/`)
Central coordination system for managing multiple agents.

**Key Features:**
- Agent registration and discovery
- Task distribution and scheduling
- State synchronization
- Workflow execution control
- Error handling and recovery

**Usage:**
```typescript
import { MultiAgentCoordinator } from './multiagent/MultiAgentCoordinator';

const coordinator = new MultiAgentCoordinator();

// Register agents
await coordinator.registerAgent(analysisAgent);

// Submit and manage tasks
const taskId = await coordinator.submitTask(taskDetails);
```text

### Units System (`units/`)
Organizational structure and unit management.

**Key Features:**
- Hierarchical unit organization
- Unit composition and relationships
- Agent deployment and management
- Workflow orchestration
- State management

**Usage:**
```typescript
import { OrganizationalStructureManager } from './units/OrganizationalStructureManager';

const unitManager = OrganizationalStructureManager.getInstance();

// Create and manage organizational units
const unit = await unitManager.createUnit('Research', 'Research Department');
```text

## Integration Patterns (`integration/patterns/`)

Resilience-focused patterns for reliable system integration:

- **Circuit Breaker**: Prevents cascading failures
- **Retry**: Automatic retry with backoff strategies
- **Timeout**: Ensures operations complete within time limits
- **Bulkhead**: Isolates components to contain failures
- **Rate Limiter**: Controls operation rates
- **Cache Aside**: Loads data on demand with caching
- **Saga**: Manages long-running transactions
- **Request-Response**: Structured request handling

## Architecture

### Design Principles
1. **Modularity**: Each system is independently deployable
2. **Resilience**: Built-in error handling and recovery
3. **Observability**: Comprehensive monitoring and metrics
4. **Performance**: Optimized for high-throughput operations
5. **Security**: Access controls and data protection

### Communication Patterns
- **Event-Driven**: Components communicate via events
- **Message-Based**: Structured message passing
- **Shared State**: Coordinated state management
- **Service Discovery**: Dynamic component discovery

### Data Flow
```text
Agents ↔ MultiAgentCoordinator ↔ Event/Message Systems ↔ Storage/Monitoring
```text

## Configuration

### Environment Configuration
```bash
# Core system settings
NODE_ENV=production
LOG_LEVEL=info

# Event system
EVENT_PERSISTENCE_ENABLED=false
EVENT_HISTORY_SIZE=1000

# Message system
MESSAGE_QUEUE_SIZE=1000
MESSAGE_TIMEOUT=30000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Storage
STORAGE_BACKEND=memory
STORAGE_MAX_SIZE=1GB
```text

### Programmatic Configuration
```typescript
// Configure core systems
const config = {
  eventSystem: { persistence: false },
  messageSystem: { queueSize: 1000 },
  monitoring: { metrics: true },
  storage: { backend: 'memory' }
};
```text

## Integration

### Component Dependencies
- **Event System**: Foundation for all communication
- **Message System**: Builds on event system for structured communication
- **Monitoring**: Observes all system components
- **Storage**: Persists state for all components
- **Multi-Agent Coordinator**: Orchestrates agent interactions
- **Units**: Provides organizational structure

### External Integrations
- **OpenAI API**: For agent language model capabilities
- **Database Systems**: For persistent storage
- **Monitoring Tools**: Grafana, Prometheus integration
- **External APIs**: REST and webhook integrations

## Performance

### Benchmarks
- **Event Throughput**: 10,000+ events/second
- **Message Processing**: 1,000+ messages/second
- **Storage Operations**: 5,000+ operations/second
- **Monitoring Overhead**: < 1% performance impact

### Scalability
- **Horizontal Scaling**: Support for multiple instances
- **Load Balancing**: Automatic request distribution
- **Resource Management**: Memory and CPU optimization
- **Caching**: Intelligent caching strategies

## Security

### Built-in Security
- **Access Control**: Role-based permissions
- **Data Encryption**: At-rest and in-transit encryption
- **Audit Logging**: Complete operation audit trails
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Configurable request throttling

### Security Best Practices
- Implement proper authentication for external access
- Use secure communication channels (HTTPS, TLS)
- Regularly update dependencies for security patches
- Monitor for security anomalies and threats
- Implement proper secret management

## Testing

### Test Coverage
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Performance Tests**: Scalability and efficiency validation
- **Security Tests**: Vulnerability and threat testing

### Running Tests
```bash
# Test all core systems
npm run test:core

# Test specific systems
npm test tests/unit/core/test_event_system.ts
npm test tests/unit/core/test_storage_system.ts
```text

## Development

### Adding New Components
1. **Interface Design**: Define clear component interfaces
2. **Implementation**: Follow established patterns
3. **Testing**: Add comprehensive test coverage
4. **Documentation**: Create detailed README files
5. **Integration**: Ensure proper integration with existing systems

### Best Practices
1. **Error Handling**: Implement comprehensive error handling
2. **Logging**: Use structured logging with context
3. **Monitoring**: Add appropriate metrics and health checks
4. **Performance**: Optimize for concurrent operations
5. **Security**: Follow security best practices

## Related Documentation

- [System Architecture](../../docs/system/system-architecture.md)
- [Integration Patterns](../../README.md)
- [Event System](../../README.md)
- [Message System](../../README.md)
- [Monitoring System](../../README.md)
- [Storage System](../../README.md)
- [Multi-Agent Coordination](../../README.md)