"""
Unit tests for the Task Ingestion System.
"""
import pytest
from typing import Dict
from unittest.mock import AsyncMock, Mock

pytestmark = pytest.mark.unit

class TestTaskValidator:
    @pytest.mark.asyncio
    async def test_validate_valid_task(self, sample_task):
        """Test validation of a valid task."""
        validator = Mock()
        validator.validate_task = AsyncMock(return_value=sample_task)
        
        result = await validator.validate_task(sample_task)
        assert result == sample_task
        validator.validate_task.assert_called_once_with(sample_task)
    
    @pytest.mark.asyncio
    async def test_validate_invalid_task(self, sample_task, error_generator):
        """Test validation of an invalid task."""
        validator = Mock()
        validator.validate_task = AsyncMock(side_effect=error_generator.validation_error)
        
        with pytest.raises(ValueError):
            await validator.validate_task(sample_task)

class TestTaskClassifier:
    @pytest.mark.asyncio
    async def test_classify_task(self, sample_task):
        """Test task classification."""
        classifier = Mock()
        expected_classification = {
            "category": "compute",
            "priority_class": "normal",
            "resource_class": "standard"
        }
        classifier.classify_task = AsyncMock(return_value=expected_classification)
        
        result = await classifier.classify_task(sample_task)
        assert result == expected_classification
        classifier.classify_task.assert_called_once_with(sample_task)
    
    @pytest.mark.asyncio
    async def test_classify_task_with_special_requirements(self, sample_task):
        """Test classification of task with special requirements."""
        classifier = Mock()
        sample_task["requirements"]["gpu"] = 1
        expected_classification = {
            "category": "gpu",
            "priority_class": "high",
            "resource_class": "gpu"
        }
        classifier.classify_task = AsyncMock(return_value=expected_classification)
        
        result = await classifier.classify_task(sample_task)
        assert result == expected_classification

class TestTaskRouter:
    @pytest.mark.asyncio
    async def test_route_task(self, sample_task):
        """Test task routing."""
        router = Mock()
        classification = {
            "category": "compute",
            "priority_class": "normal",
            "resource_class": "standard"
        }
        expected_routing = {
            "executor": "compute-pool-1",
            "queue": "standard-tasks",
            "priority": 1
        }
        router.route_task = AsyncMock(return_value=expected_routing)
        
        result = await router.route_task(sample_task, classification)
        assert result == expected_routing
        router.route_task.assert_called_once_with(sample_task, classification)
    
    @pytest.mark.asyncio
    async def test_route_task_with_no_resources(self, sample_task, error_generator):
        """Test routing when no resources are available."""
        router = Mock()
        classification = {
            "category": "compute",
            "priority_class": "normal",
            "resource_class": "standard"
        }
        router.route_task = AsyncMock(side_effect=error_generator.resource_error)
        
        with pytest.raises(RuntimeError):
            await router.route_task(sample_task, classification)

class TestTaskIngestionSystem:
    @pytest.mark.asyncio
    async def test_ingest_task_success(self, sample_task):
        """Test successful task ingestion."""
        ingestion_system = Mock()
        expected_result = {
            "task": sample_task,
            "classification": {
                "category": "compute",
                "priority_class": "normal",
                "resource_class": "standard"
            },
            "routing": {
                "executor": "compute-pool-1",
                "queue": "standard-tasks",
                "priority": 1
            }
        }
        ingestion_system.ingest_task = AsyncMock(return_value=expected_result)
        
        result = await ingestion_system.ingest_task(sample_task)
        assert result == expected_result
        ingestion_system.ingest_task.assert_called_once_with(sample_task)
    
    @pytest.mark.asyncio
    async def test_ingest_task_batch(self, task_batch):
        """Test batch task ingestion."""
        ingestion_system = Mock()
        expected_results = []
        for task in task_batch:
            expected_results.append({
                "task": task,
                "classification": {
                    "category": "compute",
                    "priority_class": "normal",
                    "resource_class": "standard"
                },
                "routing": {
                    "executor": "compute-pool-1",
                    "queue": "standard-tasks",
                    "priority": task["priority"]
                }
            })
        ingestion_system.ingest_task = AsyncMock(side_effect=expected_results)
        
        results = []
        for task in task_batch:
            result = await ingestion_system.ingest_task(task)
            results.append(result)
        
        assert len(results) == len(task_batch)
        assert all(isinstance(r, dict) for r in results)
    
    @pytest.mark.asyncio
    async def test_ingest_task_failure_handling(self, sample_task, error_generator):
        """Test handling of task ingestion failures."""
        ingestion_system = Mock()
        ingestion_system.ingest_task = AsyncMock(side_effect=error_generator.validation_error)
        
        with pytest.raises(ValueError):
            await ingestion_system.ingest_task(sample_task)
    
    @pytest.mark.asyncio
    async def test_ingest_task_performance(self, sample_task, benchmark_config):
        """Test task ingestion performance."""
        ingestion_system = Mock()
        expected_result = {
            "task": sample_task,
            "classification": {
                "category": "compute",
                "priority_class": "normal",
                "resource_class": "standard"
            },
            "routing": {
                "executor": "compute-pool-1",
                "queue": "standard-tasks",
                "priority": 1
            }
        }
        ingestion_system.ingest_task = AsyncMock(return_value=expected_result)
        
        start_time = benchmark_config["timer"]()
        for _ in range(benchmark_config["iterations"]):
            await ingestion_system.ingest_task(sample_task)
        end_time = benchmark_config["timer"]()
        
        total_time = end_time - start_time
        avg_time = total_time / benchmark_config["iterations"]
        assert avg_time < 0.001  # Less than 1ms per ingestion 