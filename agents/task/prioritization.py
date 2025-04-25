"""Task prioritization system for managing task priorities."""

from typing import Dict, Any
from datetime import datetime, timezone
import math

class TaskPrioritizer:
    """System for prioritizing tasks based on various factors."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the task prioritization system.
        
        Args:
            config: Optional configuration for prioritization factors
        """
        self.config = config or {
            "deadline_weight": 0.4,
            "resource_weight": 0.3,
            "importance_weight": 0.3,
            "priority_levels": {
                "low": (0.0, 0.4),
                "normal": (0.4, 0.7),
                "high": (0.7, 1.0)
            }
        }
    
    async def prioritize_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Prioritize a task based on its characteristics.
        
        Args:
            task: Task definition including deadline, resources, and importance
            
        Returns:
            Dictionary containing priority level, score, and factor breakdown
        """
        # Calculate individual factor scores
        factors = {
            "deadline": await self._calculate_deadline_score(task),
            "resources": await self._calculate_resource_score(task),
            "importance": await self._calculate_importance_score(task)
        }
        
        # Calculate weighted score
        score = (
            factors["deadline"] * self.config["deadline_weight"] +
            factors["resources"] * self.config["resource_weight"] +
            factors["importance"] * self.config["importance_weight"]
        )
        
        # Determine priority level
        level = await self._determine_priority_level(score)
        
        # Apply constraints
        if task.get("importance") == "critical":
            level = "high"
            score = max(score, self.config["priority_levels"]["high"][0])
        
        return {
            "level": level,
            "score": score,
            "factors": factors
        }
    
    async def _calculate_deadline_score(self, task: Dict[str, Any]) -> float:
        """Calculate score based on task deadline."""
        if "deadline" not in task:
            return 0.5  # Default score for no deadline
            
        try:
            deadline = datetime.fromisoformat(task["deadline"].replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            time_left = (deadline - now).total_seconds()
            
            if time_left <= 0:
                return 1.0  # Highest priority for overdue tasks
            
            # Exponential decay based on time left
            # Score approaches 1.0 as deadline nears
            return 1.0 - math.exp(-1.0 / (time_left / 3600 + 1))
            
        except (ValueError, TypeError):
            return 0.5  # Default score for invalid deadline
    
    async def _calculate_resource_score(self, task: Dict[str, Any]) -> float:
        """Calculate score based on resource requirements."""
        if "resources" not in task:
            return 0.5  # Default score for no resource requirements
            
        try:
            # Calculate based on number and type of resources
            resources = task["resources"]
            if isinstance(resources, list):
                # More resources = higher score
                return min(1.0, len(resources) / 5)
            elif isinstance(resources, dict):
                # Calculate based on resource quantities
                total = sum(
                    float(v) if isinstance(v, (int, float))
                    else 1.0
                    for v in resources.values()
                )
                return min(1.0, total / 10)
            return 0.5
            
        except (TypeError, ValueError):
            return 0.5  # Default score for invalid resources
    
    async def _calculate_importance_score(self, task: Dict[str, Any]) -> float:
        """Calculate score based on task importance."""
        importance_map = {
            "low": 0.3,
            "normal": 0.5,
            "high": 0.8,
            "critical": 1.0
        }
        
        importance = task.get("importance", "normal")
        return importance_map.get(importance, 0.5)
    
    async def _determine_priority_level(self, score: float) -> str:
        """Determine priority level based on score."""
        for level, (min_score, max_score) in self.config["priority_levels"].items():
            if min_score <= score < max_score:
                return level
        return "high" if score >= 1.0 else "low" 