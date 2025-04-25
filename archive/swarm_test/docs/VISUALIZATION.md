# Test Visualization System

## Overview
The test visualization system provides comprehensive charting capabilities for analyzing test results and metrics. It supports multiple chart types, automatic fallbacks, and both HTML and PNG output formats.

## Chart Types

### 1. Task Duration Distribution
```typescript
interface TaskDurationChart {
  type: 'scatter';
  data: {
    x: number[];  // Timestamps
    y: number[];  // Duration values
    mode: 'lines+markers';
    name: 'Duration';
  };
  layout: {
    xaxis: { title: 'Time (ms)' };
    yaxis: { title: 'Duration (ms)' };
  };
}
```

### 2. Task Success Rate
```typescript
interface TaskSuccessChart {
  type: 'pie';
  data: {
    values: number[];  // [successful, failed]
    labels: string[];  // ['Success', 'Failed']
    marker: {
      colors: string[];  // Success/failure colors
    };
  };
  layout: {
    showlegend: true;
  };
}
```

### 3. Resource Utilization
```typescript
interface ResourceUtilizationChart {
  type: 'heatmap';
  data: {
    z: number[][];    // Resource values
    x: string[];      // Resource types
    y: string[];      // Agent IDs
    colorscale: string;
  };
  layout: {
    xaxis: { title: 'Resource Type' };
    yaxis: { title: 'Agent ID' };
  };
}
```

### 4. Task Distribution
```typescript
interface TaskDistributionChart {
  type: 'bar';
  data: {
    x: string[];  // Agent IDs
    y: number[];  // Task counts
    marker: {
      color: string;
    };
  };
  layout: {
    xaxis: { title: 'Agent ID' };
    yaxis: { title: 'Tasks' };
  };
}
```

## Usage

### 1. Basic Chart Generation
```typescript
import { ChartGenerator } from './visualization/chart_generator';

// Generate a single chart
await ChartGenerator.generateChart('test_duration', {
  title: 'Task Duration',
  type: 'scatter',
  data: durationData,
  layout: {
    xaxis: { title: 'Time' },
    yaxis: { title: 'Duration' }
  }
});

// Generate all charts for a test case
await ChartGenerator.generateTestCharts('test_name', metrics);
```

### 2. Metric Collection
```typescript
// Record metrics during test execution
metrics.recordMetric('taskDuration', {
  timestamp: Date.now() - startTime,
  value: {
    taskId: task.id,
    duration: duration,
    success: result.success
  }
});
```

### 3. Custom Charts
```typescript
// Create custom chart configuration
const customConfig = {
  title: 'Custom Metric',
  type: 'line',
  data: customData,
  layout: customLayout,
  options: {
    responsive: true,
    displayModeBar: true
  }
};

await ChartGenerator.generateChart('custom_chart', customConfig);
```

## Features

### 1. Automatic Fallbacks
- Handles missing or invalid data gracefully
- Provides informative fallback visualizations
- Includes error messages in generated charts

### 2. Multiple Output Formats
- HTML files for interactive viewing
- PNG files for documentation
- Consistent styling across formats

### 3. Error Handling
- Validates input data before generation
- Provides meaningful error messages
- Continues execution even if some charts fail

## Directory Structure
```
agents/swarm_test/
├── visualization/
│   ├── chart_generator.ts    # Main chart generation logic
│   └── types.ts             # Chart type definitions
├── docs/
│   └── VISUALIZATION.md     # This documentation
└── visualizations/          # Generated chart output
    ├── *.html              # Interactive charts
    └── *.png               # Static chart images
```

## Best Practices

### 1. Data Preparation
```typescript
// Good
const data = metrics.map(m => ({
  x: m.timestamp,
  y: m.value.duration || 0,  // Provide fallback
  text: `Task: ${m.value.taskId || 'unknown'}`  // Handle missing data
}));

// Bad
const data = metrics.map(m => ({
  x: m.timestamp,
  y: m.value.duration,  // No fallback
  text: m.value.taskId  // May be undefined
}));
```

### 2. Chart Configuration
```typescript
// Good
const config = {
  title: 'Task Metrics',
  layout: {
    showlegend: true,
    margin: { t: 50, l: 50, r: 50, b: 50 },
    xaxis: {
      title: 'Time',
      showgrid: true,
      zeroline: true
    }
  }
};

// Bad
const config = {
  title: 'Task Metrics',
  layout: {
    xaxis: { title: 'Time' }  // Missing important configuration
  }
};
```

### 3. Error Handling
```typescript
// Good
try {
  await ChartGenerator.generateChart('test_chart', config);
} catch (error) {
  console.warn(`Failed to generate chart: ${error.message}`);
  // Continue with other charts
}

// Bad
await ChartGenerator.generateChart('test_chart', config);  // Unhandled errors
```

## Common Issues and Solutions

### 1. Missing Data
Problem:
```
Empty data for chart type: line
```

Solution:
```typescript
// Provide default data
const data = metrics.length > 0 ? metrics : [{
  timestamp: 0,
  value: { duration: 0 }
}];
```

### 2. Invalid Chart Type
Problem:
```
Invalid chart type specified
```

Solution:
```typescript
// Use type union to prevent invalid types
type ChartType = 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
```

### 3. Chart Generation Failure
Problem:
```
Failed to generate PNG: Error: Page crashed
```

Solution:
```typescript
// Implement retry logic
async function generateWithRetry(name: string, config: ChartConfig): Promise<void> {
  for (let i = 0; i < 3; i++) {
    try {
      await ChartGenerator.generateChart(name, config);
      break;
    } catch (error) {
      if (i === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

## Contributing

### Adding New Chart Types
1. Add type definition to `ChartConfig`
2. Implement data transformation function
3. Add fallback data handler
4. Update documentation
5. Add example usage

### Improving Existing Charts
1. Maintain backward compatibility
2. Add new options as optional parameters
3. Update fallback handlers if needed
4. Document changes
5. Update examples 