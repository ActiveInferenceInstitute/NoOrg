# Analytics Methodology Standards

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Data Analytics

## Purpose

Establishes standards for analytical methodologies to ensure consistency, reproducibility, and quality of analytical outputs.

## Scope

Applies to all analytical work including reporting, statistical analysis, machine learning, and data science projects.

## Methodology Categories

### Descriptive Analytics
| Method | Use Case | Output |
|--------|----------|--------|
| Aggregation | Summarizing data | Dashboards, reports |
| Visualization | Pattern recognition | Charts, graphs |
| Segmentation | Group analysis | Cohort reports |

### Diagnostic Analytics
| Method | Use Case | Output |
|--------|----------|--------|
| Root Cause Analysis | Issue investigation | Findings report |
| Correlation Analysis | Relationship discovery | Statistical summary |
| Variance Analysis | Performance deviation | Exception reports |

### Predictive Analytics
| Method | Use Case | Output |
|--------|----------|--------|
| Regression | Forecasting | Predictions |
| Classification | Categorization | Scores, labels |
| Time Series | Trend analysis | Forecasts |

### Prescriptive Analytics
| Method | Use Case | Output |
|--------|----------|--------|
| Optimization | Resource allocation | Recommendations |
| Simulation | Scenario modeling | What-if analysis |
| Decision Trees | Decision support | Action recommendations |

## Documentation Requirements

All analytical projects must include:
1. **Problem Statement** - Clear definition of business question
2. **Data Sources** - Documented inputs and quality assessment
3. **Methodology** - Approach and techniques used
4. **Assumptions** - Key assumptions and limitations
5. **Results** - Findings with confidence levels
6. **Recommendations** - Actionable insights

## Model Governance

| Stage | Requirement |
|-------|-------------|
| Development | Version control, testing documentation |
| Validation | Independent review, accuracy metrics |
| Deployment | Approval, monitoring setup |
| Monitoring | Performance tracking, drift detection |
| Retirement | Sunset plan, archive |

## Related Documents

- [Data Quality Policy](./Data_Quality_Policy.md)
- [Model Development Process](../Processes/Model_Development_Process.md)
