"""Task execution system for managing task lifecycle and execution."""

from typing import Dict, Any
import asyncio
import time

class TaskExecutionSystem:
    """System for executing tasks and managing their lifecycle."""
    
    def __init__(self, database):
        """Initialize the task execution system.
        
        Args:
            database: Async database interface for storing task state
        """
        self._db = database
        
    async def submit_task(self, task: Dict[str, Any]) -> None:
        """Submit a task for execution.
        
        Args:
            task: Task definition including id, type, priority, and resources
        """
        await self._db.set(f"task:{task['id']}", {
            "status": "submitted",
            "task": task,
            "submitted_at": time.time()
        })
        
        # Simulate task execution
        asyncio.create_task(self._execute_task(task))
        
    async def _execute_task(self, task: Dict[str, Any]) -> None:
        """Execute a task and update its state.
        
        Args:
            task: Task to execute
        """
        # Update status to running
        start_time = time.time()
        await self._db.set(f"task:{task['id']}", {
            "status": "running",
            "task": task,
            "started_at": start_time
        })
        
        # Simulate task execution
        await asyncio.sleep(0.5)
        
        # Update status to completed
        completed_at = time.time()
        await self._db.set(f"task:{task['id']}", {
            "status": "completed",
            "task": task,
            "completed_at": completed_at
        })
        
        # Store metrics
        await self._db.set(f"metrics:{task['id']}", {
            "duration": completed_at - start_time,
            "resources_used": task["resources"],
            "error_rate": 0.0
        }) 