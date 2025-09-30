"""
Real Multi-Agent Workflow Integration Tests
NO MOCKS - All tests use real implementations and actual data
"""

import pytest
import asyncio
import json
import os
from pathlib import Path
from typing import Dict, List, Any

# Import actual implementations - NO MOCKS
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.core.multiagent.MultiAgentCoordinator import MultiAgentCoordinator
from src.core.multiagent.TaskManager import TaskManager
from src.core.multiagent.SharedStateManager import SharedStateManager
from src.core.multiagent.AgentRegistry import AgentRegistry
from src.core.multiagent.AgentHealthMonitor import AgentHealthMonitor


class TestRealMultiAgentWorkflow:
    """Test complete agent lifecycle with real data"""
    
    @pytest.fixture
    async def coordinator(self, tmp_path):
        """Create real coordinator with temporary state file"""
        state_file = tmp_path / "test-coordinator-state.json"
        
        coordinator = MultiAgentCoordinator(
            "Test Coordinator",
            {
                "stateFilePath": str(state_file),
                "executionConfig": {
                    "maxConcurrentTasks": 5,
                    "enableAutoRetry": True,
                    "maxRetryAttempts": 3
                }
            }
        )
        
        await coordinator.initialize()
        await coordinator.start()
        
        yield coordinator
        
        # Cleanup
        await coordinator.stop()
        if state_file.exists():
            state_file.unlink()
    
    @pytest.fixture
    def real_test_data(self):
        """Real test data - not mocked"""
        return {
            "agents": [
                {
                    "name": "Data Processor Alpha",
                    "type": "worker",
                    "capabilities": ["data-processing", "transformation"],
                    "status": "available",
                    "description": "Primary data processing agent"
                },
                {
                    "name": "Data Processor Beta",
                    "type": "worker",
                    "capabilities": ["data-processing", "validation"],
                    "status": "available",
                    "description": "Secondary data processing agent"
                },
                {
                    "name": "Analysis Agent",
                    "type": "analyzer",
                    "capabilities": ["analysis", "reporting"],
                    "status": "available",
                    "description": "Data analysis specialist"
                }
            ],
            "tasks": [
                {
                    "name": "Process Dataset A",
                    "description": "Process and transform dataset A",
                    "priority": "high",
                    "type": "data-processing",
                    "metadata": {
                        "requiredCapabilities": ["data-processing"],
                        "estimatedDuration": 5000
                    }
                },
                {
                    "name": "Validate Results",
                    "description": "Validate processed data",
                    "priority": "medium",
                    "type": "validation",
                    "metadata": {
                        "requiredCapabilities": ["validation"],
                        "dependsOnPrevious": True
                    }
                },
                {
                    "name": "Generate Report",
                    "description": "Generate analysis report",
                    "priority": "low",
                    "type": "reporting",
                    "metadata": {
                        "requiredCapabilities": ["reporting"],
                        "format": "json"
                    }
                }
            ]
        }
    
    @pytest.mark.asyncio
    async def test_complete_agent_lifecycle(self, coordinator, real_test_data):
        """Test complete agent lifecycle from registration to task completion"""
        
        # Phase 1: Register agents
        agent_ids = []
        for agent_data in real_test_data["agents"]:
            agent_id = await coordinator.registerAgent(agent_data)
            assert agent_id is not None, f"Failed to register agent {agent_data['name']}"
            agent_ids.append(agent_id)
        
        # Verify agents are registered
        agents = await coordinator.listAgents()
        assert len(agents) == 3, "Should have 3 registered agents"
        
        # Phase 2: Create tasks
        task_ids = []
        for task_data in real_test_data["tasks"]:
            task_id = await coordinator.createTask(task_data)
            assert task_id is not None, f"Failed to create task {task_data['name']}"
            task_ids.append(task_id)
        
        # Verify tasks are created
        tasks = await coordinator.listTasks()
        assert len(tasks) == 3, "Should have 3 created tasks"
        
        # Phase 3: Task assignment and execution
        # Wait for automatic assignment
        await asyncio.sleep(2)
        
        # Check task assignment
        assigned_tasks = await coordinator.listTasks({"status": ["assigned", "in-progress"]})
        assert len(assigned_tasks) > 0, "At least one task should be assigned"
        
        # Phase 4: Simulate task completion
        for task_id in task_ids[:2]:  # Complete first 2 tasks
            task = await coordinator.getTask(task_id)
            if task and task.assignedTo:
                await coordinator.completeTask(task_id, task.assignedTo)
        
        # Verify completions
        completed_tasks = await coordinator.listTasks({"status": ["completed"]})
        assert len(completed_tasks) >= 2, "At least 2 tasks should be completed"
        
        # Phase 5: Verify state persistence
        state_manager = coordinator.getSharedStateManager()
        coordinator_state = await state_manager.getState("system.coordinator")
        assert coordinator_state is not None, "Coordinator state should exist"
        
        # Phase 6: Agent health check
        health_monitor = AgentHealthMonitor.getInstance(coordinator.getAgentRegistry())
        for agent_id in agent_ids:
            await health_monitor.startMonitoring(agent_id)
            health_status = await health_monitor.getHealthStatus(agent_id)
            assert health_status is not None, f"Health status should exist for agent {agent_id}"
    
    @pytest.mark.asyncio
    async def test_task_dependency_resolution(self, coordinator, real_test_data):
        """Test that task dependencies are properly resolved"""
        
        # Register an agent
        agent_id = await coordinator.registerAgent(real_test_data["agents"][0])
        assert agent_id is not None
        
        # Create dependent tasks
        task1_id = await coordinator.createTask({
            "name": "Parent Task",
            "description": "Must complete first",
            "priority": "high",
            "type": "data-processing"
        })
        
        task2_id = await coordinator.createTask({
            "name": "Child Task",
            "description": "Depends on parent",
            "priority": "high",
            "type": "data-processing",
            "dependsOn": [task1_id]
        })
        
        # Verify dependency tracking
        task_manager = coordinator.getTaskManager()
        
        # Child task dependencies should not be satisfied initially
        deps_satisfied = await task_manager.areDependenciesSatisfied(task2_id)
        assert not deps_satisfied, "Dependencies should not be satisfied yet"
        
        # Complete parent task
        await coordinator.assignTask(task1_id, agent_id)
        await coordinator.completeTask(task1_id, agent_id)
        
        # Now dependencies should be satisfied
        deps_satisfied = await task_manager.areDependenciesSatisfied(task2_id)
        assert deps_satisfied, "Dependencies should now be satisfied"
    
    @pytest.mark.asyncio
    async def test_agent_failure_and_recovery(self, coordinator, real_test_data):
        """Test system behavior when agents fail"""
        
        # Register agents
        agent1_id = await coordinator.registerAgent(real_test_data["agents"][0])
        agent2_id = await coordinator.registerAgent(real_test_data["agents"][1])
        
        # Create task
        task_id = await coordinator.createTask(real_test_data["tasks"][0])
        
        # Assign to first agent
        await coordinator.assignTask(task_id, agent1_id)
        
        # Simulate agent failure - unregister agent
        await coordinator.unregisterAgent(agent1_id)
        
        # Task should be reassigned
        await asyncio.sleep(1)
        
        task = await coordinator.getTask(task_id)
        # Task should either be pending or assigned to another agent
        assert task.status in ["pending", "assigned"], "Task should be reassignable after agent failure"
    
    @pytest.mark.asyncio
    async def test_concurrent_task_execution(self, coordinator, real_test_data):
        """Test handling of multiple concurrent tasks"""
        
        # Register multiple agents
        agent_ids = []
        for agent_data in real_test_data["agents"]:
            agent_id = await coordinator.registerAgent(agent_data)
            agent_ids.append(agent_id)
        
        # Create many tasks concurrently
        task_ids = []
        for i in range(10):
            task_id = await coordinator.createTask({
                "name": f"Concurrent Task {i}",
                "description": f"Task number {i}",
                "priority": "medium",
                "type": "data-processing",
                "metadata": {"index": i}
            })
            task_ids.append(task_id)
        
        # Wait for assignment
        await asyncio.sleep(3)
        
        # Check that tasks are being processed
        tasks = await coordinator.listTasks()
        processing_tasks = [t for t in tasks if t.status in ["assigned", "in-progress"]]
        
        # At least maxConcurrentTasks should be processing
        assert len(processing_tasks) >= 3, "Multiple tasks should be processing concurrently"
    
    @pytest.mark.asyncio
    async def test_state_persistence_and_recovery(self, coordinator, tmp_path, real_test_data):
        """Test that coordinator state persists and can be recovered"""
        
        state_file = tmp_path / "persistence-test.json"
        
        # Create coordinator with persistence
        coord1 = MultiAgentCoordinator(
            "Persistence Test",
            {"stateFilePath": str(state_file)}
        )
        await coord1.initialize()
        
        # Register agent and create task
        agent_id = await coord1.registerAgent(real_test_data["agents"][0])
        task_id = await coord1.createTask(real_test_data["tasks"][0])
        
        # Save state
        await coord1.saveState(str(state_file))
        
        # Verify state file exists
        assert state_file.exists(), "State file should be created"
        
        # Load state in new coordinator
        coord2 = MultiAgentCoordinator(
            "Persistence Test Recovery",
            {"stateFilePath": str(state_file)}
        )
        
        # Load the saved state
        loaded = await coord2.loadState(str(state_file))
        assert loaded, "State should load successfully"
        
        # Verify data was recovered
        # Note: This tests the persistence mechanism itself
        assert coord2.name == "Persistence Test", "Coordinator name should be restored"
        
        # Cleanup
        await coord1.stop()
        await coord2.stop()
    
    @pytest.mark.asyncio
    async def test_task_history_tracking(self, coordinator, real_test_data):
        """Test that complete task history is tracked"""
        
        # Register agent
        agent_id = await coordinator.registerAgent(real_test_data["agents"][0])
        
        # Create and execute task
        task_id = await coordinator.createTask(real_test_data["tasks"][0])
        
        # Get task manager
        task_manager = coordinator.getTaskManager()
        
        # Assign task
        await coordinator.assignTask(task_id, agent_id)
        
        # Start task
        await coordinator.updateTaskStatus(task_id, "in-progress")
        
        # Complete task
        await coordinator.completeTask(task_id, agent_id)
        
        # Get task history
        history = await task_manager.getTaskHistory(task_id)
        
        # Verify history contains all events
        events = [entry["event"] for entry in history]
        assert "created" in events, "History should include creation"
        assert "assigned" in events, "History should include assignment"
        assert "completed" in events, "History should include completion"
        
        # Verify history is chronological
        timestamps = [entry["timestamp"] for entry in history]
        assert timestamps == sorted(timestamps), "History should be chronologically ordered"
    
    @pytest.mark.asyncio
    async def test_task_duration_estimation(self, coordinator, real_test_data):
        """Test ML-based task duration estimation"""
        
        task_manager = coordinator.getTaskManager()
        
        # Register agent
        agent_id = await coordinator.registerAgent(real_test_data["agents"][0])
        
        # Create and complete several tasks to build history
        for i in range(5):
            task_id = await coordinator.createTask({
                "name": f"Training Task {i}",
                "description": "Build estimation history",
                "priority": "medium",
                "type": "data-processing"
            })
            
            await coordinator.assignTask(task_id, agent_id)
            
            # Simulate processing time
            import time
            time.sleep(0.1)
            
            await coordinator.completeTask(task_id, agent_id)
        
        # Now estimate duration for a new similar task
        new_task = await task_manager.createTask({
            "name": "Estimation Test",
            "type": "data-processing",
            "priority": "medium"
        })
        
        task = await task_manager.getTask(new_task)
        estimated_duration = await task_manager.estimateTaskDuration(task)
        
        # Should return a reasonable estimate
        assert estimated_duration > 0, "Should provide positive duration estimate"
        assert estimated_duration < 1000000, "Estimate should be reasonable"
    
    @pytest.mark.asyncio
    async def test_task_statistics(self, coordinator, real_test_data):
        """Test comprehensive task statistics"""
        
        task_manager = coordinator.getTaskManager()
        
        # Register agent
        agent_id = await coordinator.registerAgent(real_test_data["agents"][0])
        
        # Create mix of tasks
        for i in range(10):
            priority = ["high", "medium", "low"][i % 3]
            task_id = await coordinator.createTask({
                "name": f"Stats Task {i}",
                "description": f"Task {i}",
                "priority": priority,
                "type": "data-processing"
            })
            
            # Complete some tasks
            if i < 7:
                await coordinator.assignTask(task_id, agent_id)
                if i < 5:  # Complete 5, fail 2
                    await coordinator.completeTask(task_id, agent_id)
                else:
                    await coordinator.failTask(task_id, agent_id, "Simulated failure")
        
        # Get statistics
        stats = await task_manager.getTaskStatistics()
        
        # Verify statistics
        assert stats["total"] == 10, "Should track all tasks"
        assert stats["byStatus"]["completed"] == 5, "Should track completed tasks"
        assert stats["byStatus"]["failed"] == 2, "Should track failed tasks"
        assert stats["byStatus"]["pending"] == 3, "Should track pending tasks"
        
        # Check priority distribution
        assert stats["byPriority"]["high"] > 0, "Should track high priority tasks"
        assert stats["byPriority"]["medium"] > 0, "Should track medium priority tasks"
        assert stats["byPriority"]["low"] > 0, "Should track low priority tasks"
        
        # Check success rate
        # 5 completed out of 7 finished = ~71%
        assert 70 <= stats["successRate"] <= 72, f"Success rate should be ~71%, got {stats['successRate']}"


class TestRealAgentHealthMonitoring:
    """Test agent health monitoring with real checks"""
    
    @pytest.fixture
    async def health_monitor_setup(self, tmp_path):
        """Setup real health monitoring infrastructure"""
        from src.core.multiagent.AgentRegistry import AgentRegistry
        
        registry = AgentRegistry.getInstance()
        health_monitor = AgentHealthMonitor.getInstance(registry)
        
        # Register test agent
        agent_id = await registry.registerAgent({
            "id": "health-test-agent",
            "name": "Health Test Agent",
            "type": "worker",
            "capabilities": ["testing"],
            "status": "available"
        })
        
        yield (health_monitor, agent_id, registry)
        
        # Cleanup
        await health_monitor.stopMonitoring(agent_id)
        await registry.unregisterAgent(agent_id)
    
    @pytest.mark.asyncio
    async def test_health_check_registration(self, health_monitor_setup):
        """Test registering and executing health checks"""
        health_monitor, agent_id, registry = health_monitor_setup
        
        check_executed = False
        
        async def custom_health_check(agent):
            nonlocal check_executed
            check_executed = True
            return {
                "healthy": True,
                "message": "Custom check passed"
            }
        
        # Register custom health check
        check_id = await health_monitor.registerHealthCheck(agent_id, {
            "name": "Custom Check",
            "description": "Test custom health check",
            "checkFunction": custom_health_check,
            "interval": 1000,
            "timeout": 500,
            "enabled": True
        })
        
        assert check_id is not None, "Health check should be registered"
        
        # Wait for check to execute
        await asyncio.sleep(1.5)
        
        assert check_executed, "Health check should have executed"
        
        # Get health status
        status = await health_monitor.getHealthStatus(agent_id)
        assert status is not None, "Should have health status"
        assert check_id in status["checks"], "Should include our check"
    
    @pytest.mark.asyncio
    async def test_health_report_generation(self, health_monitor_setup):
        """Test comprehensive health report generation"""
        health_monitor, agent_id, _ = health_monitor_setup
        
        # Start monitoring
        await health_monitor.startMonitoring(agent_id)
        
        # Wait for default checks to run
        await asyncio.sleep(2)
        
        # Generate report
        report = await health_monitor.generateHealthReport(agent_id)
        
        assert report is not None, "Should generate health report"
        assert report["agentId"] == agent_id, "Report should be for correct agent"
        assert "overall" in report, "Should include overall status"
        assert report["overall"] in ["healthy", "degraded", "unhealthy"], "Should have valid status"
        assert "recommendations" in report, "Should include recommendations"


# Run tests with proper async support
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
