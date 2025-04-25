# Test Cases Documentation

## Overview
This document outlines the test cases used in the swarm coordination system, including proper implementation, error handling, and best practices.

## Test Structure

### 1. Basic Test Template
```typescript
async function testCase(): Promise<void> {
  // 1. Initialize
  const logger = TestExecutionUtils.createTestLogger('test_name');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    logger.info('Starting test');
    
    // 2. Setup
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    const agents = TestDataGenerator.generateTestAgents(TEST_SCENARIOS.scenario.agentCount);
    const tasks = TestDataGenerator.generateTestTasks(TEST_SCENARIOS.scenario.taskCount);
    
    // 3. Execute
    await executeTestLogic(system, agents, tasks, metrics, testStartTime);
    
    // 4. Visualize
    await generateVisualizations(metrics, 'test_name');
    
    // 5. Save Results
    await saveTestResults('test_name', metrics);
    
    logger.info('Test completed successfully');
  } catch (error) {
    handleTestError(error, logger);
    throw error;
  }
}
```

## Error Handling

### 1. Task Execution Errors
```typescript
async function executeTask(system: SwarmCoordinationSystem, task: SwarmTask): Promise<SwarmResult> {
  try {
    // Ensure task has required fields
    if (!task.id || !task.type) {
      throw new Error('Invalid task structure');
    }
    
    const result = await system.assignTask(swarmId, task);
    
    // Validate result structure
    if (!result.results || result.results.length === 0) {
      return {
        success: false,
        error: 'No task results',
        results: []
      };
    }
    
    return result;
  } catch (error) {
    logger.error(`Task execution failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}
```

### 2. Metric Recording Errors
```typescript
function recordTaskMetrics(
  metrics: TestMetricsCollector,
  task: SwarmTask,
  result: SwarmResult,
  duration: number,
  testStartTime: number
): void {
  try {
    // Record task duration
    metrics.recordMetric('taskDuration', {
      timestamp: Date.now() - testStartTime,
      value: {
        taskId: task.id,
        duration: duration || 0,
        metrics: {
          duration: duration || 0,
          resourceUsage: {
            cpu: result.results?.[0]?.resourceUsage?.cpu || 0,
            memory: result.results?.[0]?.resourceUsage?.memory || 0
          }
        }
      }
    });
    
    // Record task success
    metrics.recordMetric('taskSuccess', {
      timestamp: Date.now() - testStartTime,
      value: {
        taskId: task.id,
        success: result.success || false,
        value: result.success ? 1 : 0,
        error: result.error
      }
    });
  } catch (error) {
    logger.error(`Failed to record metrics: ${error.message}`);
    // Record failure metric
    metrics.recordMetric('metricFailure', {
      timestamp: Date.now() - testStartTime,
      value: {
        error: error.message,
        taskId: task.id
      }
    });
  }
}
```

## Test Cases

### 1. Basic Coordination Test
```typescript
async function testBasicSwarmCoordination(): Promise<void> {
  const logger = TestExecutionUtils.createTestLogger('basic_coordination');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    // Initialize system
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    
    // Generate and validate test data
    const agents = TestDataGenerator.generateTestAgents(TEST_SCENARIOS.basic.agentCount);
    if (agents.length === 0) {
      throw new Error('No agents generated');
    }
    
    const tasks = TestDataGenerator.generateTestTasks(TEST_SCENARIOS.basic.taskCount);
    if (tasks.length === 0) {
      throw new Error('No tasks generated');
    }
    
    // Register agents with error handling
    for (const agent of agents) {
      try {
        await system.registerAgent(agent);
        logger.debug(`Registered agent: ${agent.id}`);
      } catch (error) {
        logger.error(`Failed to register agent ${agent.id}: ${error.message}`);
        // Continue with remaining agents
      }
    }
    
    // Create swarm with validation
    const swarmId = 'test-swarm';
    const selectedAgents = await system.createSwarm(swarmId, {
      name: 'Test Swarm',
      purpose: 'Basic coordination test'
    });
    
    if (selectedAgents.size === 0) {
      throw new Error('No agents selected for swarm');
    }
    
    // Execute tasks with proper error handling
    for (const task of tasks) {
      const startTime = Date.now();
      const result = await executeTask(system, task);
      const duration = Date.now() - startTime;
      
      // Record metrics with validation
      recordTaskMetrics(metrics, task, result, duration, testStartTime);
      
      // Update agent metrics
      updateAgentMetrics(metrics, selectedAgents, agents, testStartTime);
    }
    
    // Generate visualizations with error handling
    try {
      await TestVisualization.generatePerformanceCharts(metrics, 'basic');
      await TestVisualization.generateSwarmMetricsCharts(metrics, 'basic');
    } catch (error) {
      logger.error(`Visualization generation failed: ${error.message}`);
    }
    
    // Save results
    const testResults = {
      scenario: 'basic',
      totalAgents: agents.length,
      selectedAgents: selectedAgents.size,
      totalTasks: tasks.length,
      metrics: metrics.calculateStatistics()
    };
    
    await TestExecutionUtils.saveTestResults('basic_coordination', testResults);
    logger.info('Basic coordination test completed successfully');
    
  } catch (error) {
    handleTestError(error, logger);
    throw error;
  }
}
```

### 2. Scalability Test
```typescript
async function testSwarmScalability(): Promise<void> {
  const logger = TestExecutionUtils.createTestLogger('scalability');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    // Initialize with batch processing
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    const agents = TestDataGenerator.generateTestAgents(TEST_SCENARIOS.scalability.agentCount);
    
    // Register agents in batches with retry
    const batchSize = TEST_SCENARIOS.scalability.batchSizes[0];
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      await registerAgentBatch(system, batch, metrics, testStartTime);
    }
    
    // Create multiple swarms with validation
    const swarms = await createTestSwarms(system, TEST_SCENARIOS.scalability.swarmCount);
    
    // Execute tasks with load balancing
    const tasks = TestDataGenerator.generateTestTasks(TEST_SCENARIOS.scalability.taskCount);
    await executeTasksWithLoadBalancing(system, tasks, swarms, metrics, testStartTime);
    
    // Generate visualizations
    await generateScalabilityVisualizations(metrics, 'scalability');
    
    // Save results
    await saveScalabilityResults(metrics, agents, swarms, tasks);
    
  } catch (error) {
    handleTestError(error, logger);
    throw error;
  }
}
```

## Helper Functions

### 1. Test Error Handler
```typescript
function handleTestError(error: Error, logger: Logger): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`Test failed: ${errorMessage}`);
  
  if (error.stack) {
    logger.error(`Stack trace: ${error.stack}`);
  }
  
  // Record error in metrics if available
  if (metrics) {
    metrics.recordMetric('testError', {
      timestamp: Date.now() - testStartTime,
      value: {
        message: errorMessage,
        stack: error.stack
      }
    });
  }
}
```

### 2. Agent Metrics Updater
```typescript
function updateAgentMetrics(
  metrics: TestMetricsCollector,
  selectedAgents: Set<string>,
  agents: SwarmAgent[],
  testStartTime: number
): void {
  Array.from(selectedAgents).forEach(agentId => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const { total, available } = agent.resources;
    
    // Calculate resource utilization
    const cpuUtil = ((total.cpu - available.cpu) / total.cpu) * 100;
    const memUtil = ((total.memory - available.memory) / total.memory) * 100;
    const storageUtil = ((total.storage - available.storage) / total.storage) * 100;
    
    // Record with validation
    try {
      metrics.recordMetric('resourceUtilization', {
        timestamp: Date.now() - testStartTime,
        value: {
          agentId,
          cpu: cpuUtil || 0,
          memory: memUtil || 0,
          storage: storageUtil || 0,
          value: cpuUtil || 0
        }
      });
    } catch (error) {
      logger.error(`Failed to record resource metrics for agent ${agentId}: ${error.message}`);
    }
  });
}
```

## Best Practices

### 1. Test Setup
- Initialize logger and metrics collector first
- Validate all generated test data
- Use proper error handling for setup operations
- Record setup metrics for debugging

### 2. Test Execution
- Handle task execution errors gracefully
- Record metrics with proper validation
- Use batching for large-scale operations
- Implement proper cleanup

### 3. Result Collection
- Validate all metrics before recording
- Provide fallback values for missing data
- Generate comprehensive test results
- Include error information in results

### 4. Visualization
- Validate data before generating charts
- Handle visualization errors gracefully
- Provide fallback visualizations
- Include error indicators in charts

## Common Issues and Solutions

### 1. Missing Task IDs
Problem:
```
Cannot read properties of undefined (reading 'taskId')
```

Solution:
```typescript
function validateTask(task: SwarmTask): SwarmTask {
  return {
    id: task?.id || `task-${Date.now()}`,
    type: task?.type || 'unknown',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    // ... other properties
  };
}
```

### 2. Missing Agent IDs
Problem:
```
Cannot read properties of undefined (reading 'agentId')
```

Solution:
```typescript
function validateAgent(agent: SwarmAgent): SwarmAgent {
  return {
    id: agent?.id || `agent-${Date.now()}`,
    type: agent?.type || 'unknown',
    status: agent?.status || 'idle',
    // ... other properties
  };
}
```

## Testing Guidelines

### 1. Unit Tests
```typescript
describe('Test Cases', () => {
  test('Basic Coordination', async () => {
    const metrics = new TestMetricsCollector();
    const result = await testBasicSwarmCoordination();
    expect(result).toBeDefined();
    expect(metrics.get('taskSuccess')).toBeDefined();
  });
});
```

### 2. Integration Tests
```typescript
describe('System Integration', () => {
  test('Full Test Suite', async () => {
    await testBasicSwarmCoordination();
    await testSwarmScalability();
    await testFaultTolerance();
    await testPerformance();
    // Verify test artifacts
    expect(fs.existsSync(TEST_PATHS.results)).toBe(true);
  });
});
``` 