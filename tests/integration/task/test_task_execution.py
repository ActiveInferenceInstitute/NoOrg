"""
Integration tests for Task Execution and Monitoring.
"""
import pytest
import asyncio
import time
from typing import Dict, List
from unittest.mock import AsyncMock, Mock, create_autospec
from agents.task.execution import TaskExecutionSystem
from agents.task.monitoring import TaskMonitoringSystem

pytestmark = [pytest.mark.integration, pytest.mark.asyncio]

class TestTaskExecutionIntegration:
    @pytest.mark.asyncio
    @pytest.mark.timeout(30)
    async def test_end_to_end_task_execution(self, mock_db, event_loop):
        # Setup test data
        task = {
            "id": "test_task_1",
            "type": "computation",
            "priority": 1,
            "resources": ["cpu", "memory"],
            "data": {"input": "test_input"}
        }
        
        try:
            # Initialize components
            execution_system = TaskExecutionSystem(mock_db)
            monitoring_system = TaskMonitoringSystem(mock_db)
            
            # Submit task
            await execution_system.submit_task(task)
            
            # Wait for task completion with timeout
            start_time = time.time()
            timeout = 25  # seconds
            completed = False
            
            while time.time() - start_time < timeout:
                status = await monitoring_system.get_task_status(task["id"])
                if status == "completed":
                    completed = True
                    break
                await asyncio.sleep(0.1)
            
            assert completed, f"Task did not complete within {timeout} seconds"
            
            # Verify final state
            metrics = await monitoring_system.get_task_metrics(task["id"])
            assert metrics["duration"] > 0
            assert metrics["resources_used"] == task["resources"]
            
        finally:
            # Cleanup
            await mock_db.delete(f"task:{task['id']}")
            await mock_db.delete(f"metrics:{task['id']}")
    
    async def test_concurrent_task_execution(
        self,
        task_batch,
        resource_pool,
        mock_db
    ):
        """Test concurrent execution of multiple tasks."""
        # Setup components
        execution_system = Mock()
        monitoring_system = Mock()
        
        async def execute_single_task(*args, **kwargs) -> Dict:
            """Simulate single task execution."""
            await asyncio.sleep(0.1)  # Simulate work
            return {
                "status": "completed",
                "result": {"success": True},
                "metrics": {
                    "execution_time": 100,
                    "cpu_usage": 0.5,
                    "memory_usage": 0.4
                }
            }
        
        execution_system.execute_task = AsyncMock(side_effect=execute_single_task)
        
        # Execute tasks concurrently
        tasks = [
            execution_system.execute_task(task, {
                "cpu": 1,
                "memory": "1Gi",
                "executor": "compute-pool-1"
            })
            for task in task_batch
        ]
        results = await asyncio.gather(*tasks)
        
        # Verify results
        assert len(results) == len(task_batch)
        assert all(r["status"] == "completed" for r in results)
        
        # Verify resource usage
        total_cpu_used = sum(r["metrics"]["cpu_usage"] for r in results)
        assert total_cpu_used <= resource_pool["compute"]["total_cpu"]
    
    async def test_task_failure_recovery(
        self,
        sample_task,
        error_generator,
        mock_db
    ):
        """Test recovery from task execution failures."""
        # Setup components
        execution_system = Mock()
        recovery_system = Mock()
        
        # Configure failure simulation
        execution_attempts = 0
        async def execute_with_retry(task: Dict, resources: Dict) -> Dict:
            nonlocal execution_attempts
            execution_attempts += 1
            if execution_attempts == 1:
                raise RuntimeError("Simulated execution failure")
            return {
                "status": "completed",
                "result": {"success": True, "retry_count": execution_attempts},
                "metrics": {"execution_time": 150}
            }
        
        execution_system.execute_task = AsyncMock(side_effect=execute_with_retry)
        recovery_system.handle_failure = AsyncMock(return_value={"should_retry": True})
        
        # Execute with recovery
        max_retries = 3
        result = None
        
        for attempt in range(max_retries):
            try:
                result = await execution_system.execute_task(
                    sample_task,
                    {"cpu": 1, "memory": "1Gi"}
                )
                break
            except Exception as e:
                recovery_result = await recovery_system.handle_failure(
                    sample_task,
                    str(e),
                    attempt + 1
                )
                if not recovery_result["should_retry"]:
                    break
        
        # Verify recovery
        assert result is not None
        assert result["status"] == "completed"
        assert result["result"]["retry_count"] == 2
        
        # Verify state consistency
        await mock_db.set(
            f"task:{sample_task['id']}",
            {"status": "completed", "retries": execution_attempts}
        )
        stored_state = await mock_db.get(f"task:{sample_task['id']}")
        assert stored_state["retries"] == 2
    
    async def test_resource_management(
        self,
        task_batch,
        resource_pool,
        mock_db
    ):
        """Test resource allocation and release during task execution."""
        # Setup components
        resource_manager = Mock()
        execution_system = Mock()
        
        # Track resource usage
        allocated_resources = {"cpu": 0, "memory": 0}
        
        async def allocate_resources(requirements: Dict) -> Dict:
            """Simulate resource allocation."""
            if (allocated_resources["cpu"] + requirements["cpu"] >
                resource_pool["compute"]["total_cpu"]):
                raise RuntimeError("Insufficient CPU")
            
            allocated_resources["cpu"] += requirements["cpu"]
            return {
                "allocation_id": f"alloc-{allocated_resources['cpu']}",
                "resources": requirements
            }
        
        async def release_resources(allocation: Dict):
            """Simulate resource release."""
            allocated_resources["cpu"] -= allocation["resources"]["cpu"]
        
        resource_manager.allocate = AsyncMock(side_effect=allocate_resources)
        resource_manager.release = AsyncMock(side_effect=release_resources)
        
        # Execute tasks with resource management
        results = []
        for task in task_batch:
            try:
                # Allocate resources
                allocation = await resource_manager.allocate(task["requirements"])
                
                # Execute task
                result = {
                    "status": "completed",
                    "allocation": allocation,
                    "metrics": {"cpu_usage": task["requirements"]["cpu"]}
                }
                results.append(result)
                
                # Release resources
                await resource_manager.release(allocation)
                
            except Exception as e:
                results.append({
                    "status": "failed",
                    "error": str(e)
                })
        
        # Verify resource cleanup
        assert allocated_resources["cpu"] == 0
        assert len(results) == len(task_batch)
        completed_tasks = [r for r in results if r["status"] == "completed"]
        assert len(completed_tasks) > 0
    
    async def test_monitoring_integration(
        self,
        sample_task,
        metrics_sample,
        mock_db
    ):
        """Test integration of execution monitoring and metrics collection."""
        # Setup components
        execution_system = Mock()
        monitoring_system = Mock()
        
        # Configure execution behavior
        async def execute_task(*args, **kwargs) -> Dict:
            """Simulate task execution."""
            await asyncio.sleep(0.5)  # Simulate long-running task
            return {
                "status": "completed",
                "result": {"success": True},
                "metrics": metrics_sample["task_metrics"]
            }
        
        execution_system.execute_task = AsyncMock(side_effect=execute_task)
        
        # Configure monitoring behavior
        metrics_history = []
        
        async def collect_metrics(execution_id: str) -> Dict:
            """Simulate metrics collection."""
            await asyncio.sleep(0.1)  # Simulate collection time
            metrics = {
                "timestamp": f"2024-03-21T10:00:{len(metrics_history):02d}Z",
                "task_metrics": {
                    "execution_time": 100 * (len(metrics_history) + 1),
                    "cpu_usage": 0.5,
                    "memory_usage": 0.4,
                    "error_rate": 0.0
                }
            }
            metrics_history.append(metrics)
            return metrics
        
        monitoring_system.collect_metrics = AsyncMock(side_effect=collect_metrics)
        
        # Execute with monitoring
        execution_id = "exec-001"
        monitoring_interval = 0.2
        monitoring_duration = 1.0
        
        # Start execution
        execution_task = asyncio.create_task(
            execution_system.execute_task(sample_task, {"cpu": 1, "memory": "1Gi"})
        )
        
        # Monitor execution
        start_time = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start_time < monitoring_duration:
            metrics = await monitoring_system.collect_metrics(execution_id)
            await mock_db.set(
                f"metrics:{execution_id}:{metrics['timestamp']}",
                metrics
            )
            await asyncio.sleep(monitoring_interval)
        
        # Wait for execution to complete
        result = await execution_task
        
        # Verify monitoring
        assert len(metrics_history) > 0
        assert all(
            isinstance(m["task_metrics"]["execution_time"], (int, float))
            for m in metrics_history
        )
        
        # Verify metrics storage
        stored_metrics = []
        async for key in mock_db:
            if key.startswith(f"metrics:{execution_id}:"):
                metric = await mock_db.get(key)
                stored_metrics.append(metric)
        
        assert len(stored_metrics) > 0
        assert all(
            isinstance(m["task_metrics"]["execution_time"], (int, float))
            for m in stored_metrics
        )
        
        # Verify execution result
        assert result["status"] == "completed"
        assert result["metrics"] == metrics_sample["task_metrics"] 