# Messaging System Technical Documentation

## Overview

The Messaging System provides structured message passing capabilities built on top of the Event System. This document provides complete technical documentation for all interfaces, classes, and methods.

## Interfaces

### Message

Represents a structured message in the system.

```typescript
interface Message {
  id: string;
  topic: string;
  payload: any;
  timestamp: number;
  metadata?: Record<string, any>;
}
```

**Properties:**
- `id` (string): Unique identifier for the message (UUID)
- `topic` (string): Message topic/category
- `payload` (any): Message data payload
- `timestamp` (number): Unix timestamp when message was created
- `metadata` (Record<string, any>, optional): Additional metadata

### MessageHandler

Function type for handling messages.

```typescript
interface MessageHandler {
  (message: Message): Promise<void> | void;
}
```

**Parameters:**
- `message` (Message): The message to handle

**Returns:** `Promise<void> | void` - Can be synchronous or asynchronous

## Classes

### MessageSystem

Main messaging system class that handles message publishing, subscription, and history.

#### Constructor

```typescript
private constructor()
```

**Note:** Constructor is private. Use `getInstance()` to obtain an instance.

#### Static Methods

##### getInstance()

```typescript
public static getInstance(): MessageSystem
```

Gets the singleton instance of MessageSystem.

**Returns:** `MessageSystem` - Singleton instance

**Example:**
```typescript
const messageSystem = MessageSystem.getInstance();
```

#### Instance Methods

##### publish()

```typescript
public async publish(
  topic: string,
  payload: any,
  metadata?: Record<string, any>
): Promise<void>
```

Publishes a message to a topic and processes all subscribed handlers.

**Parameters:**
- `topic` (string): Message topic
- `payload` (any): Message payload data
- `metadata` (Record<string, any>, optional): Additional metadata

**Returns:** `Promise<void>` - Resolves when message is published and handlers are processed

**Example:**
```typescript
await messageSystem.publish('task.completed', {
  taskId: 'task-123',
  result: 'success'
}, {
  priority: 'high',
  correlationId: 'workflow-456'
});
```

**Behavior:**
- Creates a message with UUID, topic, payload, timestamp, and metadata
- Stores message in history for the topic
- Emits message event through EventSystem
- Processes all handlers subscribed to the topic (awaits all handlers)

##### subscribe()

```typescript
public subscribe(topic: string, handler: MessageHandler): () => void
```

Subscribes a handler to a topic.

**Parameters:**
- `topic` (string): Topic to subscribe to
- `handler` (MessageHandler): Handler function

**Returns:** `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = messageSystem.subscribe('task.completed', async (message) => {
  console.log('Task completed:', message.payload);
  await processCompletion(message.payload);
});

// Later...
unsubscribe();
```

**Behavior:**
- Adds handler to the topic's handler set
- Returns a function that removes the handler when called
- Handlers can be synchronous or asynchronous

##### getMessageHistory()

```typescript
public getMessageHistory(topic: string): Message[]
```

Gets the message history for a specific topic.

**Parameters:**
- `topic` (string): Topic to get history for

**Returns:** `Message[]` - Array of messages for the topic (empty array if no messages)

**Example:**
```typescript
const messages = messageSystem.getMessageHistory('task.completed');
console.log(`Found ${messages.length} completed tasks`);
```

**Note:** Returns empty array if topic has no message history.

#### Private Methods

##### handleMessage()

```typescript
private async handleMessage(message: Message): Promise<void>
```

Internal method that processes a message through all handlers for its topic.

**Parameters:**
- `message` (Message): Message to handle

**Returns:** `Promise<void>` - Resolves when all handlers complete

**Behavior:**
- Gets all handlers for the message topic
- Executes all handlers in parallel using Promise.all
- Handlers are executed asynchronously even if they're synchronous functions

## Usage Examples

### Basic Message Publishing and Subscription

```typescript
import { MessageSystem } from './MessageSystem';

const messageSystem = MessageSystem.getInstance();

// Subscribe to messages
const unsubscribe = messageSystem.subscribe('task.completed', (message) => {
  console.log('Received message:', message.payload);
});

// Publish message
await messageSystem.publish('task.completed', {
  taskId: 'task-123',
  status: 'success'
});

// Unsubscribe when done
unsubscribe();
```

### Async Message Handlers

```typescript
messageSystem.subscribe('data.process', async (message) => {
  const result = await processData(message.payload);
  console.log('Processed:', result);
});
```

### Message History

```typescript
// Publish several messages
await messageSystem.publish('user.action', { action: 'login' });
await messageSystem.publish('user.action', { action: 'view_page' });
await messageSystem.publish('user.action', { action: 'logout' });

// Retrieve history
const history = messageSystem.getMessageHistory('user.action');
console.log(`User performed ${history.length} actions`);
```

### Multiple Handlers for Same Topic

```typescript
// Register multiple handlers
messageSystem.subscribe('system.event', (message) => {
  console.log('Handler 1:', message.payload);
});

messageSystem.subscribe('system.event', (message) => {
  console.log('Handler 2:', message.payload);
});

// Both handlers will be called when message is published
await messageSystem.publish('system.event', { event: 'startup' });
```

### Message with Metadata

```typescript
await messageSystem.publish('task.assigned', {
  taskId: 'task-123',
  agentId: 'agent-001'
}, {
  priority: 'high',
  correlationId: 'workflow-456',
  source: 'coordinator'
});
```

## Integration with Event System

The MessageSystem integrates with the EventSystem:
- Messages are emitted as events with type 'message'
- The EventSystem's event handlers can also listen to message events
- This allows for cross-system event/message handling

**Example:**
```typescript
import { EventSystem } from '../events/EventSystem';

const eventSystem = EventSystem.getInstance();

// Listen to messages via EventSystem
eventSystem.on('message', (event) => {
  const message = event.payload;
  console.log('Message via EventSystem:', message.topic);
});
```

## Error Handling

- Handler errors are not caught by MessageSystem - they propagate to the caller
- If a handler throws an error, it may affect other handlers if they're in the same Promise.all batch
- It's recommended to wrap handler logic in try-catch blocks

**Example:**
```typescript
messageSystem.subscribe('task.process', async (message) => {
  try {
    await processTask(message.payload);
  } catch (error) {
    console.error('Handler error:', error);
    // Error doesn't stop other handlers
  }
});
```

## Performance Characteristics

- **Message Publishing**: O(1) for storage, O(n) for handler execution where n = number of handlers
- **Message Subscription**: O(1) for adding handler
- **Message History Retrieval**: O(1) for getting history array
- **Memory Usage**: Grows with message history (no automatic cleanup)
- **Handler Execution**: All handlers for a topic execute in parallel

## Thread Safety

The MessageSystem is designed for single-threaded Node.js execution. For concurrent access, use appropriate synchronization mechanisms.

## Limitations

- No message persistence beyond in-memory history
- No message expiration or TTL
- No message ordering guarantees beyond timestamp
- No message delivery guarantees (fire-and-forget)
- No request-response pattern built-in
- No message filtering or routing beyond topic matching

## Related Documentation

- [Messaging System README](./README.md)
- [Event System Documentation](../events/AGENTS.md)
- [Core Systems Documentation](../README.md)
