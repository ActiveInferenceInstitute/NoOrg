#!/usr/bin/env python3
"""
Add domain-specific content for remaining units:
Intelligence, Compliance, Governance, Strategy, Research, Innovation
"""

from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

UNIT_CONTENT = {
    "Intelligence": {
        "Policies": [
            ("Competitive_Intelligence_Policy.md", """# Competitive Intelligence Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Intelligence

## Purpose

Establishes guidelines for ethical collection and use of competitive intelligence.

## Scope

Applies to all activities related to gathering, analyzing, and disseminating competitive information.

## Ethical Standards

| Principle | Application |
|-----------|-------------|
| Legality | Comply with all laws |
| Honesty | No misrepresentation |
| Transparency | Disclose identity when asked |
| Respect | Others' confidential information |
| Professionalism | Industry best practices |

## Information Sources

### Acceptable Sources
| Type | Examples |
|------|----------|
| Public | Annual reports, press releases |
| Industry | Trade publications, conferences |
| Market | Analyst reports, research firms |
| Primary | Customer feedback, sales intel |
| Digital | Websites, social media |

### Prohibited Activities
- Industrial espionage
- Misrepresentation of identity
- Bribing for information
- Stealing trade secrets
- Hacking or unauthorized access
- Violating NDAs

## Intelligence Process

### Collection
| Activity | Standard |
|----------|----------|
| Source identification | Document origins |
| Information gathering | Ethical methods only |
| Verification | Cross-reference data |
| Documentation | Maintain records |

### Analysis
| Method | Application |
|--------|-------------|
| SWOT | Competitor assessment |
| Porter's Five Forces | Industry analysis |
| Benchmarking | Performance comparison |
| Scenario planning | Future projections |

### Dissemination
| Audience | Content |
|----------|---------|
| Executive | Strategic insights |
| Sales | Competitive positioning |
| Product | Feature comparison |
| Marketing | Market intelligence |

## Governance

| Activity | Frequency |
|----------|-----------|
| Ethics review | Annual |
| Source audit | Quarterly |
| Training | Annual |
| Policy review | Annual |

## Related Documents

- [Business Strategy](../../Strategy/)
- [Ethics Policy](../../Governance/Policies/)
"""),
            ("Market_Research_Policy.md", """# Market Research Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Intelligence

## Purpose

Establishes standards for conducting market research to support strategic decisions.

## Research Types

| Type | Purpose | Methods |
|------|---------|---------|
| Primary | Original data | Surveys, interviews, focus groups |
| Secondary | Existing data | Reports, databases, publications |
| Quantitative | Statistical insight | Large-scale surveys, analytics |
| Qualitative | Deep understanding | Interviews, observations |

## Research Standards

### Quality Criteria
| Criterion | Standard |
|-----------|----------|
| Validity | Measures what intended |
| Reliability | Consistent results |
| Representativeness | Appropriate sample |
| Objectivity | Unbiased approach |
| Timeliness | Current and relevant |

### Ethical Standards
| Requirement | Implementation |
|-------------|----------------|
| Consent | Informed participation |
| Privacy | Data protection |
| Anonymity | When promised |
| Transparency | Research purpose |
| No harm | Participant welfare |

## Research Process

### Phase 1: Planning
| Activity | Output |
|----------|--------|
| Define objectives | Research brief |
| Design methodology | Research plan |
| Budget and timeline | Project plan |
| Vendor selection | If outsourced |

### Phase 2: Execution
| Activity | Standard |
|----------|----------|
| Data collection | Per methodology |
| Quality control | Ongoing monitoring |
| Progress tracking | Regular updates |

### Phase 3: Analysis
| Activity | Output |
|----------|--------|
| Data processing | Clean dataset |
| Statistical analysis | Findings |
| Interpretation | Insights |
| Recommendations | Actionable advice |

### Phase 4: Reporting
| Element | Content |
|---------|---------|
| Executive summary | Key findings |
| Methodology | Research approach |
| Findings | Detailed results |
| Recommendations | Suggested actions |
| Appendices | Supporting data |

## Related Documents

- [Competitive Intelligence](./Competitive_Intelligence_Policy.md)
- [Strategy](../../Strategy/)
"""),
        ],
    },
    "Compliance": {
        "Policies": [
            ("Regulatory_Compliance_Policy.md", """# Regulatory Compliance Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Compliance Officer

## Purpose

Establishes the framework for ensuring compliance with all applicable laws and regulations.

## Compliance Framework

### Core Elements
| Element | Description |
|---------|-------------|
| Governance | Oversight structure |
| Risk Assessment | Identify compliance risks |
| Policies | Written standards |
| Training | Employee education |
| Monitoring | Ongoing surveillance |
| Response | Issue management |
| Improvement | Continuous enhancement |

## Regulatory Scope

### Key Regulatory Areas
| Area | Examples |
|------|----------|
| Financial | SEC, SOX, banking regulations |
| Privacy | GDPR, CCPA, data protection |
| Employment | Labor laws, safety regulations |
| Industry | Sector-specific requirements |
| Environmental | EPA, sustainability |
| International | Trade, anti-corruption |

## Compliance Responsibilities

| Role | Responsibility |
|------|----------------|
| Board | Oversight, accountability |
| CCO | Program leadership |
| Compliance Team | Day-to-day management |
| Business Units | First line compliance |
| All Employees | Follow policies |

## Risk Assessment

### Assessment Process
| Step | Activity |
|------|----------|
| Identify | List regulatory requirements |
| Assess | Evaluate current compliance |
| Gap analysis | Identify deficiencies |
| Prioritize | Rank by risk |
| Remediate | Address gaps |

### Risk Rating
| Rating | Definition | Action |
|--------|------------|--------|
| High | Significant exposure | Immediate action |
| Medium | Moderate risk | Planned remediation |
| Low | Minor issues | Routine management |

## Monitoring and Testing

| Activity | Frequency |
|----------|-----------|
| Compliance reviews | Quarterly |
| Control testing | Semi-annually |
| External audits | Annually |
| Regulatory exams | As required |

## Issue Management

| Step | Timeline |
|------|----------|
| Detection | Immediate reporting |
| Assessment | 24-48 hours |
| Remediation | Per action plan |
| Root cause | Within 2 weeks |
| Closure | Upon completion |

## Related Documents

- [Ethics Policy](../../Governance/Policies/)
- [Audit](../../Audit/)
"""),
            ("Anti_Corruption_Policy.md", """# Anti-Corruption Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Compliance Officer

## Purpose

Establishes zero tolerance for bribery and corruption in all business activities.

## Scope

Applies to all employees, officers, directors, agents, and third parties acting on behalf of the organization.

## Prohibited Conduct

### Bribery
| Type | Prohibition |
|------|-------------|
| Active | Offering, promising, giving |
| Passive | Requesting, accepting |
| Direct | Personal payments |
| Indirect | Through third parties |

### Corrupt Payments
| Prohibited | Examples |
|------------|----------|
| Bribes | Cash, gifts for decisions |
| Kickbacks | Rebates for business |
| Facilitation | Payments to expedite |
| Political | Improper contributions |

## Government Interactions

### Public Officials
| Standard | Requirement |
|----------|-------------|
| Approval | Senior management |
| Documentation | Full records |
| Gifts | Generally prohibited |
| Entertainment | Modest and appropriate |

### Lobbying
| Requirement | Standard |
|-------------|----------|
| Registration | As required by law |
| Disclosure | Transparent reporting |
| Approval | Legal review |

## Third Party Due Diligence

### Assessment
| Step | Activity |
|------|----------|
| Screening | Background check |
| Risk assessment | Corruption risk rating |
| Due diligence | Appropriate to risk |
| Approval | Documented decision |

### Ongoing Monitoring
| Activity | Frequency |
|----------|-----------|
| Certification | Annual |
| Re-assessment | Per policy |
| Audit | Risk-based |

## Gifts and Entertainment

| Category | Standard |
|----------|----------|
| Gifts given | < $100, no government officials |
| Gifts received | Modest, documented |
| Entertainment | Reasonable, documented |
| Travel | Pre-approved only |

## Reporting and Investigation

| Activity | Process |
|----------|---------|
| Reporting | Hotline, management |
| Investigation | Compliance-led |
| Discipline | Per policy |
| External reporting | As required |

## Related Documents

- [Regulatory Compliance](./Regulatory_Compliance_Policy.md)
- [Third Party Management](../../Procurement/)
"""),
        ],
    },
    "Strategy": {
        "Policies": [
            ("Strategic_Planning_Framework_Policy.md", """# Strategic Planning Framework Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Strategy Officer

## Purpose

Establishes the framework and process for organizational strategic planning.

## Strategic Framework

### Vision, Mission, Values
| Element | Purpose |
|---------|---------|
| Vision | Future aspiration |
| Mission | Core purpose |
| Values | Guiding principles |

### Strategy Components
| Level | Scope | Horizon |
|-------|-------|---------|
| Corporate | Enterprise direction | 5-10 years |
| Business | Unit strategy | 3-5 years |
| Functional | Department plans | 1-3 years |
| Operational | Execution plans | Annual |

## Strategic Planning Process

### Phase 1: Assessment
| Activity | Output |
|----------|--------|
| Environmental scan | Market analysis |
| Internal assessment | Capability review |
| Stakeholder input | Perspectives |
| Performance review | Current state |

### Phase 2: Strategy Formulation
| Activity | Output |
|----------|--------|
| Vision/mission review | Updated statements |
| Strategic options | Alternative strategies |
| Strategy selection | Chosen direction |
| Goal setting | Strategic objectives |

### Phase 3: Planning
| Activity | Output |
|----------|--------|
| Initiative development | Strategic initiatives |
| Resource allocation | Budget and people |
| Timeline | Implementation roadmap |
| Metrics | KPIs and targets |

### Phase 4: Execution
| Activity | Output |
|----------|--------|
| Deployment | Cascade to organization |
| Implementation | Execute initiatives |
| Monitoring | Track progress |
| Adjustment | Course corrections |

## Planning Calendar

| Month | Activity |
|-------|----------|
| April | Environmental scan |
| May | Strategy review |
| June | Direction setting |
| July-Aug | Initiative planning |
| September | Resource allocation |
| October | Final approval |
| November | Communication |
| December | Deployment |

## Governance

| Body | Role |
|------|------|
| Board | Approve strategy |
| Executive Committee | Develop strategy |
| Strategy Team | Facilitate process |
| Business Units | Execute strategy |

## Related Documents

- [Performance Management](../Processes/)
- [Budgeting](../../Finance/Processes/)
"""),
        ],
        "Processes": [
            ("Strategic_Review_Process.md", """# Strategic Review Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Strategy Officer

## Purpose

Defines the process for reviewing strategic performance and making adjustments.

## Review Types

| Type | Frequency | Focus |
|------|-----------|-------|
| Operational | Monthly | Execution progress |
| Quarterly | Quarterly | Strategic metrics |
| Annual | Annually | Strategy refresh |
| Triggered | As needed | Major changes |

## Monthly Review

### Scope
| Element | Content |
|---------|---------|
| Initiative status | Progress, issues |
| Key metrics | Leading indicators |
| Risks | Emerging concerns |
| Actions | Decisions needed |

### Process
| Step | Activity |
|------|----------|
| Data collection | Gather metrics |
| Analysis | Trend and variance |
| Review meeting | Leadership discussion |
| Actions | Assign follow-ups |

## Quarterly Review

### Strategic Assessment
| Dimension | Evaluation |
|-----------|------------|
| Goal progress | Achievement vs. plan |
| Initiative health | On track, at risk |
| Market conditions | Changes, implications |
| Competitive position | Relative standing |
| Resource adequacy | Capacity vs. demand |

### Review Structure
| Duration | Content |
|----------|---------|
| Hour 1 | Performance review |
| Hour 2 | Strategic issues |
| Hour 3 | Decisions and actions |

## Annual Review

### Comprehensive Assessment
| Area | Analysis |
|------|----------|
| Strategy validity | Is direction still right? |
| Goal achievement | Did we hit targets? |
| Market changes | What shifted? |
| Capability gaps | What's needed? |
| Resource needs | Investment priorities |

### Outputs
| Deliverable | Purpose |
|-------------|---------|
| Performance report | Year in review |
| Strategy update | Adjustments needed |
| Planning input | Next year priorities |
| Lessons learned | Improvement insights |

## Triggered Reviews

| Trigger | Response |
|---------|----------|
| Major market shift | Strategy reassessment |
| Competitive threat | Competitive response |
| M&A opportunity | Strategic evaluation |
| Performance crisis | Turnaround review |

## Related Documents

- [Strategic Planning](../Policies/)
- [Performance Management](../../Governance/)
"""),
        ],
    },
    "Innovation": {
        "Policies": [
            ("Innovation_Management_Policy.md", """# Innovation Management Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Innovation Officer

## Purpose

Establishes the framework for driving innovation across the organization.

## Innovation Philosophy

| Principle | Application |
|-----------|-------------|
| Culture | Innovation is everyone's job |
| Experimentation | Learn through testing |
| Tolerance | Accept intelligent failures |
| Speed | Quick iteration cycles |
| Customer focus | Solve real problems |

## Innovation Types

| Type | Definition | Examples |
|------|------------|----------|
| Incremental | Continuous improvement | Process optimization |
| Adjacent | New markets/products | Extensions, adjacencies |
| Disruptive | Breakthrough change | New business models |

## Innovation Process

### Ideation
| Activity | Output |
|----------|--------|
| Trend scanning | Opportunity areas |
| Brainstorming | Raw ideas |
| Customer research | Problem insights |
| Crowdsourcing | Employee ideas |

### Evaluation
| Criterion | Weight |
|-----------|--------|
| Strategic fit | 25% |
| Customer value | 25% |
| Feasibility | 20% |
| Market potential | 20% |
| Differentiation | 10% |

### Development
| Stage | Gate |
|-------|------|
| Concept | Problem-solution fit |
| Prototype | Technical feasibility |
| Pilot | Market validation |
| Scale | Business case |

### Commercialization
| Activity | Owner |
|----------|-------|
| Launch planning | Product/Marketing |
| Go-to-market | Marketing/Sales |
| Operations readiness | Operations |
| Scale operations | Business units |

## Innovation Portfolio

### Portfolio Balance
| Type | Target |
|------|--------|
| Core | 70% |
| Adjacent | 20% |
| Transformational | 10% |

### Investment Criteria
| Stage | Funding |
|-------|---------|
| Ideation | Minimal |
| Concept | Seed budget |
| Prototype | Project funding |
| Pilot | Scale budget |
| Launch | Full investment |

## Governance

| Body | Role |
|------|------|
| Innovation Council | Strategic oversight |
| Innovation Team | Day-to-day management |
| Business Units | Implementation |
| All Employees | Ideation, participation |

## Related Documents

- [R&D](../../ResearchDevelopment/)
- [Product Management](../../ProductManagement/)
"""),
        ],
        "Processes": [
            ("Idea_to_Innovation_Process.md", """# Idea to Innovation Process

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Innovation Manager

## Purpose

Defines the end-to-end process for turning ideas into innovations.

## Process Overview

```
Capture → Evaluate → Develop → Test → Launch → Scale
```

## Stage 1: Idea Capture

### Submission Channels
| Channel | Method |
|---------|--------|
| Portal | Online submission |
| Events | Innovation challenges |
| Workshops | Facilitated sessions |
| Suggestion | Informal ideas |

### Idea Requirements
| Element | Description |
|---------|-------------|
| Problem | What problem does it solve? |
| Solution | How does it work? |
| Value | Who benefits and how? |
| Feasibility | Can we build it? |
| Differentiation | What's unique? |

## Stage 2: Evaluation

### Initial Screening
| Criterion | Threshold |
|-----------|-----------|
| Alignment | Strategic fit |
| Novelty | Not duplicative |
| Feasibility | Technically possible |
| Market | Customer need exists |

### Deep Evaluation
| Assessment | Method |
|------------|--------|
| Market analysis | Research, validation |
| Technical review | Engineering assessment |
| Financial model | Business case |
| Risk assessment | Risk evaluation |

## Stage 3: Development

### Concept Development
| Activity | Duration |
|----------|----------|
| Problem definition | 1-2 weeks |
| Solution design | 2-4 weeks |
| Prototype | 4-8 weeks |
| Testing | 2-4 weeks |

### Resource Allocation
| Resource | Source |
|----------|--------|
| Funding | Innovation budget |
| People | Dedicated or shared |
| Facilities | Lab, workspace |
| Technology | Tools, platforms |

## Stage 4: Testing

### Validation Methods
| Method | Purpose |
|--------|---------|
| User testing | Usability, value |
| Beta launch | Market response |
| A/B testing | Optimization |
| Pivot or proceed | Decision point |

## Stage 5: Launch

### Go-to-Market
| Activity | Owner |
|----------|-------|
| Launch plan | Product + Marketing |
| Communications | Marketing |
| Sales enablement | Sales |
| Operations readiness | Operations |

## Stage 6: Scale

### Scaling Activities
| Activity | Focus |
|----------|-------|
| Process optimization | Efficiency |
| Capacity building | Scale operations |
| Geographic expansion | New markets |
| Continuous improvement | Iteration |

## Related Documents

- [Innovation Policy](../Policies/)
- [Product Development](../../ProductManagement/)
"""),
        ],
    },
    "Research": {
        "Policies": [
            ("Research_Integrity_Policy.md", """# Research Integrity Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Research

## Purpose

Establishes standards for ethical and responsible research conduct.

## Integrity Principles

| Principle | Application |
|-----------|-------------|
| Honesty | Truthful reporting |
| Objectivity | Unbiased analysis |
| Transparency | Open methodology |
| Reproducibility | Verifiable results |
| Accountability | Responsible conduct |

## Research Standards

### Planning and Design
| Requirement | Standard |
|-------------|----------|
| Protocol | Documented methodology |
| Review | Appropriate oversight |
| Resources | Adequate capacity |
| Ethics | IRB/ethics approval |

### Data Management
| Standard | Requirement |
|----------|-------------|
| Collection | Accurate recording |
| Storage | Secure preservation |
| Retention | Per requirements |
| Access | Controlled appropriately |
| Sharing | Per data sharing policy |

### Publication and Reporting
| Standard | Requirement |
|----------|-------------|
| Accuracy | Truthful representation |
| Attribution | Proper credit |
| Disclosure | Conflicts of interest |
| Peer review | Quality assurance |

## Misconduct

### Prohibited Conduct
| Type | Definition |
|------|------------|
| Fabrication | Inventing data or results |
| Falsification | Manipulating data |
| Plagiarism | Misappropriating work |
| Misrepresentation | False claims |

### Reporting
| Concern | Process |
|---------|---------|
| Suspected misconduct | Report to research integrity |
| Investigation | Per misconduct policy |
| Findings | Appropriate action |
| Remediation | Correct the record |

## Intellectual Property

| Type | Management |
|------|------------|
| Inventions | IP disclosure |
| Publications | Per publication policy |
| Data | Per data policy |
| Collaborations | Per agreements |

## Related Documents

- [IP Management](../../Legal/IntellectualProperty/)
- [Ethics](../../Governance/Policies/)
"""),
        ],
    },
    "Executive": {
        "Policies": [
            ("Executive_Decision_Making_Policy.md", """# Executive Decision Making Policy

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Chief Executive Officer

## Purpose

Establishes the framework for executive-level decision making.

## Decision Authority

### Decision Categories
| Category | Authority | Examples |
|----------|-----------|----------|
| Strategic | Board/CEO | Vision, major M&A |
| Operational | Executive Team | Policy, major contracts |
| Tactical | Business Units | Implementation |
| Delegated | Managers | Day-to-day |

### Authority Matrix
| Decision Value | Authority |
|----------------|-----------|
| > $10M | Board |
| $1M - $10M | CEO |
| $250K - $1M | Executive Team |
| $100K - $250K | VP |
| < $100K | Director |

## Decision Process

### Strategic Decisions
| Step | Activity |
|------|----------|
| Analysis | Comprehensive assessment |
| Options | Multiple alternatives |
| Recommendation | Management proposal |
| Review | Executive discussion |
| Approval | CEO/Board decision |

### RACI Framework
| Role | Definition |
|------|------------|
| Responsible | Does the work |
| Accountable | Final authority |
| Consulted | Input provided |
| Informed | Kept updated |

## Executive Committee

### Composition
| Role | Function |
|------|----------|
| CEO | Chair, final decisions |
| CFO | Financial oversight |
| COO | Operations oversight |
| CXOs | Functional expertise |
| GC | Legal guidance |

### Meeting Cadence
| Meeting | Frequency |
|---------|-----------|
| Executive Committee | Weekly |
| Strategy session | Monthly |
| Board preparation | Quarterly |
| Annual planning | Annually |

## Documentation Requirements

| Decision Type | Documentation |
|---------------|---------------|
| Board-level | Board minutes |
| Executive | Decision memo |
| Major contracts | Approval form |
| Policy changes | Policy document |

## Related Documents

- [Governance](../../Governance/)
- [Board](../../BoardOfDirectors/)
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
