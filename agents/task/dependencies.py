"""Task dependency management system for tracking and resolving task dependencies."""

from typing import Dict, List, Any, Optional, Set, Tuple
from collections import defaultdict, deque
from enum import Enum
import time


class DependencyType(Enum):
    """Types of dependencies between tasks."""
    FINISH_TO_START = "finish_to_start"     # B cannot start until A finishes
    START_TO_START = "start_to_start"       # B cannot start until A starts
    FINISH_TO_FINISH = "finish_to_finish"   # B cannot finish until A finishes
    START_TO_FINISH = "start_to_finish"     # B cannot finish until A starts


class DependencyStatus(Enum):
    """Status of a dependency relationship."""
    PENDING = "pending"
    SATISFIED = "satisfied"
    BLOCKED = "blocked"
    FAILED = "failed"


class TaskDependencyManager:
    """System for managing task dependencies, detecting cycles, and resolving execution order.

    Maintains a directed acyclic graph (DAG) of task dependencies and provides
    methods for querying dependency chains, detecting circular dependencies,
    and computing topological execution order.
    """

    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the task dependency manager.

        Args:
            config: Optional configuration for dependency management parameters
        """
        self.config = config or {
            "max_dependency_depth": 100,
            "allow_optional_dependencies": True,
            "strict_cycle_detection": True,
        }
        # Adjacency list: task_id -> list of (dependency_task_id, dep_type, metadata)
        self._dependencies: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        # Reverse adjacency list: task_id -> list of task_ids that depend on it
        self._dependents: Dict[str, List[str]] = defaultdict(list)
        # Task completion status tracking
        self._task_status: Dict[str, str] = {}
        # Dependency metadata storage
        self._metadata: Dict[str, Dict[str, Any]] = {}

    def add_dependency(
        self,
        task_id: str,
        depends_on: str,
        dependency_type: DependencyType = DependencyType.FINISH_TO_START,
        optional: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Add a dependency relationship between two tasks.

        Args:
            task_id: The task that has the dependency
            depends_on: The task that must be completed first
            dependency_type: The type of dependency relationship
            optional: Whether this dependency is optional
            metadata: Additional metadata about the dependency

        Returns:
            Dictionary containing the dependency details

        Raises:
            ValueError: If adding this dependency would create a circular dependency
        """
        if task_id == depends_on:
            raise ValueError(
                f"A task cannot depend on itself: {task_id}"
            )

        # Check for circular dependency before adding
        if self.config["strict_cycle_detection"]:
            if self._would_create_cycle(task_id, depends_on):
                raise ValueError(
                    f"Adding dependency {task_id} -> {depends_on} would create "
                    f"a circular dependency"
                )

        # Check for duplicate dependency
        for existing in self._dependencies[task_id]:
            if existing["depends_on"] == depends_on:
                raise ValueError(
                    f"Dependency already exists: {task_id} -> {depends_on}"
                )

        dependency = {
            "task_id": task_id,
            "depends_on": depends_on,
            "type": dependency_type.value,
            "optional": optional,
            "metadata": metadata or {},
            "status": DependencyStatus.PENDING.value,
            "created_at": time.time(),
        }

        self._dependencies[task_id].append(dependency)
        self._dependents[depends_on].append(task_id)

        # Initialize task status if not present
        if task_id not in self._task_status:
            self._task_status[task_id] = "pending"
        if depends_on not in self._task_status:
            self._task_status[depends_on] = "pending"

        return dependency

    def remove_dependency(
        self,
        task_id: str,
        depends_on: str,
    ) -> bool:
        """Remove a dependency relationship between two tasks.

        Args:
            task_id: The task that has the dependency
            depends_on: The task it depends on

        Returns:
            True if the dependency was removed, False if it did not exist
        """
        if task_id not in self._dependencies:
            return False

        original_count = len(self._dependencies[task_id])
        self._dependencies[task_id] = [
            dep for dep in self._dependencies[task_id]
            if dep["depends_on"] != depends_on
        ]
        removed = len(self._dependencies[task_id]) < original_count

        if removed:
            self._dependents[depends_on] = [
                t for t in self._dependents[depends_on]
                if t != task_id
            ]

            # Clean up empty entries
            if not self._dependencies[task_id]:
                del self._dependencies[task_id]
            if not self._dependents[depends_on]:
                del self._dependents[depends_on]

        return removed

    def check_dependencies(
        self,
        task_id: str,
    ) -> Dict[str, Any]:
        """Check the status of all dependencies for a given task.

        Args:
            task_id: The task to check dependencies for

        Returns:
            Dictionary containing dependency check results with overall
            status, individual dependency statuses, and readiness flag
        """
        if task_id not in self._dependencies:
            return {
                "task_id": task_id,
                "dependencies": [],
                "all_satisfied": True,
                "ready_to_execute": True,
                "blocking_tasks": [],
            }

        dependencies = self._dependencies[task_id]
        results = []
        blocking_tasks = []
        all_satisfied = True

        for dep in dependencies:
            dep_task_id = dep["depends_on"]
            dep_status = self._task_status.get(dep_task_id, "unknown")

            satisfied = self._is_dependency_satisfied(dep, dep_status)

            result = {
                "depends_on": dep_task_id,
                "type": dep["type"],
                "optional": dep["optional"],
                "task_status": dep_status,
                "satisfied": satisfied,
            }
            results.append(result)

            if not satisfied and not dep["optional"]:
                all_satisfied = False
                blocking_tasks.append(dep_task_id)

        return {
            "task_id": task_id,
            "dependencies": results,
            "all_satisfied": all_satisfied,
            "ready_to_execute": all_satisfied,
            "blocking_tasks": blocking_tasks,
        }

    def get_dependency_chain(
        self,
        task_id: str,
        max_depth: Optional[int] = None,
    ) -> List[List[str]]:
        """Get all dependency chains leading to a task.

        Traverses the dependency graph from the given task back to all
        root tasks (tasks with no dependencies), returning each unique
        path as a chain.

        Args:
            task_id: The task to trace dependencies for
            max_depth: Maximum depth to traverse (defaults to config value)

        Returns:
            List of dependency chains, where each chain is an ordered list
            of task IDs from root to the given task
        """
        depth_limit = max_depth or self.config["max_dependency_depth"]
        chains: List[List[str]] = []
        self._trace_chains(task_id, [task_id], chains, set(), depth_limit)
        return chains

    def get_dependents(self, task_id: str) -> List[str]:
        """Get all tasks that directly depend on the given task.

        Args:
            task_id: The task to find dependents for

        Returns:
            List of task IDs that depend on the given task
        """
        return list(self._dependents.get(task_id, []))

    def get_all_dependents(self, task_id: str) -> Set[str]:
        """Get all tasks that directly or transitively depend on the given task.

        Args:
            task_id: The task to find all dependents for

        Returns:
            Set of all task IDs that depend on the given task (transitively)
        """
        all_dependents: Set[str] = set()
        queue = deque(self._dependents.get(task_id, []))

        while queue:
            current = queue.popleft()
            if current not in all_dependents:
                all_dependents.add(current)
                queue.extend(self._dependents.get(current, []))

        return all_dependents

    def detect_circular_dependencies(self) -> List[List[str]]:
        """Detect all circular dependencies in the dependency graph.

        Uses depth-first search to find all cycles in the dependency graph.

        Returns:
            List of cycles, where each cycle is a list of task IDs forming
            the circular dependency path
        """
        cycles: List[List[str]] = []
        visited: Set[str] = set()
        rec_stack: Set[str] = set()

        all_tasks = set(self._dependencies.keys())
        for deps in self._dependencies.values():
            for dep in deps:
                all_tasks.add(dep["depends_on"])

        for task_id in all_tasks:
            if task_id not in visited:
                self._detect_cycles_dfs(
                    task_id, visited, rec_stack, [], cycles
                )

        return cycles

    def topological_sort(self) -> List[str]:
        """Compute a topological ordering of all tasks.

        Returns tasks in an order such that for every dependency edge
        (A depends on B), B appears before A in the ordering.

        Returns:
            List of task IDs in topological order

        Raises:
            ValueError: If the dependency graph contains cycles
        """
        # Collect all task IDs
        all_tasks: Set[str] = set()
        in_degree: Dict[str, int] = defaultdict(int)

        for task_id, deps in self._dependencies.items():
            all_tasks.add(task_id)
            for dep in deps:
                all_tasks.add(dep["depends_on"])

        # Calculate in-degrees (number of dependencies each task has)
        for task_id in all_tasks:
            if task_id not in in_degree:
                in_degree[task_id] = 0

        for task_id, deps in self._dependencies.items():
            in_degree[task_id] = len([
                d for d in deps if not d.get("optional", False)
            ])

        # Kahn's algorithm for topological sort
        queue = deque([
            task_id for task_id, degree in in_degree.items()
            if degree == 0
        ])

        sorted_tasks: List[str] = []

        while queue:
            current = queue.popleft()
            sorted_tasks.append(current)

            # Reduce in-degree for all dependents
            for dependent in self._dependents.get(current, []):
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)

        if len(sorted_tasks) != len(all_tasks):
            remaining = all_tasks - set(sorted_tasks)
            raise ValueError(
                f"Circular dependency detected involving tasks: "
                f"{', '.join(sorted(remaining))}"
            )

        return sorted_tasks

    def get_execution_layers(self) -> List[List[str]]:
        """Group tasks into layers for parallel execution.

        Tasks within the same layer have no dependencies on each other
        and can be executed in parallel. Each layer depends on all
        previous layers being completed.

        Returns:
            List of layers, where each layer is a list of task IDs
            that can be executed concurrently
        """
        all_tasks: Set[str] = set()
        for task_id, deps in self._dependencies.items():
            all_tasks.add(task_id)
            for dep in deps:
                all_tasks.add(dep["depends_on"])

        # Calculate in-degrees
        in_degree: Dict[str, int] = defaultdict(int)
        for task_id in all_tasks:
            in_degree[task_id] = 0
        for task_id, deps in self._dependencies.items():
            in_degree[task_id] = len([
                d for d in deps if not d.get("optional", False)
            ])

        remaining = set(all_tasks)
        layers: List[List[str]] = []

        while remaining:
            # Find all tasks with zero in-degree among remaining
            layer = [
                t for t in remaining
                if in_degree.get(t, 0) == 0
            ]

            if not layer:
                raise ValueError(
                    f"Circular dependency detected involving tasks: "
                    f"{', '.join(sorted(remaining))}"
                )

            layers.append(sorted(layer))

            # Remove this layer and update in-degrees
            for task_id in layer:
                remaining.discard(task_id)
                for dependent in self._dependents.get(task_id, []):
                    in_degree[dependent] = max(0, in_degree[dependent] - 1)

        return layers

    def mark_task_completed(self, task_id: str) -> List[str]:
        """Mark a task as completed and return newly unblocked tasks.

        Args:
            task_id: The task to mark as completed

        Returns:
            List of task IDs that are now ready to execute
        """
        self._task_status[task_id] = "completed"

        # Find tasks that are now unblocked
        newly_ready: List[str] = []
        for dependent in self._dependents.get(task_id, []):
            check = self.check_dependencies(dependent)
            if check["ready_to_execute"]:
                newly_ready.append(dependent)

        return newly_ready

    def mark_task_started(self, task_id: str) -> None:
        """Mark a task as started.

        Args:
            task_id: The task to mark as started
        """
        self._task_status[task_id] = "running"

    def mark_task_failed(self, task_id: str) -> List[str]:
        """Mark a task as failed and return affected dependent tasks.

        Args:
            task_id: The task to mark as failed

        Returns:
            List of task IDs that are blocked due to this failure
        """
        self._task_status[task_id] = "failed"

        # Find all transitively affected tasks
        affected: List[str] = []
        for dependent in self.get_all_dependents(task_id):
            # Check if the dependency on the failed task is non-optional
            deps = self._dependencies.get(dependent, [])
            for dep in deps:
                if dep["depends_on"] == task_id and not dep["optional"]:
                    affected.append(dependent)
                    self._task_status[dependent] = "blocked"
                    break

        return affected

    def get_task_status(self, task_id: str) -> Optional[str]:
        """Get the current status of a task.

        Args:
            task_id: The task to check status for

        Returns:
            Task status string or None if task is unknown
        """
        return self._task_status.get(task_id)

    def get_all_tasks(self) -> Set[str]:
        """Get all task IDs known to the dependency manager.

        Returns:
            Set of all task IDs in the dependency graph
        """
        all_tasks: Set[str] = set()
        for task_id, deps in self._dependencies.items():
            all_tasks.add(task_id)
            for dep in deps:
                all_tasks.add(dep["depends_on"])
        all_tasks.update(self._task_status.keys())
        return all_tasks

    def get_root_tasks(self) -> List[str]:
        """Get all tasks with no dependencies (root tasks).

        Returns:
            List of task IDs that have no dependencies
        """
        all_tasks = self.get_all_tasks()
        tasks_with_deps = set(self._dependencies.keys())
        return sorted(all_tasks - tasks_with_deps)

    def get_leaf_tasks(self) -> List[str]:
        """Get all tasks that no other task depends on (leaf tasks).

        Returns:
            List of task IDs that are not depended upon
        """
        all_tasks = self.get_all_tasks()
        depended_upon = set(self._dependents.keys())
        return sorted(all_tasks - depended_upon)

    def get_critical_path(self) -> List[str]:
        """Calculate the critical path through the dependency graph.

        The critical path is the longest chain of dependent tasks,
        representing the minimum time to complete all tasks.

        Returns:
            List of task IDs forming the critical path
        """
        try:
            sorted_tasks = self.topological_sort()
        except ValueError:
            return []

        # Calculate longest path to each task
        distances: Dict[str, int] = {task: 0 for task in sorted_tasks}
        predecessors: Dict[str, Optional[str]] = {
            task: None for task in sorted_tasks
        }

        for task_id in sorted_tasks:
            for dependent in self._dependents.get(task_id, []):
                new_distance = distances[task_id] + 1
                if new_distance > distances.get(dependent, 0):
                    distances[dependent] = new_distance
                    predecessors[dependent] = task_id

        if not distances:
            return []

        # Find the task with the longest path
        end_task = max(distances, key=lambda t: distances[t])

        # Trace back the critical path
        path: List[str] = []
        current: Optional[str] = end_task
        while current is not None:
            path.append(current)
            current = predecessors.get(current)

        path.reverse()
        return path

    def export_graph(self) -> Dict[str, Any]:
        """Export the dependency graph as a serializable dictionary.

        Returns:
            Dictionary representation of the dependency graph
        """
        nodes = []
        edges = []

        for task_id in self.get_all_tasks():
            nodes.append({
                "id": task_id,
                "status": self._task_status.get(task_id, "unknown"),
            })

        for task_id, deps in self._dependencies.items():
            for dep in deps:
                edges.append({
                    "from": dep["depends_on"],
                    "to": task_id,
                    "type": dep["type"],
                    "optional": dep["optional"],
                })

        return {
            "nodes": nodes,
            "edges": edges,
            "task_count": len(nodes),
            "dependency_count": len(edges),
        }

    def clear(self) -> None:
        """Clear all dependency data."""
        self._dependencies.clear()
        self._dependents.clear()
        self._task_status.clear()
        self._metadata.clear()

    # --- Private helper methods ---

    def _would_create_cycle(
        self,
        task_id: str,
        depends_on: str,
    ) -> bool:
        """Check if adding a dependency would create a cycle.

        Uses BFS to check if there is already a path from depends_on
        to task_id in the current graph, which would mean adding
        task_id -> depends_on creates a cycle.

        Args:
            task_id: The task that would gain the dependency
            depends_on: The task it would depend on

        Returns:
            True if adding this dependency would create a cycle
        """
        # If depends_on can reach task_id through existing dependencies,
        # then adding task_id -> depends_on would create a cycle
        visited: Set[str] = set()
        queue = deque([depends_on])

        while queue:
            current = queue.popleft()
            if current == task_id:
                return True
            if current in visited:
                continue
            visited.add(current)

            # Follow the dependency edges forward from depends_on
            for dependent in self._dependents.get(current, []):
                if dependent not in visited:
                    queue.append(dependent)

        return False

    def _detect_cycles_dfs(
        self,
        task_id: str,
        visited: Set[str],
        rec_stack: Set[str],
        path: List[str],
        cycles: List[List[str]],
    ) -> None:
        """DFS-based cycle detection.

        Args:
            task_id: Current task being visited
            visited: Set of all visited tasks
            rec_stack: Set of tasks in the current recursion stack
            path: Current path being explored
            cycles: Accumulator for detected cycles
        """
        visited.add(task_id)
        rec_stack.add(task_id)
        path.append(task_id)

        for dep in self._dependencies.get(task_id, []):
            next_task = dep["depends_on"]

            if next_task not in visited:
                self._detect_cycles_dfs(
                    next_task, visited, rec_stack, path, cycles
                )
            elif next_task in rec_stack:
                # Found a cycle: extract the cycle from the path
                cycle_start = path.index(next_task)
                cycle = path[cycle_start:] + [next_task]
                cycles.append(cycle)

        path.pop()
        rec_stack.discard(task_id)

    def _trace_chains(
        self,
        task_id: str,
        current_chain: List[str],
        chains: List[List[str]],
        visited: Set[str],
        max_depth: int,
    ) -> None:
        """Recursively trace dependency chains from a task to its roots.

        Args:
            task_id: Current task being traced
            current_chain: The chain being built
            chains: Accumulator for completed chains
            visited: Set of visited tasks (cycle protection)
            max_depth: Maximum traversal depth
        """
        if len(current_chain) > max_depth:
            chains.append(list(reversed(current_chain)))
            return

        deps = self._dependencies.get(task_id, [])

        if not deps:
            # Reached a root task -- save the chain
            chains.append(list(reversed(current_chain)))
            return

        for dep in deps:
            dep_task = dep["depends_on"]
            if dep_task not in visited:
                visited.add(dep_task)
                current_chain.append(dep_task)
                self._trace_chains(
                    dep_task, current_chain, chains, visited, max_depth
                )
                current_chain.pop()
                visited.discard(dep_task)

    def _is_dependency_satisfied(
        self,
        dependency: Dict[str, Any],
        dep_task_status: str,
    ) -> bool:
        """Check if a single dependency is satisfied based on type and status.

        Args:
            dependency: The dependency record
            dep_task_status: Current status of the dependency task

        Returns:
            True if the dependency is satisfied
        """
        dep_type = dependency["type"]

        if dep_type == DependencyType.FINISH_TO_START.value:
            return dep_task_status == "completed"
        elif dep_type == DependencyType.START_TO_START.value:
            return dep_task_status in ("running", "completed")
        elif dep_type == DependencyType.FINISH_TO_FINISH.value:
            return dep_task_status == "completed"
        elif dep_type == DependencyType.START_TO_FINISH.value:
            return dep_task_status in ("running", "completed")

        return False
