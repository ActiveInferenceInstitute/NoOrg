# Monitoring System Technical Documentation

## Overview

The Monitoring System provides comprehensive observability including metrics collection, alerting, and health checks. This document provides complete technical documentation for all interfaces, classes, and methods.

## Interfaces

### Metric

Represents a single metric measurement.

```typescript
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}
```

**Properties:**
- `name` (string): Metric name
- `value` (number): Metric value
- `timestamp` (number): Unix timestamp when metric was recorded
- `labels` (Record<string, string>, optional): Metric labels for filtering/grouping

### Alert

Represents an alert definition and state.

```typescript
interface Alert {
  id: string;
  name: string;
  condition: (metric: Metric) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved';
  timestamp: number;
  metadata?: Record<string, any>;
}
```

**Properties:**
- `id` (string): Unique alert identifier
- `name` (string): Alert name
- `condition` (function): Function that returns true when alert should trigger
- `message` (string): Alert message
- `severity` ('info' | 'warning' | 'error' | 'critical'): Alert severity level
- `status` ('active' | 'resolved'): Current alert status
- `timestamp` (number): Unix timestamp of last status change
- `metadata` (Record<string, any>, optional): Additional metadata

### HealthCheck

Represents a health check definition.

```typescript
interface HealthCheck {
  id: string;
  name: string;
  description?: string;
  check: () => Promise<HealthStatus>;
  interval?: number;
  timeout?: number;
  enabled?: boolean;
  tags?: string[];
  dependencies?: string[];
}
```

**Properties:**
- `id` (string): Unique health check identifier
- `name` (string): Health check name
- `description` (string, optional): Health check description
- `check` (function): Async function that returns HealthStatus
- `interval` (number, optional): Check interval in milliseconds (default: 30000)
- `timeout` (number, optional): Timeout in milliseconds (default: 5000)
- `enabled` (boolean, optional): Whether check is enabled (default: true)
- `tags` (string[], optional): Tags for grouping/filtering
- `dependencies` (string[], optional): IDs of health checks this depends on

### HealthStatus

Represents the result of a health check.

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
  duration?: number;
}
```

**Properties:**
- `status` ('healthy' | 'degraded' | 'unhealthy' | 'unknown'): Health status
- `message` (string, optional): Status message
- `details` (Record<string, any>, optional): Additional details
- `timestamp` (number): Unix timestamp when check was performed
- `duration` (number, optional): Time taken for check in milliseconds

### HealthCheckResult

Represents a health check execution result.

```typescript
interface HealthCheckResult {
  checkId: string;
  status: HealthStatus;
  error?: Error;
  timestamp: number;
}
```

**Properties:**
- `checkId` (string): Health check ID
- `status` (HealthStatus): Health status result
- `error` (Error, optional): Error if check failed
- `timestamp` (number): Unix timestamp when check completed

### SystemHealth

Represents overall system health.

```typescript
interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, HealthStatus>;
  lastUpdated: number;
  uptime: number;
}
```

**Properties:**
- `overall` ('healthy' | 'degraded' | 'unhealthy'): Overall system health
- `components` (Record<string, HealthStatus>): Health status of each component
- `lastUpdated` (number): Unix timestamp when health was last updated
- `uptime` (number): System uptime in milliseconds

## Classes

### MonitoringSystem

Main monitoring system for metrics and alerts.

#### Constructor

```typescript
private constructor()
```

**Note:** Constructor is private. Use `getInstance()` to obtain an instance.

**Behavior:**
- Initializes metrics and alerts storage
- Sets up periodic metric persistence (every 5 minutes)
- Integrates with EventSystem and StorageSystem

#### Static Methods

##### getInstance()

```typescript
public static getInstance(): MonitoringSystem
```

Gets the singleton instance of MonitoringSystem.

**Returns:** `MonitoringSystem` - Singleton instance

**Example:**
```typescript
const monitoring = MonitoringSystem.getInstance();
```

#### Instance Methods

##### recordMetric()

```typescript
public recordMetric(
  name: string,
  value: number,
  labels?: Record<string, string>
): void
```

Records a metric value.

**Parameters:**
- `name` (string): Metric name
- `value` (number): Metric value
- `labels` (Record<string, string>, optional): Metric labels

**Returns:** `void`

**Example:**
```typescript
monitoring.recordMetric('api.request.count', 1, {
  endpoint: '/users',
  method: 'GET',
  status: '200'
});

monitoring.recordMetric('system.cpu.usage', 75.5, {
  host: 'server-1'
});
```

**Behavior:**
- Stores metric in memory
- Checks all alerts against the metric
- Emits 'monitoring:metric' event

##### getMetrics()

```typescript
public getMetrics(
  name: string,
  timeRange?: { start: number; end: number }
): Metric[]
```

Gets metrics for a specific name, optionally filtered by time range.

**Parameters:**
- `name` (string): Metric name
- `timeRange` (object, optional): Time range filter
  - `start` (number): Start timestamp
  - `end` (number): End timestamp

**Returns:** `Metric[]` - Array of metrics

**Example:**
```typescript
// Get all metrics
const allMetrics = monitoring.getMetrics('api.request.count');

// Get metrics in time range
const recentMetrics = monitoring.getMetrics('api.request.count', {
  start: Date.now() - 3600000,
  end: Date.now()
});
```

##### createAlert()

```typescript
public createAlert(
  name: string,
  condition: (metric: Metric) => boolean,
  message: string,
  severity: Alert['severity'] = 'warning'
): string
```

Creates a new alert definition.

**Parameters:**
- `name` (string): Alert name
- `condition` (function): Function that returns true when alert should trigger
- `message` (string): Alert message
- `severity` ('info' | 'warning' | 'error' | 'critical', optional): Severity (default: 'warning')

**Returns:** `string` - Alert ID

**Example:**
```typescript
const alertId = monitoring.createAlert(
  'High CPU Usage',
  (metric) => metric.name === 'system.cpu.usage' && metric.value > 90,
  'CPU usage exceeds 90%',
  'critical'
);
```

**Behavior:**
- Creates alert with unique ID
- Alert starts in 'resolved' status
- Alert is checked against all recorded metrics

##### onAlert()

```typescript
public onAlert(handler: (alert: Alert) => void): () => void
```

Registers a handler for alert notifications.

**Parameters:**
- `handler` (function): Handler function receiving Alert

**Returns:** `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = monitoring.onAlert((alert) => {
  console.log(`Alert ${alert.severity}: ${alert.message}`);
  if (alert.severity === 'critical') {
    sendNotification(alert);
  }
});

// Later...
unsubscribe();
```

##### getActiveAlerts()

```typescript
public getActiveAlerts(): Alert[]
```

Gets all currently active alerts.

**Returns:** `Alert[]` - Array of active alerts

**Example:**
```typescript
const activeAlerts = monitoring.getActiveAlerts();
console.log(`Found ${activeAlerts.length} active alerts`);
```

##### loadPersistedMetrics()

```typescript
public async loadPersistedMetrics(): Promise<void>
```

Loads persisted metrics from storage.

**Returns:** `Promise<void>` - Resolves when metrics are loaded

**Example:**
```typescript
await monitoring.loadPersistedMetrics();
```

### HealthCheckManager

Manages health checks for system components.

#### Constructor

```typescript
private constructor()
```

**Note:** Constructor is private. Use `getInstance()` to obtain an instance.

#### Static Methods

##### getInstance()

```typescript
static getInstance(): HealthCheckManager
```

Gets the singleton instance of HealthCheckManager.

**Returns:** `HealthCheckManager` - Singleton instance

**Example:**
```typescript
const healthManager = HealthCheckManager.getInstance();
```

#### Instance Methods

##### registerHealthCheck()

```typescript
registerHealthCheck(check: HealthCheck): void
```

Registers a health check.

**Parameters:**
- `check` (HealthCheck): Health check definition

**Returns:** `void`

**Throws:** Error if health check ID already exists

**Example:**
```typescript
healthManager.registerHealthCheck({
  id: 'database',
  name: 'Database Connection',
  description: 'Checks database connectivity',
  check: async () => {
    const connected = await checkDatabaseConnection();
    return {
      status: connected ? 'healthy' : 'unhealthy',
      message: connected ? 'Database connected' : 'Database unreachable',
      timestamp: Date.now()
    };
  },
  interval: 30000,
  timeout: 5000,
  enabled: true
});
```

**Behavior:**
- Sets default interval (30000ms) and timeout (5000ms) if not provided
- Starts health check if manager is running
- Emits 'health-check.registered' event

##### unregisterHealthCheck()

```typescript
unregisterHealthCheck(checkId: string): void
```

Unregisters a health check.

**Parameters:**
- `checkId` (string): Health check ID

**Returns:** `void`

**Example:**
```typescript
healthManager.unregisterHealthCheck('database');
```

**Behavior:**
- Stops health check timer
- Removes from registry
- Emits 'health-check.unregistered' event

##### executeHealthCheck()

```typescript
async executeHealthCheck(checkId: string): Promise<HealthStatus>
```

Executes a specific health check immediately.

**Parameters:**
- `checkId` (string): Health check ID

**Returns:** `Promise<HealthStatus>` - Health status result

**Throws:** Error if health check not found or disabled

**Example:**
```typescript
const status = await healthManager.executeHealthCheck('database');
console.log(`Database status: ${status.status}`);
```

**Behavior:**
- Executes check with timeout
- Records metrics for duration and status
- Stores result in history
- Returns HealthStatus with duration

##### getSystemHealth()

```typescript
async getSystemHealth(): Promise<SystemHealth>
```

Gets overall system health by executing all enabled health checks.

**Returns:** `Promise<SystemHealth>` - System health status

**Example:**
```typescript
const systemHealth = await healthManager.getSystemHealth();
console.log(`Overall: ${systemHealth.overall}`);
console.log(`Uptime: ${systemHealth.uptime}ms`);
```

**Behavior:**
- Executes all enabled health checks in parallel
- Determines overall status (unhealthy > degraded > healthy)
- Records overall health metric
- Returns SystemHealth with all component statuses

##### start()

```typescript
start(): void
```

Starts the health check manager.

**Returns:** `void`

**Example:**
```typescript
healthManager.start();
```

**Behavior:**
- Starts all registered health checks
- Sets running flag
- Emits 'health-check-manager.started' event

##### stop()

```typescript
stop(): void
```

Stops the health check manager.

**Returns:** `void`

**Example:**
```typescript
healthManager.stop();
```

**Behavior:**
- Stops all health check timers
- Sets running flag to false
- Emits 'health-check-manager.stopped' event

##### getCheckResults()

```typescript
getCheckResults(checkId: string, limit: number = 100): HealthCheckResult[]
```

Gets health check result history.

**Parameters:**
- `checkId` (string): Health check ID
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns:** `HealthCheckResult[]` - Array of results (most recent first)

**Example:**
```typescript
const results = healthManager.getCheckResults('database', 50);
console.log(`Last 50 results: ${results.length}`);
```

##### getRegisteredChecks()

```typescript
getRegisteredChecks(): HealthCheck[]
```

Gets all registered health checks.

**Returns:** `HealthCheck[]` - Array of health checks

**Example:**
```typescript
const checks = healthManager.getRegisteredChecks();
console.log(`Registered ${checks.length} health checks`);
```

##### setCheckEnabled()

```typescript
setCheckEnabled(checkId: string, enabled: boolean): void
```

Enables or disables a health check.

**Parameters:**
- `checkId` (string): Health check ID
- `enabled` (boolean): Whether to enable the check

**Returns:** `void`

**Throws:** Error if health check not found

**Example:**
```typescript
healthManager.setCheckEnabled('database', false); // Disable
healthManager.setCheckEnabled('database', true);  // Enable
```

##### updateHealthCheck()

```typescript
updateHealthCheck(checkId: string, updates: Partial<HealthCheck>): void
```

Updates health check configuration.

**Parameters:**
- `checkId` (string): Health check ID
- `updates` (Partial<HealthCheck>): Partial health check to merge

**Returns:** `void`

**Throws:** Error if health check not found

**Example:**
```typescript
healthManager.updateHealthCheck('database', {
  interval: 60000, // Change interval to 60 seconds
  timeout: 10000   // Change timeout to 10 seconds
});
```

## Usage Examples

### Basic Metrics

```typescript
import { MonitoringSystem } from './MonitoringSystem';

const monitoring = MonitoringSystem.getInstance();

// Record metrics
monitoring.recordMetric('api.requests', 1);
monitoring.recordMetric('api.response.time', 150, { endpoint: '/users' });

// Get metrics
const metrics = monitoring.getMetrics('api.requests', {
  start: Date.now() - 3600000,
  end: Date.now()
});
```

### Alerts

```typescript
// Create alert
const alertId = monitoring.createAlert(
  'High Error Rate',
  (metric) => metric.name === 'api.errors' && metric.value > 10,
  'Error rate exceeds threshold',
  'error'
);

// Handle alerts
monitoring.onAlert((alert) => {
  if (alert.status === 'active') {
    console.error(`ALERT: ${alert.message}`);
  }
});

// Get active alerts
const active = monitoring.getActiveAlerts();
```

### Health Checks

```typescript
import { HealthCheckManager } from './HealthCheckManager';

const healthManager = HealthCheckManager.getInstance();

// Register health check
healthManager.registerHealthCheck({
  id: 'api',
  name: 'API Health',
  check: async () => {
    const response = await fetch('http://api/health');
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      timestamp: Date.now()
    };
  },
  interval: 30000
});

// Start manager
healthManager.start();

// Get system health
const health = await healthManager.getSystemHealth();
console.log(`System: ${health.overall}`);
```

## Event Integration

### MonitoringSystem Events

- `monitoring:metric` - Emitted when metric is recorded
- `monitoring:alert` - Emitted when alert status changes

### HealthCheckManager Events

- `health-check.registered` - Emitted when health check is registered
- `health-check.unregistered` - Emitted when health check is unregistered
- `health-check-manager.started` - Emitted when manager starts
- `health-check-manager.stopped` - Emitted when manager stops

## Performance Characteristics

- **Metric Recording**: O(1) for storage, O(n) for alert checking where n = number of alerts
- **Health Check Execution**: O(1) per check, parallel execution for system health
- **Metric Persistence**: Periodic (every 5 minutes), non-blocking
- **Result History**: Limited to 1000 results per health check

## Related Documentation

- [Monitoring System README](./README.md)
- [Core Systems Documentation](../README.md)
- [Event System Documentation](../events/AGENTS.md)
- [Storage System Documentation](../storage/AGENTS.md)
