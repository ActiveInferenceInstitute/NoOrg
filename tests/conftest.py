"""
Global pytest configuration and fixtures.
"""
import os
import sys
import json
import uuid
import pytest
import asyncio
import logging
import tempfile
from typing import Dict, List, Any, AsyncGenerator, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s (%(filename)s:%(lineno)s)'
)
logger = logging.getLogger(__name__)

# Test paths
TEST_ROOT = Path(__file__).parent
FIXTURE_DIR = TEST_ROOT / "fixtures"
DATA_DIR = TEST_ROOT / "data"

# Ensure directories exist
FIXTURE_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# Event loop configuration
@pytest.fixture(scope="session")
def event_loop_policy():
    """Configure the event loop policy for the test session."""
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    return asyncio.get_event_loop_policy()

@pytest.fixture
async def event_loop(event_loop_policy: asyncio.AbstractEventLoopPolicy) -> AsyncGenerator[asyncio.AbstractEventLoop, None]:
    """Create and yield an event loop for each test."""
    loop = event_loop_policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    if loop.is_running():
        loop.stop()
    if not loop.is_closed():
        await loop.shutdown_asyncgens()
        loop.close()

# Configuration fixtures
@pytest.fixture(scope="session")
def test_config():
    """Load test configuration."""
    return {
        "test_env": os.getenv("TEST_ENV", "test"),
        "log_level": os.getenv("TEST_LOG_LEVEL", "INFO"),
        "timeout": int(os.getenv("TEST_TIMEOUT", "300")),
        "database": {
            "type": "memory",
            "connection": None
        },
        "messaging": {
            "type": "memory",
            "connection": None
        }
    }

# Database fixtures
@pytest.fixture
async def mock_db():
    """Create a mock database for testing."""
    class AsyncDictKeys:
        def __init__(self, keys):
            self._keys = list(keys)
            self._index = 0

        def __aiter__(self):
            return self

        async def __anext__(self):
            if self._index >= len(self._keys):
                raise StopAsyncIteration
            key = self._keys[self._index]
            self._index += 1
            return key

    class AsyncDict:
        def __init__(self):
            self._data = {}
            self._default_task_status = "pending"
            self._default_metrics = {
                "duration": 0.1,
                "resources_used": [],
                "error_rate": 0.0
            }

        async def get(self, key: str) -> Any:
            if key.startswith("task:") and key not in self._data:
                return {"status": self._default_task_status}
            if key.startswith("metrics:") and key not in self._data:
                return self._default_metrics
            return self._data.get(key)

        async def set(self, key: str, value: Any) -> None:
            self._data[key] = value

        async def delete(self, key: str) -> None:
            self._data.pop(key, None)

        def __aiter__(self):
            return AsyncDictKeys(list(self._data.keys()))

    return AsyncDict()

# Task fixtures
@pytest.fixture
def task_id():
    """Generate a unique task ID."""
    return f"task-{uuid.uuid4().hex[:8]}"

@pytest.fixture
def sample_task(task_id):
    """Create a sample task for testing."""
    return {
        "id": task_id,
        "type": "test",
        "priority": 1,
        "requirements": {
            "cpu": 1,
            "memory": "1Gi",
            "timeout": 300
        },
        "metadata": {
            "test": True,
            "category": "unit-test",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    }

@pytest.fixture
def task_batch():
    """Create a batch of sample tasks."""
    return [
        {
            "id": f"test-task-{i:03d}",
            "type": "test",
            "priority": i % 3 + 1,
            "requirements": {
                "cpu": 1,
                "memory": "1Gi",
                "timeout": 300
            },
            "metadata": {
                "test": True,
                "batch": i // 3,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        }
        for i in range(10)
    ]

# Resource fixtures
@pytest.fixture
def resource_pool():
    """Create a sample resource pool."""
    return {
        "compute": {
            "total_cpu": 16,
            "total_memory": "32Gi",
            "available_cpu": 16,
            "available_memory": "32Gi"
        },
        "storage": {
            "total": "1Ti",
            "available": "1Ti"
        },
        "network": {
            "bandwidth": "10Gi"
        }
    }

# Monitoring fixtures
@pytest.fixture
def metrics_sample():
    """Create sample metrics data."""
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "task_metrics": {
            "execution_time": 150,
            "cpu_usage": 0.75,
            "memory_usage": 0.5,
            "error_rate": 0.01
        },
        "system_metrics": {
            "total_tasks": 100,
            "active_tasks": 10,
            "completed_tasks": 85,
            "failed_tasks": 5
        },
        "resource_metrics": {
            "cpu_utilization": 0.65,
            "memory_utilization": 0.45,
            "network_throughput": 125000000
        }
    }

# Storage fixtures
@pytest.fixture
async def temp_storage():
    """Create a temporary storage directory."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)

@pytest.fixture
async def mock_storage(temp_storage):
    """Create a mock storage interface."""
    class MockStorage:
        def __init__(self, root_dir: Path):
            self.root_dir = root_dir
            
        async def write(self, path: str, data: bytes) -> None:
            full_path = self.root_dir / path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_bytes(data)
            
        async def read(self, path: str) -> bytes:
            full_path = self.root_dir / path
            return full_path.read_bytes()
            
        async def delete(self, path: str) -> None:
            full_path = self.root_dir / path
            if full_path.exists():
                full_path.unlink()
                
        async def list(self, prefix: str = "") -> List[str]:
            base_path = self.root_dir / prefix
            if not base_path.exists():
                return []
            return [
                str(p.relative_to(self.root_dir))
                for p in base_path.rglob("*")
                if p.is_file()
            ]
    
    return MockStorage(temp_storage)

# Error injection fixtures
@pytest.fixture
async def error_generator():
    """Generate various types of errors for testing."""
    class ErrorGenerator:
        @staticmethod
        async def network_error(*args, **kwargs):
            raise ConnectionError("Simulated network error")
        
        @staticmethod
        async def timeout_error(*args, **kwargs):
            raise asyncio.TimeoutError("Simulated timeout")
        
        @staticmethod
        async def resource_error(*args, **kwargs):
            raise RuntimeError("Simulated resource exhaustion")
        
        @staticmethod
        async def validation_error(*args, **kwargs):
            raise ValueError("Simulated validation error")
            
        @staticmethod
        async def permission_error(*args, **kwargs):
            raise PermissionError("Simulated permission error")
            
        @staticmethod
        async def not_found_error(*args, **kwargs):
            raise FileNotFoundError("Simulated not found error")
    
    return ErrorGenerator()

# Performance fixtures
@pytest.fixture
def benchmark_config():
    """Configuration for performance benchmarks."""
    return {
        "iterations": 1000,
        "warmup": 100,
        "max_time": 60,
        "timeout": 300,
        "min_throughput": 10,
        "max_avg_duration": 1.0,
        "max_duration": 5.0,
        "timer": asyncio.get_event_loop().time
    }

# Utility functions
def load_fixture(name: str) -> Dict:
    """Load test fixture data from file."""
    path = FIXTURE_DIR / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Fixture not found: {name}")
    
    import yaml
    with open(path) as f:
        return yaml.safe_load(f)

def compare_metrics(actual: Dict, expected: Dict, tolerance: float = 0.01) -> bool:
    """Compare metric values within tolerance."""
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

def generate_test_data(schema: Dict) -> Dict:
    """Generate test data based on schema."""
    from faker import Faker
    fake = Faker()
    
    def _generate_value(field_type: str, **kwargs) -> Any:
        if field_type == "string":
            return fake.word()
        elif field_type == "integer":
            return fake.random_int(**kwargs)
        elif field_type == "float":
            return fake.pyfloat(**kwargs)
        elif field_type == "boolean":
            return fake.boolean()
        elif field_type == "datetime":
            return fake.date_time().isoformat()
        elif field_type == "uuid":
            return str(uuid.uuid4())
        else:
            return None
    
    result = {}
    for field, field_def in schema.items():
        result[field] = _generate_value(**field_def)
    
    return result

# Cleanup fixtures
@pytest.fixture(autouse=True)
async def cleanup_tasks():
    """Cleanup any resources after each test."""
    yield
    # Cleanup code here
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True) 