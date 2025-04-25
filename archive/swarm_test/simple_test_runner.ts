import { TestLogger } from './logger';
import { SwarmCoordinationSystem } from '../implementations/swarm_coordination_system';
import { TEST_CONFIG, TEST_SCENARIOS } from './test_config';
import { TestDataGenerator } from './test_utils';
import { ValidationUtils } from './validation_utils';
import fs from 'fs-extra';
import path from 'path';

/**
 * Simple test runner for basic functionality
 */
async function runSimpleTests() {
  const logger = new TestLogger('simple_tests');
  let passed = 0;
  let failed = 0;
  
  try {
    // Initialize test environment
    await logger.step('Initializing Test Environment');
    await fs.ensureDir(path.join(__dirname, 'logs'));
    await fs.ensureDir(path.join(__dirname, 'results'));
    
    // Test 1: System Initialization
    await logger.step('Test 1: System Initialization');
    try {
      const system = new SwarmCoordinationSystem(TEST_CONFIG);
      await logger.success('System initialized successfully');
      passed++;
    } catch (error) {
      await logger.error('System initialization failed', error as Error);
      failed++;
    }

    // Test 2: Agent Generation
    await logger.step('Test 2: Agent Generation');
    try {
      const agents = TestDataGenerator.generateTestAgents(3);
      if (agents.length !== 3) {
        throw new Error('Wrong number of agents generated');
      }
      
      // Validate each agent
      for (const agent of agents) {
        const validatedAgent = ValidationUtils.validateAgent(agent);
        await logger.debug(`Generated agent: ${validatedAgent.id}`);
      }
      
      await logger.success('Agents generated and validated successfully');
      passed++;
    } catch (error) {
      await logger.error('Agent generation failed', error as Error);
      failed++;
    }

    // Test 3: Task Generation
    await logger.step('Test 3: Task Generation');
    try {
      const tasks = TestDataGenerator.generateTestTasks(3);
      if (tasks.length !== 3) {
        throw new Error('Wrong number of tasks generated');
      }
      
      // Validate each task
      for (const task of tasks) {
        const validatedTask = ValidationUtils.validateTask(task);
        await logger.debug(`Generated task: ${validatedTask.id}`);
      }
      
      await logger.success('Tasks generated and validated successfully');
      passed++;
    } catch (error) {
      await logger.error('Task generation failed', error as Error);
      failed++;
    }

    // Test 4: Basic Swarm Creation
    await logger.step('Test 4: Basic Swarm Creation');
    try {
      const system = new SwarmCoordinationSystem(TEST_CONFIG);
      const agents = TestDataGenerator.generateTestAgents(3);
      
      // Register agents
      for (const agent of agents) {
        await system.registerAgent(agent);
        await logger.debug(`Registered agent: ${agent.id}`);
      }
      
      // Create swarm
      const swarmId = 'test-swarm';
      const selectedAgents = await system.createSwarm(swarmId, {
        name: 'Test Swarm',
        purpose: 'Simple test'
      });
      
      if (selectedAgents.size === 0) {
        throw new Error('No agents selected for swarm');
      }
      
      await logger.success(`Swarm created with ${selectedAgents.size} agents`);
      passed++;
    } catch (error) {
      await logger.error('Swarm creation failed', error as Error);
      failed++;
    }

    // Test 5: Simple Task Execution
    await logger.step('Test 5: Simple Task Execution');
    try {
      const system = new SwarmCoordinationSystem(TEST_CONFIG);
      const agents = TestDataGenerator.generateTestAgents(3);
      
      // Register agents
      for (const agent of agents) {
        await system.registerAgent(agent);
      }
      
      // Create swarm
      const swarmId = 'test-swarm';
      const selectedAgents = await system.createSwarm(swarmId, {
        name: 'Test Swarm',
        purpose: 'Simple test'
      });
      
      // Create and execute a single task
      const task = ValidationUtils.validateTask({
        id: 'test-task-1',
        type: 'test',
        priority: 'medium',
        status: 'pending',
        requiredCapabilities: [],
        resourceRequirements: {
          cpu: 1,
          memory: 512,
          storage: 64
        },
        divisible: false,
        size: 1
      });
      
      const result = await system.assignTask(swarmId, task);
      
      if (!result.success) {
        throw new Error('Task execution failed');
      }
      
      await logger.success('Task executed successfully');
      passed++;
    } catch (error) {
      await logger.error('Task execution failed', error as Error);
      failed++;
    }

    // Log final summary
    await logger.summary({ passed, failed, total: passed + failed });
    
  } catch (error) {
    await logger.error('Test suite failed', error as Error);
  }
  
  // Return test results
  return {
    passed,
    failed,
    total: passed + failed
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSimpleTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { runSimpleTests }; 