# Event System Technical Documentation

## Overview

The Event System provides a publish/subscribe infrastructure for decoupled communication across the NoOrg Multi-Agent Framework. This document provides complete technical documentation for all interfaces, classes, and methods.

## Interfaces

### EventDefinition

Represents a single event in the system.

```typescript
interface EventDefinition {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  correlationId?: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}
```text

**Properties:**
- `id` (string): Unique identifier for the event
- `type` (string): Event type/category
- `payload` (any): Event data payload
- `timestamp` (number): Unix timestamp when event was created
- `correlationId` (string, optional): ID for correlating related events
- `sourceId` (string, optional): ID of the event source
- `metadata` (Record<string, any>, optional): Additional metadata

### EventFilter

Filter criteria for querying events.

```typescript
interface EventFilter {
  type?: string | RegExp;
  correlationId?: string;
  sourceId?: string;
  timestampFrom?: number;
  timestampTo?: number;
  metadataFilter?: Record<string, any>;
}
```text

**Properties:**
- `type` (string | RegExp, optional): Event type filter (exact match or regex)
- `correlationId` (string, optional): Filter by correlation ID
- `sourceId` (string, optional): Filter by source ID
- `timestampFrom` (number, optional): Start timestamp for range filter
- `timestampTo` (number, optional): End timestamp for range filter
- `metadataFilter` (Record<string, any>, optional): Metadata key-value filters

### EventSubscriptionOptions

Options for event subscriptions.

```typescript
interface EventSubscriptionOptions {
  filter?: EventFilter;
  onlyFuture?: boolean;
  persist?: boolean;
  subscriptionId?: string;
}
```text

**Properties:**
- `filter` (EventFilter, optional): Filter criteria for subscription
- `onlyFuture` (boolean, optional): If true, only receive future events (default: false)
- `persist` (boolean, optional): Whether to persist subscription
- `subscriptionId` (string, optional): Custom subscription ID

### EventPersistenceOptions

Configuration for event persistence.

```typescript
interface EventPersistenceOptions {
  enabled: boolean;
  storageDirectory?: string;
  maxEventsPerType?: number;
}
```text

**Properties:**
- `enabled` (boolean): Whether persistence is enabled
- `storageDirectory` (string, optional): Directory for storing persisted events
- `maxEventsPerType` (number, optional): Maximum events to store per type

## Classes

### EventSystem

Main event system class implementing publish/subscribe pattern.

#### Constructor

```typescript
private constructor(persistenceOptions: EventPersistenceOptions = { enabled: false })
```text

**Parameters:**
- `persistenceOptions` (EventPersistenceOptions, optional): Persistence configuration

**Note:** Constructor is private. Use `getInstance()` to obtain an instance.

#### Static Methods

##### getInstance()

```typescript
public static getInstance(persistenceOptions?: EventPersistenceOptions): EventSystem
```text

Gets the singleton instance of EventSystem.

**Parameters:**
- `persistenceOptions` (EventPersistenceOptions, optional): Persistence configuration (only used on first call)

**Returns:** `EventSystem` - Singleton instance

**Example:**
```typescript
const eventSystem = EventSystem.getInstance({
  enabled: true,
  storageDirectory: './events',
  maxEventsPerType: 1000
});
```text

#### Instance Methods

##### emit()

```typescript
public emit(
  type: string,
  payload: any,
  options?: {
    correlationId?: string;
    sourceId?: string;
    metadata?: Record<string, any>;
  }
): EventDefinition
```text

Emits an event to all subscribers.

**Parameters:**
- `type` (string): Event type/category
- `payload` (any): Event data
- `options` (object, optional): Event options
  - `correlationId` (string, optional): Correlation ID for related events
  - `sourceId` (string, optional): Source identifier
  - `metadata` (Record<string, any>, optional): Additional metadata

**Returns:** `EventDefinition` - The created event

**Example:**
```typescript
const event = eventSystem.emit('task.completed', {
  taskId: 'task-123',
  result: 'success'
}, {
  correlationId: 'workflow-456',
  sourceId: 'agent-001',
  metadata: { priority: 'high' }
});
```text

##### on()

```typescript
public on(type: string, handler: (event: EventDefinition) => void): void
```text

Registers a handler for a specific event type.

**Parameters:**
- `type` (string): Event type to listen for
- `handler` (function): Handler function receiving EventDefinition

**Returns:** `void`

**Example:**
```typescript
eventSystem.on('task.completed', (event) => {
  console.log('Task completed:', event.payload);
});
```text

##### off()

```typescript
public off(type: string, handler: (event: EventDefinition) => void): void
```text

Removes a handler for a specific event type.

**Parameters:**
- `type` (string): Event type
- `handler` (function): Handler function to remove

**Returns:** `void`

**Example:**
```typescript
const handler = (event) => console.log(event);
eventSystem.on('task.completed', handler);
// Later...
eventSystem.off('task.completed', handler);
```text

##### getEventHistory()

```typescript
public getEventHistory(type: string): EventDefinition[]
```text

Gets all events of a specific type.

**Parameters:**
- `type` (string): Event type

**Returns:** `EventDefinition[]` - Array of events

**Example:**
```typescript
const taskEvents = eventSystem.getEventHistory('task.completed');
```text

##### getAllEvents()

```typescript
public getAllEvents(): EventDefinition[]
```text

Gets all events across all types, sorted by timestamp.

**Returns:** `EventDefinition[]` - Array of all events, sorted by timestamp

**Example:**
```typescript
const allEvents = eventSystem.getAllEvents();
```text

##### findEvents()

```typescript
public findEvents(filter: EventFilter): EventDefinition[]
```text

Finds events matching the specified filter.

**Parameters:**
- `filter` (EventFilter): Filter criteria

**Returns:** `EventDefinition[]` - Array of matching events

**Example:**
```typescript
const events = eventSystem.findEvents({
  type: /^task\./,
  timestampFrom: Date.now() - 3600000,
  metadataFilter: { priority: 'high' }
});
```text

##### subscribe()

```typescript
public subscribe(
  options: EventSubscriptionOptions,
  handler: (event: EventDefinition) => void
): () => void
```text

Subscribes to events with filtering options.

**Parameters:**
- `options` (EventSubscriptionOptions): Subscription options
- `handler` (function): Handler function

**Returns:** `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = eventSystem.subscribe({
  filter: { type: 'task.completed' },
  onlyFuture: false
}, (event) => {
  console.log('Received event:', event);
});

// Later...
unsubscribe();
```text

##### getCorrelatedEvents()

```typescript
public getCorrelatedEvents(correlationId: string): EventDefinition[]
```text

Gets all events with a specific correlation ID.

**Parameters:**
- `correlationId` (string): Correlation ID

**Returns:** `EventDefinition[]` - Array of correlated events

**Example:**
```typescript
const relatedEvents = eventSystem.getCorrelatedEvents('workflow-456');
```text

##### clearEventHistory()

```typescript
public clearEventHistory(): void
```text

Clears all event history and persisted events.

**Returns:** `void`

**Example:**
```typescript
eventSystem.clearEventHistory();
```text

##### replayEvents()

```typescript
public replayEvents(
  filter?: EventFilter,
  handler?: (event: EventDefinition) => void
): void
```text

Replays events matching the filter.

**Parameters:**
- `filter` (EventFilter, optional): Filter criteria
- `handler` (function, optional): Custom handler (default: emits events)

**Returns:** `void`

**Example:**
```typescript
// Replay all task events
eventSystem.replayEvents({ type: /^task\./ });

// Replay with custom handler
eventSystem.replayEvents(
  { correlationId: 'workflow-456' },
  (event) => console.log('Replaying:', event)
);
```text

## Private Methods

### storeEvent()

```typescript
private storeEvent(event: EventDefinition): void
```text

Stores an event in memory and optionally persists it.

**Parameters:**
- `event` (EventDefinition): Event to store

**Returns:** `void`

### matchesFilter()

```typescript
private matchesFilter(event: EventDefinition, filter: EventFilter): boolean
```text

Checks if an event matches the filter criteria.

**Parameters:**
- `event` (EventDefinition): Event to check
- `filter` (EventFilter): Filter criteria

**Returns:** `boolean` - True if event matches filter

### processSubscriptionsForEvent()

```typescript
private processSubscriptionsForEvent(event: EventDefinition): void
```text

Processes all subscriptions for a given event.

**Parameters:**
- `event` (EventDefinition): Event to process

**Returns:** `void`

### persistEventToDisk()

```typescript
private persistEventToDisk(event: EventDefinition): void
```text

Persists an event to disk if persistence is enabled.

**Parameters:**
- `event` (EventDefinition): Event to persist

**Returns:** `void`

### loadPersistedEvents()

```typescript
private loadPersistedEvents(): void
```text

Loads persisted events from disk on initialization.

**Returns:** `void`

### generateEventId()

```typescript
private generateEventId(): string
```text

Generates a unique event ID.

**Returns:** `string` - Unique event ID

### generateSubscriptionId()

```typescript
private generateSubscriptionId(): string
```text

Generates a unique subscription ID.

**Returns:** `string` - Unique subscription ID

## Usage Examples

### Basic Event Publishing and Subscription

```typescript
import { EventSystem } from './EventSystem';

const eventSystem = EventSystem.getInstance();

// Subscribe to events
eventSystem.on('task.completed', (event) => {
  console.log('Task completed:', event.payload);
});

// Publish event
eventSystem.emit('task.completed', {
  taskId: 'task-123',
  status: 'success'
});
```text

### Filtered Subscriptions

```typescript
const unsubscribe = eventSystem.subscribe({
  filter: {
    type: /^task\./,
    timestampFrom: Date.now() - 3600000
  },
  onlyFuture: false
}, (event) => {
  console.log('Task event:', event);
});
```text

### Event Correlation

```typescript
const correlationId = 'workflow-456';

// Emit correlated events
eventSystem.emit('task.started', { taskId: 'task-1' }, { correlationId });
eventSystem.emit('task.completed', { taskId: 'task-1' }, { correlationId });

// Get all correlated events
const relatedEvents = eventSystem.getCorrelatedEvents(correlationId);
```text

### Event Persistence

```typescript
const eventSystem = EventSystem.getInstance({
  enabled: true,
  storageDirectory: './events',
  maxEventsPerType: 1000
});

// Events are automatically persisted
eventSystem.emit('system.startup', { version: '1.0.0' });
```text

### Event Replay

```typescript
// Replay all events from the last hour
const oneHourAgo = Date.now() - 3600000;
eventSystem.replayEvents({
  timestampFrom: oneHourAgo
});
```text

## Error Handling

The EventSystem handles errors gracefully:
- Event handlers that throw errors are isolated (errors don't affect other handlers)
- Persistence errors are logged but don't prevent event emission
- Invalid filters return empty arrays rather than throwing errors

## Performance Characteristics

- **Event Emission**: O(1) for storing, O(n) for delivery where n = number of subscribers
- **Event Query**: O(m) where m = total number of events
- **Memory Usage**: Bounded by `maxEventsPerType` configuration
- **Persistence**: Asynchronous file I/O, non-blocking

## Thread Safety

The EventSystem is designed for single-threaded Node.js execution. For concurrent access, use appropriate synchronization mechanisms.

## Related Documentation

- [Event System README](./README.md)
- [Core Systems Documentation](../README.md)
- [Integration Patterns](../../../README.md)
