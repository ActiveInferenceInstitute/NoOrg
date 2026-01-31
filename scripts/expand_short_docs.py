#!/usr/bin/env python3
"""
Expand short subdirectory READMEs in units/ with comprehensive content.
Targets files under 15 lines in subdirectories like MeetingNotes, Policies, Processes, Reports.
"""

import os
from pathlib import Path
import re

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")
MIN_LINES = 15

def get_unit_name(file_path: Path) -> str:
    """Extract unit name from file path."""
    parts = file_path.relative_to(UNITS_DIR).parts
    return parts[0] if parts else "Unknown"

def get_subdir_name(file_path: Path) -> str:
    """Extract subdirectory name from file path."""
    parts = file_path.relative_to(UNITS_DIR).parts
    return parts[1] if len(parts) > 1 else ""

def get_display_name(name: str) -> str:
    """Convert camelCase/PascalCase to display name."""
    return re.sub(r'([A-Z])', r' \1', name).strip()

def generate_meeting_notes_readme(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display} Meeting Notes

## Overview

This directory contains meeting documentation for the {display} unit, including agendas, minutes, action items, and decision logs.

## Meeting Types

| Meeting | Frequency | Purpose |
|---------|-----------|---------|
| Team Stand-up | Daily/Weekly | Operational updates and blockers |
| Leadership Sync | Weekly | Strategic alignment and planning |
| Stakeholder Review | Monthly | Progress updates and feedback |
| Quarterly Business Review | Quarterly | Performance assessment |

## Meeting Notes Template

Each meeting note should include:

1. **Header**: Date, time, attendees, facilitator
2. **Agenda**: Topics to be discussed
3. **Discussion**: Key points and decisions
4. **Action Items**: Tasks, owners, due dates
5. **Next Steps**: Follow-up items

## File Naming Convention

```
YYYY-MM-DD_Meeting-Type_Topic.md
```

Example: `2026-01-15_Weekly_Sprint-Review.md`

## Recent Meetings

*Meeting notes are organized chronologically. Most recent meetings appear first.*

## Related Documentation

- [Processes](../Processes/)
- [Reports](../Reports/)
- [Meeting Minutes Template](./Meeting_Minutes_Template.md)
'''

def generate_policies_readme(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display} Policies

## Overview

This directory contains the official policies governing {display} operations, standards, and compliance requirements.

## Policy Categories

### Core Policies
Foundational policies that govern unit operations and standards.

### Operational Policies
Day-to-day operational guidelines and procedures.

### Compliance Policies
Regulatory and compliance-related requirements.

## Policy Lifecycle

| Stage | Description | Owner |
|-------|-------------|-------|
| Draft | Initial policy creation | Policy Author |
| Review | Stakeholder feedback | Review Committee |
| Approval | Formal authorization | Unit Leadership |
| Published | Active and enforced | Policy Owner |
| Review | Periodic assessment | Policy Owner |
| Retired | No longer active | Unit Leadership |

## Policy Standards

All policies must include:
- **Version**: Current version number
- **Effective Date**: When policy becomes active
- **Owner**: Responsible individual or role
- **Review Date**: Next scheduled review
- **Scope**: Who the policy applies to

## Related Documentation

- [Processes](../Processes/)
- [Governance Policies](../../Governance/Policies/)
- [Policy on Policies](../../Governance/Policies/Policy_on_Policies.md)
'''

def generate_processes_readme(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display} Processes

## Overview

This directory contains the documented processes and workflows for {display} operations.

## Process Categories

### Core Processes
Essential workflows that define how the unit operates.

### Supporting Processes
Additional processes that enable core operations.

### Integration Processes
Workflows involving cross-functional collaboration.

## Process Documentation Standard

Each process document includes:

1. **Purpose**: Why the process exists
2. **Scope**: What is covered
3. **Roles**: Who is involved (RACI)
4. **Steps**: Detailed workflow
5. **Inputs/Outputs**: Required materials and deliverables
6. **Metrics**: How success is measured
7. **Related Documents**: Links to policies and references

## Process Improvement

| Phase | Activity | Outcome |
|-------|----------|---------|
| Identify | Recognize improvement opportunity | Improvement proposal |
| Analyze | Assess current state and gaps | Root cause analysis |
| Design | Develop improved process | Process documentation |
| Implement | Deploy changes | Updated workflow |
| Monitor | Track effectiveness | Performance metrics |

## Related Documentation

- [Policies](../Policies/)
- [Reports](../Reports/)
- [Governance Processes](../../Governance/Processes/)
'''

def generate_reports_readme(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display} Reports

## Overview

This directory contains reports, dashboards, and analytics produced by the {display} unit.

## Report Types

| Report | Frequency | Audience | Purpose |
|--------|-----------|----------|---------|
| Operational Dashboard | Real-time | Team | Current status monitoring |
| Weekly Status | Weekly | Leadership | Progress and blockers |
| Monthly Summary | Monthly | Stakeholders | Performance review |
| Quarterly Review | Quarterly | Executive | Strategic assessment |
| Annual Report | Annually | Board | Comprehensive analysis |

## Report Structure

Each report should include:
- **Executive Summary**: Key highlights and recommendations
- **Performance Metrics**: KPIs and trends
- **Activities**: Completed and in-progress work
- **Issues & Risks**: Challenges and mitigations
- **Next Steps**: Planned actions

## Dashboards & Metrics

Key performance indicators tracked:
- Operational efficiency metrics
- Quality and compliance metrics
- Resource utilization
- Stakeholder satisfaction

## Report Templates

- [Status Report Template](./templates/status_report_template.md)
- [Monthly Summary Template](./templates/monthly_summary_template.md)

## Related Documentation

- [Processes](../Processes/)
- [MeetingNotes](../MeetingNotes/)
'''

def generate_related_links(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display} - Related Links

## Internal Resources

### Organizational Units
| Unit | Relationship |
|------|-------------|
| [Governance](../Governance/) | Policy alignment and compliance |
| [Executive](../Executive/) | Strategic direction |
| [Finance](../Finance/) | Budget and financial reporting |
| [HumanResources](../HumanResources/) | Staffing and development |

### Key Documents
- [Organizational Charter](../Governance/Charter.md)
- [Strategic Plan](../Strategy/)
- [Policy Framework](../Governance/Policies/)

## External Resources

### Industry Standards
- Relevant industry frameworks
- Professional association guidelines
- Regulatory requirements

### Best Practices
- Industry benchmarks
- Professional publications
- Research and reports

### Tools & Platforms
- Internal systems documentation
- Vendor resources
- Training platforms

## Related Documentation

- [Charter](./Charter.md)
- [Policies](./Policies/)
- [Processes](./Processes/)
'''

def generate_unit_readme(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display}

## Overview

The {display} unit is responsible for {display.lower()}-related strategy, operations, and stakeholder support across the organization.

## Mission

To deliver excellence in {display.lower()} by providing strategic guidance, operational efficiency, and continuous improvement.

## Directory Structure

```
{unit_name}/
├── Charter.md           # Unit charter and governance
├── Policies/            # Policies and guidelines
│   ├── PositionsPersonas.md
│   ├── Resources.md
│   ├── Responsibilities.md
│   └── SkillsRoles.md
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
| [Reports](./Reports/) | Performance tracking |

## Team Contacts

| Role | Responsibility |
|------|----------------|
| Head of {display} | Strategic direction and oversight |
| {display} Manager | Operational management |
| {display} Lead | Team coordination |

## Related Units

- [Governance](../Governance/) - Policy alignment
- [Executive](../Executive/) - Strategic alignment  
- [HumanResources](../HumanResources/) - Staffing and training

## Getting Started

1. Review the [Charter](./Charter.md) to understand the unit's purpose
2. Familiarize yourself with key [Policies](./Policies/)
3. Understand the operational [Processes](./Processes/)
4. Connect with team members listed above
'''

def expand_short_file(file_path: Path) -> bool:
    """Check if file is short and expand it if so."""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        if len(lines) >= MIN_LINES:
            return False
        
        file_name = file_path.name
        unit_name = get_unit_name(file_path)
        subdir_name = get_subdir_name(file_path)
        
        content = None
        
        if file_name == "README.md":
            if subdir_name == "MeetingNotes":
                content = generate_meeting_notes_readme(unit_name)
            elif subdir_name == "Policies":
                content = generate_policies_readme(unit_name)
            elif subdir_name == "Processes":
                content = generate_processes_readme(unit_name)
            elif subdir_name == "Reports":
                content = generate_reports_readme(unit_name)
            else:
                # Top-level unit README
                content = generate_unit_readme(unit_name)
        elif file_name == "Related_Links.md":
            content = generate_related_links(unit_name)
        
        if content:
            file_path.write_text(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    expanded_count = 0
    
    for md_file in UNITS_DIR.rglob("*.md"):
        if expand_short_file(md_file):
            expanded_count += 1
            rel_path = md_file.relative_to(UNITS_DIR)
            print(f"✓ Expanded: {rel_path}")
    
    print(f"\nTotal files expanded: {expanded_count}")

if __name__ == "__main__":
    main()
