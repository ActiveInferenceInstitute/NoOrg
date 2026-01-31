#!/usr/bin/env python3
"""
Add domain-specific content to units that would benefit from additional files.
Creates specialized policies, processes, and documentation for each unit.
"""

import os
from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

# Domain-specific content for each unit
UNIT_CONTENT = {
    "DataAnalytics": {
        "Policies": [
            ("Data_Quality_Policy.md", """# Data Quality Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Data Analytics

## Purpose

This policy establishes standards for data quality management across all analytical activities and data assets.

## Scope

Applies to all data used for analysis, reporting, and decision support throughout the organization.

## Data Quality Dimensions

| Dimension | Definition | Metric |
|-----------|------------|--------|
| Accuracy | Data correctly represents reality | Error rate < 0.1% |
| Completeness | All required data is present | Fill rate > 99% |
| Consistency | Data is uniform across sources | Match rate > 99.5% |
| Timeliness | Data is current and available | Latency < SLA |
| Validity | Data conforms to formats/rules | Validation pass > 99% |
| Uniqueness | No unwanted duplicates | Duplicate rate < 0.5% |

## Quality Requirements

### Critical Data Elements
- Customer identifiers: 100% accuracy required
- Financial data: Reconciled to source systems
- Regulatory data: Audit trail required

### Quality Monitoring
- Automated quality checks on ingestion
- Daily quality dashboards
- Monthly quality reports
- Quarterly quality reviews

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| Data Steward | Define quality rules, resolve issues |
| Data Engineers | Implement quality checks |
| Data Analysts | Report quality issues |
| Data Governance | Oversee quality program |

## Issue Management

| Severity | Response Time | Resolution |
|----------|---------------|------------|
| Critical | 1 hour | 4 hours |
| High | 4 hours | 24 hours |
| Medium | 24 hours | 5 days |
| Low | 5 days | 30 days |

## Related Documents

- [Data Governance Policy](../../Governance/Policies/Data_Governance_Policy.md)
- [Data Management Process](../Processes/Data_Management_Process.md)
"""),
            ("Analytics_Methodology_Standards.md", """# Analytics Methodology Standards

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
"""),
        ],
        "Processes": [
            ("Data_Pipeline_Management_Process.md", """# Data Pipeline Management Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Data Engineering Lead

## Purpose

Defines the process for designing, building, monitoring, and maintaining data pipelines.

## Process Overview

```
Design → Build → Test → Deploy → Monitor → Optimize
```

## Process Steps

### 1. Requirements Gathering
| Activity | Owner | Output |
|----------|-------|--------|
| Identify data sources | Data Engineer | Source inventory |
| Define transformations | Data Analyst | Logic specifications |
| Establish SLAs | Product Owner | Service requirements |

### 2. Pipeline Design
| Component | Consideration |
|-----------|---------------|
| Ingestion | Batch vs. streaming, frequency |
| Storage | Data lake, warehouse, format |
| Processing | ETL/ELT, compute resources |
| Serving | APIs, reports, dashboards |

### 3. Development
- Use version control for all code
- Follow coding standards
- Implement idempotent operations
- Include error handling

### 4. Testing
| Test Type | Purpose |
|-----------|---------|
| Unit | Individual component function |
| Integration | End-to-end data flow |
| Performance | SLA compliance |
| Data Quality | Validation rules |

### 5. Deployment
- Deploy to staging environment
- Run validation checks
- Obtain approval
- Deploy to production
- Verify operation

### 6. Monitoring
| Metric | Threshold | Alert |
|--------|-----------|-------|
| Latency | < SLA | Warning at 80% |
| Failures | 0 | Immediate |
| Data Volume | Within range | Deviation > 20% |
| Quality Scores | > 99% | Below threshold |

## Incident Response

| Severity | Response | Escalation |
|----------|----------|------------|
| P1 - Pipeline Down | 15 min | Immediate |
| P2 - Data Late | 1 hour | 4 hours |
| P3 - Quality Issue | 4 hours | 24 hours |

## Related Documents

- [Data Quality Policy](../Policies/Data_Quality_Policy.md)
- [Infrastructure Standards](../../InformationTechnology/Policies/)
"""),
            ("Model_Development_Process.md", """# Model Development Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Data Science Lead

## Purpose

Establishes the standard process for developing, validating, and deploying analytical models.

## Process Phases

### Phase 1: Problem Definition
| Activity | Deliverable |
|----------|-------------|
| Business problem statement | Problem charter |
| Success criteria definition | KPI targets |
| Feasibility assessment | Go/No-go decision |

### Phase 2: Data Preparation
| Activity | Deliverable |
|----------|-------------|
| Data collection | Raw dataset |
| Exploratory analysis | EDA report |
| Feature engineering | Feature set |
| Data validation | Quality assessment |

### Phase 3: Model Development
| Activity | Deliverable |
|----------|-------------|
| Algorithm selection | Approach documentation |
| Model training | Trained model artifacts |
| Hyperparameter tuning | Optimized parameters |
| Performance evaluation | Metrics report |

### Phase 4: Model Validation
| Validation Type | Owner | Criteria |
|-----------------|-------|----------|
| Technical | Data Science | Accuracy, stability |
| Business | Product Owner | Business value |
| Compliance | Legal/Risk | Regulatory alignment |

### Phase 5: Deployment
| Activity | Owner |
|----------|-------|
| Integration development | Engineering |
| A/B testing setup | Data Science |
| Monitoring configuration | Operations |
| Production release | DevOps |

### Phase 6: Monitoring
| Metric | Frequency | Action |
|--------|-----------|--------|
| Prediction accuracy | Daily | Retrain if degraded |
| Feature drift | Weekly | Investigate changes |
| Business impact | Monthly | ROI assessment |

## Model Registry Requirements

All production models must be registered with:
- Model ID and version
- Training data and date
- Performance metrics
- Owner and approvers
- Monitoring endpoints

## Related Documents

- [Analytics Methodology Standards](../Policies/Analytics_Methodology_Standards.md)
- [Data Pipeline Process](./Data_Pipeline_Management_Process.md)
"""),
        ],
    },
    "InvestorRelations": {
        "Policies": [
            ("Disclosure_Policy.md", """# Disclosure Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Investor Relations

## Purpose

Establishes guidelines for fair, timely, and consistent disclosure of material information to investors and the public.

## Scope

Applies to all communications with investors, analysts, media, and the public regarding company performance and prospects.

## Disclosure Principles

| Principle | Description |
|-----------|-------------|
| Fair | Broad and simultaneous disclosure |
| Accurate | Factual and complete information |
| Timely | Prompt disclosure of material events |
| Consistent | Aligned messaging across channels |
| Compliant | Adherence to regulatory requirements |

## Material Information

### Definition
Information is material if a reasonable investor would consider it important in making an investment decision.

### Examples of Material Information
- Financial results
- Significant transactions
- Executive changes
- Material contracts
- Legal proceedings
- Product launches/discontinuations

## Disclosure Channels

| Channel | Use Case | Approval |
|---------|----------|----------|
| SEC Filings | Regulatory requirements | Legal + CFO |
| Press Releases | Major announcements | CEO/CFO |
| Investor Presentations | Conferences, roadshows | IR + Legal |
| Earnings Calls | Quarterly results | Scripted Q&A |
| Website | Ongoing information | IR |

## Quiet Period

| Event | Period | Restrictions |
|-------|--------|--------------|
| Earnings | Last 2 weeks of quarter | No guidance |
| Offerings | Filing to completion | Limited discussion |
| M&A | Announcement to close | Material terms only |

## Spokesperson Authorization

| Level | Authorized Topics |
|-------|-------------------|
| CEO | Strategy, major announcements |
| CFO | Financial performance, guidance |
| IR Head | Investor inquiries, clarifications |
| Others | Only with IR approval |

## Related Documents

- [Communications Policy](../../Communications/Policies/)
- [Governance Policies](../../Governance/Policies/)
"""),
            ("Shareholder_Engagement_Policy.md", """# Shareholder Engagement Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Investor Relations

## Purpose

Establishes guidelines for effective engagement with shareholders and the investment community.

## Engagement Objectives

- Maintain open dialogue with shareholders
- Communicate strategy and performance
- Gather feedback on company matters
- Build long-term relationships
- Support fair valuation

## Engagement Types

| Type | Frequency | Participants |
|------|-----------|--------------|
| Quarterly Earnings | 4x/year | CFO, CEO, IR |
| Annual Meeting | Annual | Board, Management |
| Investor Conferences | As scheduled | CEO, CFO |
| Non-deal Roadshows | 2-4x/year | Management |
| One-on-One Meetings | Ongoing | IR, Management |

## Key Engagement Topics

### Financial
- Quarterly/annual results
- Guidance and outlook
- Capital allocation
- Dividend policy

### Strategic
- Business strategy
- Competitive position
- Growth initiatives
- M&A approach

### Governance
- Board composition
- Executive compensation
- Risk management
- ESG matters

## Engagement Standards

| Standard | Requirement |
|----------|-------------|
| Preparation | Know shareholder background |
| Documentation | Record meeting notes |
| Follow-up | Address outstanding questions |
| Consistency | Align with public disclosures |

## Major Shareholder Engagement

For shareholders owning >1% of outstanding shares:
- Proactive outreach program
- Direct access to management
- Governance-focused discussions
- Board engagement when appropriate

## Activist Engagement

| Stage | Action |
|-------|--------|
| Monitoring | Track activist activity |
| Preparation | Response team, materials |
| Engagement | Constructive dialogue |
| Resolution | Board oversight |

## Related Documents

- [Disclosure Policy](./Disclosure_Policy.md)
- [Board of Directors](../../BoardOfDirectors/)
"""),
        ],
        "Processes": [
            ("Earnings_Release_Process.md", """# Earnings Release Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Investor Relations

## Purpose

Establishes the standard process for preparing and executing quarterly earnings releases.

## Timeline

| Timing | Activity | Owner |
|--------|----------|-------|
| Q End + 1 week | Close books | Accounting |
| Q End + 2 weeks | Draft financials | FP&A |
| Q End + 3 weeks | Management review | CFO |
| Q End + 3.5 weeks | Audit committee | Controller |
| Q End + 4 weeks | Earnings release | IR |

## Deliverables

### Earnings Press Release
- Financial highlights
- Segment performance
- Guidance update
- Management commentary

### Earnings Presentation
- Key metrics
- Trend analysis
- Strategic updates
- Q&A preparation

### SEC Filings
- 10-Q/10-K filing
- 8-K for earnings
- Supporting schedules

## Preparation Process

### Week 1: Data Collection
| Task | Owner |
|------|-------|
| Collect financial data | FP&A |
| Prepare segment analysis | Controllers |
| Compile operational metrics | Business units |

### Week 2: Drafting
| Document | Primary Author | Reviewer |
|----------|----------------|----------|
| Press Release | IR | CFO, Legal |
| Presentation | IR | CFO, CEO |
| Talking Points | IR | Management |
| Q&A Document | IR | Cross-functional |

### Week 3: Review and Approval
| Activity | Participants |
|----------|--------------|
| Management review | CFO, CEO, COO |
| Legal review | General Counsel |
| Board review | Audit Committee |
| Final approval | CEO, CFO |

### Week 4: Execution
| Activity | Timing |
|----------|--------|
| File 8-K | Day of release |
| Issue press release | Market close |
| Host earnings call | Scheduled time |
| Post materials | Immediately after |

## Related Documents

- [Disclosure Policy](../Policies/Disclosure_Policy.md)
- [Communications Process](../../Communications/Processes/)
"""),
        ],
    },
    "Procurement": {
        "Policies": [
            ("Vendor_Management_Policy.md", """# Vendor Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Procurement

## Purpose

Establishes standards for selecting, managing, and monitoring vendor relationships to ensure quality, value, and risk management.

## Scope

Applies to all vendor relationships including suppliers, service providers, contractors, and consultants.

## Vendor Categories

| Category | Definition | Oversight Level |
|----------|------------|-----------------|
| Strategic | Critical to operations | Executive |
| Preferred | Standard suppliers | Manager |
| Approved | Qualified vendors | Standard |
| Probationary | New/remediation | Enhanced |

## Vendor Selection

### Requirements
| Criteria | Evaluation |
|----------|------------|
| Capability | Technical qualification |
| Financial | Stability assessment |
| Compliance | Regulatory alignment |
| Security | Risk assessment |
| References | Customer validation |

### Approval Thresholds
| Contract Value | Approval Authority |
|----------------|-------------------|
| < $10K | Manager |
| $10K - $100K | Director |
| $100K - $500K | VP |
| > $500K | Executive |

## Vendor Performance

### Key Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Delivery | 95% on-time | Monthly |
| Quality | 99% defect-free | Per delivery |
| Cost | Within budget | Quarterly |
| Compliance | 100% | Annually |

### Performance Review
| Frequency | Scope | Participants |
|-----------|-------|--------------|
| Monthly | Operational metrics | Category manager |
| Quarterly | Performance scorecard | Procurement + Vendor |
| Annual | Strategic review | Leadership |

## Risk Management

| Risk Category | Mitigation |
|---------------|------------|
| Concentration | Multiple suppliers |
| Financial | Credit monitoring |
| Operational | Business continuity |
| Compliance | Regular audits |
| Security | Assessments, controls |

## Contract Requirements

All vendor contracts must include:
- Service level agreements
- Compliance requirements
- Audit rights
- Termination provisions
- Liability and insurance
- Data protection clauses

## Related Documents

- [Procurement Process](../Processes/Procurement_Process.md)
- [Contract Management](../../Legal/Contracts/)
"""),
            ("Sustainable_Procurement_Policy.md", """# Sustainable Procurement Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Procurement

## Purpose

Integrates environmental, social, and governance (ESG) considerations into procurement decisions.

## Scope

Applies to all procurement activities and vendor relationships.

## Sustainability Principles

| Principle | Application |
|-----------|-------------|
| Environmental | Minimize environmental impact |
| Social | Support fair labor practices |
| Economic | Consider total cost of ownership |
| Ethical | Maintain highest integrity |

## Environmental Criteria

### Product/Service Requirements
| Factor | Consideration |
|--------|---------------|
| Materials | Recycled, renewable content |
| Energy | Efficiency, renewable sources |
| Packaging | Minimal, recyclable |
| Transport | Carbon footprint |
| Disposal | End-of-life management |

### Vendor Requirements
- Environmental management system
- Carbon reduction targets
- Waste reduction programs
- Compliance with regulations

## Social Criteria

### Labor Standards
| Standard | Requirement |
|----------|-------------|
| Fair Wages | Living wage commitment |
| Working Conditions | Safe and healthy |
| No Child Labor | Age verification |
| No Forced Labor | Voluntary employment |
| Non-discrimination | Equal opportunity |

### Community Impact
- Local sourcing preference
- Diversity supplier program
- Community investment

## Governance Criteria

| Area | Requirement |
|------|-------------|
| Ethics | Code of conduct |
| Anti-corruption | FCPA compliance |
| Transparency | Disclosure practices |
| Human Rights | Policy commitment |

## Supplier Assessment

| Tier | Criteria | Action |
|------|----------|--------|
| Leader | Exceeds standards | Strategic partnership |
| Compliant | Meets standards | Standard relationship |
| Developing | Improvement plan | Support and monitor |
| Non-compliant | Fails standards | Exit or remediate |

## Related Documents

- [Vendor Management Policy](./Vendor_Management_Policy.md)
- [Sustainability](../../Sustainability/)
"""),
        ],
        "Processes": [
            ("Procurement_Process.md", """# Procurement Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Procurement Manager

## Purpose

Defines the end-to-end process for procuring goods and services.

## Process Overview

```
Request → Source → Select → Contract → Order → Receive → Pay
```

## Process Steps

### 1. Requisition
| Activity | Owner | Output |
|----------|-------|--------|
| Submit request | Requester | Purchase requisition |
| Budget check | Finance | Approval |
| Specification review | Procurement | Requirements document |

### 2. Sourcing
| Method | Use Case | Timeline |
|--------|----------|----------|
| Catalog | Standard items | Same day |
| RFQ | Price comparison | 1-2 weeks |
| RFP | Complex requirements | 4-8 weeks |
| Sole Source | Unique supplier | 1-2 weeks |

### 3. Vendor Selection
| Step | Activity |
|------|----------|
| Evaluation | Score proposals |
| Negotiation | Terms and pricing |
| Due diligence | Risk assessment |
| Selection | Award decision |

### 4. Contracting
| Contract Type | Use Case |
|---------------|----------|
| Purchase Order | Simple transactions |
| Master Agreement | Ongoing relationship |
| Statement of Work | Project-based |
| Service Agreement | Recurring services |

### 5. Order Management
| Activity | System |
|----------|--------|
| PO creation | ERP |
| Acknowledgment | Vendor portal |
| Status tracking | Procurement dashboard |
| Change orders | Formal amendment |

### 6. Receipt and Inspection
| Step | Responsibility |
|------|----------------|
| Delivery receipt | Receiving |
| Quality inspection | Quality |
| Documentation | Procurement |
| Issue resolution | Vendor management |

### 7. Payment
| Step | Timing |
|------|--------|
| Invoice receipt | Upon delivery |
| 3-way match | PO, receipt, invoice |
| Approval | Net terms |
| Payment | Per schedule |

## Related Documents

- [Vendor Management Policy](../Policies/Vendor_Management_Policy.md)
- [Finance Policies](../../Finance/Policies/)
"""),
        ],
    },
    "ProjectManagement": {
        "Policies": [
            ("Project_Governance_Policy.md", """# Project Governance Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** PMO Director

## Purpose

Establishes the governance framework for managing projects across the organization.

## Scope

Applies to all projects regardless of size, type, or business unit.

## Project Classification

| Category | Budget | Duration | Governance |
|----------|--------|----------|------------|
| Strategic | > $1M | > 12 months | Executive Steering |
| Major | $100K-$1M | 6-12 months | Director Oversight |
| Standard | $10K-$100K | 1-6 months | Manager Review |
| Minor | < $10K | < 1 month | Self-managed |

## Governance Structure

### Steering Committee
- Executive sponsors
- Key stakeholders
- Strategic oversight
- Issue escalation

### Project Sponsor
- Business case owner
- Decision authority
- Resource commitment
- Executive liaison

### Project Manager
- Day-to-day management
- Team coordination
- Status reporting
- Risk management

## Stage Gates

| Gate | Decision | Criteria |
|------|----------|----------|
| G0 - Initiation | Approve concept | Business case |
| G1 - Planning | Approve plan | Detailed planning |
| G2 - Execution | Continue/Adjust | Progress review |
| G3 - Closure | Accept delivery | Success criteria |

## Governance Meetings

| Meeting | Frequency | Participants |
|---------|-----------|--------------|
| Steering Committee | Monthly | Executives |
| Status Review | Weekly | PM + Stakeholders |
| Team Stand-up | Daily | Project team |

## Escalation Matrix

| Issue Type | Level 1 | Level 2 | Level 3 |
|------------|---------|---------|---------|
| Schedule | PM | Director | VP |
| Budget | PM | Finance | CFO |
| Scope | PM | Sponsor | Steering |
| Risk | PM | Director | Executive |

## Related Documents

- [Project Methodology](../Processes/Project_Methodology.md)
- [Risk Management](../../RiskManagement/)
"""),
        ],
        "Processes": [
            ("Project_Methodology.md", """# Project Methodology

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** PMO Director

## Purpose

Defines the standard project management methodology used across the organization.

## Methodology Selection

| Project Type | Recommended Approach |
|--------------|---------------------|
| Fixed requirements | Waterfall |
| Evolving requirements | Agile |
| Complex/uncertain | Hybrid |
| Time-critical | Rapid delivery |

## Waterfall Methodology

### Phases
1. **Initiation** - Define project, get approval
2. **Planning** - Detailed scope, schedule, budget
3. **Execution** - Deliver work products
4. **Monitoring** - Track progress, manage changes
5. **Closure** - Accept deliverables, lessons learned

### Key Artifacts
| Phase | Deliverable |
|-------|-------------|
| Initiation | Project Charter |
| Planning | Project Plan, WBS, Schedule |
| Execution | Status Reports, Deliverables |
| Monitoring | Change Requests, Issues Log |
| Closure | Lessons Learned, Closure Report |

## Agile Methodology

### Framework
| Element | Description |
|---------|-------------|
| Sprint | 2-week iteration |
| Backlog | Prioritized requirements |
| Stand-up | Daily 15-min sync |
| Review | Sprint demo |
| Retrospective | Process improvement |

### Roles
| Role | Responsibility |
|------|----------------|
| Product Owner | Backlog prioritization |
| Scrum Master | Process facilitation |
| Team | Delivery |

### Ceremonies
| Ceremony | Timing | Duration |
|----------|--------|----------|
| Sprint Planning | Start of sprint | 2-4 hours |
| Daily Stand-up | Daily | 15 min |
| Sprint Review | End of sprint | 1-2 hours |
| Retrospective | End of sprint | 1 hour |

## Hybrid Approach

Combines elements based on project needs:
- Waterfall for planning and governance
- Agile for delivery phases
- Regular stakeholder reviews
- Flexible scope management

## Related Documents

- [Project Governance Policy](../Policies/Project_Governance_Policy.md)
- [Templates](./Templates/)
"""),
            ("Resource_Management_Process.md", """# Resource Management Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** PMO Director

## Purpose

Defines the process for planning, allocating, and managing project resources.

## Resource Types

| Type | Examples |
|------|----------|
| Human | Staff, contractors, consultants |
| Technical | Systems, tools, infrastructure |
| Financial | Budget, funding |
| Material | Equipment, supplies |

## Resource Planning

### Demand Forecasting
| Activity | Output |
|----------|--------|
| Collect project needs | Resource requirements |
| Aggregate demand | Capacity demand forecast |
| Identify gaps | Capacity analysis |

### Capacity Assessment
| Step | Activity |
|------|----------|
| Document current capacity | Resource inventory |
| Project availability | Capacity calendar |
| Compare demand vs capacity | Gap analysis |

## Resource Allocation

### Prioritization Criteria
| Factor | Weight |
|--------|--------|
| Strategic alignment | 30% |
| Business impact | 25% |
| Resource availability | 20% |
| Dependencies | 15% |
| Risk | 10% |

### Allocation Process
1. Review resource requests
2. Assess availability
3. Apply prioritization
4. Confirm with resource managers
5. Update allocations
6. Communicate decisions

## Resource Tracking

| Metric | Frequency | Owner |
|--------|-----------|-------|
| Utilization | Weekly | PMO |
| Availability | Weekly | Resource managers |
| Over-allocation | Daily | PMO |
| Forecast accuracy | Monthly | PMO |

## Conflict Resolution

| Issue | Resolution Path |
|-------|-----------------|
| Resource conflict | PMO coordination |
| Skill mismatch | Training or replacement |
| Capacity shortage | Prioritization or hiring |
| Over-allocation | Rebalance or defer |

## Related Documents

- [Project Governance Policy](../Policies/Project_Governance_Policy.md)
- [HR Policies](../../HumanResources/Policies/)
"""),
        ],
    },
    "Sustainability": {
        "Policies": [
            ("ESG_Policy.md", """# Environmental, Social, and Governance (ESG) Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Sustainability Officer

## Purpose

Establishes the organization's commitment to sustainable business practices and ESG integration.

## Scope

Applies to all business activities, operations, and stakeholder relationships.

## ESG Commitment

### Environmental
| Focus Area | Commitment |
|------------|------------|
| Climate | Net-zero carbon by 2040 |
| Resources | Circular economy principles |
| Biodiversity | No net loss |
| Pollution | Zero harmful discharge |

### Social
| Focus Area | Commitment |
|------------|------------|
| Employees | Safe, inclusive workplace |
| Communities | Positive impact |
| Supply Chain | Responsible sourcing |
| Human Rights | Full respect and protection |

### Governance
| Focus Area | Commitment |
|------------|------------|
| Ethics | Highest integrity standards |
| Transparency | Full disclosure |
| Accountability | Board oversight |
| Risk Management | Integrated ESG risks |

## ESG Governance

### Board Oversight
- ESG committee of the board
- Quarterly ESG reporting
- Annual ESG strategy review

### Executive Accountability
- CEO: Overall ESG performance
- CSO: Strategy and reporting
- Business units: Implementation

## ESG Reporting

| Report | Frequency | Audience |
|--------|-----------|----------|
| ESG Report | Annual | Public |
| Progress Update | Quarterly | Board |
| Framework Disclosures | As required | Regulators |

## Frameworks and Standards

| Framework | Application |
|-----------|-------------|
| GRI | Sustainability reporting |
| SASB | Industry-specific metrics |
| TCFD | Climate disclosure |
| UN SDGs | Impact alignment |

## Related Documents

- [Climate Action Plan](./Climate_Action_Policy.md)
- [Diversity & Inclusion](../../HumanResources/Policies/)
- [Governance Policies](../../Governance/Policies/)
"""),
            ("Climate_Action_Policy.md", """# Climate Action Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Sustainability Officer

## Purpose

Establishes the organization's approach to addressing climate change through mitigation and adaptation.

## Climate Goals

| Target | Baseline | Timeline |
|--------|----------|----------|
| Net-zero emissions | 2020 | 2040 |
| 50% reduction | 2020 | 2030 |
| 100% renewable energy | Current | 2030 |
| Carbon-neutral operations | Current | 2025 |

## Emissions Scope

| Scope | Coverage | Approach |
|-------|----------|----------|
| Scope 1 | Direct emissions | Reduce, electrify |
| Scope 2 | Purchased energy | Renewables |
| Scope 3 | Value chain | Engage suppliers |

## Mitigation Strategies

### Energy
| Initiative | Target |
|------------|--------|
| Energy efficiency | 30% reduction |
| Renewable procurement | 100% by 2030 |
| On-site generation | 25% of consumption |

### Transportation
| Initiative | Target |
|------------|--------|
| Fleet electrification | 100% by 2030 |
| Business travel reduction | 50% vs 2019 |
| Employee commuting | 30% reduction |

### Supply Chain
| Initiative | Target |
|------------|--------|
| Supplier engagement | 70% SBTi aligned |
| Sustainable materials | 80% certified |
| Logistics optimization | 25% reduction |

## Carbon Management

| Approach | Priority |
|----------|----------|
| Avoid | First choice |
| Reduce | Primary strategy |
| Replace | Key enabler |
| Offset | Residual only |

## Adaptation Planning

| Risk | Adaptation Measure |
|------|-------------------|
| Physical risks | Business continuity |
| Transition risks | Strategy adjustment |
| Supply chain | Diversification |
| Operations | Resilience investments |

## Related Documents

- [ESG Policy](./ESG_Policy.md)
- [Risk Management](../../RiskManagement/)
"""),
        ],
        "Processes": [
            ("Carbon_Accounting_Process.md", """# Carbon Accounting Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Sustainability Manager

## Purpose

Defines the process for measuring, tracking, and reporting greenhouse gas emissions.

## Scope

All organizational emissions across Scope 1, 2, and 3.

## Accounting Standards

| Standard | Application |
|----------|-------------|
| GHG Protocol | Inventory methodology |
| ISO 14064 | Verification standard |
| SBTi | Target setting |
| CDP | Disclosure framework |

## Data Collection

### Scope 1 - Direct Emissions
| Source | Data Required | Frequency |
|--------|---------------|-----------|
| Facilities | Fuel consumption | Monthly |
| Fleet | Fuel purchases | Monthly |
| Refrigerants | Leakage records | Quarterly |

### Scope 2 - Energy
| Source | Data Required | Frequency |
|--------|---------------|-----------|
| Electricity | kWh consumption | Monthly |
| Steam/Heat | Consumption records | Monthly |
| Cooling | Consumption records | Monthly |

### Scope 3 - Value Chain
| Category | Data Required | Frequency |
|----------|---------------|-----------|
| Purchased goods | Spend or quantity | Quarterly |
| Transportation | Weight/distance | Quarterly |
| Business travel | Booking data | Monthly |
| Employee commuting | Survey data | Annual |

## Calculation Methodology

| Step | Activity |
|------|----------|
| 1 | Collect activity data |
| 2 | Select emission factors |
| 3 | Calculate emissions |
| 4 | Aggregate by scope |
| 5 | Validate results |
| 6 | Report and disclose |

## Emission Factors

| Source | Factor Source |
|--------|---------------|
| Fuels | EPA, DEFRA |
| Electricity | Grid averages, RECs |
| Materials | LCA databases |
| Services | Spend-based factors |

## Related Documents

- [Climate Action Policy](../Policies/Climate_Action_Policy.md)
- [Reporting Templates](./Templates/)
"""),
        ],
    },
    "Communications": {
        "Policies": [
            ("Crisis_Communications_Policy.md", """# Crisis Communications Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Communications

## Purpose

Establishes guidelines for effective communication during organizational crises.

## Scope

Applies to all communications during crisis situations affecting the organization.

## Crisis Definition

| Level | Definition | Triggers |
|-------|------------|----------|
| Level 1 | Minor incident | Local impact |
| Level 2 | Significant event | Regional impact |
| Level 3 | Major crisis | Organizational impact |
| Level 4 | Catastrophic | Existential threat |

## Crisis Communication Team

| Role | Responsibility |
|------|----------------|
| CEO | Final approval, spokesperson |
| CCO | Strategy and coordination |
| Legal | Liability review |
| HR | Employee communications |
| IR | Investor communications |
| Subject Matter | Technical guidance |

## Response Framework

### Initial Response (Golden Hour)
| Activity | Timing | Owner |
|----------|--------|-------|
| Assess situation | Immediate | Crisis team |
| Activate protocol | <30 min | CCO |
| Prepare holding statement | <1 hour | Communications |
| Internal notification | <2 hours | HR |
| External communication | As needed | CCO |

### Ongoing Communications
| Activity | Frequency |
|----------|-----------|
| Situation updates | As developments occur |
| Stakeholder briefings | Daily minimum |
| Media monitoring | Continuous |
| Response evaluation | Every 4 hours |

## Key Stakeholders

| Stakeholder | Channel | Priority |
|-------------|---------|----------|
| Employees | Email, intranet | Immediate |
| Customers | Direct, website | High |
| Investors | IR direct | High |
| Media | Press release | As needed |
| Regulators | Direct | Required |
| Community | Website, social | As appropriate |

## Message Development

### Principles
- Express concern
- State known facts
- Outline actions taken
- Provide contact information
- Commit to updates

### Approval Chain
1. Draft by communications
2. Legal review
3. CEO approval
4. Dissemination

## Post-Crisis

| Activity | Timing |
|----------|--------|
| Debrief | Within 1 week |
| Lessons learned | Within 2 weeks |
| Policy updates | Within 1 month |

## Related Documents

- [Communications Policy](./Communications_Policy.md)
- [Business Continuity](../../RiskManagement/)
"""),
            ("Internal_Communications_Policy.md", """# Internal Communications Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Communications

## Purpose

Establishes standards for effective internal communication across the organization.

## Scope

Applies to all internal communications between employees and organizational units.

## Communication Principles

| Principle | Application |
|-----------|-------------|
| Transparency | Share information openly |
| Timeliness | Communicate promptly |
| Clarity | Use clear, simple language |
| Relevance | Target appropriate audiences |
| Two-way | Encourage feedback |

## Communication Channels

| Channel | Use Case | Urgency |
|---------|----------|---------|
| Email | Formal communication | Normal |
| Intranet | Policies, resources | Reference |
| Town Hall | Major announcements | Special |
| Team Meetings | Operational updates | Regular |
| Chat/Messaging | Quick coordination | Immediate |
| Newsletter | Company updates | Weekly |

## Communication Types

### Executive Communications
| Type | Frequency | Audience |
|------|-----------|----------|
| CEO Message | Monthly | All employees |
| Strategy Update | Quarterly | All employees |
| Town Hall | Quarterly | All employees |

### Organizational Updates
| Type | Responsibility | Channel |
|------|----------------|---------|
| Policy changes | HR/Legal | Email + Intranet |
| Organizational changes | HR | Manager cascade |
| Operational updates | Business units | Team meetings |

### Employee Communications
| Type | Channel |
|------|---------|
| Recognition | Email, intranet |
| Events | Calendar, email |
| Benefits | HR portal |
| Training | LMS |

## Cascade Communication

| Level | Receives From | Communicates To |
|-------|---------------|-----------------|
| Executive | External, Board | Senior management |
| Senior Management | Executive | Managers |
| Managers | Sr. Management | Teams |
| Employees | Managers | Feedback up |

## Related Documents

- [Communications Policy](./Communications_Policy.md)
- [HR Policies](../../HumanResources/Policies/)
"""),
        ],
    },
}

def create_content(unit_name: str, content_type: str, files: list[tuple[str, str]]):
    """Create files for a unit."""
    unit_dir = UNITS_DIR / unit_name / content_type
    unit_dir.mkdir(parents=True, exist_ok=True)
    
    created = []
    for filename, content in files:
        file_path = unit_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            created.append(str(file_path.relative_to(UNITS_DIR)))
    
    return created

def main():
    total_created = 0
    
    for unit_name, content in UNIT_CONTENT.items():
        for content_type, files in content.items():
            created = create_content(unit_name, content_type, files)
            for f in created:
                print(f"✓ Created: {f}")
                total_created += 1
    
    print(f"\nTotal files created: {total_created}")

if __name__ == "__main__":
    main()
