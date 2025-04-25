"""Test utilities and helper functions."""

import os
import json
import yaml
import uuid
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timezone
from pathlib import Path

import jsonschema
from faker import Faker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s (%(filename)s:%(lineno)s)'
)
logger = logging.getLogger(__name__)

# Initialize Faker
fake = Faker()

# Constants
TEST_ROOT = Path(__file__).parent
DATA_DIR = TEST_ROOT / "data"
SCHEMA_FILE = DATA_DIR / "schemas.json"

def load_json(file_path: Union[str, Path]) -> Dict:
    """Load JSON data from file.
    
    Args:
        file_path: Path to JSON file
        
    Returns:
        Dictionary containing loaded data
    """
    with open(file_path) as f:
        return json.load(f)

def load_yaml(file_path: Union[str, Path]) -> Dict:
    """Load YAML data from file.
    
    Args:
        file_path: Path to YAML file
        
    Returns:
        Dictionary containing loaded data
    """
    with open(file_path) as f:
        return yaml.safe_load(f)

def save_json(data: Dict, file_path: Union[str, Path]) -> None:
    """Save data to JSON file.
    
    Args:
        data: Data to save
        file_path: Path to save JSON file
    """
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def save_yaml(data: Dict, file_path: Union[str, Path]) -> None:
    """Save data to YAML file.
    
    Args:
        data: Data to save
        file_path: Path to save YAML file
    """
    with open(file_path, 'w') as f:
        yaml.dump(data, f, indent=4)

def load_schema(schema_type: str) -> Dict:
    """Load JSON schema for validation.
    
    Args:
        schema_type: Type of schema to load
        
    Returns:
        Dictionary containing schema definition
    """
    schemas = load_json(SCHEMA_FILE)
    if schema_type not in schemas:
        raise ValueError(f"Unknown schema type: {schema_type}")
    return schemas[schema_type]

def validate_data(data: Dict, schema_type: str) -> None:
    """Validate data against schema.
    
    Args:
        data: Data to validate
        schema_type: Type of schema to validate against
        
    Raises:
        jsonschema.exceptions.ValidationError: If validation fails
    """
    schema = load_schema(schema_type)
    jsonschema.validate(instance=data, schema=schema)

def generate_id(prefix: str, length: int = 8) -> str:
    """Generate a unique ID with prefix.
    
    Args:
        prefix: Prefix for the ID
        length: Length of random part
        
    Returns:
        Generated ID string
    """
    return f"{prefix}-{uuid.uuid4().hex[:length]}"

def generate_task(task_type: Optional[str] = None) -> Dict:
    """Generate a sample task.
    
    Args:
        task_type: Optional task type
        
    Returns:
        Dictionary containing task data
    """
    task_types = ["computation", "io", "gpu"]
    task = {
        "id": generate_id("task"),
        "type": task_type or fake.random_element(task_types),
        "priority": fake.random_int(min=1, max=3),
        "requirements": {
            "cpu": fake.random_int(min=1, max=8),
            "memory": f"{fake.random_int(min=1, max=32)}Gi",
            "timeout": fake.random_int(min=60, max=3600)
        },
        "metadata": {
            "category": fake.word(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "owner": fake.user_name()
        }
    }
    
    # Add type-specific requirements
    if task["type"] == "io":
        task["requirements"]["storage"] = f"{fake.random_int(min=1, max=100)}Gi"
    elif task["type"] == "gpu":
        task["requirements"]["gpu"] = fake.random_int(min=1, max=4)
    
    return task

def generate_workflow(tasks: Optional[List[Dict]] = None) -> Dict:
    """Generate a sample workflow.
    
    Args:
        tasks: Optional list of tasks to include
        
    Returns:
        Dictionary containing workflow data
    """
    if not tasks:
        tasks = [generate_task() for _ in range(3)]
    
    workflow = {
        "id": generate_id("workflow"),
        "name": fake.word(),
        "tasks": [task["id"] for task in tasks],
        "dependencies": {},
        "metadata": {
            "category": fake.word(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "owner": fake.user_name()
        }
    }
    
    # Generate some dependencies
    for i in range(1, len(tasks)):
        if fake.boolean(chance_of_getting_true=75):
            workflow["dependencies"][tasks[i]["id"]] = [tasks[i-1]["id"]]
    
    return workflow

def generate_resource_pool(pool_type: Optional[str] = None) -> Dict:
    """Generate a sample resource pool.
    
    Args:
        pool_type: Optional pool type
        
    Returns:
        Dictionary containing resource pool data
    """
    pool_types = ["compute", "storage", "gpu"]
    pool = {
        "id": generate_id("pool"),
        "name": f"{pool_type or fake.random_element(pool_types)}-pool",
        "type": pool_type or fake.random_element(pool_types),
        "resources": {},
        "metadata": {
            "zone": fake.random_element(["us-west", "us-east", "eu-west"]),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    }
    
    # Add type-specific resources
    if pool["type"] == "compute":
        total_cpu = fake.random_int(min=8, max=64)
        allocated_cpu = fake.random_int(min=0, max=total_cpu)
        total_memory = fake.random_int(min=16, max=256)
        allocated_memory = fake.random_int(min=0, max=total_memory)
        
        pool["resources"]["cpu"] = {
            "total": total_cpu,
            "allocated": allocated_cpu,
            "available": total_cpu - allocated_cpu
        }
        pool["resources"]["memory"] = {
            "total": f"{total_memory}Gi",
            "allocated": f"{allocated_memory}Gi",
            "available": f"{total_memory - allocated_memory}Gi"
        }
    
    elif pool["type"] == "storage":
        total_storage = fake.random_int(min=1, max=10)
        allocated_storage = fake.random_int(min=0, max=total_storage)
        
        pool["resources"]["ssd"] = {
            "total": f"{total_storage}Ti",
            "allocated": f"{allocated_storage}Ti",
            "available": f"{total_storage - allocated_storage}Ti"
        }
    
    elif pool["type"] == "gpu":
        total_gpu = fake.random_int(min=1, max=8)
        allocated_gpu = fake.random_int(min=0, max=total_gpu)
        total_memory = fake.random_int(min=32, max=256)
        allocated_memory = fake.random_int(min=0, max=total_memory)
        
        pool["resources"]["gpu"] = {
            "total": total_gpu,
            "allocated": allocated_gpu,
            "available": total_gpu - allocated_gpu,
            "type": fake.random_element(["nvidia-a100", "nvidia-v100"])
        }
        pool["resources"]["memory"] = {
            "total": f"{total_memory}Gi",
            "allocated": f"{allocated_memory}Gi",
            "available": f"{total_memory - allocated_memory}Gi"
        }
    
    return pool

def generate_allocation(
    pool: Dict,
    task: Dict,
    status: Optional[str] = None
) -> Dict:
    """Generate a sample resource allocation.
    
    Args:
        pool: Resource pool
        task: Task to allocate resources for
        status: Optional allocation status
        
    Returns:
        Dictionary containing allocation data
    """
    allocation = {
        "id": generate_id("alloc"),
        "pool_id": pool["id"],
        "task_id": task["id"],
        "resources": {},
        "status": status or fake.random_element(["pending", "active", "released"]),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Copy required resources from task
    for resource, value in task["requirements"].items():
        if resource in ["cpu", "memory", "storage", "gpu"]:
            allocation["resources"][resource] = value
    
    return allocation

def generate_metrics(
    task: Optional[Dict] = None,
    pool: Optional[Dict] = None
) -> Dict:
    """Generate sample metrics.
    
    Args:
        task: Optional task to generate metrics for
        pool: Optional resource pool to generate metrics for
        
    Returns:
        Dictionary containing metrics data
    """
    metrics = {
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    if task:
        metrics["task_id"] = task["id"]
        metrics["metrics"] = {
            "execution_time": fake.random_float(min=0, max=1000),
            "cpu_usage": fake.random_float(min=0, max=1),
            "memory_usage": fake.random_float(min=0, max=1),
            "error_rate": fake.random_float(min=0, max=0.1)
        }
        
        # Add type-specific metrics
        if task["type"] == "io":
            metrics["metrics"]["io_throughput"] = fake.random_int(min=1000000, max=1000000000)
            metrics["metrics"]["latency"] = fake.random_float(min=1, max=100)
        elif task["type"] == "gpu":
            metrics["metrics"]["gpu_usage"] = fake.random_float(min=0, max=1)
            metrics["metrics"]["training_loss"] = fake.random_float(min=0, max=1)
            metrics["metrics"]["validation_accuracy"] = fake.random_float(min=0, max=1)
    
    if pool:
        metrics["pool_id"] = pool["id"]
        metrics["metrics"] = {
            "task_queue_length": fake.random_int(min=0, max=10),
            "active_tasks": fake.random_int(min=0, max=5)
        }
        
        # Add type-specific metrics
        if pool["type"] == "compute":
            metrics["metrics"].update({
                "cpu_utilization": fake.random_float(min=0, max=1),
                "memory_utilization": fake.random_float(min=0, max=1)
            })
        elif pool["type"] == "storage":
            metrics["metrics"].update({
                "storage_utilization": fake.random_float(min=0, max=1),
                "io_throughput": fake.random_int(min=1000000, max=1000000000)
            })
        elif pool["type"] == "gpu":
            metrics["metrics"].update({
                "gpu_utilization": fake.random_float(min=0, max=1),
                "gpu_memory_usage": fake.random_float(min=0, max=1)
            })
    
    return metrics

async def async_sleep(min_seconds: float = 0.1, max_seconds: float = 1.0) -> None:
    """Sleep for a random duration.
    
    Args:
        min_seconds: Minimum sleep duration
        max_seconds: Maximum sleep duration
    """
    duration = fake.random_float(min=min_seconds, max=max_seconds)
    await asyncio.sleep(duration)

def compare_dicts(
    dict1: Dict,
    dict2: Dict,
    ignore_keys: Optional[List[str]] = None
) -> bool:
    """Compare two dictionaries, optionally ignoring certain keys.
    
    Args:
        dict1: First dictionary
        dict2: Second dictionary
        ignore_keys: Optional list of keys to ignore
        
    Returns:
        True if dictionaries are equal (ignoring specified keys)
    """
    if ignore_keys is None:
        ignore_keys = []
    
    # Create copies without ignored keys
    d1 = {k: v for k, v in dict1.items() if k not in ignore_keys}
    d2 = {k: v for k, v in dict2.items() if k not in ignore_keys}
    
    return d1 == d2

def compare_metrics(
    actual: Dict,
    expected: Dict,
    tolerance: float = 0.01
) -> bool:
    """Compare metric values within tolerance.
    
    Args:
        actual: Actual metrics
        expected: Expected metrics
        tolerance: Tolerance for floating point comparison
        
    Returns:
        True if metrics are equal within tolerance
    """
    if set(actual.keys()) != set(expected.keys()):
        return False
    
    for key, value in expected.items():
        if isinstance(value, (int, float)):
            if abs(actual[key] - value) > tolerance:
                return False
        else:
            if actual[key] != value:
                return False
    
    return True 