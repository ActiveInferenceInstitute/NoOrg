"""
Performance Tests for Multi-Agent Coordinator
Tests system behavior under load, stress, and scale
"""

import pytest
import asyncio
import time
from statistics import mean, stdev
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.core.multiagent.MultiAgentCoordinator import MultiAgentCoordinator


@pytest.mark.performance
class TestCoordinatorPerformance:
    """Performance benchmarks for coordinator"""
    
    @pytest.fixture
    async def coordinator(self, tmp_path):
        """Create coordinator for performance testing"""
        state_file = tmp_path / "perf-test-state.json"
        
        coordinator = MultiAgentCoordinator(
            "Performance Test Coordinator",
            {
                "stateFilePath": str(state_file),
                "executionConfig": {
                    "maxConcurrentTasks": 50,
                    "enableAutoRetry": True,
                    "maxRetryAttempts": 2
                }
            }
        )
        
        await coordinator.initialize()
        await coordinator.start()
        
        yield coordinator
        
        await coordinator.stop()
    
    @pytest.mark.asyncio
    async def test_agent_registration_performance(self, coordinator):
        """Benchmark agent registration performance"""
        
        registration_times = []
        num_agents = 100
        
        for i in range(num_agents):
            start = time.perf_counter()
            
            agent_id = await coordinator.registerAgent({
                "name": f"Perf Agent {i}",
                "type": "worker",
                "capabilities": ["processing"],
                "status": "available"
            })
            
            end = time.perf_counter()
            registration_times.append((end - start) * 1000)  # Convert to ms
            
            assert agent_id is not None
        
        # Calculate statistics
        avg_time = mean(registration_times)
        std_dev = stdev(registration_times) if len(registration_times) > 1 else 0
        max_time = max(registration_times)
        min_time = min(registration_times)
        
        print(f"\nAgent Registration Performance ({num_agents} agents):")
        print(f"  Average: {avg_time:.2f}ms")
        print(f"  Std Dev: {std_dev:.2f}ms")
        print(f"  Min: {min_time:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        
        # Performance assertions
        assert avg_time < 100, f"Average registration time should be <100ms, got {avg_time:.2f}ms"
        assert max_time < 500, f"Max registration time should be <500ms, got {max_time:.2f}ms"
    
    @pytest.mark.asyncio
    async def test_task_creation_performance(self, coordinator):
        """Benchmark task creation performance"""
        
        # Register an agent first
        await coordinator.registerAgent({
            "name": "Task Creation Agent",
            "type": "worker",
            "capabilities": ["processing"],
            "status": "available"
        })
        
        creation_times = []
        num_tasks = 200
        
        for i in range(num_tasks):
            start = time.perf_counter()
            
            task_id = await coordinator.createTask({
                "name": f"Perf Task {i}",
                "description": f"Performance test task {i}",
                "priority": "medium",
                "type": "processing"
            })
            
            end = time.perf_counter()
            creation_times.append((end - start) * 1000)
            
            assert task_id is not None
        
        # Statistics
        avg_time = mean(creation_times)
        std_dev = stdev(creation_times) if len(creation_times) > 1 else 0
        max_time = max(creation_times)
        
        print(f"\nTask Creation Performance ({num_tasks} tasks):")
        print(f"  Average: {avg_time:.2f}ms")
        print(f"  Std Dev: {std_dev:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        
        # Performance assertions
        assert avg_time < 50, f"Average task creation should be <50ms, got {avg_time:.2f}ms"
        assert max_time < 200, f"Max task creation should be <200ms, got {max_time:.2f}ms"
    
    @pytest.mark.asyncio
    async def test_concurrent_task_handling(self, coordinator):
        """Test handling of many concurrent tasks"""
        
        # Register multiple agents
        num_agents = 20
        for i in range(num_agents):
            await coordinator.registerAgent({
                "name": f"Concurrent Agent {i}",
                "type": "worker",
                "capabilities": ["processing"],
                "status": "available"
            })
        
        # Create many tasks concurrently
        num_tasks = 100
        start_time = time.perf_counter()
        
        tasks = []
        for i in range(num_tasks):
            task = coordinator.createTask({
                "name": f"Concurrent Task {i}",
                "description": f"Task {i}",
                "priority": "medium",
                "type": "processing",
                "metadata": {"index": i}
            })
            tasks.append(task)
        
        # Wait for all to be created
        task_ids = await asyncio.gather(*tasks)
        
        creation_time = (time.perf_counter() - start_time) * 1000
        
        print(f"\nConcurrent Task Handling ({num_tasks} tasks):")
        print(f"  Total creation time: {creation_time:.2f}ms")
        print(f"  Tasks per second: {(num_tasks / (creation_time/1000)):.2f}")
        
        assert len(task_ids) == num_tasks, "All tasks should be created"
        assert all(tid is not None for tid in task_ids), "All tasks should have IDs"
        
        # Wait for assignment
        await asyncio.sleep(2)
        
        # Check that tasks are being processed
        all_tasks = await coordinator.listTasks()
        processing = [t for t in all_tasks if t.status in ["assigned", "in-progress"]]
        
        print(f"  Tasks being processed: {len(processing)}")
        assert len(processing) > 0, "Should have tasks being processed"
    
    @pytest.mark.asyncio
    async def test_task_assignment_performance(self, coordinator):
        """Benchmark task assignment speed"""
        
        # Register agents
        num_agents = 10
        agent_ids = []
        for i in range(num_agents):
            agent_id = await coordinator.registerAgent({
                "name": f"Assignment Agent {i}",
                "type": "worker",
                "capabilities": ["processing"],
                "status": "available"
            })
            agent_ids.append(agent_id)
        
        # Create tasks
        num_tasks = 50
        task_ids = []
        for i in range(num_tasks):
            task_id = await coordinator.createTask({
                "name": f"Assignment Task {i}",
                "description": f"Task {i}",
                "priority": "medium",
                "type": "processing"
            })
            task_ids.append(task_id)
        
        # Measure assignment time
        assignment_times = []
        
        for i, task_id in enumerate(task_ids):
            agent_id = agent_ids[i % len(agent_ids)]
            
            start = time.perf_counter()
            await coordinator.assignTask(task_id, agent_id)
            end = time.perf_counter()
            
            assignment_times.append((end - start) * 1000)
        
        avg_time = mean(assignment_times)
        max_time = max(assignment_times)
        
        print(f"\nTask Assignment Performance ({num_tasks} assignments):")
        print(f"  Average: {avg_time:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        
        assert avg_time < 200, f"Average assignment should be <200ms, got {avg_time:.2f}ms"
    
    @pytest.mark.asyncio
    async def test_state_query_performance(self, coordinator):
        """Benchmark state management query performance"""
        
        # Register agents and create tasks
        for i in range(20):
            await coordinator.registerAgent({
                "name": f"Query Agent {i}",
                "type": "worker",
                "capabilities": ["processing"],
                "status": "available"
            })
        
        for i in range(50):
            await coordinator.createTask({
                "name": f"Query Task {i}",
                "description": f"Task {i}",
                "priority": "medium",
                "type": "processing"
            })
        
        # Benchmark listAgents
        agent_query_times = []
        for _ in range(100):
            start = time.perf_counter()
            agents = await coordinator.listAgents()
            end = time.perf_counter()
            agent_query_times.append((end - start) * 1000)
            assert len(agents) == 20
        
        # Benchmark listTasks
        task_query_times = []
        for _ in range(100):
            start = time.perf_counter()
            tasks = await coordinator.listTasks()
            end = time.perf_counter()
            task_query_times.append((end - start) * 1000)
            assert len(tasks) == 50
        
        print(f"\nState Query Performance (100 queries each):")
        print(f"  List Agents - Avg: {mean(agent_query_times):.2f}ms, Max: {max(agent_query_times):.2f}ms")
        print(f"  List Tasks - Avg: {mean(task_query_times):.2f}ms, Max: {max(task_query_times):.2f}ms")
        
        assert mean(agent_query_times) < 50, "Agent queries should be fast"
        assert mean(task_query_times) < 50, "Task queries should be fast"
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_sustained_load(self, coordinator):
        """Test system under sustained load"""
        
        # Register agents
        num_agents = 10
        for i in range(num_agents):
            await coordinator.registerAgent({
                "name": f"Load Agent {i}",
                "type": "worker",
                "capabilities": ["processing"],
                "status": "available"
            })
        
        # Continuously create tasks for 30 seconds
        duration = 30  # seconds
        start_time = time.time()
        tasks_created = 0
        
        while time.time() - start_time < duration:
            task_id = await coordinator.createTask({
                "name": f"Load Task {tasks_created}",
                "description": f"Sustained load task {tasks_created}",
                "priority": "medium",
                "type": "processing"
            })
            assert task_id is not None
            tasks_created += 1
            
            # Small delay to simulate realistic load
            await asyncio.sleep(0.1)
        
        elapsed = time.time() - start_time
        throughput = tasks_created / elapsed
        
        print(f"\nSustained Load Test ({duration}s):")
        print(f"  Tasks created: {tasks_created}")
        print(f"  Throughput: {throughput:.2f} tasks/second")
        
        # Verify system is still responsive
        agents = await coordinator.listAgents()
        assert len(agents) == num_agents, "System should still be responsive"
        
        tasks = await coordinator.listTasks()
        assert len(tasks) == tasks_created, "All tasks should be tracked"
    
    @pytest.mark.asyncio
    async def test_memory_efficiency(self, coordinator):
        """Test memory usage remains stable"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Create and complete many tasks
        agent_id = await coordinator.registerAgent({
            "name": "Memory Test Agent",
            "type": "worker",
            "capabilities": ["processing"],
            "status": "available"
        })
        
        for i in range(1000):
            task_id = await coordinator.createTask({
                "name": f"Memory Task {i}",
                "description": f"Task {i}",
                "priority": "medium",
                "type": "processing"
            })
            
            # Immediately complete and clean up
            await coordinator.assignTask(task_id, agent_id)
            await coordinator.completeTask(task_id, agent_id)
            
            # Periodic cleanup
            if i % 100 == 0:
                task_manager = coordinator.getTaskManager()
                await task_manager.cleanupOldTasks(time.time() * 1000 - 1000)
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"\nMemory Efficiency Test (1000 tasks):")
        print(f"  Initial memory: {initial_memory:.2f} MB")
        print(f"  Final memory: {final_memory:.2f} MB")
        print(f"  Increase: {memory_increase:.2f} MB")
        
        # Memory should not grow excessively
        assert memory_increase < 100, f"Memory increase should be <100MB, got {memory_increase:.2f}MB"


@pytest.mark.performance
class TestScalability:
    """Test system scalability"""
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_agent_scalability(self, tmp_path):
        """Test with increasing number of agents"""
        
        agent_counts = [10, 50, 100, 200]
        results = {}
        
        for num_agents in agent_counts:
            coordinator = MultiAgentCoordinator(
                f"Scale Test {num_agents}",
                {"stateFilePath": str(tmp_path / f"scale-{num_agents}.json")}
            )
            await coordinator.initialize()
            await coordinator.start()
            
            start_time = time.perf_counter()
            
            for i in range(num_agents):
                await coordinator.registerAgent({
                    "name": f"Scale Agent {i}",
                    "type": "worker",
                    "capabilities": ["processing"],
                    "status": "available"
                })
            
            elapsed = (time.perf_counter() - start_time) * 1000
            results[num_agents] = elapsed
            
            await coordinator.stop()
        
        print(f"\nAgent Scalability Test:")
        for count, time_ms in results.items():
            print(f"  {count} agents: {time_ms:.2f}ms ({time_ms/count:.2f}ms per agent)")
        
        # Check scalability is reasonable (not exponential)
        assert results[200] / results[10] < 50, "Should scale reasonably with agent count"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto", "-m", "performance"])
