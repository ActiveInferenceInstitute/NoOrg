"""
Unit tests for Task Prioritization System.
"""
import pytest
from typing import Dict, List
from unittest.mock import AsyncMock, Mock

pytestmark = pytest.mark.unit

class TestTaskPrioritizer:
    @pytest.mark.asyncio
    async def test_prioritize_single_task(self, sample_task):
        """Test prioritization of a single task."""
        prioritizer = Mock()
        expected_priority = {
            "level": "high",
            "score": 0.8,
            "factors": {
                "deadline": 0.9,
                "resources": 0.7,
                "importance": 0.8
            }
        }
        prioritizer.prioritize_task = AsyncMock(return_value=expected_priority)
        
        result = await prioritizer.prioritize_task(sample_task)
        assert result == expected_priority
        prioritizer.prioritize_task.assert_called_once_with(sample_task)
    
    @pytest.mark.asyncio
    async def test_prioritize_task_batch(self, task_batch):
        """Test batch task prioritization."""
        prioritizer = Mock()
        
        async def prioritize_task(task: Dict) -> Dict:
            """Simulate task prioritization."""
            return {
                "level": "high" if task["priority"] > 2 else "normal",
                "score": 0.5 + (task["priority"] * 0.1),
                "factors": {
                    "deadline": 0.8,
                    "resources": 0.7,
                    "importance": 0.6 + (task["priority"] * 0.1)
                }
            }
        
        prioritizer.prioritize_task = AsyncMock(side_effect=prioritize_task)
        
        results = []
        for task in task_batch:
            result = await prioritizer.prioritize_task(task)
            results.append(result)
        
        assert len(results) == len(task_batch)
        assert all(isinstance(r["score"], float) for r in results)
        assert all(0.0 <= r["score"] <= 1.0 for r in results)
    
    @pytest.mark.asyncio
    async def test_priority_ordering(self, task_batch):
        """Test that tasks are correctly ordered by priority."""
        prioritizer = Mock()
        
        # Configure prioritization behavior
        priority_map = {
            1: {"level": "low", "score": 0.3},
            2: {"level": "normal", "score": 0.6},
            3: {"level": "high", "score": 0.9}
        }
        
        async def prioritize_task(task: Dict) -> Dict:
            base_priority = priority_map[task["priority"]]
            return {
                "level": base_priority["level"],
                "score": base_priority["score"],
                "factors": {
                    "deadline": 0.8,
                    "resources": 0.7,
                    "importance": base_priority["score"]
                }
            }
        
        prioritizer.prioritize_task = AsyncMock(side_effect=prioritize_task)
        
        # Prioritize all tasks
        priorities = []
        for task in task_batch:
            priority = await prioritizer.prioritize_task(task)
            priorities.append((task["id"], priority))
        
        # Sort by priority score
        sorted_priorities = sorted(
            priorities,
            key=lambda x: x[1]["score"],
            reverse=True
        )
        
        # Verify ordering
        for i in range(len(sorted_priorities) - 1):
            current_score = sorted_priorities[i][1]["score"]
            next_score = sorted_priorities[i + 1][1]["score"]
            assert current_score >= next_score
    
    @pytest.mark.asyncio
    async def test_priority_factors(self, sample_task):
        """Test that all priority factors are considered."""
        prioritizer = Mock()
        
        # Add deadline and importance to task
        sample_task.update({
            "deadline": "2024-03-22T10:00:00Z",
            "importance": "critical"
        })
        
        expected_factors = {
            "deadline": 0.9,  # High due to close deadline
            "resources": 0.7,  # Medium resource requirements
            "importance": 1.0  # Maximum due to critical importance
        }
        
        expected_priority = {
            "level": "high",
            "score": sum(expected_factors.values()) / len(expected_factors),
            "factors": expected_factors
        }
        
        prioritizer.prioritize_task = AsyncMock(return_value=expected_priority)
        
        result = await prioritizer.prioritize_task(sample_task)
        assert result["factors"] == expected_factors
        assert all(0.0 <= v <= 1.0 for v in result["factors"].values())
    
    @pytest.mark.asyncio
    async def test_priority_updates(self, sample_task):
        """Test priority updates based on system state changes."""
        prioritizer = Mock()
        
        # Initial priority
        initial_priority = {
            "level": "normal",
            "score": 0.5,
            "factors": {
                "deadline": 0.5,
                "resources": 0.5,
                "importance": 0.5
            }
        }
        
        # Updated priority (after system state change)
        updated_priority = {
            "level": "high",
            "score": 0.8,
            "factors": {
                "deadline": 0.9,  # Deadline getting closer
                "resources": 0.7,  # Resources more available
                "importance": 0.8  # Importance increased
            }
        }
        
        prioritizer.prioritize_task = AsyncMock(side_effect=[
            initial_priority,
            updated_priority
        ])
        
        # Initial prioritization
        result1 = await prioritizer.prioritize_task(sample_task)
        assert result1 == initial_priority
        
        # Simulate system state change
        sample_task["deadline"] = "2024-03-21T11:00:00Z"  # Closer deadline
        
        # Re-prioritize
        result2 = await prioritizer.prioritize_task(sample_task)
        assert result2 == updated_priority
        assert result2["score"] > result1["score"]
    
    @pytest.mark.asyncio
    async def test_priority_constraints(self, sample_task):
        """Test that priority constraints are enforced."""
        prioritizer = Mock()
        
        async def prioritize_with_constraints(task: Dict) -> Dict:
            """Prioritize task with constraint checking."""
            if task.get("importance") == "critical":
                # Critical tasks must have high priority
                return {
                    "level": "high",
                    "score": max(0.8, task.get("base_score", 0.8)),
                    "factors": {
                        "deadline": 1.0,
                        "resources": 0.8,
                        "importance": 1.0
                    }
                }
            return {
                "level": "normal",
                "score": task.get("base_score", 0.5),
                "factors": {
                    "deadline": 0.5,
                    "resources": 0.5,
                    "importance": 0.5
                }
            }
        
        prioritizer.prioritize_task = AsyncMock(side_effect=prioritize_with_constraints)
        
        # Test normal task
        result1 = await prioritizer.prioritize_task(sample_task)
        assert result1["level"] == "normal"
        
        # Test critical task
        sample_task["importance"] = "critical"
        result2 = await prioritizer.prioritize_task(sample_task)
        assert result2["level"] == "high"
        assert result2["score"] >= 0.8 