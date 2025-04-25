# Swarm Coordination System Test Suite

## Overview
This test suite provides comprehensive testing for the agent swarm coordination system, focusing on key aspects of distributed system behavior, performance, and reliability.

## Test Cases

### 1. Basic Coordination Test
Tests fundamental swarm coordination capabilities:
- Agent registration and capability validation
- Task assignment and execution
- Resource utilization tracking
- Basic metrics collection

```typescript
await testBasicSwarmCoordination();
```

#### Metrics Collected:
- Task Duration
- Task Success Rate
- Resource Utilization
- Task Distribution

### 2. Scalability Test
Tests system behavior under increasing load:
- Agent scaling (5, 10, 20 agents)
- Task scaling (5, 10, 20 tasks)
- Concurrent swarm creation
- Concurrent task execution

```typescript
await testSwarmScalability();
```

#### Metrics Collected:
- Agent Count
- Task Count
- Concurrent Swarms
- Execution Time
- Success Rate

### 3. Fault Tolerance Test
Tests system resilience to failures:
- Agent failure simulation
- Task redistribution
- Recovery mechanisms
- Resource reallocation

```typescript
await testFaultTolerance();
```

#### Metrics Collected:
- Failed Agent Count
- Task Success Rate
- Recovery Time
- Resource Reallocation

### 4. Performance Test
Tests system performance under load:
- Batch task processing
- Resource utilization
- Throughput measurement
- Latency tracking

```typescript
await testPerformance();
```

#### Metrics Collected:
- Batch Duration
- Task Duration
- Resource Utilization
- Throughput
- Latency

### 5. Task Visualization Test
Tests specific task implementations with visualization:
- Parallel Sorting
- Towers of Hanoi
- State visualization
- Progress tracking

```typescript
await testTaskVisualization();
```

#### Visualizations Generated:
- Sorting Progress
- Hanoi Moves
- Resource Usage
- Task Distribution

## Visualization System

### Chart Types
1. Task Duration Distribution (Scatter)
   - X-axis: Time
   - Y-axis: Duration
   - Moving average line

2. Task Success Rate (Pie)
   - Success/Failure distribution
   - Percentage labels

3. Resource Utilization (Heatmap)
   - X-axis: Resource types
   - Y-axis: Agent IDs
   - Color scale: 0-100%

4. Task Distribution (Bar)
   - X-axis: Agent IDs
   - Y-axis: Task count
   - Stacked by success/failure

### Task-Specific Visualizations

#### Towers of Hanoi
- Interactive HTML visualization
- Animated GIF generation
- Step-by-step move display
- Disk movement tracking

#### Parallel Sorting
- Chunk sorting progress
- Merge step visualization
- Array state tracking
- Performance metrics

## Metrics Collection

### System Metrics
```typescript
interface SystemMetrics {
  timestamp: number;
  swarmSize: number;
  activeAgents: number;
  resourceUtilization: ResourceUtilization;
  taskMetrics: TaskMetrics;
}
```

### Task Metrics
```typescript
interface TaskMetrics {
  taskId: string;
  duration: number;
  success: boolean;
  resourceUsage: ResourceUsage;
}
```

### Resource Metrics
```typescript
interface ResourceMetrics {
  agentId: string;
  cpu: number;    // Percentage
  memory: number; // Percentage
  storage: number; // Percentage
}
```

## Test Configuration

### Environment Setup
```typescript
const TEST_CONFIG = {
  logLevel: 'debug',
  metrics: {
    enabled: true,
    interval: 1000
  },
  resources: {
    monitoring: {
      enabled: true,
      interval: 1000
    }
  }
};
```

### Test Scenarios
```typescript
const TEST_SCENARIOS = {
  basic: {
    agentCount: 5,
    taskCount: 10
  },
  scalability: {
    agentCount: [5, 10, 20],
    taskCount: [5, 10, 20]
  },
  faultTolerance: {
    agentCount: 10,
    failureRate: 0.3
  },
  performance: {
    agentCount: 15,
    taskCount: 100,
    concurrency: 5
  }
};
```

## Output Files

### Directory Structure
```
agents/swarm_test/
├── logs/                    # Test execution logs
├── results/                 # Test results (JSON)
└── visualizations/          # Generated visualizations
    ├── *.html              # Interactive charts
    ├── *.png               # Static charts
    └── *.gif               # Animated visualizations
```

### Log Format
```
[TIMESTAMP] [LEVEL] [STEP] Message
```

### Results Format
```json
{
  "testName": "string",
  "duration": "number",
  "metrics": {
    "taskSuccess": "number",
    "averageDuration": "number",
    "resourceUtilization": "object"
  },
  "errors": "array"
}
```

## Best Practices

### 1. Test Execution
- Initialize logger and metrics collector first
- Validate all test data
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

### 4. Error Handling
- Log all errors with context
- Provide fallback behavior
- Clean up resources on failure
- Report detailed error information

## Running Tests

### Prerequisites
1. Node.js 14+
2. TypeScript
3. Required dependencies:
   ```bash
   npm install
   ```

### Running Individual Tests
```bash
npm run test:basic
npm run test:scalability
npm run test:fault-tolerance
npm run test:performance
npm run test:visualization
```

### Running All Tests
```bash
npm test
```

## Extending the Test Suite

### Adding New Test Cases
1. Create test case file in `test_cases.ts`
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

### Adding New Visualizations
1. Create visualization class
2. Add chart generation logic
3. Implement data transformation
4. Add to test cases
5. Update documentation 