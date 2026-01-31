#!/usr/bin/env python3
"""
Create missing committee charters that are referenced by AGENTS.md files.
"""

from pathlib import Path

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

# Committees that need charters
MISSING_CHARTERS = [
    "BoardOfDirectors/CommitteeStructure/RiskCommittee",
    "BoardOfDirectors/CommitteeStructure/AuditCommittee",
    "Finance/MeetingNotes/AuditCommitteeMeetings",
    "Compliance/MeetingNotes/ComplianceCommittee",
    "AdvisoryBoard/Committees/StrategyCommittee",
    "AdvisoryBoard/Committees/RiskCommittee",
    "AdvisoryBoard/Committees/GovernanceCommittee",
    "AdvisoryBoard/Committees/ComplianceCommittee",
    "AdvisoryBoard/Committees/EthicsCommittee",
    "AdvisoryBoard/Committees/AuditCommittee",
    "AdvisoryBoard/Committees/InnovationCommittee",
]

def get_committee_name(path: str) -> str:
    """Extract committee name from path."""
    parts = path.split("/")
    name = parts[-1]
    # Format nicely
    if name.endswith("Committee"):
        return name.replace("Committee", " Committee")
    elif name.endswith("Meetings"):
        return name.replace("Meetings", " ").strip()
    return name

def generate_charter(committee_name: str, unit_name: str) -> str:
    """Generate a comprehensive committee charter."""
    
    return f"""# {committee_name} Charter

**Effective Date:** 2026-01-01
**Last Reviewed:** 2026-01-31
**Parent Unit:** {unit_name}

## Purpose

The {committee_name} is established to provide oversight, guidance, and governance in its designated area of responsibility.

## Authority

The Committee operates under authority delegated by the {unit_name} and is empowered to:

- Review and recommend policies within its scope
- Request information and reports from management
- Engage external advisors as necessary
- Make recommendations to the governing body

## Composition

| Role | Qualifications |
|------|----------------|
| Chair | Appointed by governing body |
| Members | Minimum 3, appointed for terms |
| Secretary | Designated for recordkeeping |

## Responsibilities

### Primary Duties
- Provide oversight in designated area
- Review relevant policies and procedures
- Monitor compliance with requirements
- Report to governing body regularly

### Specific Functions
- Review and approve relevant matters
- Assess risks within scope
- Recommend improvements
- Ensure adequate resources

## Meetings

| Element | Standard |
|---------|----------|
| Frequency | Quarterly minimum |
| Quorum | Majority of members |
| Notice | 7 days advance |
| Minutes | Distributed within 5 days |

## Reporting

| Report | Frequency | Recipient |
|--------|-----------|-----------|
| Meeting summary | After each meeting | Governing body |
| Annual report | Annually | Full board |
| Special reports | As needed | Appropriate parties |

## Review

This charter shall be reviewed annually and updated as necessary.

## Related Documents

- [{unit_name} Charter](../../Charter.md)
- [Committee Policies](./Policies/)
- [Meeting Notes](./MeetingNotes/)
"""

def main():
    created = 0
    
    for path in MISSING_CHARTERS:
        full_path = UNITS_DIR / path / "Charter.md"
        
        if full_path.exists():
            print(f"Exists: {path}/Charter.md")
            continue
        
        # Get unit name
        unit_name = path.split("/")[0]
        committee_name = get_committee_name(path)
        
        # Create directory if needed
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Generate and write charter
        content = generate_charter(committee_name, unit_name)
        full_path.write_text(content)
        
        print(f"✓ Created: {path}/Charter.md")
        created += 1
    
    print(f"\nTotal created: {created}")

if __name__ == "__main__":
    main()
