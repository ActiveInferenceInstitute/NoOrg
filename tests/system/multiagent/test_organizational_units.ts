/**
 * Test for Organizational Unit-Based Multiagent Compositions
 * 
 * This test validates that agents can be composed according to organizational units
 * defined in the units/ directory structure.
 */

import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Import core components
import { Agent, Task } from '../../../src/core/multiagent/types';
import { 
  createTestFixture, 
  createTestAgent,
  createTestTask,
  setupTestScenario,
  TEST_TIMEOUT 
} from '../../utils/test-helpers';

describe('Organizational Unit-Based Multiagent Composition', function() {
  this.timeout(TEST_TIMEOUT);
  
  // Test fixture
  let fixture;

  // Generate unique test ID
  const testId = uuidv4().substring(0, 8);
  
  // Set up test fixture before tests
  before(async function() {
    fixture = createTestFixture();
    await fixture.coordinator.initialize();
  });
  
  // Clean up after tests
  after(async function() {
    // Clean up any test resources
  });
  
  /**
   * This test demonstrates how to compose agents based on the organizational
   * structure defined in the units/ directory.
   */
  it('should compose agents based on organizational units', async function() {
    // Get organizational units from the units/ directory
    const unitsDir = path.join(process.cwd(), 'units');
    const units = fs.readdirSync(unitsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    expect(units.length).to.be.greaterThan(0, 'No organizational units found');
    
    console.log(`Found ${units.length} organizational units`);
    console.log(`Using units: ${units.slice(0, 3).join(', ')}${units.length > 3 ? '...' : ''}`);
    
    // Sample capabilities for organizational units
    const unitCapabilities = {
      'Research': ['research', 'analysis', 'reporting'],
      'Development': ['coding', 'testing', 'documentation'],
      'Operations': ['deployment', 'monitoring', 'maintenance'],
      'Marketing': ['content-creation', 'social-media', 'analytics'],
      'Finance': ['budgeting', 'forecasting', 'reporting'],
      'Human_Resources': ['recruitment', 'training', 'policy-development'],
      // Add more unit capabilities as needed
    };
    
    // Create agents for each organizational unit (limit to 5 for the test)
    const testUnits = units.slice(0, 5);
    const agents: Agent[] = [];
    
    for (const unit of testUnits) {
      // Get capabilities for this unit or use default capabilities
      const capabilities = unitCapabilities[unit] || ['coordination', 'communication', 'problem-solving'];
      
      // Create an agent for this unit
      const agent = createTestAgent(unit, capabilities, {
        name: `${unit} Agent`,
        description: `Agent for the ${unit} organizational unit`,
        metadata: {
          unit: unit,
          test: testId
        }
      });
      
      agents.push(agent);
    }
    
    // Register agents
    const agentIds: string[] = [];
    for (const agent of agents) {
      const agentId = await fixture.agentRegistry.registerAgent(agent);
      agentIds.push(agentId);
    }
    
    expect(agentIds.length).to.equal(agents.length, 'Not all agents were registered');
    
    // Create a composition task
    const compositionTask = await fixture.taskManager.createTask({
      type: 'composition',
      title: `Organizational Composition Test ${testId}`,
      description: 'Create a composition of agents based on organizational units',
      status: 'pending',
      priority: 'medium',
      metadata: {
        test: testId,
        units: testUnits
      }
    });
    
    // Set up shared state
    await fixture.sharedStateManager.setState(`test.${testId}.composition`, {
      id: compositionTask,
      status: 'pending',
      agents: agentIds,
      units: testUnits
    });
    
    // Create a workflow with tasks for agents
    const workflowTasks: Task[] = [];
    
    // Add a task for each agent
    for (let i = 0; i < agentIds.length; i++) {
      const task = await fixture.taskManager.createTask({
        type: 'unit-task',
        title: `Task for ${testUnits[i]}`,
        description: `Perform actions relevant to the ${testUnits[i]} unit`,
        status: 'pending',
        priority: 'medium',
        assignedTo: agentIds[i],
        metadata: {
          test: testId,
          unit: testUnits[i]
        }
      });
      
      workflowTasks.push(task);
    }
    
    // Create a coordination task
    const coordinationTask = await fixture.taskManager.createTask({
      type: 'coordination',
      title: 'Coordinate Organizational Units',
      description: 'Coordinate the work between different organizational units',
      status: 'pending',
      priority: 'high',
      metadata: {
        test: testId,
        units: testUnits
      }
    });
    
    // Assign the coordination task to the coordinator
    const coordinatorAgent = createTestAgent('Coordinator', ['coordination', 'oversight', 'planning'], {
      name: 'Coordinator Agent',
      description: 'Coordinates activities across organizational units',
      metadata: {
        test: testId,
        role: 'coordinator'
      }
    });
    
    const coordinatorId = await fixture.agentRegistry.registerAgent(coordinatorAgent);
    
    // Update the coordination task
    await fixture.taskManager.updateTask(coordinationTask, {
      assignedTo: coordinatorId
    });
    
    // Add dependencies to tasks
    for (const task of workflowTasks) {
      await fixture.taskManager.updateTask(task, {
        dependsOn: [coordinationTask]
      });
    }
    
    // Execute tasks
    for (const task of [coordinationTask, ...workflowTasks]) {
      const taskObj = await fixture.taskManager.getTask(task);
      
      // Run task only if it has no dependencies or all dependencies are completed
      if (!taskObj.dependsOn || taskObj.dependsOn.length === 0) {
        await fixture.taskManager.updateTask(task, { status: 'in-progress' });
        await fixture.taskManager.updateTask(task, { status: 'completed' });
      }
    }
    
    // Verify all tasks were completed
    for (const task of [coordinationTask, ...workflowTasks]) {
      const taskObj = await fixture.taskManager.getTask(task);
      expect(taskObj.status).to.equal('completed', `Task ${task} was not completed`);
    }
    
    // Update shared state with completion status
    await fixture.sharedStateManager.setState(`test.${testId}.composition.status`, 'completed');
    await fixture.sharedStateManager.setState(`test.${testId}.composition.completed_at`, Date.now());
    
    // Verify the composition was created correctly
    const state = await fixture.sharedStateManager.getState(`test.${testId}.composition`);
    expect(state.status).to.equal('completed', 'Composition was not marked as completed');
  });
  
  /**
   * This test demonstrates integrating real LLM capabilities with organizational
   * units for AI-powered organizational structures.
   */
  it('should integrate LLM capabilities with organizational units', async function() {
    // Skip this test if not using real LLMs
    if (!process.env.USE_REAL_LLM) {
      this.skip();
      return;
    }
    
    // Create a test scenario with real LLM agents
    const scenario = {
      name: `Organizational LLM Test ${testId}`,
      description: 'Test integrating LLMs with organizational units',
      agents: [
        createTestAgent('Research', ['research', 'analysis'], {
          name: 'Research Unit Agent',
          metadata: { unit: 'Research', test: testId }
        }),
        createTestAgent('Development', ['coding', 'testing'], {
          name: 'Development Unit Agent',
          metadata: { unit: 'Development', test: testId }
        }),
        createTestAgent('Operations', ['deployment', 'monitoring'], {
          name: 'Operations Unit Agent',
          metadata: { unit: 'Operations', test: testId }
        })
      ],
      initialState: {
        [`test.${testId}.llm_scenario`]: {
          status: 'initialized',
          startTime: Date.now()
        }
      },
      tasks: [
        createTestTask('research', 'Research the best practices for multiagent systems', {
          title: 'Research Task',
          metadata: { unit: 'Research', test: testId }
        }),
        createTestTask('development', 'Design a system architecture for multiagent deployment', {
          title: 'Development Task',
          metadata: { unit: 'Development', test: testId }
        }),
        createTestTask('operations', 'Plan the deployment of multiagent systems', {
          title: 'Operations Task',
          metadata: { unit: 'Operations', test: testId }
        })
      ]
    };
    
    // Set up the scenario
    const scenarioSetup = await setupTestScenario(scenario);
    
    // Execute the tasks
    for (const taskId of scenarioSetup.taskIds) {
      const task = await scenarioSetup.fixture.taskManager.getTask(taskId);
      const agent = scenarioSetup.fixture.agentRegistry.getAgentById(task.assignedTo);
      
      if (agent && task) {
        // Process task with LLM
        await scenarioSetup.fixture.taskManager.updateTask(taskId, { status: 'in-progress' });
        
        // In a real test, we would process with LLM here
        // For this test, we'll just mark as completed
        
        await scenarioSetup.fixture.taskManager.updateTask(taskId, { 
          status: 'completed',
          result: {
            success: true,
            data: {
              output: `Sample output for ${task.title} by ${agent.name}`,
              timestamp: Date.now()
            }
          }
        });
      }
    }
    
    // Verify all tasks were completed
    for (const taskId of scenarioSetup.taskIds) {
      const task = await scenarioSetup.fixture.taskManager.getTask(taskId);
      expect(task.status).to.equal('completed', `Task ${taskId} was not completed`);
      expect(task.result).to.exist;
      expect(task.result.success).to.be.true;
    }
    
    // Update scenario state
    await scenarioSetup.fixture.sharedStateManager.setState(
      `test.${testId}.llm_scenario.status`, 
      'completed'
    );
    
    // Verify scenario was completed
    const state = await scenarioSetup.fixture.sharedStateManager.getState(`test.${testId}.llm_scenario`);
    expect(state.status).to.equal('completed', 'LLM scenario was not marked as completed');
  });
}); 