# Event System

The Event System provides a robust publish/subscribe infrastructure for communication across the multi-agent framework.

## Overview

The Event System enables loose coupling between components by allowing them to publish events and subscribe to events of interest without direct dependencies.

## Core Components

### EventSystem

The main event system that manages event publishing, subscription, and delivery.

**Key Features:**
- Topic-based event routing
- Asynchronous event delivery
- Event persistence and history
- Subscriber management
- Error handling and recovery

**Usage:**
```typescript
import { EventSystem } from './EventSystem';

// Get singleton instance
const eventSystem = EventSystem.getInstance();

// Subscribe to events
const subscriptionId = eventSystem.subscribe('task.completed', (event) => {
  console.log('Task completed:', event.data);
});

// Publish events
eventSystem.publish('task.started', {
  taskId: '123',
  agentId: 'agent-001',
  timestamp: Date.now()
});

// Unsubscribe
eventSystem.unsubscribe(subscriptionId);
```text

## Event Types

### Event Interface
```typescript
interface Event {
  id: string;
  type: string;
  topic: string;
  data: any;
  metadata?: {
    timestamp: number;
    source: string;
    correlationId?: string;
  };
}
```text

### Event Categories
- **Task Events**: `task.created`, `task.assigned`, `task.started`, `task.completed`, `task.failed`
- **Agent Events**: `agent.registered`, `agent.status.changed`, `agent.error`
- **System Events**: `system.startup`, `system.shutdown`, `system.health.check`
- **Custom Events**: Application-specific event types

## Configuration

### EventSystem Configuration
```typescript
interface EventSystemConfig {
  enablePersistence?: boolean;
  maxEventHistory?: number;
  enableAsyncDelivery?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}
```text

## Best Practices

1. **Use Descriptive Topic Names**: Choose clear, hierarchical topic names like `agent.task.assigned`
2. **Include Correlation IDs**: For tracking related events across the system
3. **Handle Errors Gracefully**: Implement proper error handling in event handlers
4. **Keep Events Small**: Avoid large payloads in events
5. **Use Appropriate Event Types**: Distinguish between commands, events, and queries

## Monitoring

The Event System provides built-in monitoring capabilities:
- Event throughput metrics
- Subscriber health monitoring
- Failed delivery tracking
- Performance metrics

## Error Handling

The system includes comprehensive error handling:
- Subscriber error isolation
- Dead letter queue for failed events
- Circuit breaker patterns for problematic subscribers
- Retry mechanisms with exponential backoff

## Integration

The Event System integrates with:
- **Task Manager**: Publishes task lifecycle events
- **Agent Registry**: Publishes agent registration events
- **Monitoring System**: Provides event metrics
- **Storage System**: Optional event persistence

## Performance

- **Event Publishing**: O(1) - Constant time for publishing
- **Event Delivery**: O(n) where n is number of subscribers for a topic
- **Memory Usage**: Configurable event history limits
- **Throughput**: Designed for high-volume event processing

## Security

- **Event Filtering**: Subscribers only receive events they're authorized for
- **Audit Trail**: Complete event history for compliance
- **Access Control**: Integration with security framework

## Related Documentation

- [Event System API Reference](../../../docs/index.md)
- [Integration Patterns](../../../docs/core/integration/patterns/README.md)
- [Monitoring Integration](../../../docs/monitoring/monitoring-system.md)

