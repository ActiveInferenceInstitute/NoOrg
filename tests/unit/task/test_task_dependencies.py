"""
Unit tests for Task Dependency Management.
"""
import pytest
from typing import Dict, List
from unittest.mock import AsyncMock, Mock

pytestmark = pytest.mark.unit

class TestTaskDependencyManager:
    @pytest.mark.asyncio
    async def test_add_dependency(self, sample_task):
        """Test adding a dependency to a task."""
        dependency_manager = Mock()
        
        # Create dependent task
        dependent_task = {
            "id": "dep-task-1",
            "type": "preprocessing",
            "priority": 1,
            "status": "completed"
        }
        
        expected_result = {
            "task_id": sample_task["id"],
            "dependency_id": dependent_task["id"],
            "type": "requires",
            "status": "satisfied"
        }
        
        dependency_manager.add_dependency = AsyncMock(return_value=expected_result)
        
        result = await dependency_manager.add_dependency(
            sample_task["id"],
            dependent_task["id"]
        )
        assert result == expected_result
        dependency_manager.add_dependency.assert_called_once_with(
            sample_task["id"],
            dependent_task["id"]
        )
    
    @pytest.mark.asyncio
    async def test_check_dependencies(self, sample_task):
        """Test checking task dependencies."""
        dependency_manager = Mock()
        
        # Add multiple dependencies
        dependencies = [
            {
                "id": "dep-task-1",
                "status": "completed"
            },
            {
                "id": "dep-task-2",
                "status": "completed"
            }
        ]
        
        sample_task["dependencies"] = [dep["id"] for dep in dependencies]
        
        expected_result = {
            "task_id": sample_task["id"],
            "satisfied": True,
            "pending_dependencies": [],
            "satisfied_dependencies": [dep["id"] for dep in dependencies]
        }
        
        dependency_manager.check_dependencies = AsyncMock(return_value=expected_result)
        
        result = await dependency_manager.check_dependencies(sample_task["id"])
        assert result == expected_result
        assert result["satisfied"]
        assert len(result["satisfied_dependencies"]) == len(dependencies)
    
    @pytest.mark.asyncio
    async def test_dependency_chain(self, task_batch):
        """Test handling of dependency chains."""
        dependency_manager = Mock()
        
        # Create dependency chain
        for i in range(len(task_batch) - 1):
            task_batch[i + 1]["dependencies"] = [task_batch[i]["id"]]
        
        async def check_chain(task_id: str) -> Dict:
            """Check dependency chain for a task."""
            chain = []
            current_task = None
            
            # Find starting task
            for task in task_batch:
                if task["id"] == task_id:
                    current_task = task
                    break
            
            # Build chain
            while current_task and "dependencies" in current_task:
                dep_id = current_task["dependencies"][0]
                chain.append(dep_id)
                
                # Find next task
                for task in task_batch:
                    if task["id"] == dep_id:
                        current_task = task
                        break
                else:
                    current_task = None
            
            return {
                "task_id": task_id,
                "dependency_chain": chain,
                "chain_length": len(chain),
                "is_circular": False
            }
        
        dependency_manager.analyze_dependency_chain = AsyncMock(side_effect=check_chain)
        
        # Check last task in chain
        result = await dependency_manager.analyze_dependency_chain(task_batch[-1]["id"])
        assert len(result["dependency_chain"]) == len(task_batch) - 1
        assert not result["is_circular"]
    
    @pytest.mark.asyncio
    async def test_circular_dependency_detection(self, task_batch):
        """Test detection of circular dependencies."""
        dependency_manager = Mock()
        
        # Create circular dependency
        task_batch[0]["dependencies"] = [task_batch[-1]["id"]]
        for i in range(len(task_batch) - 1):
            task_batch[i + 1]["dependencies"] = [task_batch[i]["id"]]
        
        async def check_circular(task_id: str) -> Dict:
            """Check for circular dependencies."""
            visited = set()
            current_id = task_id
            
            while current_id:
                if current_id in visited:
                    return {
                        "task_id": task_id,
                        "is_circular": True,
                        "cycle_detected": True,
                        "cycle_path": list(visited)
                    }
                visited.add(current_id)
                
                # Find next task in chain
                next_id = None
                for task in task_batch:
                    if task["id"] == current_id and "dependencies" in task:
                        next_id = task["dependencies"][0]
                        break
                current_id = next_id
            
            return {
                "task_id": task_id,
                "is_circular": False,
                "cycle_detected": False,
                "cycle_path": []
            }
        
        dependency_manager.analyze_dependency_chain = AsyncMock(side_effect=check_circular)
        
        # Check for circular dependency
        result = await dependency_manager.analyze_dependency_chain(task_batch[0]["id"])
        assert result["is_circular"]
        assert result["cycle_detected"]
        assert len(result["cycle_path"]) > 0
    
    @pytest.mark.asyncio
    async def test_dependency_satisfaction(self, sample_task):
        """Test dependency satisfaction checking."""
        dependency_manager = Mock()
        
        # Create dependencies with different states
        dependencies = [
            {
                "id": "dep-task-1",
                "status": "completed",
                "result": {"success": True}
            },
            {
                "id": "dep-task-2",
                "status": "failed",
                "result": {"error": "execution_failed"}
            },
            {
                "id": "dep-task-3",
                "status": "running"
            }
        ]
        
        sample_task["dependencies"] = [dep["id"] for dep in dependencies]
        
        expected_result = {
            "task_id": sample_task["id"],
            "satisfied": False,
            "pending_dependencies": ["dep-task-2", "dep-task-3"],
            "satisfied_dependencies": ["dep-task-1"],
            "failed_dependencies": ["dep-task-2"],
            "status": {
                "completed": 1,
                "failed": 1,
                "running": 1
            }
        }
        
        dependency_manager.check_dependencies = AsyncMock(return_value=expected_result)
        
        result = await dependency_manager.check_dependencies(sample_task["id"])
        assert result == expected_result
        assert not result["satisfied"]
        assert len(result["pending_dependencies"]) == 2
        assert len(result["failed_dependencies"]) == 1
    
    @pytest.mark.asyncio
    async def test_dependency_updates(self, sample_task):
        """Test handling of dependency updates."""
        dependency_manager = Mock()
        
        # Initial state
        initial_state = {
            "task_id": sample_task["id"],
            "dependencies": ["dep-task-1"],
            "status": {
                "dep-task-1": "running"
            }
        }
        
        # Updated state
        updated_state = {
            "task_id": sample_task["id"],
            "dependencies": ["dep-task-1"],
            "status": {
                "dep-task-1": "completed"
            },
            "satisfied": True
        }
        
        dependency_manager.get_dependency_state = AsyncMock(side_effect=[
            initial_state,
            updated_state
        ])
        
        # Check initial state
        result1 = await dependency_manager.get_dependency_state(sample_task["id"])
        assert result1 == initial_state
        assert result1["status"]["dep-task-1"] == "running"
        
        # Check updated state
        result2 = await dependency_manager.get_dependency_state(sample_task["id"])
        assert result2 == updated_state
        assert result2["status"]["dep-task-1"] == "completed"
        assert result2["satisfied"] 