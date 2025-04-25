"""Unit tests for Task Workflow Management."""

import pytest
import asyncio
from unittest.mock import AsyncMock, Mock
from datetime import datetime, timedelta
import uuid

@pytest.fixture
async def mock_db():
    """Create a mock database for testing."""
    db = AsyncMock()
    db._data = {}
    
    async def mock_set(key, value):
        db._data[key] = value
        
    async def mock_get(key):
        return db._data.get(key)
        
    db.set = mock_set
    db.get = mock_get
    return db

@pytest.fixture
def workflow_def():
    """Create a sample workflow definition."""
    return {
        "name": "test_workflow",
        "description": "Test workflow for unit tests",
        "tasks": [
            {"id": "task1", "name": "Task 1"},
            {"id": "task2", "name": "Task 2"},
            {"id": "task3", "name": "Task 3"}
        ],
        "dependencies": {
            "task2": ["task1"],
            "task3": ["task2"]
        }
    }

@pytest.mark.asyncio
async def test_create_workflow(mock_db, workflow_def):
    """Test creating a new workflow."""
    from agents.task.workflow import TaskWorkflowManager
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    assert workflow["name"] == workflow_def["name"]
    assert workflow["description"] == workflow_def["description"]
    assert len(workflow["tasks"]) == 3
    assert workflow["status"] == "created"
    
    # Check workflow state
    state = await mock_db.get(f"workflow_state:{workflow['id']}")
    assert state["status"] == "created"
    assert state["progress"]["total_tasks"] == 3
    assert state["progress"]["completed_tasks"] == 0

@pytest.mark.asyncio
async def test_execute_workflow(mock_db, workflow_def):
    """Test executing a workflow."""
    from agents.task.workflow import TaskWorkflowManager
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    execution = await manager.execute_workflow(workflow["id"])
    
    assert execution["status"] == "completed"
    assert len(execution["stages"]) == 1
    assert execution["tasks_completed"] == 3
    assert "execution_time" in execution

@pytest.mark.asyncio
async def test_workflow_error_handling(mock_db, workflow_def):
    """Test workflow error handling and recovery."""
    from agents.task.workflow import TaskWorkflowManager
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    # Simulate task failure
    state = await mock_db.get(f"workflow_state:{workflow['id']}")
    task_id = workflow_def["tasks"][0]["id"]
    state["task_states"][task_id] = {
        "status": "failed",
        "error": "Test error"
    }
    state["progress"]["failed_tasks"] = 1
    await mock_db.set(f"workflow_state:{workflow['id']}", state)
    
    # Test error recovery
    recovery = await manager.handle_workflow_error(workflow["id"], task_id)
    assert recovery["successful"]
    assert recovery["attempts"] == 1
    
    # Check updated state
    state = await mock_db.get(f"workflow_state:{workflow['id']}")
    assert state["task_states"][task_id]["status"] == "completed"
    assert state["progress"]["failed_tasks"] == 0

@pytest.mark.asyncio
async def test_workflow_optimization(mock_db, workflow_def):
    """Test workflow optimization."""
    from agents.task.workflow import TaskWorkflowManager
    
    # Add resource usage to tasks
    for task in workflow_def["tasks"]:
        task["resource_usage"] = {
            "cpu": 0.5,
            "memory": 256
        }
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    optimization = await manager.optimize_workflow(workflow["id"])
    
    assert len(optimization["optimizations"]) == 2
    assert optimization["estimated_total_improvement"] > 0
    
    # Check optimization types
    optimization_types = {opt["type"] for opt in optimization["optimizations"]}
    assert "task_reordering" in optimization_types
    assert "resource_allocation" in optimization_types

@pytest.mark.asyncio
async def test_workflow_state_persistence(mock_db, workflow_def):
    """Test workflow state persistence."""
    from agents.task.workflow import TaskWorkflowManager
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    # Create test state
    test_state = {
        "workflow_id": workflow["id"],
        "status": "running",
        "progress": {
            "total_tasks": 3,
            "completed_tasks": 1,
            "failed_tasks": 0
        },
        "task_states": {
            "task1": {"status": "completed"}
        }
    }
    
    # Save state
    save_result = await manager.save_workflow_state(workflow["id"], test_state)
    assert save_result["version"] == 1
    assert "saved_at" in save_result
    
    # Get state
    state = await manager.get_workflow_state(workflow["id"])
    assert state["status"] == "running"
    assert state["progress"]["completed_tasks"] == 1
    assert state["task_states"]["task1"]["status"] == "completed"

@pytest.mark.asyncio
async def test_workflow_monitoring(mock_db, workflow_def):
    """Test workflow monitoring."""
    from agents.task.workflow import TaskWorkflowManager
    
    manager = TaskWorkflowManager(mock_db)
    workflow = await manager.create_workflow(workflow_def)
    
    # Start execution
    execution_task = asyncio.create_task(
        manager.execute_workflow(workflow["id"])
    )
    
    # Monitor state while executing
    state = await manager.get_workflow_state(workflow["id"])
    assert "execution" in state
    assert state["execution"]["status"] in ["running", "completed"]
    
    # Wait for completion
    execution = await execution_task
    assert execution["status"] == "completed"
    
    # Final state check
    final_state = await manager.get_workflow_state(workflow["id"])
    assert final_state["progress"]["completed_tasks"] == 3
    assert final_state["progress"]["failed_tasks"] == 0 