# Messaging System

The Messaging System provides structured message passing capabilities for the multi-agent framework, building on top of the Event System for more sophisticated communication patterns.

## Overview

The Messaging System enables agents and components to communicate using structured messages with metadata, routing, and delivery guarantees. It provides higher-level abstractions over the basic Event System.

## Core Components

### MessageSystem

The main messaging system that handles message routing, delivery, and processing.

**Key Features:**
- Structured message formats
- Message routing and delivery
- Message persistence and queuing
- Request-response patterns
- Message transformation and filtering

**Usage:**
```typescript
import { MessageSystem } from './MessageSystem';

// Get singleton instance
const messageSystem = MessageSystem.getInstance();

// Send a message
await messageSystem.sendMessage({
  id: 'msg-123',
  type: 'task.request',
  from: 'agent-001',
  to: 'coordinator',
  subject: 'Process Task',
  body: { taskId: 'task-456' },
  metadata: {
    priority: 'high',
    correlationId: 'corr-789'
  }
});

// Listen for messages
messageSystem.onMessage('task.request', async (message) => {
  console.log('Received task request:', message.body);
  // Process the message
  return { status: 'acknowledged' };
});
```

## Message Structure

### Message Interface
```typescript
interface Message {
  id: string;
  type: string;
  from: string;
  to: string;
  subject: string;
  body: any;
  metadata?: {
    timestamp: number;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    correlationId?: string;
    replyTo?: string;
    expiresAt?: number;
    tags?: string[];
  };
}
```

### Message Types
- **Task Messages**: `task.request`, `task.response`, `task.error`
- **Agent Messages**: `agent.capability.request`, `agent.status.update`
- **System Messages**: `system.health.check`, `system.configuration.update`
- **Custom Messages**: Application-specific message types

## Message Patterns

### Request-Response Pattern
```typescript
// Send request
const response = await messageSystem.sendRequest('agent-002', {
  type: 'data.analysis',
  body: { dataset: data }
});

// Handle response
console.log('Analysis result:', response.body);
```

### Publish-Subscribe Pattern
```typescript
// Subscribe to topic
messageSystem.subscribe('data.updates', (message) => {
  console.log('Data update:', message.body);
});

// Publish to topic
messageSystem.publish('data.updates', {
  body: { newData: processedData }
});
```

### Broadcast Pattern
```typescript
// Broadcast to all agents
await messageSystem.broadcast({
  type: 'system.notification',
  subject: 'System Maintenance',
  body: { message: 'Scheduled maintenance in 1 hour' }
});
```

## Configuration

### MessageSystem Configuration
```typescript
interface MessageSystemConfig {
  enablePersistence?: boolean;
  maxMessageQueueSize?: number;
  enableMessageTransformation?: boolean;
  defaultMessageTimeout?: number;
  maxRetries?: number;
}
```

## Message Processing

### Message Handlers
```typescript
// Register message handler
messageSystem.registerHandler('task.request', async (message) => {
  try {
    // Process the message
    const result = await processTaskRequest(message.body);

    // Send response
    return {
      type: 'task.response',
      body: result
    };
  } catch (error) {
    // Send error response
    throw new MessageProcessingError('Failed to process task', error);
  }
});
```

### Message Transformation
```typescript
// Register message transformer
messageSystem.registerTransformer('legacy.format', (message) => {
  // Transform legacy message format to current format
  return {
    ...message,
    body: transformLegacyData(message.body)
  };
});
```

## Error Handling

The system includes comprehensive error handling:
- **MessageProcessingError**: Errors during message processing
- **MessageDeliveryError**: Failures in message delivery
- **MessageTimeoutError**: Messages that exceed timeout limits
- **MessageValidationError**: Invalid message formats

## Performance

- **Message Routing**: O(1) for direct messages, O(n) for topic-based routing
- **Message Persistence**: Configurable persistence levels
- **Throughput**: Optimized for high-volume messaging
- **Latency**: Sub-millisecond for in-memory operations

## Monitoring

Built-in monitoring capabilities:
- Message throughput metrics
- Queue depth monitoring
- Processing time tracking
- Error rate monitoring
- Delivery success rates

## Security

- **Message Encryption**: Optional message body encryption
- **Access Control**: Authorization for message access
- **Audit Logging**: Complete message history for compliance
- **Message Filtering**: Content-based filtering for sensitive data

## Integration

The Messaging System integrates with:
- **Event System**: Uses events for message delivery notifications
- **Task Manager**: Handles task-related message flows
- **Agent Registry**: Routes messages to appropriate agents
- **Storage System**: Optional message persistence

## Best Practices

1. **Use Correlation IDs**: Track related messages across the system
2. **Set Appropriate Priorities**: Use priority levels effectively
3. **Handle Timeouts**: Implement proper timeout handling for long-running operations
4. **Validate Messages**: Always validate message formats and content
5. **Use Structured Message Bodies**: Prefer structured data over plain text

## Advanced Features

### Message Queues
```typescript
// Create named queue
const queue = messageSystem.createQueue('high-priority-tasks');

// Add message to queue
await queue.enqueue(message);

// Process messages from queue
await queue.process(async (message) => {
  await processHighPriorityTask(message);
});
```

### Message Filtering
```typescript
// Register message filter
messageSystem.registerFilter('sensitive-data', (message) => {
  // Filter out sensitive information
  return sanitizeMessage(message);
});
```

### Message Batching
```typescript
// Enable message batching
messageSystem.enableBatching('data.updates', {
  batchSize: 10,
  timeout: 5000
});
```

## Related Documentation

- [Message System API Reference](../../docs/core/index.md)
- [Event System Integration](../events/README.md)
- [Integration Patterns](../../../docs/core/integration/patterns/README.md)
