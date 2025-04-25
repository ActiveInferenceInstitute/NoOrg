# Swarm Coordination Test Suite

## Overview
This test suite provides comprehensive testing for the agent swarm coordination system, focusing on:
- Basic coordination capabilities
- System scalability
- Fault tolerance
- Performance under load
- Task visualization

## Directory Structure
```
agents/swarm_test/
├── docs/                    # Documentation
│   ├── METRICS.md          # Metrics documentation
│   ├── TEST_CASES.md       # Test cases documentation
│   └── VISUALIZATION.md    # Visualization documentation
├── logs/                   # Test execution logs
├── results/                # Test results in JSON format
├── visualizations/         # Generated charts and visualizations
├── test_runner.ts         # Main test runner
├── test_cases.ts          # Individual test implementations
├── test_utils.ts          # Test utilities
├── test_config.ts         # Test configuration
└── validation_utils.ts    # Validation utilities
```

## Configuration

### Test Scenarios
The test suite includes several predefined scenarios in `test_config.ts`:

1. **Basic Coordination**
   - Agent Count: 5
   - Task Count: 10
   - Duration: 1 minute
   - Retries: 3

2. **Scalability**
   - Agent Count: 20
   - Task Count: 50
   - Swarm Count: 3
   - Batch Sizes: [5, 10, 20]
   - Duration: 5 minutes

3. **Fault Tolerance**
   - Agent Count: 10
   - Task Count: 20
   - Failure Rate: 30%
   - Recovery Time: 5 seconds
   - Duration: 2 minutes

4. **Performance**
   - Agent Count: 15
   - Task Count: 100
   - Concurrency: 5
   - Duration: 3 minutes
   - Metric Collection Interval: 1 second

### Visualization Configuration
Chart configurations are defined in `VISUALIZATION_CONFIG`:

1. **Task Duration Distribution**
   - Type: Scatter plot
   - X-axis: Time
   - Y-axis: Duration

2. **Task Success Rate**
   - Type: Pie chart
   - Segments: Success/Failure

3. **Resource Utilization**
   - Type: Heatmap
   - X-axis: Resource Type
   - Y-axis: Agent ID

4. **Task Distribution**
   - Type: Bar chart
   - X-axis: Agent ID
   - Y-axis: Task Count

## Running Tests

### Prerequisites
1. Node.js 14+ installed
2. TypeScript installed globally
3. Required dependencies installed:
   ```bash
   npm install
   ```

### Running All Tests
```bash
npm test
```

### Running Individual Tests
```bash
# Basic coordination test
npm run test:basic

# Scalability test
npm run test:scalability

# Fault tolerance test
npm run test:fault-tolerance

# Performance test
npm run test:performance

# Task visualization test
npm run test:visualization
```

### Test Output
1. **Logs**
   - Location: `logs/`
   - Format: `{test_name}.log`
   - Contains: Detailed execution logs

2. **Results**
   - Location: `results/`
   - Format: `{test_name}.json`
   - Contains: Test metrics and statistics

3. **Visualizations**
   - Location: `visualizations/`
   - Formats: HTML (interactive), PNG (static)
   - Types:
     - Task duration charts
     - Success rate charts
     - Resource utilization heatmaps
     - Task distribution charts

## Metrics Collection

### Task Metrics
```typescript
interface TaskMetric {
  timestamp: number;
  value: {
    taskId: string;
    duration: number;
    success: boolean;
  };
}
```

### Agent Metrics
```typescript
interface AgentMetric {
  timestamp: number;
  value: {
    agentId: string;
    tasks: number;
    cpu: number;
    memory: number;
    storage: number;
  };
}
```

## Error Handling

### Validation
- All test data is validated before use
- Metrics are validated before recording
- Chart data is validated before generation

### Recovery
- Failed tasks are retried based on configuration
- Invalid metrics are logged and skipped
- Chart generation failures produce fallback visualizations

## Best Practices

### 1. Test Execution
- Initialize logger and metrics collector first
- Validate all test data before use
- Use proper error handling
- Clean up resources after tests

### 2. Metric Collection
- Include all required fields
- Validate metric values
- Use proper timestamps
- Handle missing data gracefully

### 3. Visualization
- Validate chart data
- Provide fallback visualizations
- Use consistent styling
- Include proper labels and tooltips

## Troubleshooting

### Common Issues

1. **Missing Task IDs**
   ```
   Error: Cannot read properties of undefined (reading 'taskId')
   ```
   Solution:
   - Ensure tasks are properly validated
   - Use validation utilities
   - Check task generation

2. **Empty Chart Data**
   ```
   Warning: Empty data for chart type: line
   ```
   Solution:
   - Verify metric collection
   - Check data transformation
   - Use default data handlers

3. **Invalid Metrics**
   ```
   Error: Invalid metric structure
   ```
   Solution:
   - Validate metric structure
   - Use proper metric types
   - Check metric recording

## Contributing

### Adding New Tests
1. Create test case in `test_cases.ts`
2. Add configuration in `test_config.ts`
3. Update test runner
4. Add documentation
5. Include visualizations

### Adding New Metrics
1. Define metric structure
2. Add validation rules
3. Update metric collector
4. Add visualization support
5. Update documentation

## License
MIT License - See LICENSE file for details 