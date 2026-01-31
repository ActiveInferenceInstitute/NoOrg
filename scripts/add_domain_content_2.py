#!/usr/bin/env python3
"""
Add additional domain-specific content for more units.
"""

from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

ADDITIONAL_CONTENT = {
    "CustomerSupport": {
        "Policies": [
            ("Customer_Service_Standards_Policy.md", """# Customer Service Standards Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Customer Support

## Purpose

Establishes service standards to ensure consistent, high-quality customer experiences.

## Service Standards

### Response Time Standards
| Channel | Initial Response | Resolution Target |
|---------|------------------|-------------------|
| Phone | < 30 seconds | First call resolution |
| Email | < 4 hours | 24 hours |
| Chat | < 1 minute | During session |
| Social | < 1 hour | 4 hours |
| Ticket | < 8 hours | Based on priority |

### Priority Levels
| Priority | Definition | Response | Resolution |
|----------|------------|----------|------------|
| P1 - Critical | Service unavailable | 15 min | 4 hours |
| P2 - High | Major functionality impacted | 1 hour | 8 hours |
| P3 - Medium | Minor impact | 4 hours | 24 hours |
| P4 - Low | General inquiry | 24 hours | 5 days |

## Quality Standards

### Customer Satisfaction
| Metric | Target | Measurement |
|--------|--------|-------------|
| CSAT | > 90% | Post-interaction survey |
| NPS | > 50 | Quarterly survey |
| First Contact Resolution | > 75% | Ticket analysis |
| Escalation Rate | < 5% | Weekly review |

### Interaction Quality
| Standard | Requirement |
|----------|-------------|
| Professionalism | Courteous, respectful |
| Knowledge | Accurate information |
| Empathy | Understanding concerns |
| Follow-through | Complete resolution |

## Service Recovery

| Situation | Action |
|-----------|--------|
| Service failure | Apologize, resolve, follow-up |
| Customer complaint | Acknowledge, investigate, respond |
| Escalation | Manager involvement within 1 hour |
| Compensation | Per guidelines, document |

## Training Requirements

| Role | Initial Training | Ongoing |
|------|------------------|---------|
| Agent | 2 weeks | Monthly updates |
| Senior Agent | 3 weeks | Bi-weekly coaching |
| Team Lead | 4 weeks | Leadership training |

## Related Documents

- [Escalation Process](../Processes/Escalation_Process.md)
- [Quality Assurance](../../QualityAssurance/)
"""),
            ("Knowledge_Base_Policy.md", """# Knowledge Base Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Knowledge Manager

## Purpose

Establishes standards for maintaining and using the customer support knowledge base.

## Scope

Applies to all knowledge base content used by support agents and made available to customers.

## Content Standards

### Quality Criteria
| Criterion | Standard |
|-----------|----------|
| Accuracy | 100% factual |
| Clarity | 8th grade reading level |
| Completeness | All steps included |
| Currency | Updated within 30 days |
| Accessibility | ADA compliant |

### Article Structure
1. **Title** - Clear problem/topic description
2. **Summary** - Brief overview
3. **Symptoms** - Problem indicators
4. **Solution** - Step-by-step resolution
5. **Related Articles** - Cross-references
6. **Metadata** - Tags, category, date

## Content Lifecycle

| Stage | Activity | Owner |
|-------|----------|-------|
| Draft | Content creation | SME |
| Review | Quality check | Knowledge Manager |
| Publish | Make live | Knowledge Manager |
| Maintain | Regular updates | Content owner |
| Archive | Remove outdated | Knowledge Manager |

## Governance

### Ownership
| Content Type | Owner |
|--------------|-------|
| Product documentation | Product Management |
| Troubleshooting | Support |
| Policies | Compliance |
| FAQs | Knowledge Manager |

### Review Cycle
| Content Type | Review Frequency |
|--------------|------------------|
| High-traffic | Monthly |
| Standard | Quarterly |
| Archive candidate | Semi-annually |

## Metrics

| Metric | Target |
|--------|--------|
| Article usage | Track trends |
| Deflection rate | > 30% |
| Article rating | > 4/5 |
| Search success | > 80% |

## Related Documents

- [Customer Service Standards](./Customer_Service_Standards_Policy.md)
- [Content Management](../../KnowledgeManagement/)
"""),
        ],
        "Processes": [
            ("Escalation_Process.md", """# Escalation Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Customer Support Manager

## Purpose

Defines the process for escalating customer issues that require specialized attention.

## Escalation Triggers

| Trigger | Action |
|---------|--------|
| Technical complexity | Tier 2 escalation |
| Customer request | Manager escalation |
| Policy exception | Supervisor escalation |
| Legal/compliance | Legal team |
| Executive customer | VIP process |

## Escalation Tiers

### Tier 1 - Frontline Support
- Handle standard inquiries
- Follow knowledge base
- Escalate per guidelines

### Tier 2 - Specialized Support
- Complex technical issues
- Product expertise
- Extended troubleshooting

### Tier 3 - Engineering/Product
- Bug investigation
- Product limitations
- Feature requests

### Management Escalation
- Service recovery
- Policy exceptions
- Customer retention

## Escalation Process

| Step | Activity | Owner |
|------|----------|-------|
| 1 | Document issue completely | Agent |
| 2 | Attempt resolution | Agent |
| 3 | Identify escalation path | Agent |
| 4 | Warm transfer or assign | Agent |
| 5 | Accept and review | Escalation team |
| 6 | Resolve and document | Escalation team |
| 7 | Follow up with customer | Owner |

## SLAs by Escalation Type

| Type | Acknowledge | Update | Resolve |
|------|-------------|--------|---------|
| Technical Tier 2 | 1 hour | 4 hours | 24 hours |
| Technical Tier 3 | 4 hours | Daily | 5 days |
| Management | 30 min | 2 hours | 8 hours |
| Executive VIP | 15 min | 1 hour | 4 hours |

## Documentation Requirements

All escalations must include:
- Customer information
- Issue summary
- Steps taken
- Desired outcome
- Priority justification

## Related Documents

- [Customer Service Standards](../Policies/Customer_Service_Standards_Policy.md)
- [SLA Management](../Policies/)
"""),
        ],
    },
    "QualityAssurance": {
        "Policies": [
            ("Quality_Management_Policy.md", """# Quality Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Quality Assurance

## Purpose

Establishes the quality management framework to ensure products and services meet defined standards.

## Quality Principles

| Principle | Application |
|-----------|-------------|
| Customer Focus | Meet customer requirements |
| Leadership | Establish quality culture |
| Engagement | Everyone contributes |
| Process Approach | Systematic management |
| Improvement | Continuous enhancement |
| Evidence-Based | Data-driven decisions |
| Relationship | Stakeholder collaboration |

## Quality Standards

### Product Quality
| Dimension | Metric | Target |
|-----------|--------|--------|
| Functionality | Defect rate | < 0.1% |
| Reliability | Uptime | 99.9% |
| Performance | Response time | < 200ms |
| Usability | Task success | > 95% |
| Security | Vulnerabilities | Zero critical |

### Service Quality
| Dimension | Metric | Target |
|-----------|--------|--------|
| Timeliness | On-time delivery | > 95% |
| Accuracy | Error rate | < 1% |
| Satisfaction | CSAT | > 90% |
| Consistency | Variance | Within tolerance |

## Quality Assurance Activities

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Requirements review | Per project | QA Lead |
| Design review | Per milestone | QA Team |
| Testing | Per release | QA Team |
| Code review | Per change | Development |
| Audit | Quarterly | Internal Audit |

## Quality Control

### Testing Levels
| Level | Scope | Responsibility |
|-------|-------|----------------|
| Unit | Components | Developers |
| Integration | Interfaces | QA |
| System | End-to-end | QA |
| UAT | Business validation | Users |
| Performance | Load/stress | QA |

### Defect Management
| Severity | Response | Fix Timeline |
|----------|----------|--------------|
| Critical | Immediate | < 24 hours |
| High | Urgent | < 1 week |
| Medium | Planned | Next release |
| Low | Backlog | As capacity |

## Related Documents

- [Testing Process](../Processes/Testing_Process.md)
- [Development Standards](../../Development/)
"""),
            ("Continuous_Improvement_Policy.md", """# Continuous Improvement Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Quality Assurance Director

## Purpose

Establishes a framework for systematic identification and implementation of improvements.

## Improvement Methodology

### PDCA Cycle
| Phase | Activities |
|-------|------------|
| Plan | Identify opportunity, analyze, develop plan |
| Do | Implement on small scale |
| Check | Measure results, compare to expectations |
| Act | Standardize or refine approach |

### Six Sigma DMAIC
| Phase | Focus |
|-------|-------|
| Define | Problem statement, scope, goals |
| Measure | Current performance baseline |
| Analyze | Root cause identification |
| Improve | Solution development and testing |
| Control | Sustaining improvements |

## Improvement Sources

| Source | Input |
|--------|-------|
| Customer feedback | Complaints, suggestions |
| Employee ideas | Kaizen suggestions |
| Audit findings | Non-conformances |
| Performance data | Metric analysis |
| Benchmarking | Industry comparisons |

## Idea Management

### Submission
| Step | Activity |
|------|----------|
| Identify | Recognize improvement opportunity |
| Document | Complete improvement proposal |
| Submit | Enter in idea management system |
| Review | Initial assessment |

### Evaluation Criteria
| Criterion | Weight |
|-----------|--------|
| Impact | 30% |
| Feasibility | 25% |
| Cost/Benefit | 25% |
| Alignment | 20% |

### Implementation Priority
| Priority | Criteria |
|----------|----------|
| Quick Win | Low effort, high impact |
| Major Project | High effort, high impact |
| Fill-In | Low effort, low impact |
| Consider Later | High effort, low impact |

## Recognition

| Achievement | Recognition |
|-------------|-------------|
| Idea submitted | Acknowledgment |
| Idea implemented | Certificate |
| Significant impact | Award + bonus |
| Best improvement | Annual recognition |

## Related Documents

- [Quality Management Policy](./Quality_Management_Policy.md)
- [Innovation](../../Innovation/)
"""),
        ],
        "Processes": [
            ("Testing_Process.md", """# Testing Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** QA Manager

## Purpose

Defines the standard testing process for all software releases.

## Testing Lifecycle

```
Planning → Design → Execution → Reporting → Closure
```

## Test Planning

### Planning Inputs
| Input | Source |
|-------|--------|
| Requirements | Product Management |
| Design documents | Development |
| Risk assessment | QA |
| Schedule | Project Management |

### Test Plan Contents
- Scope and objectives
- Test strategy
- Resource requirements
- Schedule
- Entry/exit criteria
- Risks and mitigations

## Test Design

### Test Case Development
| Element | Description |
|---------|-------------|
| ID | Unique identifier |
| Title | Brief description |
| Preconditions | Required state |
| Steps | Actions to perform |
| Expected Results | Validation criteria |
| Priority | Execution priority |

### Coverage Requirements
| Coverage Type | Target |
|---------------|--------|
| Requirement | 100% |
| Functional | 100% critical paths |
| Integration | All interfaces |
| Non-functional | Per requirements |

## Test Execution

### Execution Phases
| Phase | Focus |
|-------|-------|
| Smoke Test | Basic functionality |
| Functional Test | Feature verification |
| Integration Test | Interface validation |
| Regression Test | No new issues |
| UAT | Business acceptance |

### Defect Workflow
```
New → Assigned → In Progress → Resolved → Verified → Closed
```

## Test Reporting

### Status Report Contents
| Metric | Description |
|--------|-------------|
| Test progress | Executed vs planned |
| Defect summary | Open, closed, by severity |
| Coverage | Requirements tested |
| Risk status | Issues and mitigations |

### Exit Criteria
| Criterion | Requirement |
|-----------|-------------|
| Test execution | 100% planned tests |
| Defects | No critical/high open |
| Coverage | All requirements tested |
| Approval | Sign-off obtained |

## Related Documents

- [Quality Management Policy](../Policies/Quality_Management_Policy.md)
- [Release Process](../../Development/Processes/)
"""),
        ],
    },
    "Operations": {
        "Policies": [
            ("Business_Continuity_Policy.md", """# Business Continuity Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Operating Officer

## Purpose

Establishes the framework for maintaining business operations during disruptive events.

## Scope

Applies to all business functions, systems, and facilities.

## Business Impact Analysis

### Critical Functions
| Function | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Core operations | 4 hours | 1 hour | P1 |
| Customer service | 8 hours | 4 hours | P1 |
| Financial systems | 24 hours | 4 hours | P2 |
| HR systems | 48 hours | 24 hours | P3 |
| Administrative | 72 hours | 48 hours | P4 |

### Recovery Objectives
| Term | Definition |
|------|------------|
| RTO | Recovery Time Objective - max acceptable downtime |
| RPO | Recovery Point Objective - max acceptable data loss |
| MTPD | Maximum Tolerable Period of Disruption |

## Continuity Strategies

### Technology Recovery
| Strategy | Application |
|----------|-------------|
| Hot site | Critical systems immediate failover |
| Warm site | Important systems 4-24 hour recovery |
| Cold site | Non-critical systems extended recovery |
| Cloud-based | Elastic recovery capability |

### Workplace Recovery
| Strategy | Application |
|----------|-------------|
| Alternate site | Pre-configured backup location |
| Work from home | Remote work capability |
| Reciprocal | Partner facility arrangement |
| Mobile | Temporary workspace solutions |

## Plan Requirements

### Plan Components
- Emergency response procedures
- Crisis communication plan
- Business recovery procedures
- IT disaster recovery
- Vital records management

### Testing Schedule
| Test Type | Frequency |
|-----------|-----------|
| Tabletop exercise | Semi-annually |
| Functional test | Annually |
| Full exercise | Bi-annually |
| Component tests | Quarterly |

## Governance

| Role | Responsibility |
|------|----------------|
| Executive Sponsor | Overall accountability |
| BC Coordinator | Program management |
| Recovery Teams | Function-specific plans |
| All Employees | Awareness and participation |

## Related Documents

- [Disaster Recovery Plan](../Processes/Disaster_Recovery_Process.md)
- [Crisis Communications](../../Communications/Policies/)
"""),
            ("Operational_Excellence_Policy.md", """# Operational Excellence Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Operating Officer

## Purpose

Establishes the framework for achieving and maintaining operational excellence.

## Operational Excellence Framework

### Core Elements
| Element | Focus |
|---------|-------|
| Process Excellence | Efficient, effective processes |
| Performance Management | Measurement and improvement |
| People Development | Capability building |
| Technology Enablement | Digital optimization |
| Continuous Improvement | Ongoing enhancement |

## Process Management

### Process Standards
| Standard | Requirement |
|----------|-------------|
| Documentation | All processes documented |
| Ownership | Clear process owners |
| Metrics | Key performance indicators |
| Review | Regular assessment cycle |

### Process Optimization
| Approach | Application |
|----------|-------------|
| Lean | Eliminate waste |
| Six Sigma | Reduce variation |
| Automation | Technology enablement |
| Simplification | Reduce complexity |

## Performance Management

### KPI Framework
| Category | Examples |
|----------|----------|
| Quality | Defect rates, accuracy |
| Efficiency | Cycle time, productivity |
| Cost | Unit cost, variance |
| Customer | Satisfaction, retention |
| Safety | Incident rate |

### Performance Review
| Frequency | Focus |
|-----------|-------|
| Daily | Operational metrics |
| Weekly | Performance trends |
| Monthly | Strategic metrics |
| Quarterly | Goal progress |

## Operational Governance

### Review Meetings
| Meeting | Frequency | Focus |
|---------|-----------|-------|
| Operations Review | Weekly | Performance |
| Process Review | Monthly | Improvement |
| Strategic Review | Quarterly | Alignment |

### Escalation
| Issue | Escalation Path |
|-------|-----------------|
| Performance gap | Manager → Director |
| Process failure | Process owner → VP |
| Strategic issue | VP → COO |

## Related Documents

- [Business Continuity](./Business_Continuity_Policy.md)
- [Quality Management](../../QualityAssurance/Policies/)
"""),
        ],
        "Processes": [
            ("Incident_Management_Process.md", """# Incident Management Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Operations Manager

## Purpose

Defines the process for managing operational incidents to minimize impact and restore normal operations.

## Incident Classification

| Priority | Impact | Urgency | Response |
|----------|--------|---------|----------|
| P1 | Critical | Immediate | 15 min |
| P2 | High | Urgent | 1 hour |
| P3 | Medium | Moderate | 4 hours |
| P4 | Low | Low | 24 hours |

## Incident Lifecycle

```
Detection → Triage → Response → Resolution → Review
```

## Process Steps

### 1. Detection
| Source | Method |
|--------|--------|
| Monitoring | Automated alerts |
| Users | Reported issues |
| Staff | Observed problems |
| Vendors | Partner notifications |

### 2. Triage
| Activity | Output |
|----------|--------|
| Initial assessment | Incident record |
| Categorization | Incident type |
| Prioritization | Priority level |
| Assignment | Response team |

### 3. Response
| Activity | Responsibility |
|----------|----------------|
| Investigate | Response team |
| Diagnose | Subject matter experts |
| Communicate | Incident manager |
| Contain | Response team |

### 4. Resolution
| Step | Activity |
|------|----------|
| Fix | Implement solution |
| Verify | Confirm resolution |
| Document | Record actions |
| Close | Update incident record |

### 5. Review
| Frequency | Scope |
|-----------|-------|
| Major incidents | Individual PIR |
| Weekly | Incident trends |
| Monthly | Process improvements |

## Escalation Matrix

| Condition | Escalation |
|-----------|------------|
| No response | Auto-escalate after SLA |
| Major incident | Immediate management |
| Extended outage | Executive notification |

## Related Documents

- [Business Continuity](../Policies/Business_Continuity_Policy.md)
- [IT Disaster Recovery](../../InformationTechnology/Policies/)
"""),
        ],
    },
    "TechnologyAdvisoryBoard": {
        "Policies": [
            ("Technology_Strategy_Policy.md", """# Technology Strategy Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Technology Advisory Board Chair

## Purpose

Establishes guidelines for technology strategy development and governance.

## Strategic Framework

### Technology Pillars
| Pillar | Focus Area |
|--------|------------|
| Digital Transformation | Business digitization |
| Infrastructure | Foundation systems |
| Data & Analytics | Decision support |
| Security | Protection and compliance |
| Innovation | Emerging technologies |

### Investment Principles
| Principle | Application |
|-----------|-------------|
| Business Alignment | Support strategic objectives |
| TCO Analysis | Total cost consideration |
| Risk Balance | Innovation vs. stability |
| Scalability | Growth capacity |
| Sustainability | Long-term viability |

## Technology Evaluation

### Evaluation Criteria
| Criterion | Weight |
|-----------|--------|
| Strategic fit | 25% |
| Technical merit | 20% |
| Cost/benefit | 20% |
| Risk assessment | 15% |
| Implementation feasibility | 10% |
| Vendor viability | 10% |

### Technology Radar
| Zone | Definition | Action |
|------|------------|--------|
| Adopt | Proven and recommended | Use actively |
| Trial | Promising, test at scale | Pilot projects |
| Assess | Interesting, explore | Research |
| Hold | Caution advised | Avoid new use |

## Governance Structure

### Technology Advisory Board
| Role | Responsibility |
|------|----------------|
| CTO (Chair) | Strategy leadership |
| Enterprise Architect | Technical direction |
| Business IT Leaders | Domain alignment |
| Security Officer | Risk oversight |
| Innovation Lead | Emerging tech |

### Decision Authority
| Decision Type | Authority |
|---------------|-----------|
| Strategic direction | Board |
| Major investments > $1M | Board |
| Standards and policies | Board |
| Architecture decisions | Enterprise Architect |

## Review Cadence

| Review | Frequency |
|--------|-----------|
| Strategy review | Annual |
| Technology radar | Quarterly |
| Investment review | Monthly |
| Standards update | As needed |

## Related Documents

- [Innovation Policy](../../Innovation/Policies/)
- [IT Governance](../../InformationTechnology/)
"""),
        ],
        "Processes": [
            ("Technology_Review_Process.md", """# Technology Review Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Enterprise Architect

## Purpose

Defines the process for evaluating and approving new technologies.

## Review Triggers

| Trigger | Initiator |
|---------|-----------|
| New technology request | Business unit |
| Vendor proposal | Procurement |
| Innovation initiative | R&D |
| Architecture update | EA team |
| Risk finding | Security |

## Review Process

### Phase 1: Intake
| Step | Activity | Owner |
|------|----------|-------|
| 1 | Submit request | Requester |
| 2 | Initial screening | EA team |
| 3 | Assign reviewer | EA Lead |
| 4 | Establish timeline | EA Lead |

### Phase 2: Assessment
| Dimension | Evaluation |
|-----------|------------|
| Business | Use case, value, alignment |
| Technical | Architecture fit, standards |
| Security | Risk, compliance, controls |
| Operational | Support, maintenance |
| Financial | TCO, ROI |
| Vendor | Viability, support |

### Phase 3: Proof of Concept
| Activity | Duration |
|----------|----------|
| Scope definition | 1 week |
| Environment setup | 1-2 weeks |
| Testing | 2-4 weeks |
| Results analysis | 1 week |

### Phase 4: Decision
| Outcome | Next Steps |
|---------|------------|
| Approved | Implementation planning |
| Conditional | Address concerns |
| Deferred | Future reconsideration |
| Rejected | Alternative solutions |

## Documentation Requirements

| Document | Purpose |
|----------|---------|
| Technology Assessment | Detailed evaluation |
| Architecture Review | Technical fit |
| Risk Assessment | Security evaluation |
| Business Case | Value justification |
| Recommendation | Advisory Board decision |

## Governance

| Forum | Role |
|-------|------|
| Architecture Review Board | Technical approval |
| Technology Advisory Board | Strategic approval |
| Security Committee | Risk approval |

## Related Documents

- [Technology Strategy](../Policies/Technology_Strategy_Policy.md)
- [Architecture Standards](../../InformationTechnology/Policies/)
"""),
        ],
    },
    "MarketingCommunications": {
        "Policies": [
            ("Brand_Guidelines_Policy.md", """# Brand Guidelines Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Brand Director

## Purpose

Establishes standards for consistent brand representation across all touchpoints.

## Brand Elements

### Visual Identity
| Element | Standards |
|---------|-----------|
| Logo | Primary, secondary, icon versions |
| Colors | Primary and secondary palette |
| Typography | Approved font families |
| Imagery | Photography and illustration style |
| Graphics | Icons, patterns, shapes |

### Color Palette
| Type | Usage |
|------|-------|
| Primary | Main brand colors |
| Secondary | Accent and supporting |
| Neutral | Backgrounds and text |
| Functional | Status and alerts |

### Typography
| Use | Font |
|-----|------|
| Headlines | [Brand font] |
| Body | [Body font] |
| Digital | [Web font] |
| Code | [Mono font] |

## Logo Usage

### Clear Space
- Minimum clear space = x height of logo
- No elements within clear zone
- Consistent positioning

### Minimum Size
| Application | Minimum |
|-------------|---------|
| Print | 1 inch width |
| Digital | 120 pixels |
| Favicon | 16x16 pixels |

### Prohibited Uses
- Distortion or rotation
- Unapproved colors
- Low resolution
- Busy backgrounds
- Modification

## Application Standards

### Digital
| Asset | Specification |
|-------|---------------|
| Website | Design system compliance |
| Email | Template standards |
| Social | Platform guidelines |
| Advertising | Asset requirements |

### Print
| Asset | Specification |
|-------|---------------|
| Business cards | Template |
| Presentations | Master deck |
| Publications | Style guide |
| Signage | Environmental design |

## Brand Voice

| Attribute | Description |
|-----------|-------------|
| Tone | [Brand tone] |
| Style | [Brand style] |
| Language | [Language guidelines] |
| Messaging | [Key messages] |

## Related Documents

- [Content Standards](./Content_Standards_Policy.md)
- [Legal Trademark](../../Legal/IntellectualProperty/)
"""),
            ("Content_Standards_Policy.md", """# Content Standards Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Content Director

## Purpose

Establishes standards for content creation and management across all channels.

## Content Principles

| Principle | Application |
|-----------|-------------|
| Clarity | Clear, understandable messaging |
| Accuracy | Factual, verified information |
| Consistency | Aligned with brand voice |
| Accessibility | Inclusive for all audiences |
| Relevance | Valuable to target audience |

## Writing Standards

### Style Guide
| Element | Standard |
|---------|----------|
| Voice | Active, direct |
| Tone | Professional yet approachable |
| Grammar | [Style guide reference] |
| Spelling | American English |
| Numbers | Chicago Manual of Style |

### Readability
| Audience | Target Level |
|----------|--------------|
| General public | 8th grade |
| Technical | 12th grade |
| Legal/Regulatory | Professional |

## Content Types

### Marketing Content
| Type | Review Process |
|------|----------------|
| Website | Marketing + Legal |
| Advertising | Marketing + Compliance |
| Sales materials | Marketing + Sales |
| Social media | Marketing approval |

### Corporate Content
| Type | Review Process |
|------|----------------|
| Press releases | Comms + Legal + Executive |
| Annual reports | Multiple stakeholders |
| Investor materials | IR + Legal + Compliance |

## Quality Controls

### Review Process
| Stage | Activity |
|-------|----------|
| Draft | Author self-review |
| Edit | Professional editing |
| Review | Stakeholder review |
| Approve | Final sign-off |
| Publish | Distribution |

### Approval Authority
| Content Type | Approver |
|--------------|----------|
| Routine marketing | Marketing Manager |
| Major campaigns | Marketing Director |
| External statements | Communications + Legal |
| Financial information | CFO + Legal |

## Related Documents

- [Brand Guidelines](./Brand_Guidelines_Policy.md)
- [Communications Policy](../../Communications/Policies/)
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
    
    for unit_name, content in ADDITIONAL_CONTENT.items():
        for content_type, files in content.items():
            created = create_content(unit_name, content_type, files)
            for f in created:
                print(f"✓ Created: {f}")
                total_created += 1
    
    print(f"\nTotal files created: {total_created}")

if __name__ == "__main__":
    main()
