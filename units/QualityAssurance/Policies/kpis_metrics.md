# Quality Assurance KPIs and Metrics

## Overview

Quality performance indicators measuring product/service quality, process compliance, and continuous improvement.

## Quality KPIs

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| First Pass Yield | 99%+ | Daily | QA Manager |
| Defect Density | <0.5 per KLOC | Per release | QA Lead |
| Customer Escape Rate | <1 per 1000 units | Monthly | Quality Dir |
| COPQ (Cost of Poor Quality) | <2% of revenue | Quarterly | Finance/QA |
| Supplier Quality Rating | 98%+ | Monthly | SQE |
| Audit Finding Closure | 100% on time | Per audit | QA Manager |
| Process Capability (Cpk) | >1.33 | Per process | Process Eng |

## Testing Metrics

### Test Coverage

- Requirements coverage: 100%
- Code coverage: 80%+
- Risk-based test coverage
- Regression test coverage

### Defect Metrics

| Priority | Discovery → Fix Time | Target |
|----------|---------------------|--------|
| Critical | Same day | 100% |
| High | 3 days | 95% |
| Medium | 7 days | 90% |
| Low | 14 days | 85% |

### Test Execution

- Test cases executed per cycle
- Pass/fail ratio
- Blocked tests: <5%
- Test automation rate: 70%+

## Process Quality

### SPC (Statistical Process Control)

- Control chart stability
- Process capability indices
- Out-of-control signals
- Corrective action effectiveness

### Audit Performance

- Internal audits completed vs. plan
- External certifications maintained
- Nonconformity trends
- CAPA closure rate

## Supplier Quality

| Metric | Target | Action |
|--------|--------|--------|
| Incoming inspection pass rate | 99%+ | Escalate if <95% |
| Supplier PPM | <100 | Supplier development |
| On-time delivery | 98%+ | Scorecard review |
| Corrective action response | 5 days | Escalation |

## Quality Costs

| Category | Elements | Target |
|----------|----------|--------|
| Prevention | Training, planning, design review | Invest to reduce failure |
| Appraisal | Inspection, testing, audits | Optimize ROI |
| Internal Failure | Rework, scrap, downtime | Minimize |
| External Failure | Returns, warranty, recalls | Eliminate |

## Dashboards

| Dashboard | Purpose | Audience |
|-----------|---------|----------|
| Quality Dashboard | Overall quality health | QA Leadership |
| Defect Dashboard | Trends, aging, root cause | QA/Dev Teams |
| Supplier Dashboard | Vendor quality performance | SQE/Procurement |
| Compliance Dashboard | Audit status, certifications | Quality/Compliance |

## Related Documentation

- [QA Processes](../Processes/qualityassurance_processes.md)
- [Operations](../../Operations/README.md)
- [Compliance](../../Compliance/README.md)
