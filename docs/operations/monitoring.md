# Monitoring Guide

## Overview

This document covers the observability and monitoring infrastructure for the NoOrg multi-agent system.

## Key Components

- **MonitoringSystem**: Central metrics collection and aggregation.
- **Agent Status Tracking**: Real-time visibility into agent health and activity.
- **Event Logging**: Structured logging for all system events.
- **Alerting**: Threshold-based alerts for critical conditions.

## Metrics

| Metric | Description |
|--------|-------------|
| `agent.task.duration` | Time taken to complete a task |
| `agent.status.changes` | Count of status transitions |
| `system.event.count` | Total events processed |

## Related Documentation

- [Monitoring AGENTS.md](./AGENTS.md)
- [Operations Index](./index.md)
