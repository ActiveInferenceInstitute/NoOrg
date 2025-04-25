"""Task monitoring system for tracking task status and metrics."""

from typing import Dict, Any

class TaskMonitoringSystem:
    """System for monitoring task execution and collecting metrics."""
    
    def __init__(self, database):
        """Initialize the task monitoring system.
        
        Args:
            database: Async database interface for storing monitoring data
        """
        self._db = database
        
    async def get_task_status(self, task_id: str) -> str:
        """Get the current status of a task.
        
        Args:
            task_id: ID of the task to check
            
        Returns:
            Current status of the task
        """
        task_data = await self._db.get(f"task:{task_id}")
        return task_data.get("status", "unknown")
        
    async def get_task_metrics(self, task_id: str) -> Dict[str, Any]:
        """Get the metrics for a task.
        
        Args:
            task_id: ID of the task to get metrics for
            
        Returns:
            Dictionary containing task metrics
        """
        return await self._db.get(f"metrics:{task_id}")
        
    async def collect_metrics(self, task_id: str) -> Dict[str, Any]:
        """Collect current metrics for a task.
        
        Args:
            task_id: ID of the task to collect metrics for
            
        Returns:
            Dictionary containing current task metrics
        """
        metrics = await self.get_task_metrics(task_id)
        task_data = await self._db.get(f"task:{task_id}")
        
        # Combine task state with metrics
        return {
            "status": task_data.get("status", "unknown"),
            "metrics": metrics
        } 