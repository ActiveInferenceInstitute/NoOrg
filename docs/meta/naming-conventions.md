---
title: Naming Conventions
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
tags: [meta, standards, documentation]
---

# Naming Conventions

## 📋 Overview
This document defines the standardized naming conventions for files, folders, and content within our Operations Knowledge Base.

## 📁 File and Folder Names

### General Rules
- Use lowercase letters
- Use hyphens (-) for spaces
- Use descriptive names
- Keep names concise
- Avoid special characters
- Use standard file extensions

### File Naming Pattern
```
[category]-[type]-[description].[ext]
```

### Examples
```
incident-process-escalation.md
security-policy-access-control.md
user-guide-obsidian-setup.md
template-meeting-notes.md
```

## 🗂️ Directory Structure

### Root Level
```
docs/
├── processes/
├── policies/
├── guides/
├── reference/
└── setup/
```

### Subdirectory Pattern
```
[category]/[subcategory]/[topic]/
```

### Examples
```
processes/incident/escalation/
policies/security/access-control/
guides/user/getting-started/
```

## 📝 Document Titles

### Title Format
```
[Category]: [Description] - [Subtype]
```

### Examples
- Process: Incident Escalation - Standard Operating Procedure
- Policy: Access Control - Security Guidelines
- Guide: Obsidian Setup - User Manual
- Template: Meeting Notes - Standard Format

## 🏷️ Asset Naming

### Image Files
```
[YYYY-MM-DD]-[category]-[description].[ext]
```

### Examples
```
2024-03-15-process-flow-diagram.png
2024-03-15-system-architecture.svg
2024-03-15-user-interface-mockup.jpg
```

### Attachments
```
[YYYY-MM-DD]-[type]-[description].[ext]
```

### Examples
```
2024-03-15-report-quarterly-review.pdf
2024-03-15-presentation-project-status.pptx
2024-03-15-spreadsheet-metrics.xlsx
```

## 🔤 Content Elements

### Heading Format
```
Level 1: # Main Title
Level 2: ## Major Section
Level 3: ### Subsection
Level 4: #### Detail Section
```

### Link Text
- Use descriptive text
- Keep consistent with target
- Include context if needed

### Examples
```markdown
[[incident-process|Incident Management Process]]
[[access-control|Access Control Policy]]
[[obsidian-setup#configuration|Obsidian Configuration]]
```

## 🏷️ Tag Naming

### Tag Format
```
#category-type-descriptor
```

### Examples
```
#process-incident-escalation
#policy-security-access
#guide-user-setup
```

## 📊 Version Naming

### Version Format
```
v[major].[minor].[patch]
```

### Examples
```
v1.0.0 - Initial release
v1.1.0 - Feature update
v1.1.1 - Bug fix
```

## 🔍 Search Optimization

### Keywords
- Include relevant terms
- Use standard terminology
- Maintain consistency
- Support findability

### Examples
```
security-access-control-policy.md
incident-response-procedure.md
user-onboarding-guide.md
```

## 📱 Mobile Compatibility

### File Names
- Keep short but descriptive
- Avoid long paths
- Use clear abbreviations
- Support touch navigation

### Examples
```
proc-inc-esc.md      # Process - Incident Escalation
pol-sec-acc.md       # Policy - Security Access
guide-setup.md       # Setup Guide
```

## 🔄 Naming Patterns

### Templates
```
template-[type]-[purpose].md
```

### Examples
```
template-process-documentation.md
template-policy-standard.md
template-guide-howto.md
```

### Maps of Content
```
[category]-moc.md
```

### Examples
```
processes-moc.md
policies-moc.md
guides-moc.md
```

## ⚡ Quick Reference

### Do's
- Use lowercase
- Use hyphens
- Be descriptive
- Be consistent
- Follow patterns
- Include dates when relevant

### Don'ts
- Use spaces
- Use special characters
- Use underscores
- Use camelCase
- Create deep nesting
- Use abbreviations (unless standard)

## 📝 Related Documentation
- [[documentation-hierarchy]]
- [[metadata-standards]]
- [[style-guide]]
- [[folder-structure]]

## 🔄 Change Log
| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial naming conventions | Name |

---

*Last updated: <% tp.date.now("YYYY-MM-DD") %>* 