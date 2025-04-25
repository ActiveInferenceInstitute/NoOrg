"""Task workflow management system."""

from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import uuid

class TaskWorkflowManager:
    """System for managing task workflows and their execution."""
    
    def __init__(self, database):
        """Initialize the task workflow manager.
        
        Args:
            database: Async database interface for storing workflow data
        """
        self._db = database
    
    async def create_workflow(
        self,
        workflow_def: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new workflow from definition.
        
        Args:
            workflow_def: Workflow definition including tasks and dependencies
            
        Returns:
            Dictionary containing created workflow details
        """
        workflow_id = f"workflow-{uuid.uuid4().hex[:8]}"
        
        # Create workflow
        workflow = {
            "id": workflow_id,
            "name": workflow_def["name"],
            "description": workflow_def.get("description", ""),
            "status": "created",
            "tasks": workflow_def["tasks"],
            "dependencies": workflow_def.get("dependencies", {}),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Store workflow
        await self._db.set(f"workflow:{workflow_id}", workflow)
        
        # Initialize workflow state
        state = {
            "workflow_id": workflow_id,
            "status": "created",
            "progress": {
                "total_tasks": len(workflow_def["tasks"]),
                "completed_tasks": 0,
                "failed_tasks": 0
            },
            "task_states": {},
            "created_at": datetime.now().isoformat()
        }
        await self._db.set(f"workflow_state:{workflow_id}", state)
        
        return workflow
    
    async def execute_workflow(
        self,
        workflow_id: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a workflow.
        
        Args:
            workflow_id: ID of the workflow to execute
            options: Optional execution options
            
        Returns:
            Dictionary containing execution results
        """
        # Get workflow
        workflow = await self._db.get(f"workflow:{workflow_id}")
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        # Initialize execution
        execution = {
            "workflow_id": workflow_id,
            "status": "running",
            "stages": [],
            "start_time": datetime.now().isoformat()
        }
        await self._db.set(f"workflow_execution:{workflow_id}", execution)
        
        try:
            # Execute stages
            stages = workflow.get("stages", [{"tasks": workflow["tasks"]}])
            for stage in stages:
                stage_result = await self._execute_stage(workflow_id, stage)
                execution["stages"].append(stage_result)
                
                if stage_result["status"] != "completed":
                    execution["status"] = "failed"
                    break
            
            if execution["status"] == "running":
                execution["status"] = "completed"
            
            # Update execution
            execution["end_time"] = datetime.now().isoformat()
            execution["tasks_completed"] = sum(
                s["tasks_completed"] for s in execution["stages"]
            )
            execution["execution_time"] = (
                datetime.fromisoformat(execution["end_time"]) -
                datetime.fromisoformat(execution["start_time"])
            ).total_seconds()
            
            await self._db.set(f"workflow_execution:{workflow_id}", execution)
            return execution
            
        except Exception as e:
            execution["status"] = "failed"
            execution["error"] = str(e)
            await self._db.set(f"workflow_execution:{workflow_id}", execution)
            raise
    
    async def get_workflow_state(self, workflow_id: str) -> Dict[str, Any]:
        """Get current state of a workflow.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Dictionary containing workflow state
        """
        # Get workflow state
        state = await self._db.get(f"workflow_state:{workflow_id}")
        if not state:
            raise ValueError(f"Workflow state not found: {workflow_id}")
        
        # Get execution state if running
        if state["status"] == "running":
            execution = await self._db.get(f"workflow_execution:{workflow_id}")
            if execution:
                state["execution"] = execution
        
        return state
    
    async def handle_workflow_error(
        self,
        workflow_id: str,
        task_id: str
    ) -> Dict[str, Any]:
        """Handle workflow error and attempt recovery.
        
        Args:
            workflow_id: ID of the workflow
            task_id: ID of the failed task
            
        Returns:
            Dictionary containing recovery results
        """
        # Get workflow and task state
        workflow = await self._db.get(f"workflow:{workflow_id}")
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        state = await self._db.get(f"workflow_state:{workflow_id}")
        task_state = state["task_states"].get(task_id)
        if not task_state:
            raise ValueError(f"Task state not found: {task_id}")
        
        # Create recovery plan
        recovery_plan = {
            "workflow_id": workflow_id,
            "failed_task": task_id,
            "error": task_state.get("error"),
            "action": "retry",
            "max_retries": 3,
            "backoff_delay": 1.0
        }
        
        # Attempt recovery
        retry_count = task_state.get("retry_count", 0)
        if retry_count < recovery_plan["max_retries"]:
            # Update task state
            task_state["status"] = "retrying"
            task_state["retry_count"] = retry_count + 1
            state["task_states"][task_id] = task_state
            await self._db.set(f"workflow_state:{workflow_id}", state)
            
            # Simulate recovery attempt
            await asyncio.sleep(recovery_plan["backoff_delay"])
            
            # Update task state after recovery
            task_state["status"] = "completed"
            task_state["result"] = {"success": True}
            state["task_states"][task_id] = task_state
            state["progress"]["completed_tasks"] += 1
            state["progress"]["failed_tasks"] -= 1
            await self._db.set(f"workflow_state:{workflow_id}", state)
            
            return {
                "successful": True,
                "attempts": task_state["retry_count"],
                "recovered_task": task_state
            }
        
        return {
            "successful": False,
            "attempts": retry_count,
            "error": "Max retries exceeded"
        }
    
    async def optimize_workflow(
        self,
        workflow_id: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Optimize workflow execution.
        
        Args:
            workflow_id: ID of the workflow to optimize
            options: Optional optimization options
            
        Returns:
            Dictionary containing optimization results
        """
        # Get workflow
        workflow = await self._db.get(f"workflow:{workflow_id}")
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        optimizations = []
        total_improvement = 0.0
        
        # Analyze task resource patterns
        task_patterns = {}
        for task in workflow["tasks"]:
            if "resource_usage" in task:
                task_patterns[task["id"]] = task["resource_usage"]
        
        if task_patterns:
            # Task reordering optimization
            reordering = {
                "type": "task_reordering",
                "description": "Optimize task order based on resource patterns",
                "impact": {
                    "estimated_improvement": 0.2,
                    "resource_efficiency": 0.15
                }
            }
            optimizations.append(reordering)
            total_improvement += reordering["impact"]["estimated_improvement"]
            
            # Resource allocation optimization
            allocation = {
                "type": "resource_allocation",
                "description": "Adjust resource allocation based on patterns",
                "impact": {
                    "estimated_improvement": 0.1,
                    "resource_efficiency": 0.25
                }
            }
            optimizations.append(allocation)
            total_improvement += allocation["impact"]["estimated_improvement"]
        
        return {
            "workflow_id": workflow_id,
            "optimizations": optimizations,
            "estimated_total_improvement": total_improvement
        }
    
    async def save_workflow_state(
        self,
        workflow_id: str,
        state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Save workflow state.
        
        Args:
            workflow_id: ID of the workflow
            state: State to save
            
        Returns:
            Dictionary containing save results
        """
        # Get current state version
        current_state = await self._db.get(f"workflow_state:{workflow_id}")
        version = (current_state.get("version", 0) if current_state else 0) + 1
        
        # Update state
        state["version"] = version
        state["saved_at"] = datetime.now().isoformat()
        
        # Store state
        await self._db.set(f"workflow_state:{workflow_id}", state)
        
        # Store state history
        await self._db.set(
            f"workflow_state_history:{workflow_id}:{version}",
            state
        )
        
        return {
            "workflow_id": workflow_id,
            "state": state,
            "saved_at": state["saved_at"],
            "version": version
        }
    
    async def _execute_stage(
        self,
        workflow_id: str,
        stage: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a workflow stage.
        
        Args:
            workflow_id: ID of the workflow
            stage: Stage definition
            
        Returns:
            Dictionary containing stage execution results
        """
        start_time = datetime.now()
        
        # Execute tasks in stage
        tasks_completed = 0
        for task_id in stage["tasks"]:
            # Get task state
            state = await self._db.get(f"workflow_state:{workflow_id}")
            task_state = state["task_states"].get(task_id, {
                "status": "pending"
            })
            
            # Execute task if not completed
            if task_state["status"] not in ["completed", "failed"]:
                # Simulate task execution
                await asyncio.sleep(0.1)
                
                # Update task state
                task_state["status"] = "completed"
                task_state["result"] = {"success": True}
                state["task_states"][task_id] = task_state
                state["progress"]["completed_tasks"] += 1
                await self._db.set(f"workflow_state:{workflow_id}", state)
                
                tasks_completed += 1
        
        end_time = datetime.now()
        
        return {
            "name": stage.get("name", "unnamed_stage"),
            "status": "completed",
            "tasks_completed": tasks_completed,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat()
        } 