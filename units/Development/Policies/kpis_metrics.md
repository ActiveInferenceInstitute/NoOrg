# Development (Software Engineering) KPIs and Metrics

## Overview

Software development performance indicators measuring code quality, delivery velocity, and engineering excellence.

## Development KPIs

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Sprint Velocity | Stable/growing | Per sprint | Scrum Master |
| Deployment Frequency | Daily capable | Weekly | DevOps |
| Lead Time for Changes | <1 day | Weekly | Engineering Mgr |
| Change Failure Rate | <5% | Weekly | Quality Lead |
| MTTR (Mean Time to Recovery) | <1 hour | Per incident | On-call Lead |
| Code Coverage | 80%+ | Per PR | Dev Lead |
| Technical Debt Ratio | <20% of backlog | Monthly | Engineering Mgr |

## DORA Metrics (DevOps Research Assessment)

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| Deployment Frequency | On-demand | Daily-weekly | Weekly-monthly | Monthly+ |
| Lead Time | <1 day | 1 day-1 week | 1 week-1 month | 1-6 months |
| Change Failure Rate | 0-15% | 16-30% | 16-30% | >30% |
| MTTR | <1 hour | <1 day | 1 day-1 week | 1 week+ |

## Code Quality Metrics

### Quality Gates

| Metric | Threshold | Blocking |
|--------|-----------|----------|
| Code coverage | ≥80% | Yes |
| Critical bugs | 0 | Yes |
| Major bugs | <5 | Yes |
| Code smells | <50 | No |
| Security hotspots | 0 unreviewed | Yes |

### Review Metrics

- PR review turnaround: <24 hours
- Review comments per PR
- First-time approval rate
- Rework cycles: <2

## Delivery Metrics

### Sprint Health

- Sprint commitment accuracy: 85%+
- Sprint burndown consistency
- Story point completion
- Unplanned work: <20%

### Release Quality

- Production defects per release
- Hotfix frequency
- Rollback rate: <5%
- Customer-reported bugs

## Platform Health

### Reliability

- Service uptime: 99.9%+
- Error rate: <0.1%
- Latency (P99): Within SLA
- Incident count trending

### Performance

- Build time: <10 minutes
- Test suite time: <30 minutes
- Deployment time: <15 minutes
- Pipeline success rate: 95%+

## Related Documentation

- [Development Processes](../Processes/development_processes.md)
- [QA](../../QualityAssurance/README.md)
- [IT](../../InformationTechnology/README.md)
