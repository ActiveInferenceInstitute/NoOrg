---
title: Metadata Standards
created: 2024-03-20
updated: 2024-03-20
tags: [meta, standards, metadata, documentation]
---

# Metadata Standards

## 📋 Overview
This document defines the standard metadata structure and requirements for all documentation in the Operations Knowledge Base. Consistent metadata ensures proper organization, searchability, and maintenance of our documentation.

## 🏷️ Required Metadata Fields

### Basic Information
```yaml
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2, tag3]
---
```text

### Extended Information (When Applicable)
```yaml
---
author: Author Name
version: X.Y.Z
status: draft|review|approved|archived
priority: low|medium|high
category: process|policy|guide|reference
related: [doc1, doc2, doc3]
---
```text

## 📝 Field Specifications

### Title
- **Required**: Yes
- **Format**: Title Case
- **Max Length**: 100 characters
- **Example**: "System Architecture Overview"
- **Description**: Clear, descriptive title of the document

### Created Date
- **Required**: Yes
- **Format**: YYYY-MM-DD
- **Auto-generated**: Yes (via template)
- **Example**: "2024-03-20"
- **Description**: Document creation date

### Updated Date
- **Required**: Yes
- **Format**: YYYY-MM-DD
- **Auto-updated**: Yes (via git hooks)
- **Example**: "2024-03-20"
- **Description**: Last modification date

### Tags
- **Required**: Yes
- **Format**: [tag1, tag2, tag3]
- **Minimum**: 2 tags
- **Maximum**: 10 tags
- **Description**: Categorization and classification tags

### Author
- **Required**: No
- **Format**: Full Name
- **Example**: "John Doe"
- **Description**: Document author or maintainer

### Version
- **Required**: For technical documents
- **Format**: Semantic Versioning (X.Y.Z)
- **Example**: "1.0.0"
- **Description**: Document version number

### Status
- **Required**: Yes
- **Values**: draft|review|approved|archived
- **Default**: draft
- **Description**: Current document status

### Priority
- **Required**: No
- **Values**: low|medium|high
- **Default**: medium
- **Description**: Document priority level

### Category
- **Required**: Yes
- **Values**: process|policy|guide|reference
- **Description**: Primary document category

### Related
- **Required**: No
- **Format**: [doc1, doc2, doc3]
- **Description**: Related document references

## 🏷️ Tag Hierarchy

### Core Tags
1. **Meta Tags**
   - meta
   - process
   - policy
   - guide
   - reference

2. **Status Tags**
   - draft
   - review
   - approved
   - archived

3. **Type Tags**
   - documentation
   - configuration
   - architecture
   - development
   - operations

### Topic Tags
1. **Technical Areas**
   - security
   - performance
   - infrastructure
   - monitoring
   - automation

2. **Process Areas**
   - workflow
   - maintenance
   - deployment
   - testing
   - review

3. **Documentation Types**
   - howto
   - tutorial
   - reference
   - explanation
   - troubleshooting

## 🔍 Search and Filter Support

### Search Fields
1. **Primary Fields**
   - title
   - tags
   - category
   - status

2. **Secondary Fields**
   - created
   - updated
   - author
   - version

### Filter Categories
1. **Status Filters**
   - Current status
   - Date ranges
   - Priority levels
   - Categories

2. **Content Filters**
   - Document type
   - Topic area
   - Author
   - Version

## 🔄 Maintenance

### Regular Updates
1. **Field Validation**
   - Check required fields
   - Verify formats
   - Update timestamps
   - Review tags

2. **Tag Management**
   - Review tag usage
   - Update tag hierarchy
   - Remove unused tags
   - Add new tags

3. **Version Control**
   - Track changes
   - Update versions
   - Maintain history
   - Archive old versions

## 🛠️ Tools and Automation

### Metadata Tools
1. **Validation Tools**
   - Field checkers
   - Format validators
   - Link verifiers
   - Tag analyzers

2. **Automation Tools**
   - Date updaters
   - Version incrementers
   - Status updaters
   - Tag suggestions

### Integration Points
1. **Git Integration**
   - Pre-commit hooks
   - Automated updates
   - Version tracking
   - Change logging

2. **Obsidian Integration**
   - Template system
   - Metadata display
   - Search integration
   - Filter support

## ✅ Quality Control

### Validation Rules
1. **Required Fields**
   - Must have title
   - Must have dates
   - Must have tags
   - Must have category

2. **Format Rules**
   - Date format
   - Version format
   - Tag format
   - Title format

### Compliance Checks
1. **Automated Checks**
   - Field presence
   - Format compliance
   - Tag validity
   - Link health

2. **Manual Reviews**
   - Content relevance
   - Tag appropriateness
   - Related documents
   - Version accuracy

## 📚 References

### Internal Resources
- [[style-guide]]
- [[documentation-workflow]]
- [[tag-hierarchy]]
- [[validation-rules]]

### External Resources
- [YAML Specification](https://yaml.org/spec/)
- [Semantic Versioning](https://semver.org/)
- [[markdown-guide|Markdown Guide]]

## 🔄 Version History
- 2024-03-20: Initial creation
- Future updates will be logged here

---

*Last updated: 2024-03-20* 