#!/usr/bin/env python3
"""
Populate empty markdown files in units/ with comprehensive content.
Generates context-aware content based on file type and parent unit.
"""

import os
from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

def get_unit_name(file_path: Path) -> str:
    """Extract unit name from file path."""
    parts = file_path.relative_to(UNITS_DIR).parts
    return parts[0] if parts else "Unknown"

def get_unit_display_name(unit_name: str) -> str:
    """Convert camelCase/PascalCase to display name."""
    import re
    return re.sub(r'([A-Z])', r' \1', unit_name).strip()

def generate_positions_personas(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} - Positions & Personas

## Overview

This document defines the key positions and personas within the {display} unit. Each role has specific responsibilities, required competencies, and interaction patterns.

## Key Positions

### Leadership Roles

| Position | Level | Reports To | Direct Reports |
|----------|-------|------------|----------------|
| Head of {display} | Director | Executive Leadership | All {display} staff |
| Senior {display} Lead | Manager | Head of {display} | Team leads and specialists |
| {display} Manager | Manager | Senior Lead | Analysts and coordinators |

### Individual Contributor Roles

| Position | Level | Focus Area |
|----------|-------|------------|
| Senior {display} Specialist | IC3 | Complex initiatives, mentoring |
| {display} Specialist | IC2 | Core operational activities |
| {display} Analyst | IC1 | Research, analysis, support |
| {display} Coordinator | IC1 | Administrative coordination |

## Personas

### Strategic Decision Maker
- **Role Type**: Executive / Director
- **Needs**: High-level metrics, trend analysis, strategic recommendations
- **Interactions**: Quarterly reviews, executive briefings, board presentations

### Operational Manager
- **Role Type**: Manager / Lead
- **Needs**: Operational dashboards, team performance, process improvements
- **Interactions**: Weekly stand-ups, project reviews, cross-functional meetings

### Subject Matter Expert
- **Role Type**: Senior Specialist
- **Needs**: Deep domain knowledge, best practices, industry standards
- **Interactions**: Technical reviews, training sessions, consulting

### Execution Contributor
- **Role Type**: Analyst / Coordinator
- **Needs**: Clear processes, templates, guidance documentation
- **Interactions**: Daily operations, data entry, routine reporting

## Career Progression

```
Coordinator → Analyst → Specialist → Senior Specialist → Manager → Senior Lead → Head
```

## Related Documents

- [Responsibilities](./Responsibilities.md)
- [Skills & Roles](./SkillsRoles.md)
- [Unit Charter](../Charter.md)
'''

def generate_resources(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} - Resources

## Overview

This document catalogs the tools, systems, templates, and external resources available to the {display} unit.

## Internal Systems

| System | Purpose | Access Level |
|--------|---------|--------------|
| Document Management | Policy and procedure storage | All {display} staff |
| Project Tracking | Initiative management | Managers and above |
| Reporting Dashboard | Metrics and KPIs | All {display} staff |
| Communication Platform | Team collaboration | All members |

## Templates & Forms

| Template | Purpose | Location |
|----------|---------|----------|
| Standard Operating Procedure | Process documentation | `./Processes/templates/` |
| Report Template | Periodic reporting | `./Reports/templates/` |
| Meeting Minutes | Meeting documentation | `./MeetingNotes/templates/` |
| Project Brief | Initiative planning | `./Projects/templates/` |

## External Resources

### Industry Standards
- Relevant industry frameworks and standards
- Regulatory guidelines and compliance requirements
- Professional association resources

### Training Resources
- Online learning platforms
- Professional development courses
- Certification programs

### Reference Materials
- Industry publications and journals
- Best practice guides
- Benchmark reports

## Budget Allocation

| Category | Typical Allocation |
|----------|-------------------|
| Personnel | 70-80% |
| Tools & Systems | 10-15% |
| Training & Development | 5-10% |
| External Services | 5-10% |

## Vendor & Partner Resources

- Approved vendor list
- Partner integration documentation
- Service level agreements

## Related Documents

- [Responsibilities](./Responsibilities.md)
- [Skills & Roles](./SkillsRoles.md)
- [Unit Budget](../Reports/budget.md)
'''

def generate_responsibilities(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} - Responsibilities

## Overview

This document defines the core responsibilities of the {display} unit and how they align with organizational objectives.

## Primary Responsibilities

### Strategic
- Develop and maintain {display.lower()} strategy aligned with organizational goals
- Provide expert guidance to leadership on {display.lower()} matters
- Monitor industry trends and best practices
- Drive continuous improvement initiatives

### Operational
- Execute core {display.lower()} processes and procedures
- Maintain documentation and knowledge base
- Ensure compliance with policies and regulations
- Support cross-functional collaboration

### Reporting
- Prepare regular performance reports
- Track and analyze key metrics
- Communicate status to stakeholders
- Escalate issues as appropriate

## RACI Matrix

| Activity | Head | Manager | Specialist | Analyst |
|----------|------|---------|------------|---------|
| Strategy Development | A | R | C | I |
| Policy Creation | A | R | C | I |
| Process Execution | I | A | R | R |
| Reporting | A | R | C | R |
| Training | A | R | R | C |
| Compliance | A | R | R | R |

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

## Service Level Expectations

| Service | Response Time | Resolution Time |
|---------|---------------|-----------------|
| Critical Issues | < 1 hour | < 4 hours |
| High Priority | < 4 hours | < 24 hours |
| Standard Requests | < 24 hours | < 5 business days |
| Information Requests | < 48 hours | < 10 business days |

## Cross-Functional Interfaces

| Unit | Interface Type | Frequency |
|------|---------------|-----------|
| Executive | Strategic updates | Monthly |
| Finance | Budget and reporting | Quarterly |
| Governance | Policy compliance | Ongoing |
| HR | Staffing and training | As needed |

## Related Documents

- [Positions & Personas](./PositionsPersonas.md)
- [Skills & Roles](./SkillsRoles.md)
- [Processes](../Processes/)
'''

def generate_skills_roles(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} - Skills & Roles

## Overview

This document defines the competency framework and skill requirements for roles within the {display} unit.

## Core Competencies

### Technical Skills

| Skill | Beginner | Intermediate | Advanced | Expert |
|-------|----------|--------------|----------|--------|
| Domain Knowledge | Basic concepts | Working knowledge | Deep expertise | Thought leadership |
| Process Management | Follow procedures | Improve processes | Design processes | Optimize systems |
| Data Analysis | Basic reporting | Trend analysis | Predictive analytics | Strategic insights |
| Tools & Systems | User proficiency | Power user | Administrator | Architect |

### Professional Skills

| Skill | Beginner | Intermediate | Advanced | Expert |
|-------|----------|--------------|----------|--------|
| Communication | Clear writing | Presentations | Executive briefings | External speaking |
| Collaboration | Team participation | Cross-team work | Multi-unit coordination | Organizational influence |
| Problem Solving | Identify issues | Analyze root causes | Develop solutions | Strategic resolution |
| Leadership | Self-management | Team contribution | Team leadership | Organizational leadership |

## Role Requirements

### Entry Level (Analyst/Coordinator)
**Required Skills:**
- Basic domain knowledge
- Strong written and verbal communication
- Proficiency in standard office tools
- Attention to detail

**Development Focus:**
- Build technical expertise
- Learn organizational processes
- Develop analytical skills

### Mid Level (Specialist)
**Required Skills:**
- Solid domain expertise
- Project coordination experience
- Cross-functional collaboration
- Independent problem solving

**Development Focus:**
- Deepen specialization
- Build leadership skills
- Expand organizational network

### Senior Level (Senior Specialist/Manager)
**Required Skills:**
- Deep domain expertise
- Team leadership experience
- Strategic thinking
- Stakeholder management

**Development Focus:**
- Strategic influence
- Organizational impact
- External visibility

### Leadership (Head/Director)
**Required Skills:**
- Comprehensive domain mastery
- Proven leadership track record
- Executive communication
- Strategic vision

**Development Focus:**
- Organizational leadership
- Industry thought leadership
- Board-level communication

## Certification & Training

| Role Level | Recommended Certifications |
|------------|---------------------------|
| Entry | Foundation certifications, internal training |
| Mid | Professional certifications, specialized training |
| Senior | Advanced certifications, leadership programs |
| Leadership | Executive education, board governance |

## Related Documents

- [Positions & Personas](./PositionsPersonas.md)
- [Responsibilities](./Responsibilities.md)
- [Training Programs](../../TrainingDevelopment/)
'''

def generate_charter(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} Unit Charter

**Version:** 1.0
**Effective Date:** 2026-01-01
**Approved By:** Executive Committee

## 1. Purpose

The {display} unit is established to provide strategic and operational excellence in {display.lower()}-related matters, supporting organizational objectives and stakeholder needs.

## 2. Mission

To deliver high-quality {display.lower()} services that enable organizational success through expert guidance, efficient processes, and continuous improvement.

## 3. Vision

To be recognized as a best-in-class {display.lower()} function that drives value and innovation across the organization.

## 4. Scope

### In Scope
- {display} strategy development and execution
- Policy development and maintenance
- Process design and optimization
- Stakeholder support and guidance
- Compliance and quality assurance

### Out of Scope
- Activities clearly owned by other units
- External regulatory enforcement
- Direct budget authority over other units

## 5. Core Functions

1. **Strategic Planning**: Develop and maintain {display.lower()} strategy
2. **Policy Management**: Create and update policies and procedures
3. **Operations**: Execute core {display.lower()} activities
4. **Advisory**: Provide expert guidance to stakeholders
5. **Reporting**: Deliver insights and performance metrics

## 6. Governance

- Reports to: Executive Leadership
- Reviews: Quarterly with Executive Committee
- Policies: Aligned with Governance unit standards

## 7. Related Documents

- [README](./README.md)
- [Policies](./Policies/)
- [Processes](./Processes/)
'''

def generate_readme(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display}

## Overview

The {display} unit is responsible for {display.lower()}-related strategy, operations, and stakeholder support across the organization.

## Directory Structure

```
{unit_name}/
├── Charter.md           # Unit charter and governance
├── Policies/            # Policies and guidelines
├── Processes/           # Operational processes
├── MeetingNotes/        # Meeting documentation
├── Reports/             # Performance and status reports
└── README.md            # This file
```

## Key Documents

| Document | Purpose |
|----------|---------|
| [Charter](./Charter.md) | Unit mission, scope, and governance |
| [Policies](./Policies/) | Guidelines and standards |
| [Processes](./Processes/) | Operational procedures |

## Contacts

| Role | Responsibility |
|------|----------------|
| Head of {display} | Strategic direction and oversight |
| {display} Manager | Operational management |

## Related Units

- [Governance](../Governance/) - Policy alignment
- [Executive](../Executive/) - Strategic alignment
- [HumanResources](../HumanResources/) - Staffing and training
'''

def generate_strategic_plan(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} Strategic Plan

**Version:** 1.0
**Period:** 2026-2028
**Owner:** Head of {display}

## Executive Summary

This strategic plan outlines the {display} unit's direction, priorities, and initiatives for the upcoming planning period.

## Strategic Objectives

### Objective 1: Operational Excellence
- Optimize core processes for efficiency
- Implement quality improvement initiatives
- Achieve measurable performance gains

### Objective 2: Stakeholder Value
- Enhance service delivery
- Improve stakeholder satisfaction
- Expand advisory capabilities

### Objective 3: Innovation
- Adopt emerging best practices
- Pilot new approaches and technologies
- Drive continuous improvement culture

## Key Initiatives

| Initiative | Timeline | Owner | Priority |
|------------|----------|-------|----------|
| Process Optimization | Q1-Q2 2026 | Manager | High |
| Technology Upgrade | Q2-Q3 2026 | Lead | Medium |
| Training Program | Q3-Q4 2026 | Specialist | Medium |

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Process Efficiency | Baseline | +20% | End of Year 1 |
| Stakeholder Satisfaction | Baseline | +15% | End of Year 2 |
| Innovation Adoption | — | 3 initiatives | Annually |

## Resource Requirements

- Personnel: Maintain current staffing levels
- Budget: Within approved allocation
- Tools: Upgrade key systems as planned

## Related Documents

- [Charter](./Charter.md)
- [Policies](./Policies/)
'''

def generate_operating_procedures(unit_name: str) -> str:
    display = get_unit_display_name(unit_name)
    return f'''# {display} Operating Procedures

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of {display}

## Purpose

This document establishes the standard operating procedures for the {display} unit.

## Meeting Cadence

| Meeting Type | Frequency | Participants | Purpose |
|--------------|-----------|--------------|---------|
| Leadership Sync | Weekly | Leadership team | Operational alignment |
| Team Meeting | Weekly | All staff | Updates and coordination |
| Strategy Review | Monthly | Leadership + stakeholders | Strategic progress |
| Quarterly Review | Quarterly | Executive + unit | Performance assessment |

## Decision Making

### Standard Decisions
- Made by appropriate role level per delegation of authority
- Documented in meeting notes or decision log

### Escalation Path
1. Team Lead → Manager
2. Manager → Head of Unit
3. Head of Unit → Executive Sponsor

## Communication Standards

| Communication Type | Channel | Response Time |
|-------------------|---------|---------------|
| Urgent Issues | Messaging platform | < 1 hour |
| Standard Requests | Email/Ticketing | < 24 hours |
| Information Sharing | Newsletter/Wiki | N/A |

## Document Management

- All documents stored in designated repository
- Version control for policies and procedures
- Review cycle: Annual or as needed

## Related Documents

- [Charter](../Charter.md)
- [Policies](../Policies/)
'''

def generate_hr_report_template() -> str:
    return '''# HR Report Template

**Report Period:** [Start Date] - [End Date]
**Prepared By:** [Name]
**Date:** [Report Date]

## Executive Summary

Brief overview of key HR metrics and highlights for the reporting period.

## Headcount Summary

| Category | Start of Period | End of Period | Change |
|----------|-----------------|---------------|--------|
| Total Employees | — | — | — |
| Full-Time | — | — | — |
| Part-Time | — | — | — |
| Contractors | — | — | — |

## Recruitment Metrics

| Metric | Current Period | Previous Period | Trend |
|--------|---------------|-----------------|-------|
| Open Positions | — | — | — |
| Positions Filled | — | — | — |
| Time to Hire (avg) | — | — | — |
| Offer Acceptance Rate | — | — | — |

## Retention & Turnover

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Voluntary Turnover | — | < X% | — |
| Involuntary Turnover | — | < X% | — |
| Retention Rate | — | > X% | — |

## Training & Development

| Metric | Value |
|--------|-------|
| Training Hours (total) | — |
| Training Hours (per employee) | — |
| Certifications Obtained | — |

## Key Initiatives

### In Progress
- [Initiative 1]
- [Initiative 2]

### Completed
- [Initiative 1]

### Planned
- [Initiative 1]

## Issues & Risks

| Issue/Risk | Impact | Mitigation | Status |
|------------|--------|------------|--------|
| — | — | — | — |

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [Action item 1]
- [Action item 2]
'''

def generate_data_classification() -> str:
    return '''# Intelligence Data Classification Guideline

**Version:** 1.0
**Effective Date:** 2026-01-01
**Owner:** Head of Intelligence

## Purpose

This guideline establishes the framework for classifying intelligence data based on sensitivity, source, and distribution requirements.

## Classification Levels

### Level 1: Public
- Information suitable for public release
- No restrictions on distribution
- Examples: Published reports, public announcements

### Level 2: Internal
- Information for internal use only
- Distribution limited to organization members
- Examples: Internal reports, operational data

### Level 3: Confidential
- Sensitive information requiring protection
- Distribution limited to need-to-know basis
- Examples: Strategic analysis, competitive intelligence

### Level 4: Restricted
- Highly sensitive information
- Distribution limited to specific individuals
- Examples: Source identities, classified assessments

## Classification Criteria

| Factor | Weight | Considerations |
|--------|--------|----------------|
| Source Sensitivity | High | Protection of sources and methods |
| Competitive Impact | High | Business advantage implications |
| Legal Requirements | High | Regulatory and contractual obligations |
| Reputational Risk | Medium | Public perception implications |
| Operational Impact | Medium | Effect on operations if disclosed |

## Handling Requirements

| Level | Storage | Transmission | Disposal |
|-------|---------|--------------|----------|
| Public | Standard | Any channel | Standard |
| Internal | Secured | Internal channels | Shredding |
| Confidential | Encrypted | Encrypted channels | Secure disposal |
| Restricted | Air-gapped | Hand delivery | Witnessed destruction |

## Marking Requirements

All intelligence products must display:
- Classification level
- Date of classification
- Declassification date (if applicable)
- Handling instructions

## Related Documents

- [Information Security Policy](../../Security/Policies/information_security_policy.md)
- [Data Governance Policy](../../Governance/Policies/Data_Governance_Policy.md)
'''

def populate_file(file_path: Path):
    """Generate and write content to an empty file."""
    file_name = file_path.name
    unit_name = get_unit_name(file_path)
    
    content = None
    
    if file_name == "PositionsPersonas.md":
        content = generate_positions_personas(unit_name)
    elif file_name == "Resources.md":
        content = generate_resources(unit_name)
    elif file_name == "Responsibilities.md":
        content = generate_responsibilities(unit_name)
    elif file_name == "SkillsRoles.md":
        content = generate_skills_roles(unit_name)
    elif file_name == "Charter.md":
        content = generate_charter(unit_name)
    elif file_name == "README.md":
        content = generate_readme(unit_name)
    elif file_name == "StrategicPlan.md":
        content = generate_strategic_plan(unit_name)
    elif file_name == "operatingprocedures.md":
        content = generate_operating_procedures(unit_name)
    elif file_name == "hr_report_template.md":
        content = generate_hr_report_template()
    elif file_name == "Intelligence_Data_Classification_Guideline.md":
        content = generate_data_classification()
    
    if content:
        file_path.write_text(content)
        return True
    return False

def main():
    # Find all empty markdown files
    empty_files = []
    small_files = []
    
    for md_file in UNITS_DIR.rglob("*.md"):
        if md_file.stat().st_size == 0:
            empty_files.append(md_file)
        elif md_file.stat().st_size < 100:
            small_files.append(md_file)
    
    print(f"Found {len(empty_files)} empty files")
    print(f"Found {len(small_files)} small files (< 100 bytes)")
    
    populated_count = 0
    
    # Populate empty files
    for file_path in empty_files:
        if populate_file(file_path):
            populated_count += 1
            print(f"✓ Populated: {file_path.relative_to(UNITS_DIR)}")
    
    # Populate small files
    for file_path in small_files:
        if populate_file(file_path):
            populated_count += 1
            print(f"✓ Populated: {file_path.relative_to(UNITS_DIR)}")
    
    print(f"\nTotal files populated: {populated_count}")

if __name__ == "__main__":
    main()
