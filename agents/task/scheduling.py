"""Task scheduling system for managing task execution schedules."""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import heapq

class TaskScheduler:
    """System for scheduling tasks based on priorities, dependencies, and constraints."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the task scheduling system.
        
        Args:
            config: Optional configuration for scheduling parameters
        """
        self.config = config or {
            "max_concurrent_tasks": 100,
            "default_time_slice": 300,  # 5 minutes
            "scheduling_horizon": "24h",
            "optimization_weights": {
                "priority": 0.4,
                "deadline": 0.3,
                "resource_efficiency": 0.3
            }
        }
        self._schedule = []  # Priority queue of scheduled tasks
        self._resource_allocations = {}  # Track resource allocations
    
    async def schedule_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule a task based on its characteristics and constraints.
        
        Args:
            task: Task definition including dependencies and constraints
            
        Returns:
            Dictionary containing scheduling details
        """
        try:
            # Check dependencies
            earliest_start = await self._calculate_earliest_start(task)
            
            # Check constraints
            await self._validate_constraints(task)
            
            # Calculate resource requirements
            resources = await self._allocate_resources(task)
            
            # Determine schedule slot
            scheduled_time = await self._find_schedule_slot(
                task,
                earliest_start,
                resources
            )
            
            # Create schedule entry
            schedule = {
                "task_id": task["id"],
                "scheduled_time": scheduled_time.isoformat().replace("+00:00", "Z"),
                "estimated_duration": await self._estimate_duration(task),
                "assigned_resources": resources,
                "dependencies": task.get("dependencies", [])
            }
            
            # Update internal schedule
            heapq.heappush(
                self._schedule,
                (scheduled_time.timestamp(), schedule)
            )
            
            return schedule
            
        except Exception as e:
            await self._handle_scheduling_error(e, task)
            raise
    
    async def optimize_schedule(
        self,
        tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Optimize schedule for multiple tasks.
        
        Args:
            tasks: List of tasks to schedule
            
        Returns:
            List of optimized schedule entries
        """
        try:
            # Sort tasks by priority and constraints
            sorted_tasks = await self._sort_tasks(tasks)
            
            # Clear current schedule
            self._schedule = []
            self._resource_allocations = {}
            
            # Schedule tasks
            schedule = []
            for task in sorted_tasks:
                entry = await self.schedule_task(task)
                schedule.append(entry)
            
            # Optimize resource usage
            optimized = await self._optimize_resource_usage(schedule)
            
            return optimized
            
        except Exception as e:
            await self._handle_optimization_error(e, tasks)
            raise
    
    async def _calculate_earliest_start(
        self,
        task: Dict[str, Any]
    ) -> datetime:
        """Calculate earliest possible start time based on dependencies."""
        if "dependencies" not in task:
            return datetime.now()
            
        # Find latest completion time of dependencies
        latest_completion = datetime.now()
        for dep_id in task["dependencies"]:
            for _, entry in self._schedule:
                if entry["task_id"] == dep_id:
                    completion_time = datetime.fromisoformat(
                        entry["scheduled_time"].replace("Z", "+00:00")
                    ) + timedelta(seconds=entry["estimated_duration"])
                    if completion_time > latest_completion:
                        latest_completion = completion_time
        
        return latest_completion
    
    async def _validate_constraints(self, task: Dict[str, Any]) -> None:
        """Validate task constraints."""
        constraints = task.get("constraints", {})
        
        # Time window constraints
        if "time_window" in constraints:
            window = constraints["time_window"]
            start = datetime.fromisoformat(window["start"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(window["end"].replace("Z", "+00:00"))
            
            if end < datetime.now():
                raise ValueError("Time window has already passed")
            
            if start > end:
                raise ValueError("Invalid time window")
        
        # Resource constraints
        if "resource_requirements" in constraints:
            reqs = constraints["resource_requirements"]
            
            # Validate CPU requirements
            if reqs.get("min_cpu", 1) > self.config.get("max_cpu_per_task", 4):
                raise ValueError("CPU requirement exceeds maximum allowed")
            
            # Validate memory requirements
            if "min_memory" in reqs:
                # Convert memory requirement to bytes for comparison
                required = self._parse_memory(reqs["min_memory"])
                maximum = self._parse_memory(
                    self.config.get("max_memory_per_task", "8Gi")
                )
                if required > maximum:
                    raise ValueError("Memory requirement exceeds maximum allowed")
    
    async def _allocate_resources(
        self,
        task: Dict[str, Any]
    ) -> List[str]:
        """Allocate resources for task execution."""
        constraints = task.get("constraints", {})
        reqs = constraints.get("resource_requirements", {})
        
        resources = []
        
        # Allocate CPU
        cpu_count = reqs.get("min_cpu", 1)
        for i in range(cpu_count):
            cpu_id = f"cpu_{i + 1}"
            if cpu_id not in self._resource_allocations:
                self._resource_allocations[cpu_id] = []
            resources.append(cpu_id)
        
        # Allocate memory
        memory_size = reqs.get("min_memory", "1Gi")
        memory_id = f"memory_block_{len(resources)}"
        if memory_id not in self._resource_allocations:
            self._resource_allocations[memory_id] = []
        resources.append(memory_id)
        
        return resources
    
    async def _find_schedule_slot(
        self,
        task: Dict[str, Any],
        earliest_start: datetime,
        resources: List[str]
    ) -> datetime:
        """Find suitable time slot for task execution."""
        current_time = max(earliest_start, datetime.now())
        
        # Check time window constraints
        constraints = task.get("constraints", {})
        if "time_window" in constraints:
            window = constraints["time_window"]
            window_start = datetime.fromisoformat(
                window["start"].replace("Z", "+00:00")
            )
            current_time = max(current_time, window_start)
        
        # Find slot with available resources
        while True:
            # Check resource availability
            resources_available = True
            for resource in resources:
                allocations = self._resource_allocations.get(resource, [])
                for alloc_start, alloc_end in allocations:
                    if (current_time >= alloc_start and
                        current_time < alloc_end):
                        resources_available = False
                        current_time = alloc_end
                        break
                if not resources_available:
                    break
            
            if resources_available:
                # Update resource allocations
                duration = await self._estimate_duration(task)
                end_time = current_time + timedelta(seconds=duration)
                
                for resource in resources:
                    if resource not in self._resource_allocations:
                        self._resource_allocations[resource] = []
                    self._resource_allocations[resource].append(
                        (current_time, end_time)
                    )
                
                return current_time
            
            # Try next time slot
            current_time += timedelta(seconds=self.config["default_time_slice"])
    
    async def _estimate_duration(self, task: Dict[str, Any]) -> int:
        """Estimate task execution duration."""
        # Use historical data if available
        if "execution_feedback" in task:
            feedback = task["execution_feedback"]
            return int(feedback["actual_duration"] * 1.1)  # Add 10% buffer
        
        # Use specified duration
        if "estimated_duration" in task:
            return task["estimated_duration"]
        
        # Use default duration
        return self.config["default_time_slice"]
    
    async def _sort_tasks(
        self,
        tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Sort tasks by priority and other factors."""
        async def calculate_score(task: Dict[str, Any]) -> float:
            weights = self.config["optimization_weights"]
            
            # Priority score
            priority_score = task.get("priority", 1) / 3
            
            # Deadline score
            deadline_score = 0.0
            if "constraints" in task and "time_window" in task["constraints"]:
                end_time = datetime.fromisoformat(
                    task["constraints"]["time_window"]["end"].replace("Z", "+00:00")
                )
                time_left = (end_time - datetime.now()).total_seconds()
                deadline_score = 1.0 / (1.0 + time_left / 3600)
            
            # Resource efficiency score
            efficiency_score = 0.5
            if "resource_usage" in task:
                if task["resource_usage"]["cpu_pattern"] == "constant":
                    efficiency_score += 0.3
                if task["resource_usage"]["memory_pattern"] == "constant":
                    efficiency_score += 0.2
            
            return (
                priority_score * weights["priority"] +
                deadline_score * weights["deadline"] +
                efficiency_score * weights["resource_efficiency"]
            )
        
        # Calculate scores
        scores = []
        for task in tasks:
            score = await calculate_score(task)
            scores.append((score, task))
        
        # Sort by score
        scores.sort(reverse=True)
        return [task for _, task in scores]
    
    async def _optimize_resource_usage(
        self,
        schedule: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Optimize resource usage across scheduled tasks."""
        optimized = []
        
        for entry in schedule:
            # Calculate optimization metrics
            optimization = {
                "resource_efficiency": 0.8,  # Placeholder
                "time_efficiency": 0.9  # Placeholder
            }
            
            # Add optimization data
            entry["optimization_factors"] = optimization
            optimized.append(entry)
        
        return optimized
    
    @staticmethod
    def _parse_memory(memory_str: str) -> int:
        """Parse memory string to bytes."""
        units = {
            "Ki": 1024,
            "Mi": 1024 * 1024,
            "Gi": 1024 * 1024 * 1024,
            "Ti": 1024 * 1024 * 1024 * 1024
        }
        
        for unit, multiplier in units.items():
            if memory_str.endswith(unit):
                value = float(memory_str[:-2])
                return int(value * multiplier)
        
        return int(memory_str)  # Assume bytes if no unit
    
    async def _handle_scheduling_error(
        self,
        error: Exception,
        task: Dict[str, Any]
    ) -> None:
        """Handle scheduling errors."""
        # Log error
        print(f"Scheduling error for task {task['id']}: {str(error)}")
        
        # Cleanup any partial resource allocations
        if hasattr(self, '_resource_allocations'):
            for resource, allocations in self._resource_allocations.items():
                self._resource_allocations[resource] = [
                    alloc for alloc in allocations
                    if task['id'] not in str(alloc)
                ]
    
    async def _handle_optimization_error(
        self,
        error: Exception,
        tasks: List[Dict[str, Any]]
    ) -> None:
        """Handle optimization errors."""
        # Log error
        print(f"Optimization error for {len(tasks)} tasks: {str(error)}")
        
        # Cleanup
        self._schedule = []
        self._resource_allocations = {} 