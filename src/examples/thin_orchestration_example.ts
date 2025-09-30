/**
 * Thin Orchestration Examples
 *
 * This file contains multiple thin orchestration patterns demonstrating
 * lightweight task coordination without complex workflows. Perfect for
 * simple automation tasks, event-driven processing, and batch operations.
 */

import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { Agent } from '../core/multiagent/types';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';

async function runThinOrchestrationExample() {
  console.log('🚀 Starting Thin Orchestration Example');

  // Create coordinator
  const coordinator = new MultiAgentCoordinator('Thin Orchestrator');

  try {
    // Initialize coordinator
    await coordinator.initialize();
    console.log('✅ Coordinator initialized');

    // Register a simple agent
    const agent: Omit<Agent, 'id'> = {
      name: 'Simple Processor',
      type: 'processor',
      description: 'Handles basic processing tasks',
      capabilities: ['text-processing', 'summarization'],
      status: 'available',
      metadata: {
        maxConcurrentTasks: 3,
        specialty: 'lightweight tasks'
      },
      preferredModel: 'o3-mini',
      lastActive: Date.now(),
      createdAt: Date.now()
    };

    const agentId = await coordinator.registerAgent(agent);
    console.log(`✅ Agent registered: ${agentId}`);

    // Create simple tasks
    const tasks = [
      {
        name: 'Process Email 1',
        description: 'Analyze and summarize email content',
        priority: 'medium',
        type: 'text-processing',
        metadata: {
          source: 'inbox',
          urgency: 'normal'
        }
      },
      {
        name: 'Process Email 2',
        description: 'Extract key information from email',
        priority: 'low',
        type: 'text-processing',
        metadata: {
          source: 'inbox',
          urgency: 'low'
        }
      }
    ];

    const taskIds = [];
    for (const task of tasks) {
      const taskId = await coordinator.createTask(task);
      taskIds.push(taskId);
      console.log(`✅ Task created: ${taskId} - ${task.name}`);
    }

    // Start coordinator (this will automatically assign and process tasks)
    await coordinator.start();
    console.log('🚀 Coordinator started - tasks are being processed');

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check results
    for (const taskId of taskIds) {
      const task = await coordinator.getTask(taskId);
      console.log(`📋 Task ${taskId}: ${task?.status} - ${task?.name}`);

      if (task?.results) {
        console.log(`   ✅ Result: ${JSON.stringify(task.results).substring(0, 100)}...`);
      }
    }

    // Get task statistics
    const taskManager = coordinator.getTaskManager();
    const stats = await taskManager.getTaskStatistics();
    console.log(`📊 Task Statistics: ${stats.completed}/${stats.total} completed (${stats.successRate.toFixed(1)}% success rate)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cleanup
    await coordinator.stop();
    console.log('🛑 Coordinator stopped');
  }
}

/**
 * Alternative: Event-driven thin orchestration
 */
async function runEventDrivenExample() {
  console.log('\n🎯 Starting Event-Driven Thin Orchestration');

  const coordinator = new MultiAgentCoordinator('Event Driven Orchestrator');

  try {
    await coordinator.initialize();
    await coordinator.start();

    // Register event handler for task completion
    const taskManager = coordinator.getTaskManager();
    // In a real implementation, you would subscribe to task completion events

    // Create a simple task
    const taskId = await coordinator.createTask({
      name: 'Event Task',
      description: 'Task that triggers events',
      priority: 'medium',
      type: 'event-processing'
    });

    console.log(`✅ Created event task: ${taskId}`);

    // Simulate event handling
    setTimeout(async () => {
      const task = await coordinator.getTask(taskId);
      if (task?.status === 'completed') {
        console.log('🎉 Task completed! Event would be triggered here.');
      }
    }, 3000);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Batch processing example
 */
async function runBatchProcessingExample() {
  console.log('\n📦 Starting Batch Processing Example');

  const coordinator = new MultiAgentCoordinator('Batch Processor');

  try {
    await coordinator.initialize();
    await coordinator.start();

    // Create multiple similar tasks
    const batchSize = 5;
    const taskIds = [];

    for (let i = 0; i < batchSize; i++) {
      const taskId = await coordinator.createTask({
        name: `Batch Task ${i + 1}`,
        description: `Process batch item ${i + 1}`,
        priority: 'medium',
        type: 'batch-processing',
        metadata: {
          batchId: 'batch-001',
          itemIndex: i
        }
      });
      taskIds.push(taskId);
    }

    console.log(`✅ Created ${batchSize} batch tasks`);

    // Monitor batch progress
    const checkProgress = async () => {
      const stats = await coordinator.getTaskManager().getTaskStatistics();
      console.log(`📈 Progress: ${stats.completed}/${stats.total} completed`);

      if (stats.completed === stats.total) {
        console.log('🎉 Batch processing complete!');
        clearInterval(progressInterval);
      }
    };

    const progressInterval = setInterval(checkProgress, 1000);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Advanced Thin Orchestration: State-based Coordination
 */
async function runStateBasedExample() {
  console.log('\n🔄 Starting State-Based Thin Orchestration');

  const coordinator = new MultiAgentCoordinator('State-Based Orchestrator');
  const sharedState = SharedStateManager.getInstance();

  try {
    await coordinator.initialize();
    await coordinator.start();

    // Register multiple agents
    const agents = [
      {
        name: 'Data Collector',
        type: 'collector',
        description: 'Collects data from various sources',
        capabilities: ['data-collection', 'api-calls'],
        status: 'available' as const,
        metadata: { sources: ['api', 'database', 'files'] },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      },
      {
        name: 'Data Processor',
        type: 'processor',
        description: 'Processes collected data',
        capabilities: ['data-processing', 'transformation'],
        status: 'available' as const,
        metadata: { batchSize: 100 },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      },
      {
        name: 'Result Aggregator',
        type: 'aggregator',
        description: 'Aggregates processed results',
        capabilities: ['aggregation', 'reporting'],
        status: 'available' as const,
        metadata: { outputFormat: 'json' },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      }
    ];

    const agentIds = [];
    for (const agent of agents) {
      const agentId = await coordinator.registerAgent(agent);
      agentIds.push(agentId);
      console.log(`✅ Agent registered: ${agent.name} (${agentId})`);
    }

    // Set up state-based workflow
    await sharedState.setState('workflow.status', 'initialized');
    await sharedState.setState('workflow.stage', 'data-collection');

    // Create data collection task
    const collectTaskId = await coordinator.createTask({
      name: 'Collect User Data',
      description: 'Collect user data from API',
      priority: 'high',
      type: 'data-collection',
      metadata: {
        source: 'user-api',
        batchSize: 1000
      }
    });

    console.log(`✅ Data collection task created: ${collectTaskId}`);

    // Simulate workflow progression based on task completion
    const workflowMonitor = async () => {
      const collectTask = await coordinator.getTask(collectTaskId);

      if (collectTask?.status === 'completed' && collectTask.results) {
        console.log('📊 Data collection complete, starting processing...');

        // Update workflow state
        await sharedState.setState('workflow.stage', 'data-processing');
        await sharedState.setState('collectedData', collectTask.results);

        // Create processing task
        const processTaskId = await coordinator.createTask({
          name: 'Process Collected Data',
          description: 'Transform and validate collected data',
          priority: 'high',
          type: 'data-processing',
          metadata: {
            inputData: collectTask.results,
            transformations: ['validate', 'normalize', 'enrich']
          }
        });

        console.log(`✅ Processing task created: ${processTaskId}`);

        // Monitor processing completion
        setTimeout(async () => {
          const processTask = await coordinator.getTask(processTaskId);
          if (processTask?.status === 'completed') {
            console.log('✅ Processing complete, starting aggregation...');
            await sharedState.setState('workflow.stage', 'aggregation');
            await sharedState.setState('processedData', processTask.results);

            // Create aggregation task
            const aggregateTaskId = await coordinator.createTask({
              name: 'Aggregate Results',
              description: 'Create final report from processed data',
              priority: 'high',
              type: 'aggregation',
              metadata: {
                format: 'comprehensive-report',
                includeCharts: true
              }
            });

            console.log(`✅ Aggregation task created: ${aggregateTaskId}`);
          }
        }, 3000);
      }
    };

    // Monitor workflow every second
    const monitorInterval = setInterval(workflowMonitor, 1000);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 15000));
    clearInterval(monitorInterval);

    // Final state check
    const finalStage = sharedState.getState('workflow.stage');
    console.log(`🎯 Final workflow stage: ${finalStage}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Thin Orchestration: Priority-based Task Distribution
 */
async function runPriorityDistributionExample() {
  console.log('\n⚡ Starting Priority-Based Task Distribution');

  const coordinator = new MultiAgentCoordinator('Priority Orchestrator');

  try {
    await coordinator.initialize();
    await coordinator.start();

    // Register agents with different capabilities
    const agents = [
      {
        name: 'High-Performance Agent',
        type: 'performer',
        description: 'Handles high-priority, complex tasks',
        capabilities: ['complex-processing', 'critical-analysis'],
        status: 'available' as const,
        metadata: { maxConcurrentTasks: 2, priority: 'high' },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      },
      {
        name: 'Standard Agent',
        type: 'worker',
        description: 'Handles standard-priority tasks',
        capabilities: ['standard-processing', 'routine-tasks'],
        status: 'available' as const,
        metadata: { maxConcurrentTasks: 5, priority: 'medium' },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      },
      {
        name: 'Background Agent',
        type: 'background',
        description: 'Handles low-priority, background tasks',
        capabilities: ['background-processing', 'maintenance'],
        status: 'available' as const,
        metadata: { maxConcurrentTasks: 10, priority: 'low' },
        preferredModel: 'o3-mini',
        lastActive: Date.now(),
        createdAt: Date.now()
      }
    ];

    const agentIds = [];
    for (const agent of agents) {
      const agentId = await coordinator.registerAgent(agent);
      agentIds.push(agentId);
      console.log(`✅ Agent registered: ${agent.name} (${agentId})`);
    }

    // Create tasks with different priorities
    const tasks = [
      { name: 'Critical Security Update', priority: 'critical' as const, type: 'complex-processing' },
      { name: 'User Data Backup', priority: 'high' as const, type: 'complex-processing' },
      { name: 'Report Generation', priority: 'medium' as const, type: 'standard-processing' },
      { name: 'Cache Cleanup', priority: 'low' as const, type: 'background-processing' },
      { name: 'Log Analysis', priority: 'medium' as const, type: 'standard-processing' },
      { name: 'System Health Check', priority: 'low' as const, type: 'background-processing' }
    ];

    const taskIds = [];
    for (const task of tasks) {
      const taskId = await coordinator.createTask({
        name: task.name,
        description: `Execute ${task.name.toLowerCase()}`,
        priority: task.priority,
        type: task.type,
        metadata: {
          autoAssign: true,
          priority: task.priority
        }
      });
      taskIds.push(taskId);
      console.log(`✅ Task created: ${task.name} (${task.priority} priority)`);
    }

    // Monitor task distribution
    const monitorDistribution = async () => {
      const stats = await coordinator.getTaskManager().getTaskStatistics();
      console.log(`📊 Task Distribution: ${stats.completed}/${stats.total} completed`);

      // Show agent workload
      for (const agentId of agentIds) {
        const agentTasks = await coordinator.getTaskManager().getTasksByAssignee(agentId);
        const activeTasks = agentTasks.filter(t => t.status === 'in-progress' || t.status === 'assigned');
        console.log(`   ${agentId}: ${activeTasks.length} active tasks`);
      }
    };

    const monitorInterval = setInterval(monitorDistribution, 2000);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 12000));
    clearInterval(monitorInterval);

    console.log('🎯 Priority-based distribution complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Thin Orchestration: Real-time Event Processing
 */
async function runRealTimeEventExample() {
  console.log('\n⚡ Starting Real-time Event Processing');

  const coordinator = new MultiAgentCoordinator('Real-time Orchestrator');
  const sharedState = SharedStateManager.getInstance();

  try {
    await coordinator.initialize();
    await coordinator.start();

    // Register event processing agent
    const eventAgent = {
      name: 'Event Processor',
      type: 'event-handler',
      description: 'Processes real-time events',
      capabilities: ['event-processing', 'notification', 'logging'],
      status: 'available' as const,
      metadata: { eventTypes: ['user-action', 'system-alert', 'data-update'] },
      preferredModel: 'o3-mini',
      lastActive: Date.now(),
      createdAt: Date.now()
    };

    const agentId = await coordinator.registerAgent(eventAgent);
    console.log(`✅ Event processor registered: ${agentId}`);

    // Set up event monitoring state
    await sharedState.setState('events.status', 'monitoring');
    await sharedState.setState('events.processed', 0);
    await sharedState.setState('events.pending', 0);

    // Simulate real-time events
    const eventTypes = ['user-login', 'data-upload', 'system-alert', 'user-feedback'];
    let eventCount = 0;

    const eventGenerator = setInterval(async () => {
      if (eventCount >= 8) {
        clearInterval(eventGenerator);
        return;
      }

      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventData = {
        id: `event-${Date.now()}-${eventCount}`,
        type: eventType,
        timestamp: Date.now(),
        data: { userId: `user-${Math.floor(Math.random() * 100)}`, action: eventType }
      };

      // Create event processing task
      const taskId = await coordinator.createTask({
        name: `Process ${eventType} Event`,
        description: `Handle ${eventType} event: ${eventData.id}`,
        priority: 'medium',
        type: 'event-processing',
        metadata: {
          eventType,
          eventData,
          realTime: true
        }
      });

      console.log(`🎯 Event created: ${eventType} (${taskId})`);

      // Update event statistics
      const currentProcessed = sharedState.getState('events.processed') || 0;
      const currentPending = sharedState.getState('events.pending') || 0;
      await sharedState.setState('events.pending', currentPending + 1);

      eventCount++;
    }, 1500);

    // Monitor event processing
    const eventMonitor = setInterval(async () => {
      const processed = sharedState.getState('events.processed') || 0;
      const pending = sharedState.getState('events.pending') || 0;

      console.log(`📊 Events: ${processed} processed, ${pending} pending`);

      if (processed >= 8) {
        console.log('🎉 All events processed!');
        clearInterval(eventMonitor);
      }
    }, 2000);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 15000));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run all examples
async function main() {
  console.log('🚀 Starting Comprehensive Thin Orchestration Examples\n');

  await runThinOrchestrationExample();
  await runEventDrivenExample();
  await runBatchProcessingExample();
  await runStateBasedExample();
  await runPriorityDistributionExample();
  await runRealTimeEventExample();

  console.log('\n✨ All Thin Orchestration Examples Complete!');
}

// Export for use in other files
export {
  runThinOrchestrationExample,
  runEventDrivenExample,
  runBatchProcessingExample,
  runStateBasedExample,
  runPriorityDistributionExample,
  runRealTimeEventExample
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}


