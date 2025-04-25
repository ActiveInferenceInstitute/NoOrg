---
title: Documentation Hierarchy
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
tags: [meta, structure, organization]
---

# Documentation Hierarchy

## 📋 Overview
This document defines the hierarchical structure and organization of our Operations Knowledge Base, ensuring consistent organization and easy navigation of content.

## 🏗 Directory Structure

```
operations/
├── .obsidian/               # Obsidian configuration
├── docs/                    # Main documentation
│   ├── processes/          # Operational processes
│   │   ├── incident/       # Incident management
│   │   ├── change/        # Change management
│   │   └── release/       # Release management
│   ├── policies/          # Official policies
│   │   ├── security/      # Security policies
│   │   ├── operations/    # Operational policies
│   │   └── compliance/    # Compliance policies
│   ├── guides/           # How-to guides
│   │   ├── user/         # User guides
│   │   ├── admin/        # Admin guides
│   │   └── technical/    # Technical guides
│   ├── reference/        # Reference materials
│   │   ├── systems/      # System documentation
│   │   ├── tools/        # Tool documentation
│   │   └── standards/    # Standards and protocols
│   └── setup/            # Setup and configuration
├── templates/             # Document templates
├── assets/               # Images and attachments
├── meta/                 # Documentation about docs
│   ├── style-guide/     # Writing standards
│   └── maintenance/     # Maintenance procedures
└── archive/             # Archived content
```

## 📚 Content Hierarchy

### 1. Strategic Level
- Vision and mission
- High-level architecture
- Organizational policies
- Strategic initiatives
- Compliance framework

### 2. Program Level
- Operational processes
- Department procedures
- System documentation
- Integration points
- Service catalogs

### 3. Project Level
- Project documentation
- Implementation guides
- Team procedures
- Work instructions
- Technical specifications

### 4. Task Level
- Step-by-step guides
- Work instructions
- Checklists
- Templates
- Examples

## 🔍 Navigation Structure

### Primary Navigation
1. **Maps of Content (MOCs)**
   - [[processes-moc|Processes]]
   - [[policies-moc|Policies]]
   - [[guides-moc|Guides]]
   - [[reference-moc|Reference]]

2. **Quick Access**
   - [[000-home|Home]]
   - [[recent-updates|Recent Updates]]
   - [[frequently-used|Frequently Used]]
   - [[search-guide|Search Guide]]

### Secondary Navigation
1. **Categories**
   - Process documentation
   - Policy documentation
   - Technical guides
   - Reference materials

2. **Tags**
   - #process
   - #policy
   - #guide
   - #reference
   - #template

## 📝 Document Types

### Core Documents
1. **Process Documentation**
   - Standard Operating Procedures
   - Work Instructions
   - Flow Charts
   - Decision Trees

2. **Policy Documentation**
   - Corporate Policies
   - Department Policies
   - Standards
   - Guidelines

3. **Technical Documentation**
   - System Documentation
   - Architecture Documents
   - Integration Guides
   - API Documentation

4. **User Documentation**
   - User Guides
   - Quick Start Guides
   - FAQs
   - Troubleshooting Guides

## 🏷️ Metadata Structure

### Required Metadata
```yaml
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [category1, category2]
---
```

### Optional Metadata
```yaml
status: draft|review|approved|archived
owner: document owner
reviewers: [reviewer1, reviewer2]
review_frequency: monthly|quarterly|annually
```

## 🔗 Linking Conventions

### Internal Links
- Use `[[filename]]` for basic links
- Use `[[filename|Display Text]]` for custom text
- Use `[[filename#section]]` for section links

### External Links
- Use `[text](URL)` for external links
- Include link title: `[text](URL "title")`
- Document external dependencies

## 📊 Organization Principles

### 1. Progressive Disclosure
- Start with overview
- Provide increasing detail
- Link to related content
- Include references

### 2. Information Architecture
- Logical grouping
- Clear hierarchy
- Consistent structure
- Easy navigation

### 3. Content Relationships
- Parent-child relationships
- Cross-references
- Related content
- Prerequisites

## 🔄 Maintenance Structure

### Regular Reviews
1. **Daily Reviews**
   - New content
   - Updates
   - Link checks

2. **Weekly Reviews**
   - Content quality
   - Navigation
   - Organization

3. **Monthly Reviews**
   - Structure assessment
   - Category review
   - Tag cleanup

4. **Quarterly Reviews**
   - Full audit
   - Reorganization
   - Archive cleanup

## 📈 Growth Management

### Scaling Considerations
- Modular structure
- Flexible categories
- Extensible hierarchy
- Clear naming conventions

### Content Evolution
- Version control
- Change tracking
- Archive process
- Migration paths

## 📝 Related Documentation
- [[style-guide]]
- [[metadata-standards]]
- [[naming-conventions]]
- [[folder-structure]]

## 🔄 Change Log
| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial hierarchy documentation | Name |

---

*Last updated: <% tp.date.now("YYYY-MM-DD") %>* 