// Manual test for verifying the TaskManager functionality
const { TaskManager } = require('./src/core/multiagent/TaskManager');

async function testTaskManager() {
  console.log("Starting TaskManager tests...");
  
  try {
    // Create a new TaskManager instance
    const taskManager = new TaskManager();
    console.log("TaskManager instance created");
    
    // Test creating a task
    const taskId = await taskManager.createTask({
      type: 'test',
      description: 'Test task for manual verification',
      priority: 'high',
      metadata: { testRun: true }
    });
    console.log(`Task created with ID: ${taskId}`);
    
    // Test getting the task
    const task = await taskManager.getTask(taskId);
    console.log("Task retrieved:", task);
    
    // Test updating the task
    await taskManager.updateTask(taskId, {
      description: 'Updated test task',
      metadata: { testRun: true, updated: true }
    });
    console.log("Task updated");
    
    // Test retrieving the updated task
    const updatedTask = await taskManager.getTask(taskId);
    console.log("Updated task retrieved:", updatedTask);
    
    // Test listing tasks
    const allTasks = await taskManager.listTasks();
    console.log(`Found ${allTasks.length} tasks:`, allTasks);
    
    // Test filtering tasks
    const highPriorityTasks = await taskManager.listTasks({ priority: ['high'] });
    console.log(`Found ${highPriorityTasks.length} high priority tasks`);
    
    console.log("All TaskManager tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Error in TaskManager tests:", error);
    return false;
  }
}

// Run the tests
testTaskManager().then(success => {
  if (success) {
    console.log("✅ Manual tests passed");
  } else {
    console.log("❌ Manual tests failed");
    process.exit(1);
  }
}); 