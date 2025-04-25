# Integration Patterns

The integration patterns in this framework provide resilience and control mechanisms for communication between services and components. These patterns help build reliable, fault-tolerant systems by handling common distributed systems challenges like failures, overload, and timing issues.

## Available Patterns

The framework includes the following integration patterns:

1. [Request-Response](#request-response-pattern)
2. [Circuit Breaker](#circuit-breaker-pattern)
3. [Bulkhead](#bulkhead-pattern)
4. [Timeout](#timeout-pattern)
5. [Retry](#retry-pattern)
6. [Rate Limiter](#rate-limiter-pattern)

## Request-Response Pattern

Provides a structured way to handle request-response style interactions between components.

### Usage

```typescript
import { RequestResponsePattern, Request, Response } from '../core/integration/patterns';

const handler = async (request: Request): Promise<Response> => {
  // Process the request
  return { data: { result: 'Success' }, status: 200 };
};

const pattern = new RequestResponsePattern('myService', handler);

// Execute a request
const response = await pattern.execute({ 
  data: { id: '123' }, 
  metadata: { timeout: 5000 } 
});
```

## Circuit Breaker Pattern

Prevents cascading failures by automatically detecting failures and preventing operation execution when the system is not healthy.

### Usage

```typescript
import { CircuitBreaker } from '../core/integration/patterns';

// Create a circuit breaker
const breaker = new CircuitBreaker('databaseConnection', {
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  halfOpenTimeout: 5000 // 5 seconds
});

// Use with any async function
const getUser = async (id: string) => {
  return breaker.execute(async () => {
    // Database operation that might fail
    return await database.findUser(id);
  });
};

// Or wrap a function for reuse
const protectedFindUser = breaker.wrap(database.findUser);
const user = await protectedFindUser('123');
```

### Configuration Options

- `failureThreshold`: Number of failures before opening the circuit (default: 5)
- `resetTimeout`: Time in ms before attempting to close circuit after opening (default: 60000)
- `halfOpenTimeout`: Time in ms to wait in half-open state before fully closing (default: 30000)
- `monitorInterval`: Time in ms between emitting monitoring events (default: 5000)

## Bulkhead Pattern

Isolates parts of the system from each other so that if one part fails, the others will continue to function.

### Usage

```typescript
import { Bulkhead } from '../core/integration/patterns';

// Create a bulkhead
const bulkhead = new Bulkhead('apiRequests', {
  maxConcurrent: 10,
  maxQueue: 20
});

// Execute with bulkhead protection
const result = await bulkhead.execute(async () => {
  return await api.fetchData();
});
```

### Configuration Options

- `maxConcurrent`: Maximum number of concurrent executions (default: 10)
- `maxQueue`: Maximum queue size for pending executions (default: 100)
- `queueTimeout`: Maximum time in ms to wait in queue (default: 30000)

## Timeout Pattern

Limits the amount of time spent waiting for an operation to complete.

### Usage

```typescript
import { Timeout } from '../core/integration/patterns';

// Create a timeout
const timeout = new Timeout('databaseQuery', {
  timeoutMs: 5000
});

// Execute with timeout
try {
  const result = await timeout.execute(async () => {
    return await database.query('SELECT * FROM users');
  });
} catch (error) {
  // Handle timeout error
}
```

### Configuration Options

- `timeoutMs`: Time in ms before operation times out (default: 5000)

## Retry Pattern

Automatically retries failed operations with configurable backoff strategies.

### Usage

```typescript
import { Retry } from '../core/integration/patterns';

// Create a retry handler
const retry = new Retry('apiCall', {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  retryableErrors: ['network error', 'timeout', /5\d\d/] // Strings or RegExp
});

// Execute with retry
const result = await retry.execute(async () => {
  return await api.fetchData();
});
```

### Configuration Options

- `maxAttempts`: Maximum number of attempts (default: 3)
- `initialDelay`: Initial delay in ms before first retry (default: 1000)
- `maxDelay`: Maximum delay in ms between retries (default: 30000)
- `backoffFactor`: Multiplier for delay between retries (default: 2)
- `retryableErrors`: Array of strings or RegExp to match errors that should trigger retry (default: [] - all errors are retryable)

## Rate Limiter Pattern

Controls the rate of operations to protect services from being overwhelmed.

### Usage

```typescript
import { RateLimiter } from '../core/integration/patterns';

// Create a rate limiter
const rateLimiter = new RateLimiter('apiRequests', {
  requestsPerPeriod: 100,
  periodInMs: 60000, // 1 minute
  maxQueueSize: 50
});

// Execute with rate limiting
const result = await rateLimiter.execute(async () => {
  return await api.makeRequest();
});
```

### Configuration Options

- `requestsPerPeriod`: Maximum number of requests allowed per period (default: 10)
- `periodInMs`: Time period in ms for the rate limit (default: 1000)
- `maxQueueSize`: Maximum size of queue for pending requests (default: 100)
- `queueTimeout`: Maximum time in ms to wait in queue (default: 30000)

## Best Practices

1. **Combine patterns**: Use multiple patterns together for maximum resilience. For example, use Circuit Breaker with Retry and Timeout.

2. **Monitor pattern metrics**: All patterns emit events with metrics that can be used for monitoring and alerting.

3. **Configure appropriately**: Test different configuration values to find the right balance for your system.

4. **Use static factory methods**: All patterns provide static methods for getting singleton instances by name:

   ```typescript
   const breaker = CircuitBreaker.getBreaker('databaseConnection');
   const retry = Retry.getRetrier('apiCalls');
   const limiter = RateLimiter.getLimiter('requests');
   ```

5. **Clean up resources**: Call the `dispose()` method on pattern instances when they are no longer needed. 