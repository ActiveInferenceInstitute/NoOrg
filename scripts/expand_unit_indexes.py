#!/usr/bin/env python3
"""
Expand unit-level index.md files with comprehensive content.
"""

import os
from pathlib import Path
import re

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")
MIN_LINES = 20

def get_display_name(name: str) -> str:
    """Convert camelCase to display name."""
    return re.sub(r'([A-Z])', r' \1', name).strip()

def generate_unit_index(unit_name: str) -> str:
    display = get_display_name(unit_name)
    return f'''# {display}

## Overview

The {display} unit provides strategic and operational leadership in {display.lower()}-related activities across the organization.

## Mission

To deliver excellence through expert guidance, efficient processes, and continuous improvement in {display.lower()}.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| [Policies](./Policies/) | Governing guidelines and standards |
| [Processes](./Processes/) | Operational workflows and procedures |
| [MeetingNotes](./MeetingNotes/) | Meeting documentation |
| [Reports](./Reports/) | Status and performance reporting |

## Key Documents

### Core Documents
| Document | Description |
|----------|-------------|
| [Charter](./Charter.md) | Unit mission, scope, and governance |
| [README](./README.md) | Quick overview and getting started |

### Policies
- Governing standards and requirements
- Compliance frameworks
- Best practices guidelines

### Processes
- Operational workflows
- Escalation procedures
- Review cycles

## Team Structure

| Role | Responsibility |
|------|----------------|
| Head of {display} | Strategic direction and oversight |
| {display} Manager | Operational management |
| {display} Lead | Team coordination |
| {display} Specialist | Subject matter expertise |

## Related Units

| Unit | Relationship |
|------|-------------|
| [Governance](../Governance/) | Policy alignment |
| [Executive](../Executive/) | Strategic direction |
| [HumanResources](../HumanResources/) | Staffing and development |

## Quick Links

- [Charter](./Charter.md)
- [All Policies](./Policies/)
- [All Processes](./Processes/)
- [Recent Reports](./Reports/)
'''

def expand_index_files():
    expanded_count = 0
    
    for md_file in UNITS_DIR.rglob("index.md"):
        try:
            with open(md_file, 'r') as f:
                lines = f.readlines()
            
            if len(lines) >= MIN_LINES:
                continue
            
            # Check for placeholder content
            content = ''.join(lines)
            if "Add a brief description" in content or "Standard Sections" in content:
                unit_name = md_file.parent.name
                new_content = generate_unit_index(unit_name)
                md_file.write_text(new_content)
                expanded_count += 1
                print(f"✓ Expanded: {md_file.relative_to(UNITS_DIR)}")
        except Exception as e:
            print(f"Error: {md_file}: {e}")
    
    print(f"\nTotal files expanded: {expanded_count}")

if __name__ == "__main__":
    expand_index_files()
