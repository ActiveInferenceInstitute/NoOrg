# Agent Task Management

## Overview

This directory contains Python modules for task management within the NoOrg agent framework, including task scheduling, prioritization, execution, monitoring, and workflow management.

## Modules

| Module | Description |
|--------|-------------|
| `execution.py` | Task execution logic and handlers |
| `monitoring.py` | Task monitoring and status tracking |
| `prioritization.py` | Task priority calculation and ordering |
| `scheduling.py` | Task scheduling and queue management |
| `workflow.py` | Workflow definition and execution |
| `dependencies.py` | Task dependency management |

## Architecture

```text
Task Lifecycle:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Scheduling  │ ──► │ Prioritizing │ ──► │  Execution  │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────┐           │
                    │  Monitoring  │ ◄─────────┘
                    └──────────────┘
```text

## Usage

```python
from agents.task import scheduling, execution, monitoring

# Schedule a task
task = scheduling.create_task(name="analysis", priority="high")

# Execute with monitoring
result = execution.run_task(task)
status = monitoring.get_status(task.id)
```text

## Related Documentation

- [Agent Framework](../README.md)
- [Task Execution Examples](../examples/)
- [Workflow Documentation](../system/agent_workflow_framework.md)
