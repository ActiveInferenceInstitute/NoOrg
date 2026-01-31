#!/usr/bin/env python3
"""
Expand specialized stub files in units/ with comprehensive content.
Targets files under 12 lines with generic boilerplate content.
"""

import os
from pathlib import Path
import re

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")
MIN_LINES = 12

def get_display_name(name: str) -> str:
    """Convert snake_case and camelCase to display name."""
    name = re.sub(r'([A-Z])', r' \1', name)
    name = name.replace('_', ' ')
    return name.strip().title()

def generate_index_content(dir_path: Path) -> str:
    """Generate comprehensive index content based on directory."""
    dir_name = dir_path.parent.name
    display = get_display_name(dir_name)
    
    return f'''# {display}

## Overview

This section provides comprehensive documentation for {display.lower()} activities, including policies, procedures, and key artifacts.

## Directory Contents

| Resource | Description |
|----------|-------------|
| Policies | Governing guidelines and standards |
| Processes | Operational workflows |
| Templates | Standardized document templates |
| Reports | Status and analysis documents |

## Key Documents

### Policies & Guidelines
- Established standards and requirements
- Compliance frameworks
- Best practices

### Processes & Procedures
- Operational workflows
- Escalation paths
- Review cycles

### Templates & Forms
- Standardized templates for common activities
- Checklists and forms
- Reporting templates

## Getting Started

1. Review applicable policies and guidelines
2. Familiarize yourself with standard processes
3. Use approved templates for documentation
4. Contact the team lead for questions

## Contacts

| Role | Responsibility |
|------|----------------|
| {display} Lead | Overall oversight and guidance |
| {display} Specialist | Day-to-day operations |

## Related Documentation

- [Governance Policies](../../Governance/Policies/)
- [Processes](./Processes/)
'''

def generate_template_content(file_path: Path) -> str:
    """Generate comprehensive template content."""
    file_name = file_path.stem
    display = get_display_name(file_name)
    
    if "NDA" in file_name.upper():
        return generate_nda_template()
    elif "MSA" in file_name.upper():
        return generate_msa_template()
    elif "Legal_Hold" in file_name:
        return generate_legal_hold_template()
    elif "Litigation" in file_name:
        return generate_litigation_template()
    elif "Articles" in file_name:
        return generate_articles_template()
    elif "Bylaws" in file_name:
        return generate_bylaws_template()
    elif "Portfolio" in file_name:
        return generate_portfolio_template()
    elif "Patent" in file_name or "Application" in file_name:
        return generate_patent_template()
    elif "Trademark" in file_name or "Usage" in file_name:
        return generate_trademark_guidelines()
    elif "GDPR" in file_name:
        return generate_gdpr_analysis()
    elif "Deal" in file_name or "Falcon" in file_name:
        return generate_deal_template()
    elif "Investigation" in file_name or "HR-" in file_name:
        return generate_investigation_template()
    else:
        return generate_generic_template(display)

def generate_nda_template() -> str:
    return '''# Non-Disclosure Agreement (NDA) Template

**Template Version:** 1.0
**Last Updated:** 2026-01-01
**Owner:** Legal Department

## Purpose

This template provides the standard framework for confidentiality agreements between the organization and third parties.

## Template Usage

Use this template when:
- Engaging with potential vendors or partners
- Sharing confidential information with consultants
- Entering exploratory discussions with third parties

## Key Terms

| Term | Standard Duration | Notes |
|------|-------------------|-------|
| Confidentiality Period | 3-5 years | May vary based on sensitivity |
| Definition of Confidential Information | Broad | Includes technical and business info |
| Exclusions | Standard | Public info, independent development |
| Return/Destruction | Upon termination | With certification |

## Required Information

| Field | Description |
|-------|-------------|
| Disclosing Party | Entity sharing confidential information |
| Receiving Party | Entity receiving confidential information |
| Purpose | Reason for disclosure |
| Term | Duration of agreement |
| Governing Law | Jurisdiction |

## Approval Process

1. Request NDA from Legal
2. Complete party information
3. Legal review and customization
4. Counter-party negotiation
5. Execution and filing

## Template Sections

1. **Definitions** - Key terms and scope
2. **Obligations** - Protection requirements
3. **Exclusions** - Carve-outs from confidentiality
4. **Term** - Duration and survival
5. **Remedies** - Breach consequences
6. **General Provisions** - Standard legal clauses

## Related Documents

- [Contract Management Process](../../../Processes/)
- [Confidentiality Policy](../../../Policies/)
'''

def generate_msa_template() -> str:
    return '''# Master Service Agreement (MSA) Template

**Template Version:** 1.0
**Last Updated:** 2026-01-01
**Owner:** Legal Department

## Purpose

This template provides the framework for ongoing service relationships with vendors and partners.

## Template Usage

Use this template when:
- Establishing long-term vendor relationships
- Engaging professional service providers
- Creating umbrella agreements for recurring services

## Key Terms

| Term | Standard Position | Negotiable |
|------|-------------------|------------|
| Payment Terms | Net 30 | Yes |
| Liability Cap | Contract value | Yes |
| Indemnification | Mutual | Limited |
| IP Ownership | Customer owns deliverables | Context-dependent |
| Termination | 30 days notice | Yes |

## Required Attachments

| Attachment | Purpose |
|------------|---------|
| Statement of Work (SOW) | Specific project details |
| Rate Card | Pricing and fees |
| SLA | Service level expectations |
| Security Addendum | Data protection terms |

## Approval Process

1. Business team identifies need
2. Procurement engagement
3. Legal drafting/review
4. Negotiation with counter-party
5. Business and legal approval
6. Execution and filing

## Related Documents

- [Procurement Process](../../../Procurement/)
- [Vendor Management Policy](../../../Policies/)
'''

def generate_legal_hold_template() -> str:
    return '''# Legal Hold Notice Template

**Template Version:** 1.0
**Last Updated:** 2026-01-01
**Owner:** Legal Department

## Purpose

This template is used to issue legal hold notices requiring preservation of potentially relevant documents and data.

## When to Issue

| Trigger | Action Required |
|---------|-----------------|
| Litigation initiated | Immediate hold |
| Regulatory investigation | Immediate hold |
| Anticipated litigation | Proactive hold |
| Government inquiry | Immediate hold |

## Template Sections

### Header Information
- Date of issuance
- Legal matter reference
- Recipients list

### Hold Instructions
- Scope of preservation
- Document categories included
- Time period covered
- Suspension of destruction policies

### Compliance Requirements
- Acknowledgment deadline
- Ongoing obligations
- Contact for questions

## Distribution Process

1. Identify custodians
2. Draft hold notice
3. Legal approval
4. Send to custodians
5. Collect acknowledgments
6. Track compliance
7. Issue reminders

## Related Documents

- [Records Management Policy](../../../Governance/Policies/)
- [Litigation Management Process](../../Processes/)
'''

def generate_litigation_template() -> str:
    return '''# Litigation Status Report Template

**Report Period:** [Start Date] to [End Date]
**Prepared By:** Legal Department
**Date:** [Report Date]

## Executive Summary

Brief overview of current litigation matters and key developments.

## Active Matters

| Matter | Type | Status | Risk Level | Next Steps |
|--------|------|--------|------------|------------|
| [Matter Name] | [Type] | [Status] | [High/Med/Low] | [Action] |

## Matter Details

### [Matter Name]
- **Case Number:** 
- **Court/Forum:** 
- **Parties:** 
- **Key Dates:**
  - Filed: 
  - Discovery Close: 
  - Trial Date: 
- **Status Update:** 
- **Risk Assessment:** 
- **Recommended Actions:** 

## Financial Summary

| Category | Current Period | YTD |
|----------|---------------|-----|
| Legal Fees | $ | $ |
| Settlements | $ | $ |
| Reserves | $ | $ |

## Key Deadlines

| Date | Matter | Deadline |
|------|--------|----------|
| | | |

## Related Documents

- [Legal Hold Status](../Legal_Hold/)
- [Budget Report](../../Finance/)
'''

def generate_articles_template() -> str:
    return '''# Articles of Incorporation

**Entity:** [Organization Name]
**Jurisdiction:** [State/Country]
**Date Filed:** [Date]
**Last Amended:** [Date]

## Purpose

This document establishes the legal existence of the corporation and defines its fundamental characteristics.

## Key Provisions

### Article I: Name
The name of the corporation is [Organization Name].

### Article II: Purpose
The purpose of the corporation is to engage in any lawful business activities for which corporations may be organized.

### Article III: Registered Agent
| Field | Information |
|-------|-------------|
| Agent Name | |
| Address | |
| City, State, ZIP | |

### Article IV: Capital Stock
| Class | Authorized Shares | Par Value |
|-------|-------------------|-----------|
| Common | | |
| Preferred | | |

### Article V: Directors
- Initial directors and their addresses
- Director qualifications

### Article VI: Incorporator
Information about the incorporating party.

## Amendment History

| Date | Amendment | Purpose |
|------|-----------|---------|
| | | |

## Related Documents

- [Bylaws](./Bylaws.md)
- [Board Resolutions](../../BoardOfDirectors/)
'''

def generate_bylaws_template() -> str:
    return '''# Corporate Bylaws

**Entity:** [Organization Name]
**Adopted:** [Date]
**Last Amended:** [Date]

## Purpose

These bylaws govern the internal operations and management of the corporation.

## Article I: Offices
- Principal office location
- Registered office
- Other offices

## Article II: Shareholders
### Meetings
| Meeting Type | Frequency | Notice Required |
|--------------|-----------|-----------------|
| Annual | Yearly | 10-60 days |
| Special | As needed | 10-60 days |

### Voting
- Quorum requirements
- Voting procedures
- Proxy voting

## Article III: Directors
### Composition
| Role | Number | Term |
|------|--------|------|
| Board Members | [N] | [Years] |
| Independent Directors | [N] | [Years] |

### Meetings
- Frequency
- Quorum
- Voting requirements

### Committees
- Standing committees
- Committee authority

## Article IV: Officers
| Office | Responsibilities |
|--------|-----------------|
| CEO | |
| CFO | |
| Secretary | |

## Article V: Indemnification
Provisions for director and officer protection.

## Related Documents

- [Articles of Incorporation](./Articles_of_Incorporation.md)
- [Board Charter](../../BoardOfDirectors/)
'''

def generate_portfolio_template() -> str:
    return '''# Patent Portfolio Overview

**As of:** [Date]
**Prepared By:** Legal - IP

## Portfolio Summary

| Category | Count | Status |
|----------|-------|--------|
| Granted Patents | | Active |
| Pending Applications | | In Progress |
| Provisional Applications | | Active |
| Licensed Patents | | Active |

## Patent Categories

### Core Technology
| Patent/Application | Title | Status | Expiration |
|-------------------|-------|--------|------------|
| | | | |

### Product Features
| Patent/Application | Title | Status | Expiration |
|-------------------|-------|--------|------------|
| | | | |

### Process/Method
| Patent/Application | Title | Status | Expiration |
|-------------------|-------|--------|------------|
| | | | |

## Strategic Value

| Patent | Commercial Value | Defensive Value |
|--------|------------------|-----------------|
| | High/Med/Low | High/Med/Low |

## Upcoming Actions

| Date | Patent | Action Required |
|------|--------|-----------------|
| | | Maintenance fee |
| | | Response deadline |

## Related Documents

- [IP Policy](../../../Policies/)
- [Innovation Projects](../../../Innovation/)
'''

def generate_patent_template() -> str:
    return '''# Patent Application

**Application Number:** [Number]
**Title:** [Patent Title]
**Filing Date:** [Date]
**Status:** [Pending/Granted/Abandoned]

## Invention Summary

Brief description of the invention and its novel aspects.

## Key Information

| Field | Details |
|-------|---------|
| Inventors | |
| Assignee | |
| Priority Date | |
| Publication Number | |
| Grant Date | |
| Patent Number | |

## Claims Summary

### Independent Claims
| Claim | Scope |
|-------|-------|
| 1 | |

### Dependent Claims
| Claim | Depends On | Additional Limitation |
|-------|------------|----------------------|
| | | |

## Prosecution History

| Date | Action | Outcome |
|------|--------|---------|
| | Filing | |
| | Office Action | |
| | Response | |

## Maintenance Schedule

| Due Date | Fee Type | Status |
|----------|----------|--------|
| | 3.5 Year | |
| | 7.5 Year | |
| | 11.5 Year | |

## Related Documents

- [Portfolio Overview](./Portfolio_Overview.md)
- [IP Policy](../../../Policies/)
'''

def generate_trademark_guidelines() -> str:
    return '''# Trademark Usage Guidelines

**Version:** 1.0
**Last Updated:** 2026-01-01
**Owner:** Legal - IP / Marketing

## Purpose

These guidelines ensure consistent and proper use of organizational trademarks to maintain brand integrity and legal protection.

## Registered Trademarks

| Mark | Registration | Class | Status |
|------|--------------|-------|--------|
| | | | Active |

## Usage Requirements

### Proper Trademark Notice
- Use ® for registered trademarks
- Use ™ for common law trademarks
- Include proper notice on first use

### Format Requirements
| Element | Requirement |
|---------|-------------|
| Capitalization | [Standard format] |
| Color | [Approved colors] |
| Size | Minimum size requirements |
| Clear Space | Minimum clear space |

### Prohibited Uses
- Altering trademark appearance
- Using as generic term
- Combining with other marks
- Unapproved merchandise

## Approval Process

1. Submit usage request to Legal/Marketing
2. Provide context and mockups
3. Obtain written approval
4. Comply with conditions

## Third-Party Guidelines

| Use Case | Requirement |
|----------|-------------|
| Partnership | License agreement required |
| Media | Attribution guidelines |
| Academic | Citation format |

## Related Documents

- [Brand Guidelines](../../../Marketing/)
- [IP Policy](../../../Policies/)
'''

def generate_gdpr_analysis() -> str:
    return '''# GDPR Article 30 Analysis

**Analysis Date:** [Date]
**Prepared By:** Privacy/Compliance Team
**Last Reviewed:** [Date]

## Purpose

This document provides the Article 30 records of processing activities analysis as required by the General Data Protection Regulation.

## Processing Activities Inventory

| Activity | Purpose | Legal Basis | Data Subjects | Data Categories |
|----------|---------|-------------|---------------|-----------------|
| | | | | |

## Detailed Analysis

### Processing Activity: [Name]

| Element | Details |
|---------|---------|
| Controller | |
| Purpose | |
| Legal Basis | |
| Data Subjects | |
| Categories of Data | |
| Recipients | |
| Transfers | |
| Retention Period | |
| Security Measures | |

## Risk Assessment

| Processing Activity | Risk Level | Mitigation |
|--------------------|------------|------------|
| | High/Med/Low | |

## Data Protection Impact

| Factor | Assessment |
|--------|------------|
| Necessity | |
| Proportionality | |
| Data Subject Rights | |
| Safeguards | |

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Related Documents

- [Privacy Policy](../../../Legal/Policies/)
- [Data Governance](../../../Governance/Policies/)
'''

def generate_deal_template() -> str:
    return '''# Deal Record

**Deal ID:** [ID]
**Account:** [Company Name]
**Created:** [Date]
**Status:** [Stage]

## Deal Summary

| Field | Value |
|-------|-------|
| Deal Value | $ |
| Close Date | |
| Probability | % |
| Owner | |

## Account Information

| Field | Details |
|-------|---------|
| Company | |
| Industry | |
| Size | |
| Location | |

## Key Contacts

| Name | Role | Email | Phone |
|------|------|-------|-------|
| | Decision Maker | | |
| | Champion | | |
| | Technical Contact | | |

## Deal Progress

| Stage | Date | Notes |
|-------|------|-------|
| Discovery | | |
| Qualification | | |
| Proposal | | |
| Negotiation | | |
| Closed | | |

## Competition

| Competitor | Strengths | Weaknesses | Strategy |
|------------|-----------|------------|----------|
| | | | |

## Next Steps

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| | | | |

## Related Documents

- [Proposal](./Proposals/)
- [Contract](../../Legal/Contracts/)
'''

def generate_investigation_template() -> str:
    return '''# HR Investigation Record

**Case ID:** [ID]
**Type:** [Investigation Type]
**Status:** [Open/Closed]
**Date Opened:** [Date]

## Case Summary

Brief description of the matter under investigation.

## Complainant Information

| Field | Details |
|-------|---------|
| Name | |
| Department | |
| Position | |
| Date Reported | |

## Respondent Information

| Field | Details |
|-------|---------|
| Name | |
| Department | |
| Position | |

## Allegations

| # | Allegation | Policy Reference |
|---|------------|------------------|
| 1 | | |

## Investigation Timeline

| Date | Action | Notes |
|------|--------|-------|
| | Complaint received | |
| | Investigation initiated | |
| | Interviews conducted | |
| | Findings documented | |
| | Resolution | |

## Witnesses

| Name | Relationship | Interview Date |
|------|--------------|----------------|
| | | |

## Findings

| Allegation | Finding | Evidence |
|------------|---------|----------|
| | Substantiated/Unsubstantiated | |

## Resolution

| Action | Date | Responsible |
|--------|------|-------------|
| | | |

## Confidentiality Notice

This document contains confidential information and is restricted to authorized personnel only.

## Related Documents

- [HR Policies](../../Policies/)
- [Code of Conduct](../../Governance/Policies/)
'''

def generate_generic_template(display_name: str) -> str:
    return f'''# {display_name}

**Version:** 1.0
**Last Updated:** 2026-01-01
**Owner:** [Department]

## Purpose

This document provides structured guidance for {display_name.lower()}.

## Overview

Description of the purpose and scope of this resource.

## Key Information

| Element | Details |
|---------|---------|
| Scope | |
| Applicability | |
| Review Cycle | Annual |

## Content

### Section 1
Content details.

### Section 2
Additional content.

## Usage Guidelines

1. Step-by-step guidance
2. Best practices
3. Common scenarios

## Related Documentation

- [Related Document 1]
- [Related Document 2]
'''

def expand_file(file_path: Path) -> bool:
    """Check if file is short and expand it with appropriate content."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            lines = content.split('\n')
        
        if len(lines) >= MIN_LINES:
            return False
        
        # Check for generic boilerplate
        if "See the subdirectories" in content or "within the NoOrg framework" in content:
            file_name = file_path.name
            
            if file_name == "index.md":
                new_content = generate_index_content(file_path)
            else:
                new_content = generate_template_content(file_path)
            
            file_path.write_text(new_content)
            return True
        
        return False
    except Exception as e:
        print(f"Error: {file_path}: {e}")
        return False

def main():
    expanded_count = 0
    
    for md_file in UNITS_DIR.rglob("*.md"):
        if expand_file(md_file):
            expanded_count += 1
            rel_path = md_file.relative_to(UNITS_DIR)
            print(f"✓ Expanded: {rel_path}")
    
    print(f"\nTotal files expanded: {expanded_count}")

if __name__ == "__main__":
    main()
