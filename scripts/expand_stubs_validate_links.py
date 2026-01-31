#!/usr/bin/env python3
"""
Expand short markdown stubs and validate links.
Focuses on subdirectory AGENTS.md files and other short stubs.
"""

from pathlib import Path
import re

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")
MIN_LINES = 16  # Files with fewer lines than this will be expanded

def get_unit_name(file_path: Path) -> str:
    """Extract the unit name from file path."""
    parts = file_path.relative_to(UNITS_DIR).parts
    return parts[0] if parts else "Unknown"

def get_parent_dir_name(file_path: Path) -> str:
    """Get immediate parent directory name."""
    return file_path.parent.name

def get_context_path(file_path: Path) -> str:
    """Get context path relative to unit."""
    rel = file_path.relative_to(UNITS_DIR)
    parts = rel.parts[1:-1]  # Skip unit name and filename
    return "/".join(parts) if parts else ""

def generate_subdir_agents(unit_name: str, subdir_name: str, context_path: str) -> str:
    """Generate comprehensive AGENTS.md for subdirectories."""
    
    # Customize based on subdirectory type
    subdir_descriptions = {
        "MeetingNotes": ("Meeting Notes", "meeting note artifacts", "AI agents to assist with meeting documentation, action item tracking, and decision summarization"),
        "Reports": ("Reports", "report artifacts", "AI agents to assist with report generation, data analysis, and executive summaries"),
        "Processes": ("Processes", "process documentation", "AI agents to assist with process automation, workflow optimization, and procedure compliance"),
        "Policies": ("Policies", "policy documents", "AI agents to assist with policy drafting, compliance checking, and policy impact analysis"),
        "Resources": ("Resources", "resource materials", "AI agents to assist with resource curation, knowledge management, and content organization"),
        "Projects": ("Projects", "project artifacts", "AI agents to assist with project management, milestone tracking, and deliverable coordination"),
        "Initiatives": ("Initiatives", "initiative tracking", "AI agents to assist with initiative planning, progress monitoring, and outcome measurement"),
        "KPIs": ("KPIs", "performance metrics", "AI agents to assist with KPI tracking, dashboard creation, and performance analysis"),
        "DecisionFramework": ("Decision Framework", "decision processes", "AI agents to assist with decision analysis, option evaluation, and consensus building"),
        "OperatingProcedures": ("Operating Procedures", "operational procedures", "AI agents to assist with procedure documentation and workflow automation"),
        "Leadership": ("Leadership", "leadership documentation", "AI agents to assist with leadership coordination and executive communications"),
        "Committees": ("Committees", "committee operations", "AI agents to assist with committee scheduling, agenda preparation, and minutes distribution"),
    }
    
    desc = subdir_descriptions.get(subdir_name, (subdir_name, "documentation", "AI agents to assist with documentation and workflow automation"))
    
    return f"""# {unit_name} {desc[0]} - AI Agent Configuration

## Overview

Technical documentation and AI agent configuration for {desc[1]} within the {unit_name} unit.

## Agent Capabilities

### Documentation Agents
- Content generation and standardization
- Template application and formatting
- Cross-reference validation
- Version control and archival

### Analysis Agents
- Content summarization
- Pattern recognition
- Gap identification
- Quality assessment

### Workflow Agents
- Notification and distribution
- Approval routing
- Schedule management
- Task coordination

## Integration Points

| System | Purpose |
|--------|---------|
| Document Management | Storage and retrieval |
| Workflow Engine | Process automation |
| Notification System | Stakeholder alerts |
| Analytics Platform | Performance metrics |

## Configuration

### Agent Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| review_threshold | 80% | Quality score for auto-approval |
| notification_delay | 24h | Time before reminder |
| archive_after | 90d | Auto-archive inactive items |

## File Naming Conventions

| Pattern | Usage |
|---------|-------|
| `YYYY-MM-DD_Topic.md` | Date-prefixed documents |
| `Topic_v#.md` | Versioned documents |
| `Template_Name.md` | Reusable templates |

## Related Documentation

- [{unit_name} Overview](../README.md)
- [{unit_name} Charter](../Charter.md)
- [Unit Policies](../Policies/)
- [Unit Processes](../Processes/)
"""

def generate_committee_agents(unit_name: str, committee_name: str) -> str:
    """Generate AGENTS.md for committee subdirectories."""
    
    return f"""# {committee_name} - AI Agent Configuration

## Overview

Technical documentation and AI agent configuration for the {committee_name} within {unit_name}.

## Agent Capabilities

### Committee Support Agents
- Meeting agenda preparation
- Pre-read material compilation
- Minutes generation
- Action item tracking

### Analysis Agents
- Committee effectiveness metrics
- Attendance tracking
- Decision history analysis
- Benchmark comparisons

### Compliance Agents
- Charter compliance monitoring
- Regulatory requirement tracking
- Policy adherence verification
- Audit trail maintenance

## Integration Points

| System | Purpose |
|--------|---------|
| Calendar System | Meeting scheduling |
| Document Repository | Materials storage |
| Board Portal | Secure communications |
| Compliance Platform | Regulatory tracking |

## Committee Configuration

### Meeting Parameters
| Parameter | Value |
|-----------|-------|
| Quorum | Per charter |
| Notice Period | 7 days |
| Materials Lead | 5 days |
| Minutes Due | 48 hours |

## Related Documentation

- [Committee Charter](./Charter.md)
- [{unit_name} Overview](../../README.md)
- [Governance](../../../Governance/)
"""

def expand_supply_chain_risk() -> str:
    """Expand SupplyChainRiskManagement.md."""
    return """# Supply Chain Risk Management

**Version:** 1.0
**Last Updated:** 2026-01-31
**Owner:** VP Supply Chain

## Purpose

Establishes the framework for identifying, assessing, and mitigating risks within the supply chain to ensure business continuity and operational resilience.

## Scope

Applies to all supply chain operations including procurement, logistics, manufacturing, and distribution.

## Risk Categories

| Category | Examples | Impact |
|----------|----------|--------|
| Supplier Risk | Supplier failure, capacity constraints | Supply disruption |
| Logistics Risk | Transportation delays, port congestion | Delivery delays |
| Geopolitical Risk | Trade restrictions, tariffs, sanctions | Cost increases |
| Natural Disaster | Earthquakes, floods, pandemics | Complete disruption |
| Quality Risk | Defects, contamination, recalls | Customer impact |
| Cyber Risk | Data breach, system failure | Operational disruption |

## Risk Assessment Framework

### Risk Identification
| Activity | Frequency |
|----------|-----------|
| Supplier assessments | Annually |
| Category analysis | Quarterly |
| External monitoring | Continuous |
| Scenario planning | Annually |

### Risk Scoring Matrix
| Likelihood | Impact | Risk Score |
|------------|--------|------------|
| High | High | Critical (9) |
| High | Medium | High (6) |
| Medium | High | High (6) |
| Medium | Medium | Medium (4) |
| Low | Any | Low (1-3) |

## Mitigation Strategies

### Diversification
- Multiple suppliers for critical materials
- Geographic distribution of suppliers
- Alternative transportation modes

### Inventory Buffers
- Safety stock for critical items
- Strategic inventory positioning
- Just-in-case vs. just-in-time balance

### Contractual Protections
- Performance guarantees
- Force majeure provisions
- Insurance requirements

### Business Continuity Planning
- Supplier contingency plans
- Alternative sourcing strategies
- Communication protocols

## Monitoring and Reporting

| Report | Frequency | Audience |
|--------|-----------|----------|
| Risk Dashboard | Weekly | Operations |
| Supplier Performance | Monthly | Procurement |
| Risk Reviews | Quarterly | Executive |
| Board Report | Annually | Board |

## Related Documents

- [Risk Management Unit](../RiskManagement/README.md)
- [Supply Chain Policies](Policies/)
- [Business Continuity](../Operations/Policies/Business_Continuity_Policy.md)
- [Procurement](../Procurement/)
"""

def expand_file(file_path: Path) -> tuple[bool, str]:
    """Expand a short file with appropriate content. Returns (success, message)."""
    
    unit_name = get_unit_name(file_path)
    parent_dir = get_parent_dir_name(file_path)
    filename = file_path.name
    
    content = None
    
    # Handle SupplyChainRiskManagement.md specifically
    if filename == "SupplyChainRiskManagement.md" and unit_name == "SupplyChain":
        content = expand_supply_chain_risk()
    
    # Handle subdirectory AGENTS.md files
    elif filename == "AGENTS.md" and parent_dir != unit_name:
        # Check if it's a committee
        if "Committee" in parent_dir:
            content = generate_committee_agents(unit_name, parent_dir)
        else:
            context = get_context_path(file_path)
            content = generate_subdir_agents(unit_name, parent_dir, context)
    
    if content:
        file_path.write_text(content)
        return (True, f"Expanded: {file_path.relative_to(UNITS_DIR)}")
    
    return (False, f"Skipped: {file_path.relative_to(UNITS_DIR)}")

def find_short_files() -> list[Path]:
    """Find all markdown files with fewer than MIN_LINES."""
    short_files = []
    for md_file in UNITS_DIR.rglob("*.md"):
        try:
            lines = len(md_file.read_text().split('\n'))
            if lines < MIN_LINES:
                short_files.append(md_file)
        except Exception:
            continue
    return short_files

def validate_links(file_path: Path) -> list[str]:
    """Check markdown links in a file for validity."""
    broken = []
    try:
        content = file_path.read_text()
        # Find markdown links: [text](path)
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        
        for text, link in links:
            # Skip external URLs and anchors
            if link.startswith(('http://', 'https://', '#', 'mailto:')):
                continue
            
            # Handle relative paths
            if link.startswith('./'):
                target = file_path.parent / link[2:]
            elif link.startswith('../'):
                target = file_path.parent / link
            else:
                target = file_path.parent / link
            
            # Remove any anchor from path
            target_str = str(target).split('#')[0]
            target = Path(target_str)
            
            if not target.exists():
                broken.append(f"  - Broken: [{text}]({link})")
    except Exception as e:
        broken.append(f"  - Error reading file: {e}")
    
    return broken

def main():
    print("=" * 60)
    print("PHASE 1: Finding short files")
    print("=" * 60)
    
    short_files = find_short_files()
    print(f"Found {len(short_files)} files with < {MIN_LINES} lines")
    
    print("\n" + "=" * 60)
    print("PHASE 2: Expanding stubs")
    print("=" * 60)
    
    expanded = 0
    skipped = 0
    
    for f in short_files:
        success, msg = expand_file(f)
        if success:
            print(f"✓ {msg}")
            expanded += 1
        else:
            skipped += 1
    
    print(f"\nExpanded: {expanded}, Skipped: {skipped}")
    
    print("\n" + "=" * 60)
    print("PHASE 3: Validating links in expanded files")
    print("=" * 60)
    
    # Re-scan expanded files for broken links
    files_with_broken = 0
    for f in short_files:
        broken = validate_links(f)
        if broken:
            print(f"\n{f.relative_to(UNITS_DIR)}:")
            for b in broken:
                print(b)
            files_with_broken += 1
    
    if files_with_broken == 0:
        print("✓ No broken links found in expanded files")
    else:
        print(f"\n{files_with_broken} files have broken links")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Files scanned: {len(short_files)}")
    print(f"Files expanded: {expanded}")
    print(f"Files with broken links: {files_with_broken}")

if __name__ == "__main__":
    main()
