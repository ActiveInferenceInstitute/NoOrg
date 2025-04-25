# Test Visualization System

## Overview
The test visualization system generates interactive charts and static images to help analyze test results. It supports multiple chart types and handles various metric formats.

## Metric Data Format

### Task Duration Metrics
```typescript
interface TaskDurationMetric {
  taskId: string;
  duration: number;
  success: boolean;
}
```

### Task Success Metrics
```typescript
interface TaskSuccessMetric {
  taskId: string;
  success: boolean;
  value: 0 | 1;  // 1 for success, 0 for failure
}
```

### Resource Utilization Metrics
```typescript
interface ResourceUtilizationMetric {
  agentId: string;
  cpu: number;    // Percentage (0-100)
  memory: number; // Percentage (0-100)
  storage: number; // Percentage (0-100)
}
```

### Task Distribution Metrics
```typescript
interface TaskDistributionMetric {
  agentId: string;
  taskId: string;
  success: boolean;
  tasks: number;
}
```

## Chart Types

### 1. Task Duration Distribution (Scatter)
- Shows task execution durations over time
- X-axis: Time (ms)
- Y-axis: Duration (ms)
- Points colored by task ID

### 2. Task Success Rate (Pie)
- Shows distribution of successful vs failed tasks
- Donut chart with percentages
- Colors: Success (green), Failure (red)

### 3. Resource Utilization (Heatmap)
- Shows resource usage across agents
- X-axis: Resource types (CPU, Memory, Storage)
- Y-axis: Agent IDs
- Colors indicate utilization percentage

### 4. Task Distribution (Bar)
- Shows task allocation across agents
- X-axis: Agent IDs
- Y-axis: Number of tasks
- Stacked bars for successful/failed tasks

## Usage

### Recording Metrics
```typescript
const metrics = new TestMetricsCollector();

// Record task duration
metrics.recordMetric('taskDuration', {
  taskId: 'task-1',
  duration: 150,
  success: true
});

// Record task success
metrics.recordMetric('taskSuccess', {
  taskId: 'task-1',
  success: true,
  value: 1
});

// Record resource utilization
metrics.recordMetric('resourceUtilization', {
  agentId: 'agent-1',
  cpu: 75.5,
  memory: 60.2,
  storage: 45.8
});

// Record task distribution
metrics.recordMetric('taskDistribution', {
  agentId: 'agent-1',
  taskId: 'task-1',
  success: true,
  tasks: 1
});
```

### Generating Charts
```typescript
// Generate all charts for a test
await ChartGenerator.generateTestCharts('test_name', metrics.getMetrics());

// Generate a single chart
await ChartGenerator.generateChart('chart_name', {
  title: 'Custom Chart',
  type: 'scatter',
  data: transformedData,
  layout: customLayout
});
```

## Output
- HTML files for interactive viewing (`test_name_chart_type.html`)
- PNG files for documentation (`test_name_chart_type.png`)
- All files saved to the `visualizations` directory

## Error Handling
- Invalid or missing data shows fallback visualizations
- Error messages logged to console
- Charts include annotations when data is missing

## Best Practices
1. Always include required fields in metrics
2. Record metrics consistently throughout test execution
3. Use appropriate chart types for different metrics
4. Handle errors gracefully with fallback visualizations
5. Include clear titles and labels for all charts 