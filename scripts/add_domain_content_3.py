#!/usr/bin/env python3
"""
Add additional domain-specific content for HumanResources, Finance, Development, Security.
"""

from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

MORE_CONTENT = {
    "HumanResources": {
        "Policies": [
            ("Performance_Management_Policy.md", """# Performance Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Human Resources Officer

## Purpose

Establishes the framework for managing and developing employee performance.

## Performance Cycle

| Phase | Timing | Activities |
|-------|--------|------------|
| Goal Setting | Q1 | Align objectives with strategy |
| Mid-Year | Q2 | Progress check, feedback |
| Year-End | Q4 | Full evaluation, calibration |
| Development | Ongoing | Coaching, training |

## Goal Framework

### SMART Criteria
| Element | Requirement |
|---------|-------------|
| Specific | Clear and detailed |
| Measurable | Quantifiable outcomes |
| Achievable | Realistic within capacity |
| Relevant | Aligned with objectives |
| Time-bound | Clear deadlines |

### Goal Categories
| Category | Weight | Examples |
|----------|--------|----------|
| Business | 60% | Revenue, projects, quality |
| Development | 20% | Skills, capabilities |
| Leadership | 10% | Team, culture |
| Values | 10% | Behaviors, ethics |

## Performance Ratings

| Rating | Definition |
|--------|------------|
| Exceptional | Consistently exceeds expectations |
| Exceeds | Regularly exceeds expectations |
| Meets | Fully meets expectations |
| Developing | Partially meets expectations |
| Below | Does not meet expectations |

## Feedback Requirements

| Type | Frequency | Method |
|------|-----------|--------|
| Informal | Weekly | One-on-ones |
| Formal | Quarterly | Documented reviews |
| 360° | Annual | Multi-source survey |

## Calibration

| Purpose | Ensure fairness and consistency |
|---------|-------------------------------|
| Participants | Managers + HR + Leadership |
| Outcomes | Adjusted ratings, development plans |
| Frequency | Annually |

## Related Documents

- [Compensation Policy](./Compensation_Policy.md)
- [Training & Development](../../TrainingDevelopment/)
"""),
            ("Compensation_Policy.md", """# Compensation Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Human Resources Officer

## Purpose

Establishes principles and guidelines for competitive and equitable compensation.

## Compensation Philosophy

| Principle | Application |
|-----------|-------------|
| Competitive | Market-aligned pay levels |
| Equitable | Fair for similar roles |
| Performance-based | Reward contribution |
| Transparent | Clear guidelines |
| Compliant | Legal requirements |

## Pay Structure

### Components
| Component | Purpose |
|-----------|---------|
| Base Salary | Fixed compensation |
| Bonus | Performance incentive |
| Equity | Long-term alignment |
| Benefits | Health, retirement, etc. |
| Perks | Additional value |

### Market Positioning
| Percentile | Application |
|------------|-------------|
| 75th | Executive, top talent |
| 50th | Standard positions |
| Variable | Based on role, skills |

## Salary Administration

### Salary Ranges
| Level | Range Spread |
|-------|--------------|
| Entry | 80% - 100% midpoint |
| Mid | 90% - 110% midpoint |
| Senior | 85% - 115% midpoint |
| Executive | Wide range, discretionary |

### Increases
| Type | Timing |
|------|--------|
| Merit | Annual, performance-based |
| Promotion | With level change |
| Market adjustment | As needed |

## Bonus Programs

### Annual Incentive
| Level | Target | Range |
|-------|--------|-------|
| Individual Contributor | 5-10% | 0-150% |
| Manager | 10-20% | 0-150% |
| Director | 15-30% | 0-200% |
| Executive | 30-100% | 0-200% |

### Factors
| Factor | Weight |
|--------|--------|
| Company performance | 40% |
| Unit performance | 30% |
| Individual performance | 30% |

## Related Documents

- [Performance Management](./Performance_Management_Policy.md)
- [Benefits Summary](./Benefits_Policy.md)
"""),
            ("Talent_Acquisition_Policy.md", """# Talent Acquisition Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Talent Acquisition

## Purpose

Establishes guidelines for attracting, selecting, and hiring qualified candidates.

## Recruitment Principles

| Principle | Application |
|-----------|-------------|
| Merit-based | Skills and qualifications |
| Inclusive | Diverse candidate pools |
| Consistent | Standardized process |
| Legal | Compliant with regulations |
| Timely | Efficient process |

## Hiring Process

| Stage | Owner | Timeline |
|-------|-------|----------|
| Requisition | Hiring manager | Week 1 |
| Sourcing | Recruiter | Weeks 1-4 |
| Screening | Recruiter | Ongoing |
| Interviews | Team | Weeks 2-6 |
| Selection | Hiring manager | Week 6-7 |
| Offer | HR | Week 7-8 |
| Onboarding | HR + Manager | Start date |

## Requisition Requirements

| Element | Requirement |
|---------|-------------|
| Job description | Current and approved |
| Budget approval | Finance sign-off |
| Level/grade | HR review |
| Justification | Business need |

## Sourcing Strategies

| Source | Focus |
|--------|-------|
| Internal | Current employees first |
| Referrals | Employee network |
| Direct | Active sourcing |
| Postings | Job boards, careers |
| Agencies | Specialized roles |
| Campus | Entry-level pipeline |

## Interview Standards

### Interview Types
| Type | Purpose |
|------|---------|
| Phone screen | Initial qualification |
| Behavioral | Past performance |
| Technical | Skills assessment |
| Case/Project | Problem solving |
| Culture fit | Values alignment |
| Executive | Final approval |

### Panel Requirements
| Level | Panel Size |
|-------|------------|
| Entry | 2-3 interviewers |
| Mid | 3-4 interviewers |
| Senior | 4-5 interviewers |
| Executive | 5+ including executives |

## Related Documents

- [Onboarding Process](../Processes/Onboarding_Process.md)
- [Diversity & Inclusion](./Diversity_Inclusion_Policy.md)
"""),
        ],
        "Processes": [
            ("Onboarding_Process.md", """# Onboarding Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** HR Manager

## Purpose

Defines the process for successfully integrating new employees into the organization.

## Onboarding Timeline

### Pre-Start (Before Day 1)
| Activity | Owner | Timing |
|----------|-------|--------|
| Welcome email | Recruiter | -1 week |
| Account setup | IT | -3 days |
| Workspace prep | Facilities | -1 day |
| Manager prep | Manager | -1 week |

### Week 1: Orientation
| Day | Focus | Activities |
|-----|-------|------------|
| 1 | Welcome | Paperwork, introductions |
| 2-3 | Company | Culture, values, org overview |
| 4-5 | Role | Job-specific training |

### Month 1: Foundation
| Week | Focus |
|------|-------|
| 2 | Systems and tools training |
| 3 | Team integration |
| 4 | Initial projects |

### Months 2-3: Integration
| Focus | Activities |
|-------|------------|
| Contribution | Start adding value |
| Relationships | Build network |
| Knowledge | Deeper learning |
| Goals | 90-day objectives |

## Stakeholder Responsibilities

### HR
- Coordinate logistics
- Deliver orientation
- Track completion
- Collect feedback

### Manager
- Welcome and integrate
- Set expectations
- Provide context
- Regular check-ins

### Buddy
- Answer questions
- Informal support
- Cultural guidance
- Social connection

## Checkpoints

| Timing | Activity | Participants |
|--------|----------|--------------|
| Day 1 | Welcome meeting | Manager |
| Week 1 | Orientation review | HR |
| 30 days | Progress check | Manager + HR |
| 60 days | Development review | Manager |
| 90 days | Probation review | Manager + HR |

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to productivity | 90 days |
| New hire satisfaction | > 4/5 |
| 90-day retention | > 95% |
| Manager satisfaction | > 4/5 |

## Related Documents

- [Talent Acquisition](../Policies/Talent_Acquisition_Policy.md)
- [Training Programs](../../TrainingDevelopment/)
"""),
        ],
    },
    "Finance": {
        "Policies": [
            ("Financial_Controls_Policy.md", """# Financial Controls Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Financial Officer

## Purpose

Establishes the framework for internal financial controls to ensure accuracy, compliance, and asset protection.

## Control Objectives

| Objective | Purpose |
|-----------|---------|
| Reliability | Accurate financial reporting |
| Compliance | Regulatory adherence |
| Safeguarding | Asset protection |
| Efficiency | Operational effectiveness |

## Control Environment

### Organizational Controls
| Control | Implementation |
|---------|----------------|
| Tone at top | Ethics and integrity |
| Authority | Clear delegation |
| Competence | Qualified personnel |
| Accountability | Performance oversight |

### Segregation of Duties
| Process | Separation |
|---------|------------|
| Purchasing | Requester ≠ Approver ≠ Receiver |
| Payments | Initiator ≠ Approver |
| Reconciliation | Preparer ≠ Reviewer |
| Access | Grantee ≠ Administrator |

## Transaction Controls

### Authorization Limits
| Amount | Authority |
|--------|-----------|
| < $10K | Manager |
| $10K - $50K | Director |
| $50K - $250K | VP |
| $250K - $1M | CFO |
| > $1M | CEO/Board |

### Payment Controls
| Control | Requirement |
|---------|-------------|
| Dual approval | > $50K payments |
| Positive pay | All checks |
| Wire verification | Callback required |
| ACH monitoring | Daily review |

## Reconciliation

| Account | Frequency | Reviewer |
|---------|-----------|----------|
| Bank | Daily | Treasury |
| AR/AP | Weekly | Controllers |
| Fixed assets | Monthly | Accounting |
| Inventory | Monthly | Operations |
| Intercompany | Monthly | Corporate |

## Monitoring

| Activity | Frequency |
|----------|-----------|
| Transaction sampling | Monthly |
| Controls testing | Quarterly |
| Self-assessment | Annually |
| External audit | Annually |

## Related Documents

- [Expense Policy](./Expense_Policy.md)
- [Audit](../../Audit/)
"""),
            ("Expense_Policy.md", """# Expense Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Controller

## Purpose

Establishes guidelines for incurring and reimbursing business expenses.

## General Principles

| Principle | Guidance |
|-----------|----------|
| Business purpose | Valid business reason |
| Reasonableness | Prudent spending |
| Documentation | Original receipts |
| Timeliness | Submit within 30 days |
| Compliance | Follow all policies |

## Travel Expenses

### Air Travel
| Criteria | Standard |
|----------|----------|
| Booking | 14+ days in advance |
| Class | Economy (< 6 hours) |
| Upgrades | Personal expense |
| Changes | Business reason required |

### Lodging
| Criteria | Standard |
|----------|----------|
| Rate | Government or negotiated |
| Location | Proximity to work |
| Amenities | Standard rooms |

### Meals
| Type | Per Diem |
|------|----------|
| Breakfast | $20 |
| Lunch | $25 |
| Dinner | $50 |
| Business meals | Actual with receipt |

### Ground Transportation
| Mode | Guidance |
|------|----------|
| Rental car | Compact unless justified |
| Rideshare | Preferred over taxi |
| Personal vehicle | IRS mileage rate |
| Parking | Reasonable expenses |

## Entertainment

### Client Entertainment
| Guideline | Limit |
|-----------|-------|
| Per person | $150 |
| Pre-approval | > $500 total |
| Documentation | Attendees, purpose |

## Approval Requirements

| Amount | Approval |
|--------|----------|
| < $500 | Manager |
| $500 - $2,500 | Director |
| $2,500 - $10,000 | VP |
| > $10,000 | CFO |

## Non-Reimbursable

- Personal expenses
- Excessive or luxury items
- Fines and penalties
- Personal travel additions
- Lost cash

## Related Documents

- [Financial Controls](./Financial_Controls_Policy.md)
- [Procurement](../../Procurement/)
"""),
        ],
        "Processes": [
            ("Budgeting_Process.md", """# Budgeting Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** FP&A Director

## Purpose

Defines the annual budgeting process and financial planning procedures.

## Budget Calendar

| Phase | Timing | Duration |
|-------|--------|----------|
| Planning | June | 4 weeks |
| Development | July-August | 8 weeks |
| Review | September | 4 weeks |
| Approval | October | 4 weeks |
| Finalization | November | 2 weeks |

## Process Phases

### Phase 1: Planning
| Activity | Owner |
|----------|-------|
| Issue budget guidelines | CFO |
| Set planning assumptions | FP&A |
| Communicate targets | Business units |
| Prepare templates | FP&A |

### Phase 2: Development
| Activity | Owner |
|----------|-------|
| Departmental submissions | Cost center owners |
| Revenue forecasting | Sales + FP&A |
| Capital requests | Business units |
| Headcount planning | HR + Managers |

### Phase 3: Review
| Level | Focus |
|-------|-------|
| Roll-up | Consolidate submissions |
| Analysis | Gap to targets |
| Iteration | Refinement cycles |
| Presentation | Executive review |

### Phase 4: Approval
| Body | Scope |
|------|-------|
| CFO | Detailed budget |
| CEO | Strategic alignment |
| Board | Final approval |

## Budget Components

| Component | Owner |
|-----------|-------|
| Revenue | Sales, Marketing |
| Cost of sales | Operations |
| Operating expenses | All departments |
| Capital expenditures | IT, Facilities |
| Headcount | HR, All managers |

## Variance Management

| Frequency | Activity |
|-----------|----------|
| Monthly | Actual vs. budget analysis |
| Quarterly | Forecast updates |
| As needed | Reforecasts |

## Related Documents

- [Financial Controls](../Policies/Financial_Controls_Policy.md)
- [Reporting Standards](./Monthly_Close_Process.md)
"""),
        ],
    },
    "Development": {
        "Policies": [
            ("Software_Development_Policy.md", """# Software Development Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** VP Engineering

## Purpose

Establishes standards and guidelines for software development practices.

## Development Principles

| Principle | Application |
|-----------|-------------|
| Quality First | Built-in quality at every stage |
| Automation | CI/CD, testing, deployment |
| Security | Secure by design |
| Simplicity | KISS, DRY, YAGNI |
| Collaboration | Code review, pair programming |

## Development Standards

### Coding Standards
| Language | Standard |
|----------|----------|
| JavaScript/TypeScript | ESLint + Prettier |
| Python | PEP 8 + Black |
| Java | Google Java Style |
| SQL | Team conventions |

### Documentation
| Type | Requirement |
|------|-------------|
| Code comments | Complex logic explained |
| README | Every repository |
| API documentation | OpenAPI/Swagger |
| Architecture | Decision records |

## Version Control

### Git Workflow
| Branch | Purpose |
|--------|---------|
| main | Production code |
| develop | Integration branch |
| feature/* | New features |
| bugfix/* | Bug fixes |
| release/* | Release preparation |

### Commit Standards
| Element | Requirement |
|---------|-------------|
| Message format | Conventional commits |
| Size | Small, focused changes |
| Testing | Tests pass before push |

## Code Review

### Requirements
| Criteria | Standard |
|----------|----------|
| Approval | Minimum 1 reviewer |
| Response time | < 24 hours |
| Comments | Constructive feedback |
| Resolution | All issues addressed |

### Focus Areas
- Code quality and standards
- Logic and correctness
- Security considerations
- Performance implications
- Test coverage

## Testing Requirements

| Level | Coverage Target |
|-------|-----------------|
| Unit | > 80% |
| Integration | Critical paths |
| End-to-end | Happy paths |
| Performance | Key workflows |

## Related Documents

- [CI/CD Pipeline](../Processes/CI_CD_Process.md)
- [Security Standards](../../Security/Policies/)
"""),
        ],
        "Processes": [
            ("CI_CD_Process.md", """# CI/CD Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** DevOps Lead

## Purpose

Defines the continuous integration and continuous deployment pipeline.

## Pipeline Stages

```
Commit → Build → Test → Security → Deploy → Monitor
```

## Continuous Integration

### Trigger Events
| Event | Action |
|-------|--------|
| Push to feature branch | Build + Unit tests |
| Pull request | Full CI pipeline |
| Merge to develop | Integration tests |
| Merge to main | Full pipeline + Deploy |

### Build Stage
| Activity | Tool |
|----------|------|
| Checkout | Git |
| Dependencies | Package manager |
| Compile | Build tool |
| Package | Container/artifact |

### Test Stage
| Test Type | Gate |
|-----------|------|
| Unit tests | 80%+ coverage |
| Integration | All pass |
| Static analysis | No critical issues |
| Security scan | No high vulnerabilities |

## Continuous Deployment

### Environment Progression
| Environment | Purpose | Deploy |
|-------------|---------|--------|
| Development | Active development | Automatic |
| Staging | Integration testing | Automatic |
| Production | Live service | Manual approval |

### Deployment Strategies
| Strategy | Use Case |
|----------|----------|
| Blue-green | Zero-downtime |
| Canary | Gradual rollout |
| Rolling | Sequential update |
| Feature flags | Controlled release |

## Quality Gates

| Stage | Gate Criteria |
|-------|---------------|
| Build | Successful compilation |
| Test | All tests pass |
| Security | No critical findings |
| Performance | Within SLA |
| Approval | Required sign-off |

## Rollback

### Triggers
| Condition | Action |
|-----------|--------|
| Failed health check | Automatic rollback |
| Error rate spike | Manual decision |
| Performance degradation | Investigation + decision |

### Process
1. Detect issue
2. Assess impact
3. Execute rollback
4. Verify restoration
5. Root cause analysis

## Related Documents

- [Development Standards](../Policies/Software_Development_Policy.md)
- [Incident Management](../../Operations/Processes/)
"""),
        ],
    },
    "Security": {
        "Policies": [
            ("Information_Security_Policy.md", """# Information Security Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Information Security Officer

## Purpose

Establishes the framework for protecting organizational information assets.

## Security Principles

| Principle | Application |
|-----------|-------------|
| Confidentiality | Protect sensitive data |
| Integrity | Ensure data accuracy |
| Availability | Maintain system access |
| Defense in Depth | Multiple security layers |
| Least Privilege | Minimum necessary access |

## Scope

Applies to all information assets, systems, and users.

## Information Classification

| Level | Definition | Examples |
|-------|------------|----------|
| Public | No restriction | Marketing materials |
| Internal | Organization only | Policies, procedures |
| Confidential | Need to know | Customer data, financials |
| Restricted | Highly sensitive | Trade secrets, PII |

## Access Control

### Authentication
| Method | Requirement |
|--------|-------------|
| Passwords | Complex, rotated |
| MFA | Required for sensitive systems |
| SSO | Enterprise applications |
| Privileged | Enhanced controls |

### Authorization
| Control | Implementation |
|---------|----------------|
| Role-based | Defined access roles |
| Reviews | Quarterly certification |
| Termination | Same-day revocation |

## Data Protection

| Control | Requirement |
|---------|-------------|
| Encryption at rest | AES-256 |
| Encryption in transit | TLS 1.2+ |
| DLP | Sensitive data monitoring |
| Backup | Encrypted, tested |

## Incident Management

| Severity | Response Time |
|----------|---------------|
| Critical | 15 minutes |
| High | 1 hour |
| Medium | 4 hours |
| Low | 24 hours |

## Compliance

| Framework | Application |
|-----------|-------------|
| SOC 2 | Service organization |
| GDPR | Personal data |
| PCI DSS | Payment data |
| Industry-specific | As applicable |

## Related Documents

- [Acceptable Use](./Acceptable_Use_Policy.md)
- [Incident Response](../Processes/Incident_Response_Process.md)
"""),
            ("Acceptable_Use_Policy.md", """# Acceptable Use Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Information Security Officer

## Purpose

Defines acceptable use of organizational technology resources.

## Scope

Applies to all employees, contractors, and third parties using organizational systems.

## General Guidelines

| Category | Guidance |
|----------|----------|
| Professional Use | Primarily for business purposes |
| Personal Use | Limited, appropriate use permitted |
| Responsibility | Users accountable for actions |
| Compliance | Follow all policies and laws |

## Acceptable Use

### Authorized Activities
- Business communications
- Research and learning
- Approved personal use
- Authorized software
- Secure data handling

### Prohibited Activities
| Prohibition | Reason |
|-------------|--------|
| Unauthorized access | Security violation |
| Illegal content | Legal compliance |
| Harassment | Hostile environment |
| Personal business | Resource misuse |
| Unauthorized software | Security risk |
| Data exfiltration | Confidentiality |

## Email and Communications

| Standard | Requirement |
|----------|-------------|
| Professional | Business-appropriate content |
| Confidential | Encrypt sensitive data |
| Retained | Subject to retention policy |
| Monitored | No expectation of privacy |

## Internet Use

| Allowed | Restricted |
|---------|------------|
| Business research | Illegal content |
| Industry news | Inappropriate material |
| Professional development | Excessive personal use |
| Approved social media | Unauthorized streaming |

## Software and Systems

| Requirement | Compliance |
|-------------|------------|
| Approved software | IT-authorized only |
| Updates | Keep current |
| Credentials | Unique, protected |
| Reporting | Report security concerns |

## Enforcement

| Violation | Consequence |
|-----------|-------------|
| Minor | Warning |
| Moderate | Written notice |
| Major | Disciplinary action |
| Severe | Termination |

## Related Documents

- [Information Security](./Information_Security_Policy.md)
- [Code of Conduct](../../Governance/Policies/)
"""),
        ],
        "Processes": [
            ("Incident_Response_Process.md", """# Incident Response Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Security Operations Manager

## Purpose

Defines the process for detecting, responding to, and recovering from security incidents.

## Incident Categories

| Category | Examples |
|----------|----------|
| Malware | Virus, ransomware |
| Unauthorized Access | Account compromise |
| Data Breach | Data exfiltration |
| DoS/DDoS | Service disruption |
| Insider Threat | Malicious insider |
| Physical | Theft, unauthorized entry |

## Severity Classification

| Severity | Impact | Response Time |
|----------|--------|---------------|
| Critical | Business-wide | 15 min |
| High | Major system/data | 1 hour |
| Medium | Limited impact | 4 hours |
| Low | Minimal impact | 24 hours |

## Response Phases

### 1. Detection
| Source | Method |
|--------|--------|
| SIEM | Automated alerts |
| EDR | Endpoint detection |
| Users | Reported issues |
| External | Threat intelligence |

### 2. Triage
| Activity | Output |
|----------|--------|
| Initial assessment | Severity classification |
| Scope determination | Affected systems |
| Team activation | Response team engaged |
| Communication | Stakeholder notification |

### 3. Containment
| Strategy | Application |
|----------|-------------|
| Short-term | Immediate isolation |
| Long-term | Remediation planning |
| Evidence | Preserve forensics |

### 4. Eradication
| Activity | Purpose |
|----------|---------|
| Root cause | Identify source |
| Remove threat | Eliminate malware/access |
| Patch/update | Close vulnerabilities |

### 5. Recovery
| Step | Activity |
|------|----------|
| Restore | Rebuild affected systems |
| Verify | Confirm security |
| Monitor | Enhanced surveillance |
| Resume | Normal operations |

### 6. Post-Incident
| Activity | Timing |
|----------|--------|
| Report | Within 5 days |
| Lessons learned | Within 2 weeks |
| Improvements | Within 30 days |

## Related Documents

- [Information Security Policy](../Policies/Information_Security_Policy.md)
- [Business Continuity](../../Operations/Policies/)
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
    
    for unit_name, content in MORE_CONTENT.items():
        for content_type, files in content.items():
            created = create_content(unit_name, content_type, files)
            for f in created:
                print(f"✓ Created: {f}")
                total_created += 1
    
    print(f"\nTotal files created: {total_created}")

if __name__ == "__main__":
    main()
