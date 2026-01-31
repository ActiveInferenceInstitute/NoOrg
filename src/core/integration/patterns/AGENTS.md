# Integration Patterns Technical Documentation

## Overview

The Integration Patterns module provides resilience-focused patterns for reliable communication between system components. This document provides complete technical documentation for all interfaces, classes, and methods.

## Pattern Classes

All patterns follow a similar structure:
- Static factory methods for singleton instances
- `wrap()` method to wrap functions
- `execute()` method for direct execution
- Metrics tracking
- Event system integration

## Circuit Breaker Pattern

### Interfaces

#### CircuitBreakerConfig

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenTimeout?: number;
  monitorInterval?: number;
}
```text

#### CircuitBreakerState

```typescript
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lastStatusChange: number;
}
```text

### CircuitBreaker Class

#### Static Methods

##### getBreaker()

```typescript
public static getBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker
```text

Gets or creates a circuit breaker instance.

**Parameters:**
- `name` (string): Circuit breaker name
- `config` (Partial<CircuitBreakerConfig>, optional): Configuration

**Returns:** `CircuitBreaker` - Circuit breaker instance

#### Instance Methods

##### wrap()

```typescript
public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>
```text

Wraps a function with circuit breaker logic.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to wrap

**Returns:** `WrappedFunction<T>` - Wrapped function

##### execute()

```typescript
public async execute<T>(
  fn: WrappedFunction<T>,
  ...args: any[]
): Promise<T>
```text

Executes a function with circuit breaker protection.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to execute
- `...args` (any[]): Function arguments

**Returns:** `Promise<T>` - Function result

**Throws:** Error if circuit breaker is OPEN

##### getState()

```typescript
public getState(): CircuitBreakerState
```text

Gets current circuit breaker state.

**Returns:** `CircuitBreakerState` - Current state

##### reset()

```typescript
public reset(): void
```text

Resets circuit breaker to CLOSED state.

**Returns:** `void`

## Retry Pattern

### Interfaces

#### RetryConfig

```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp>;
}
```text

#### RetryMetrics

```typescript
interface RetryMetrics {
  attempts: number;
  successes: number;
  failures: number;
  lastAttemptTime: number;
  lastError: Error | null;
}
```text

### Retry Class

#### Static Methods

##### getRetrier()

```typescript
public static getRetrier(
  name: string,
  config?: Partial<RetryConfig>
): Retry
```text

Gets or creates a retry instance.

**Parameters:**
- `name` (string): Retry instance name
- `config` (Partial<RetryConfig>, optional): Configuration

**Returns:** `Retry` - Retry instance

#### Instance Methods

##### wrap()

```typescript
public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>
```text

Wraps a function with retry logic.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to wrap

**Returns:** `WrappedFunction<T>` - Wrapped function

##### execute()

```typescript
public async execute<T>(
  fn: WrappedFunction<T>,
  ...args: any[]
): Promise<T>
```text

Executes a function with retry logic.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to execute
- `...args` (any[]): Function arguments

**Returns:** `Promise<T>` - Function result

##### getMetrics()

```typescript
public getMetrics(): RetryMetrics
```text

Gets retry metrics.

**Returns:** `RetryMetrics` - Current metrics

## Rate Limiter Pattern

### Interfaces

#### RateLimiterConfig

```typescript
interface RateLimiterConfig {
  requestsPerPeriod: number;
  periodInMs: number;
  maxQueueSize?: number;
  queueTimeout?: number;
}
```text

#### RateLimiterMetrics

```typescript
interface RateLimiterMetrics {
  totalRequests: number;
  successfulRequests: number;
  rejectedRequests: number;
  queuedRequests: number;
  currentQueueSize: number;
  lastRequestTime: number;
  periodStart: number;
  requestsInCurrentPeriod: number;
}
```text

### RateLimiter Class

#### Static Methods

##### getLimiter()

```typescript
public static getLimiter(
  name: string,
  config?: Partial<RateLimiterConfig>
): RateLimiter
```text

Gets or creates a rate limiter instance.

**Parameters:**
- `name` (string): Rate limiter name
- `config` (Partial<RateLimiterConfig>, optional): Configuration

**Returns:** `RateLimiter` - Rate limiter instance

#### Instance Methods

##### wrap()

```typescript
public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>
```text

Wraps a function with rate limiting.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to wrap

**Returns:** `WrappedFunction<T>` - Wrapped function

##### execute()

```typescript
public async execute<T>(
  fn: WrappedFunction<T>,
  ...args: any[]
): Promise<T>
```text

Executes a function with rate limiting.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to execute
- `...args` (any[]): Function arguments

**Returns:** `Promise<T>` - Function result

**Throws:** Error if request is rejected

##### getMetrics()

```typescript
public getMetrics(): RateLimiterMetrics
```text

Gets rate limiter metrics.

**Returns:** `RateLimiterMetrics` - Current metrics

## Timeout Pattern

### Interfaces

#### TimeoutConfig

```typescript
interface TimeoutConfig {
  timeout: number;
  retries?: number;
  backoff?: {
    initial: number;
    multiplier: number;
    maxDelay: number;
  };
}
```text

#### TimeoutMetrics

```typescript
interface TimeoutMetrics {
  name: string;
  totalAttempts: number;
  successCount: number;
  timeoutCount: number;
  failureCount: number;
  averageExecutionTime: number;
}
```text

### Timeout Class

#### Static Methods

##### getTimeout()

```typescript
public static getTimeout(
  name: string,
  config: TimeoutConfig
): Timeout
```text

Gets or creates a timeout instance.

**Parameters:**
- `name` (string): Timeout instance name
- `config` (TimeoutConfig): Configuration

**Returns:** `Timeout` - Timeout instance

#### Instance Methods

##### execute()

```typescript
public async execute<T>(task: () => Promise<T>): Promise<T>
```text

Executes a task with timeout protection.

**Parameters:**
- `task` (function): Task function

**Returns:** `Promise<T>` - Task result

**Throws:** TimeoutError if timeout is exceeded

##### getMetrics()

```typescript
public getMetrics(): TimeoutMetrics
```text

Gets timeout metrics.

**Returns:** `TimeoutMetrics` - Current metrics

## Bulkhead Pattern

### Interfaces

#### BulkheadConfig

```typescript
interface BulkheadConfig {
  maxConcurrent: number;
  queueSize: number;
  timeout: number;
}
```text

#### BulkheadMetrics

```typescript
interface BulkheadMetrics {
  activeExecutions: number;
  queuedRequests: number;
  completedExecutions: number;
  rejectedRequests: number;
}
```text

### Bulkhead Class

#### Static Methods

##### getBulkhead()

```typescript
public static getBulkhead(
  name: string,
  config?: Partial<BulkheadConfig>
): Bulkhead
```text

Gets or creates a bulkhead instance.

**Parameters:**
- `name` (string): Bulkhead name
- `config` (Partial<BulkheadConfig>, optional): Configuration

**Returns:** `Bulkhead` - Bulkhead instance

#### Instance Methods

##### wrap()

```typescript
public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T>
```text

Wraps a function with bulkhead isolation.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to wrap

**Returns:** `WrappedFunction<T>` - Wrapped function

##### execute()

```typescript
public async execute<T>(
  fn: WrappedFunction<T>,
  ...args: any[]
): Promise<T>
```text

Executes a function with bulkhead isolation.

**Parameters:**
- `fn` (WrappedFunction<T>): Function to execute
- `...args` (any[]): Function arguments

**Returns:** `Promise<T>` - Function result

**Throws:** Error if bulkhead is full

##### getMetrics()

```typescript
public getMetrics(): BulkheadMetrics
```text

Gets bulkhead metrics.

**Returns:** `BulkheadMetrics` - Current metrics

## Cache Aside Pattern

### CacheAside Class

#### Methods

##### get()

```typescript
public async get<T>(
  key: string,
  loader: (key: string) => Promise<T>
): Promise<T>
```text

Gets value from cache or loads it.

**Parameters:**
- `key` (string): Cache key
- `loader` (function): Function to load value if not cached

**Returns:** `Promise<T>` - Cached or loaded value

##### set()

```typescript
public async set<T>(key: string, value: T): Promise<void>
```text

Sets a value in cache.

**Parameters:**
- `key` (string): Cache key
- `value` (T): Value to cache

**Returns:** `Promise<void>`

##### invalidate()

```typescript
public async invalidate(key: string): Promise<void>
```text

Invalidates a cache entry.

**Parameters:**
- `key` (string): Cache key

**Returns:** `Promise<void>`

## Saga Pattern

### Saga Class

#### Methods

##### addStep()

```typescript
public addStep(
  name: string,
  action: (context: any) => Promise<any>,
  compensation?: (context: any) => Promise<any>
): void
```text

Adds a step to the saga.

**Parameters:**
- `name` (string): Step name
- `action` (function): Action to execute
- `compensation` (function, optional): Compensation function

**Returns:** `void`

##### execute()

```typescript
public async execute(context: any): Promise<any>
```text

Executes the saga.

**Parameters:**
- `context` (any): Execution context

**Returns:** `Promise<any>` - Final result

**Behavior:**
- Executes steps in order
- If a step fails, executes compensations in reverse order
- Returns result or throws error

## Request-Response Pattern

### Interfaces

#### Request

```typescript
interface Request {
  id: string;
  type: string;
  payload: any;
  metadata?: Record<string, any>;
}
```text

#### Response

```typescript
interface Response {
  id: string;
  requestId: string;
  payload: any;
  error?: Error;
  metadata?: Record<string, any>;
}
```text

#### RequestHandler

```typescript
interface RequestHandler {
  (request: Request): Promise<Response>;
}
```text

### RequestResponsePattern Class

#### Methods

##### registerHandler()

```typescript
public registerHandler(
  type: string,
  handler: RequestHandler
): void
```text

Registers a request handler.

**Parameters:**
- `type` (string): Request type
- `handler` (RequestHandler): Handler function

**Returns:** `void`

##### sendRequest()

```typescript
public async sendRequest(request: Request): Promise<Response>
```text

Sends a request and waits for response.

**Parameters:**
- `request` (Request): Request to send

**Returns:** `Promise<Response>` - Response

## Usage Examples

### Circuit Breaker

```typescript
import { CircuitBreaker } from './CircuitBreaker';

const breaker = CircuitBreaker.getBreaker('api', {
  failureThreshold: 5,
  resetTimeout: 60000
});

const wrappedApiCall = breaker.wrap(async () => {
  return await apiCall();
});

try {
  const result = await wrappedApiCall();
} catch (error) {
  // Handle circuit breaker open or API error
}
```text

### Retry

```typescript
import { Retry } from './Retry';

const retry = Retry.getRetrier('api', {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2
});

const result = await retry.execute(async () => {
  return await unreliableOperation();
});
```text

### Rate Limiter

```typescript
import { RateLimiter } from './RateLimiter';

const limiter = RateLimiter.getLimiter('api', {
  requestsPerPeriod: 10,
  periodInMs: 1000
});

const result = await limiter.execute(async () => {
  return await apiCall();
});
```text

### Timeout

```typescript
import { Timeout } from './Timeout';

const timeout = Timeout.getTimeout('api', {
  timeout: 5000,
  retries: 2
});

const result = await timeout.execute(async () => {
  return await longRunningOperation();
});
```text

### Combining Patterns

```typescript
const breaker = CircuitBreaker.getBreaker('api');
const retry = Retry.getRetrier('api');
const timeout = Timeout.getTimeout('api', { timeout: 5000 });

const operation = timeout.execute(() =>
  retry.execute(() =>
    breaker.execute(async () => {
      return await apiCall();
    })
  )
);
```text

## Event Integration

All patterns emit events through EventSystem:
- Pattern-specific events for state changes
- Metrics events for monitoring
- Error events for failures

## Performance Characteristics

- **Circuit Breaker**: O(1) state check, minimal overhead
- **Retry**: O(n) where n = number of attempts
- **Rate Limiter**: O(1) token check, O(n) queue processing
- **Timeout**: O(1) timeout setup, minimal overhead
- **Bulkhead**: O(1) concurrency check, O(n) queue management

## Related Documentation

- [Integration Patterns README](../README.md)
- [Core Systems Documentation](../../README.md)
- [Event System Documentation](../../events/AGENTS.md)
