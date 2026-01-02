# Monitoring System

The Monitoring System provides comprehensive observability capabilities for the multi-agent framework, including metrics collection, alerting, and system health monitoring.

## Overview

The Monitoring System enables real-time monitoring of system performance, agent health, task execution, and overall framework operations. It provides both operational visibility and strategic insights.

## Core Components

### MonitoringSystem

The main monitoring system that collects metrics, manages alerts, and provides monitoring dashboards.

**Key Features:**
- Real-time metrics collection
- Configurable alerting system
- Health check automation
- Performance monitoring
- Custom metric registration

**Usage:**
```typescript
import { MonitoringSystem } from './MonitoringSystem';

// Get singleton instance
const monitoring = MonitoringSystem.getInstance();

// Record a metric
monitoring.recordMetric('agent.response.time', 150, {
  agentId: 'agent-001',
  operation: 'task-processing'
});

// Set up health check
monitoring.registerHealthCheck('database', async () => {
  return await checkDatabaseHealth();
});

// Create alert rule
monitoring.createAlertRule({
  name: 'high-error-rate',
  condition: 'error.rate > 0.1',
  threshold: 0.1,
  duration: 300, // 5 minutes
  severity: 'warning',
  notificationChannels: ['email', 'slack']
});
```

## Metrics Collection

### Built-in Metrics
- **System Metrics**: CPU, memory, disk usage, network I/O
- **Agent Metrics**: Response times, error rates, task completion rates
- **Task Metrics**: Queue depth, processing times, success/failure rates
- **Framework Metrics**: Event throughput, message delivery rates

### Custom Metrics
```typescript
// Register custom metric
monitoring.registerMetric('custom.business.value', {
  type: 'counter',
  description: 'Business value generated',
  unit: 'points'
});

// Record custom metric
monitoring.recordMetric('custom.business.value', 10, {
  userId: 'user-123',
  action: 'purchase'
});
```

### Metric Types
- **Counter**: Monotonically increasing values (e.g., total requests)
- **Gauge**: Point-in-time values (e.g., current queue size)
- **Histogram**: Distribution of values (e.g., response time distribution)
- **Timer**: Duration measurements (e.g., task execution time)

## Alerting System

### Alert Rules
```typescript
interface AlertRule {
  name: string;
  condition: string; // Expression like 'error.rate > 0.1'
  threshold: number;
  duration: number; // How long condition must be true
  severity: 'info' | 'warning' | 'error' | 'critical';
  notificationChannels: string[];
  cooldown?: number; // Minimum time between alerts
}
```

### Alert Conditions
- **Threshold Alerts**: `metric > threshold`
- **Rate Alerts**: `metric.rate > threshold` (over time window)
- **Anomaly Alerts**: `metric.deviation > threshold` (from baseline)
- **Composite Alerts**: `metric1 > threshold1 AND metric2 < threshold2`

### Notification Channels
- **Email**: SMTP-based email notifications
- **Slack**: Slack webhook integration
- **Webhook**: Custom HTTP webhook endpoints
- **SMS**: SMS gateway integration
- **Dashboard**: Real-time dashboard alerts

## Health Checks

### Health Check Types
```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<HealthStatus>;
  interval?: number; // Check interval in seconds
  timeout?: number; // Check timeout in seconds
}
```

### Health Status
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}
```

### Built-in Health Checks
- **Database Connectivity**: Database connection health
- **External Services**: API endpoint availability
- **Resource Usage**: CPU, memory, disk usage thresholds
- **Agent Health**: Agent responsiveness and error rates
- **Queue Health**: Message queue depth and processing rates

## Dashboards

### Real-time Dashboards
The monitoring system provides web-based dashboards for:
- **System Overview**: High-level system status and key metrics
- **Agent Monitoring**: Individual agent performance and health
- **Task Analytics**: Task execution patterns and bottlenecks
- **Alert Management**: Active alerts and alert history

### Dashboard Configuration
```typescript
// Create custom dashboard
monitoring.createDashboard({
  name: 'custom-overview',
  widgets: [
    {
      type: 'metric',
      metric: 'system.cpu.usage',
      title: 'CPU Usage',
      refreshInterval: 5
    },
    {
      type: 'chart',
      metrics: ['agent.response.time', 'agent.error.rate'],
      title: 'Agent Performance',
      chartType: 'line'
    }
  ]
});
```

## Configuration

### MonitoringSystem Configuration
```typescript
interface MonitoringConfig {
  enableMetricsCollection?: boolean;
  metricsRetentionPeriod?: number; // Days to retain metrics
  enableHealthChecks?: boolean;
  healthCheckInterval?: number; // Seconds between health checks
  enableAlerting?: boolean;
  alertCooldownPeriod?: number; // Minimum time between similar alerts
  dashboardPort?: number; // Port for web dashboard
}
```

## Performance

- **Metrics Collection**: Minimal overhead (< 1% CPU)
- **Health Checks**: Configurable frequency to balance coverage vs. performance
- **Alert Processing**: Asynchronous processing to avoid blocking
- **Dashboard**: Optimized for real-time updates with WebSocket support

## Security

- **Access Control**: Role-based access to monitoring data
- **Data Encryption**: Sensitive metrics encryption at rest
- **Audit Logging**: Complete audit trail of monitoring activities
- **Secure Dashboards**: HTTPS-only dashboard access

## Integration

The Monitoring System integrates with:
- **Event System**: Publishes monitoring events and alerts
- **Messaging System**: Sends alert notifications
- **Storage System**: Persists metrics and alert history
- **External Tools**: Integrates with Grafana, Prometheus, etc.

## Best Practices

1. **Define Meaningful Metrics**: Focus on actionable metrics that drive decisions
2. **Set Appropriate Thresholds**: Use statistical baselines rather than arbitrary values
3. **Balance Check Frequency**: Don't over-check healthy systems
4. **Use Correlation IDs**: Track related metrics across components
5. **Implement Gradual Alerting**: Use warning levels before critical alerts

## Advanced Features

### Metric Aggregation
```typescript
// Aggregate metrics across time periods
const dailyMetrics = await monitoring.aggregateMetrics(
  'agent.response.time',
  'day',
  { startDate: '2024-01-01', endDate: '2024-01-31' }
);

// Calculate percentiles
const p95ResponseTime = await monitoring.getPercentile(
  'agent.response.time',
  95,
  { lastHours: 24 }
);
```

### Alert Correlation
```typescript
// Correlate related alerts
monitoring.correlateAlerts([
  'database.connection.failed',
  'api.response.time.high',
  'agent.error.rate.spike'
]);
```

### Predictive Monitoring
```typescript
// Set up predictive alerts
monitoring.createPredictiveAlert({
  metric: 'system.memory.usage',
  predictionWindow: 3600, // 1 hour
  threshold: 0.9,
  action: 'scale-up-cluster'
});
```

## Troubleshooting

### Common Issues

#### High Memory Usage
**Cause**: Metrics retention period too long
**Solution**:
```typescript
// Reduce retention period
monitoring.updateConfig({
  metricsRetentionPeriod: 7 // Days instead of 30
});
```

#### Frequent False Alerts
**Cause**: Thresholds too sensitive
**Solution**:
```typescript
// Increase alert duration requirement
monitoring.updateAlertRule('high-error-rate', {
  duration: 600 // 10 minutes instead of 5
});
```

#### Missing Metrics
**Cause**: Metrics not being recorded or collected
**Solution**:
```typescript
// Check metric registration
const metrics = monitoring.listMetrics();
console.log('Registered metrics:', metrics);

// Verify collection is enabled
console.log('Collection enabled:', monitoring.isCollectionEnabled());
```

## Related Documentation

- [Monitoring System API Reference](../../docs/core/index.md)
- [Event System Integration](../events/README.md)
- [Integration Patterns](../../../docs/core/integration/patterns/README.md)
