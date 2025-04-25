# Metrics Documentation

## Overview
This document outlines the metric collection system used in the swarm coordination tests, including proper data structures, validation, and error handling.

## Metric Types

### 1. Task Metrics

#### Task Duration
```typescript
interface TaskDurationMetric {
  timestamp: number;  // Relative to test start time
  value: {
    taskId: string;  // Required
    duration: number;  // In milliseconds
    metrics?: {
      duration: number;
      resourceUsage?: {
        cpu: number;    // Percentage (0-100)
        memory: number; // MB
      }
    }
  }
}
```

#### Task Success
```typescript
interface TaskSuccessMetric {
  timestamp: number;
  value: {
    taskId: string;    // Required
    success: boolean;  // Required
    value: 0 | 1;     // Required: 1 for success, 0 for failure
    error?: string;   // Optional error message
  }
}
```

### 2. Agent Metrics

#### Task Distribution
```typescript
interface TaskDistributionMetric {
  timestamp: number;
  value: {
    agentId: string;  // Required
    tasks: number;    // Required: Number of tasks assigned
    value: number;    // Required: Same as tasks
    status?: string;  // Optional: Agent status
  }
}
```

#### Resource Utilization
```typescript
interface ResourceUtilizationMetric {
  timestamp: number;
  value: {
    agentId: string;  // Required
    cpu: number;      // Required: CPU usage percentage
    memory: number;   // Required: Memory usage percentage
    storage: number;  // Required: Storage usage percentage
    value: number;    // Required: Primary metric value (typically CPU)
  }
}
```

## Metric Collection Best Practices

### 1. Initialization
Always initialize metrics at the start of each test:
```typescript
const metrics = new TestMetricsCollector();
const testStartTime = Date.now();
```

### 2. Recording Metrics
Always include required fields and validate data:
```typescript
// Good
metrics.recordMetric('taskDuration', {
  timestamp: Date.now() - testStartTime,
  value: {
    taskId: task.id,
    duration: duration || 0,
    metrics: {
      duration: duration || 0,
      resourceUsage: {
        cpu: cpuUsage || 0,
        memory: memoryUsage || 0
      }
    }
  }
});

// Bad - Missing required fields
metrics.recordMetric('taskDuration', {
  duration: duration  // Missing taskId and proper structure
});
```

### 3. Error Handling
Implement proper error handling for metric collection:
```typescript
try {
  metrics.recordMetric('taskSuccess', {
    timestamp: Date.now() - testStartTime,
    value: {
      taskId: task.id,
      success: result.success,
      value: result.success ? 1 : 0
    }
  });
} catch (error) {
  logger.error(`Failed to record metric: ${error.message}`);
  // Provide fallback or default values
  metrics.recordMetric('taskSuccess', {
    timestamp: Date.now() - testStartTime,
    value: {
      taskId: 'unknown',
      success: false,
      value: 0,
      error: error.message
    }
  });
}
```

## Validation Rules

### 1. Task Metrics
- `taskId` must be a non-empty string
- `duration` must be a non-negative number
- `success` must be a boolean
- `value` must be 0 or 1 for success metrics

### 2. Agent Metrics
- `agentId` must be a non-empty string
- `tasks` must be a non-negative integer
- Resource utilization values must be between 0 and 100

## Common Issues and Solutions

### 1. Undefined Properties
Problem:
```typescript
Cannot read properties of undefined (reading 'taskId')
```

Solution:
```typescript
// Add null checks and default values
const taskId = result?.task?.id || 'unknown';
const duration = result?.duration || 0;
```

### 2. Empty Chart Data
Problem:
```typescript
Empty data for chart type: line
```

Solution:
```typescript
// Provide default data point
if (data.length === 0) {
  return [{
    x: 0,
    y: 0,
    text: 'No Data Available'
  }];
}
```

## Metric Visualization Requirements

### 1. Time Series Charts
- X-axis: timestamp (relative to test start)
- Y-axis: metric value
- Required fields: x, y
- Optional: text for tooltips

### 2. Bar Charts
- X-axis: categorical (e.g., agent IDs)
- Y-axis: metric value
- Required fields: x, y
- Optional: text for tooltips

### 3. Pie Charts
- Required: values, labels
- Values must sum to > 0
- Labels must be unique

## Testing Metrics

### 1. Unit Tests
```typescript
describe('Metric Collection', () => {
  test('Task Duration Metric', () => {
    const metric = {
      timestamp: 0,
      value: {
        taskId: 'task-1',
        duration: 100
      }
    };
    expect(validateMetric('taskDuration', metric)).toBe(true);
  });
});
```

### 2. Integration Tests
```typescript
describe('Metric Visualization', () => {
  test('Chart Generation', async () => {
    const metrics = new TestMetricsCollector();
    // Record test metrics
    await TestVisualization.generatePerformanceCharts(metrics);
    // Verify chart files exist
  });
});
``` 