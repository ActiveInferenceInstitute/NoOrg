import { SwarmCoordinationSystem } from '../implementations/swarm_coordination_system';
import { TEST_CONFIG, TEST_SCENARIOS } from './test_config';
import { TestDataGenerator, TestExecutionUtils, TestMetricsCollector, TestVisualization } from './test_utils';
import { SwarmResult } from '../types/swarm';
import { TowersOfHanoiTaskGenerator, SortingTaskGenerator, TaskVisualizationCollector } from './task_generators';
import { TestLogger } from './logger';
import { ValidationUtils } from './validation_utils';
import { ChartGenerator } from './visualization/chart_generator';

interface TestResult {
  task: string;
  result: SwarmResult;
  duration: number;
  swarm?: string;
}

/**
 * Test basic swarm coordination functionality
 */
export async function testBasicSwarmCoordination(): Promise<void> {
  const logger = new TestLogger('basic_coordination');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    await logger.step('Initializing test environment');
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    await logger.success('System initialized successfully');
    await logger.endStep();

    await logger.step('Registering test template');
    const template = TestDataGenerator.generateTestTemplate(
      'test-swarm',
      'Basic Test Swarm'
    );
    await system.registerTemplate(template);
    await logger.success('Template registered successfully');
    await logger.endStep();

    await logger.step('Generating test agents');
    const agents = TestDataGenerator.generateTestAgents(3);
    for (const agent of agents) {
      await logger.debug(`Generated agent: ${agent.id}`);
      ValidationUtils.validateAgent(agent);
      await system.registerAgent(agent);

      // Record agent metrics
      metrics.recordMetric('resourceUtilization', {
        agentId: agent.id,
        cpu: (agent.resources.total.cpu - agent.resources.available.cpu) / agent.resources.total.cpu * 100,
        memory: (agent.resources.total.memory - agent.resources.available.memory) / agent.resources.total.memory * 100,
        storage: (agent.resources.total.storage - agent.resources.available.storage) / agent.resources.total.storage * 100
      });
    }
    await logger.success(`Generated and registered ${agents.length} agents`);
    await logger.endStep();

    await logger.step('Generating test tasks');
    const tasks = TestDataGenerator.generateTestTasks(3);
    for (const task of tasks) {
      await logger.debug(`Generated task: ${task.id}`);
      ValidationUtils.validateTask(task);
      await system.registerTask(task);
    }
    await logger.success(`Generated and added ${tasks.length} tasks`);
    await logger.endStep();

    await logger.step('Creating swarm');
    const swarmId = 'test-swarm';
    const swarm = await system.createSwarm(swarmId, {
      name: 'Test Swarm',
      purpose: 'Basic coordination test'
    });
    await logger.success(`Created swarm with ${swarm.size} agents`);
    await logger.metric('swarmSize', swarm.size);
    await logger.endStep();

    await logger.step('Executing tasks');
    for (const task of tasks) {
      const startTime = Date.now();
      const result = await system.assignTask(swarmId, task);
      const duration = Date.now() - startTime;

      // Record task metrics
      metrics.recordMetric('taskDuration', {
        taskId: task.id,
        duration,
        success: result.success
      });

      metrics.recordMetric('taskSuccess', {
        taskId: task.id,
        success: result.success,
        value: result.success ? 1 : 0
      });

      // Record task distribution with agent IDs
      if (result.results) {
        for (const taskResult of result.results) {
          metrics.recordMetric('taskDistribution', {
            agentId: taskResult.agentId,
            taskId: task.id,
            success: result.success,
            tasks: 1,
            timestamp: Date.now() - startTime
          });

          // Update resource utilization for the agent
          const agent = agents.find(a => a.id === taskResult.agentId);
          if (agent) {
            metrics.recordMetric('resourceUtilization', {
              agentId: agent.id,
              cpu: (agent.resources.total.cpu - agent.resources.available.cpu) / agent.resources.total.cpu * 100,
              memory: (agent.resources.total.memory - agent.resources.available.memory) / agent.resources.total.memory * 100,
              storage: (agent.resources.total.storage - agent.resources.available.storage) / agent.resources.total.storage * 100,
              timestamp: Date.now() - startTime
            });
          }
        }
      }

      await logger.debug(`Task ${task.id} completed: ${result.success}`);
    }
    await logger.success('Tasks executed successfully');
    await logger.endStep();

    await logger.step('Generating visualizations');
    await ChartGenerator.generateTestCharts('basic_coordination', metrics.getMetrics());
    await logger.success('Generated visualizations');
    await logger.endStep();

    // Save test results
    const testResults = {
      agents: agents.length,
      tasks: tasks.length,
      swarmSize: swarm.size,
      metrics: metrics.calculateStatistics()
    };
    await TestExecutionUtils.saveTestResults('basic_coordination', testResults);
    await logger.success('Test completed successfully');
    
  } catch (error) {
    await logger.error('Test failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Test swarm scalability
 */
export async function testSwarmScalability(): Promise<void> {
  const logger = new TestLogger('scalability');
  
  try {
    await logger.step('Initializing test environment');
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    await logger.success('System initialized successfully');
    await logger.endStep();

    await logger.step('Registering test templates');
    for (let i = 0; i < 5; i++) {
      const template = TestDataGenerator.generateTestTemplate(
        `test-swarm-${i}`,
        `Scalability Test Swarm ${i}`
      );
      await system.registerTemplate(template);
      await logger.debug(`Registered template: test-swarm-${i}`);
    }
    await logger.success('Templates registered successfully');
    await logger.endStep();

    await logger.step('Testing agent scaling');
    const agentCounts = [5, 10, 20];
    for (const count of agentCounts) {
      await logger.info(`Testing with ${count} agents`);
      const agents = TestDataGenerator.generateTestAgents(count);
      
      for (const agent of agents) {
        ValidationUtils.validateAgent(agent);
        await system.registerAgent(agent);
      }
      
      await logger.metric('agentCount', count);
      await logger.success(`Registered ${count} agents successfully`);
    }
    await logger.endStep();

    await logger.step('Testing task scaling');
    const taskCounts = [5, 10, 20];
    for (const count of taskCounts) {
      await logger.info(`Testing with ${count} tasks`);
      const tasks = TestDataGenerator.generateTestTasks(count);
      
      for (const task of tasks) {
        ValidationUtils.validateTask(task);
        await system.registerTask(task);
      }
      
      await logger.metric('taskCount', count);
      await logger.success(`Added ${count} tasks successfully`);
    }
    await logger.endStep();

    await logger.step('Testing concurrent swarm creation');
    const swarmPromises = [];
    for (let i = 0; i < taskCounts[0]; i++) {
      const swarmId = `test-swarm-${i}`;
      swarmPromises.push(system.createSwarm(swarmId, {
        name: `Test Swarm ${i}`,
        purpose: 'Scalability test'
      }));
    }
    const swarms = await Promise.all(swarmPromises);
    await logger.success(`Created ${swarms.length} swarms concurrently`);
    await logger.metric('concurrentSwarms', swarms.length);
    await logger.endStep();

    await logger.step('Testing concurrent task execution');
    const startTime = Date.now();
    const tasks = TestDataGenerator.generateTestTasks(swarms.length);
    const executionPromises = swarms.map((swarm, index) => 
      system.assignTask(`test-swarm-${index}`, tasks[index])
    );
    
    const results = await Promise.all(executionPromises);
    const duration = Date.now() - startTime;
    
    await logger.success(`Executed ${results.length} tasks concurrently in ${duration}ms`);
    await logger.metric('concurrentExecution', {
      tasks: results.length,
      duration,
      successRate: results.filter(r => r.success).length / results.length
    });
    await logger.endStep();

    // Save test results
    const testResults = {
      agentScaling: agentCounts,
      taskScaling: taskCounts,
      concurrentSwarms: swarms.length,
      executionResults: {
        tasks: results.length,
        duration,
        successRate: results.filter(r => r.success).length / results.length
      }
    };
    await TestExecutionUtils.saveTestResults('scalability', testResults);
    await logger.success('Test completed successfully');
    
  } catch (error) {
    await logger.error('Test failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Test fault tolerance
 */
export async function testFaultTolerance(): Promise<void> {
  const logger = new TestLogger('fault_tolerance');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    await logger.step('Initializing test environment');
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    await logger.success('System initialized successfully');
    await logger.endStep();

    await logger.step('Registering test template');
    const template = TestDataGenerator.generateTestTemplate(
      'fault-tolerance-swarm',
      'Fault Tolerance Test Swarm'
    );
    await system.registerTemplate(template);
    await logger.success('Template registered successfully');
    await logger.endStep();

    await logger.step('Generating test data');
    const agents = TestDataGenerator.generateTestAgents(TEST_SCENARIOS.faultTolerance.agentCount);
    const tasks = TestDataGenerator.generateTestTasks(TEST_SCENARIOS.faultTolerance.taskCount);
    await logger.success(`Generated ${agents.length} agents and ${tasks.length} tasks`);
    await logger.endStep();

    await logger.step('Registering agents');
    for (const agent of agents) {
      await system.registerAgent(agent);
      await logger.debug(`Registered agent: ${agent.id}`);

      // Record initial resource utilization
      metrics.recordMetric('resourceUtilization', {
        agentId: agent.id,
        cpu: (agent.resources.total.cpu - agent.resources.available.cpu) / agent.resources.total.cpu * 100,
        memory: (agent.resources.total.memory - agent.resources.available.memory) / agent.resources.total.memory * 100,
        storage: (agent.resources.total.storage - agent.resources.available.storage) / agent.resources.total.storage * 100
      });
    }
    await logger.success(`Registered ${agents.length} agents`);
    await logger.endStep();

    await logger.step('Creating swarm');
    const swarmId = 'fault-tolerance-swarm';
    const selectedAgents = await system.createSwarm(swarmId, {
      name: 'Fault Tolerance Test Swarm',
      purpose: 'Testing fault tolerance'
    });
    await logger.success(`Created swarm with ${selectedAgents.size} agents`);
    await logger.endStep();

    await logger.step('Simulating agent failures');
    const failureCount = Math.floor(agents.length * TEST_SCENARIOS.faultTolerance.failureRate);
    const failedAgents = new Set<string>();
    
    for (let i = 0; i < failureCount; i++) {
      const agentId = Array.from(selectedAgents)[i];
      failedAgents.add(agentId);
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        agent.status = 'offline';
        await logger.debug(`Agent ${agentId} marked as offline`);

        // Record resource utilization for failed agent (all resources at 0%)
        metrics.recordMetric('resourceUtilization', {
          agentId: agent.id,
          cpu: 0,
          memory: 0,
          storage: 0
        });
      }
    }
    await logger.success(`Simulated failure of ${failureCount} agents`);
    await logger.endStep();

    await logger.step('Executing tasks');
    const results: TestResult[] = [];
    
    for (const task of tasks) {
      const startTime = Date.now();
      const result = await system.assignTask(swarmId, task);
      const duration = Date.now() - startTime;
      
      results.push({ task: task.id, result, duration });
      
      metrics.recordMetric('taskDuration', {
        taskId: task.id,
        duration,
        success: result.success
      });
      
      metrics.recordMetric('taskSuccess', {
        taskId: task.id,
        success: result.success,
        value: result.success ? 1 : 0
      });

      // Record task distribution and update resource utilization
      if (result.results) {
        for (const taskResult of result.results) {
          const agent = agents.find(a => a.id === taskResult.agentId);
          if (agent && agent.status !== 'offline') {
            metrics.recordMetric('taskDistribution', {
              agentId: taskResult.agentId,
              taskId: task.id,
              success: result.success,
              tasks: 1
            });

            // Update resource utilization for active agent
            metrics.recordMetric('resourceUtilization', {
              agentId: agent.id,
              cpu: (agent.resources.total.cpu - agent.resources.available.cpu) / agent.resources.total.cpu * 100,
              memory: (agent.resources.total.memory - agent.resources.available.memory) / agent.resources.total.memory * 100,
              storage: (agent.resources.total.storage - agent.resources.available.storage) / agent.resources.total.storage * 100
            });
          }
        }
      }

      await logger.debug(`Task ${task.id} completed: ${result.success}`);
    }
    await logger.success(`Executed ${tasks.length} tasks`);
    await logger.endStep();

    await logger.step('Generating visualizations');
    await ChartGenerator.generateTestCharts('fault_tolerance', metrics.getMetrics());
    await logger.success('Generated visualizations');
    await logger.endStep();

    // Save test results
    const testResults = {
      scenario: 'faultTolerance',
      totalAgents: agents.length,
      failedAgents: Array.from(failedAgents),
      totalTasks: tasks.length,
      results,
      metrics: metrics.calculateStatistics()
    };
    await TestExecutionUtils.saveTestResults('fault_tolerance', testResults);
    await logger.success('Test completed successfully');
    
  } catch (error) {
    await logger.error('Test failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Test performance under load
 */
export async function testPerformance(): Promise<void> {
  const logger = new TestLogger('performance');
  const metrics = new TestMetricsCollector();
  const testStartTime = Date.now();
  
  try {
    await logger.step('Initializing test environment');
    const system = new SwarmCoordinationSystem(TEST_CONFIG);
    await logger.success('System initialized successfully');
    await logger.endStep();

    await logger.step('Registering test template');
    const template = TestDataGenerator.generateTestTemplate(
      'performance-swarm',
      'Performance Test Swarm'
    );
    await system.registerTemplate(template);
    await logger.success('Template registered successfully');
    await logger.endStep();

    await logger.step('Generating test data');
    const agents = TestDataGenerator.generateTestAgents(TEST_SCENARIOS.performance.agentCount);
    const tasks = TestDataGenerator.generateTestTasks(TEST_SCENARIOS.performance.taskCount);
    await logger.success(`Generated ${agents.length} agents and ${tasks.length} tasks`);
    await logger.endStep();

    await logger.step('Registering agents');
    for (const agent of agents) {
      await system.registerAgent(agent);
      await logger.debug(`Registered agent: ${agent.id}`);
    }
    await logger.success(`Registered ${agents.length} agents`);
    await logger.endStep();

    await logger.step('Creating swarm');
    const swarmId = 'performance-swarm';
    const selectedAgents = await system.createSwarm(swarmId, {
      name: 'Performance Test Swarm',
      purpose: 'Testing performance under load'
    });
    await logger.success(`Created swarm with ${selectedAgents.size} agents`);
    await logger.endStep();

    await logger.step('Executing tasks in batches');
    const results: TestResult[] = [];
    const batchSize = TEST_SCENARIOS.performance.concurrency;
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, Math.min(i + batchSize, tasks.length));
      const startTime = Date.now();
      
      await logger.debug(`Executing batch of ${batch.length} tasks`);
      const batchResults = await Promise.all(
        batch.map(task => system.assignTask(swarmId, task))
      );
      
      const duration = Date.now() - startTime;
      
      // Record individual task metrics
      for (let j = 0; j < batch.length; j++) {
        const task = batch[j];
        const result = batchResults[j];
        const taskDuration = duration / batch.length; // Approximate individual duration

        metrics.recordMetric('taskDuration', {
          taskId: task.id,
          duration: taskDuration,
          success: result.success
        });

        metrics.recordMetric('taskSuccess', {
          taskId: task.id,
          success: result.success,
          value: result.success ? 1 : 0
        });

        // Record task distribution
        if (result.results) {
          result.results.forEach(r => {
            metrics.recordMetric('taskDistribution', {
              agentId: r.agentId,
              taskId: task.id,
              success: result.success,
              tasks: 1
            });
          });
        }
      }
      
      // Record batch metrics
      metrics.recordMetric('batchDuration', {
        timestamp: Date.now() - testStartTime,
        value: {
          duration,
          batchSize: batch.length,
          successRate: batchResults.filter(r => r.success).length / batch.length
        }
      });

      // Record resource utilization for each agent
      for (const agentId of selectedAgents) {
        const agentResult = batchResults
          .flatMap(r => r.results || [])
          .find(r => r?.agentId === agentId);
          
        if (agentResult?.metrics?.resourceUtilization) {
          metrics.recordMetric('resourceUtilization', {
            agentId,
            ...agentResult.metrics.resourceUtilization
          });
        }
      }
      
      await logger.debug(`Batch completed in ${duration}ms with ${batchResults.filter(r => r.success).length} successes`);
    }
    await logger.success(`Executed ${tasks.length} tasks in ${results.length / batchSize} batches`);
    await logger.endStep();

    await logger.step('Generating visualizations');
    await ChartGenerator.generateTestCharts('performance', metrics.getMetrics());
    await logger.success('Generated visualizations');
    await logger.endStep();

    // Save test results
    const testResults = {
      scenario: 'performance',
      totalAgents: agents.length,
      selectedAgents: selectedAgents.size,
      totalTasks: tasks.length,
      concurrency: TEST_SCENARIOS.performance.concurrency,
      results,
      metrics: metrics.calculateStatistics()
    };
    await TestExecutionUtils.saveTestResults('performance', testResults);
    await logger.success('Test completed successfully');
    
  } catch (error) {
    await logger.error('Test failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Test case for task visualization
 */
export async function testTaskVisualization(): Promise<void> {
  console.log('🔵 Starting test: Task Visualization');
  
  // Initialize test environment
  console.log('📋 Initializing test environment');
  const metrics = new TestMetricsCollector();
  await TestExecutionUtils.initializeTestDirectories();
  
  // Test Towers of Hanoi
  console.log('📋 Testing Towers of Hanoi');
  const numDisks = 4;
  
  // Initialize Hanoi state
  const initialState = {
    A: Array.from({length: numDisks}, (_, i) => numDisks - i),
    B: [],
    C: []
  };
  
  // Record initial state
  metrics.recordMetric('hanoiStates', {
    disk: 0,
    from: 'A',
    to: 'A',
    state: {...initialState}
  });
  
  // Helper function to move disk
  const moveDisk = async (disk: number, from: string, to: string, state: any) => {
    console.log(`⚪ Moving disk ${disk} from ${from} to ${to}`);
    
    // Create new state to avoid mutation
    const newState = {
      A: [...state.A],
      B: [...state.B],
      C: [...state.C]
    };
    
    const fromTower = newState[from as keyof typeof newState];
    const toTower = newState[to as keyof typeof newState];
    
    if (fromTower.length > 0) {
      const movedDisk = fromTower.pop();
      if (movedDisk !== undefined) {
        toTower.push(movedDisk);
      }
    }
    
    // Record state
    metrics.recordMetric('hanoiStates', {
      disk,
      from,
      to,
      state: {...newState}
    });
    
    // Simulate task execution delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newState;
  };
  
  // Recursive function to solve Towers of Hanoi
  const solveHanoi = async (n: number, from: string, to: string, aux: string, state: any): Promise<any> => {
    if (n === 1) {
      return await moveDisk(1, from, to, state);
    }
    
    let newState = {...state};
    newState = await solveHanoi(n - 1, from, aux, to, newState);
    newState = await moveDisk(n, from, to, newState);
    newState = await solveHanoi(n - 1, aux, to, from, newState);
    
    return newState;
  };
  
  // Solve Towers of Hanoi
  console.log('Starting Hanoi solution...');
  await solveHanoi(numDisks, 'A', 'C', 'B', initialState);
  console.log(`🟢 Completed Towers of Hanoi with ${numDisks} disks`);
  
  // Generate visualizations
  console.log('📋 Generating visualizations');
  await TestVisualization.generateTaskVisualizations('task_visualization', metrics.getMetrics());
  
  console.log('🟢 Generated visualizations');
  console.log('🟢 Test completed successfully');
}

/**
 * Helper function to merge sorted arrays
 */
function mergeSortedArrays(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
} 