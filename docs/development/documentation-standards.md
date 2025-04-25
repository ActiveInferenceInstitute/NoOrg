---
title: Documentation Standards
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
type: standard
status: active
tags: [standard, documentation]
---

# Documentation Standards

## 📋 Overview
This document defines the standards and guidelines for creating and maintaining documentation in the Operations Knowledge Base.

## 🎯 Purpose
- Ensure consistency across documentation
- Maintain high quality standards
- Enable efficient knowledge sharing
- Support maintainability
- Facilitate collaboration

## 📝 Document Structure

### 1. Metadata
All documents must include YAML frontmatter:
```yaml
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: [document-type]
status: [draft/review/active/archived]
tags: [relevant-tags]
---
```

### 2. Standard Sections
1. Title (H1)
2. Overview
3. Main Content
4. Related Documents
5. Metadata
6. Last Updated

### 3. Heading Hierarchy
- H1 (#) - Document Title
- H2 (##) - Main Sections
- H3 (###) - Subsections
- H4 (####) - Detailed Points

## 📚 Writing Guidelines

### 1. Style
- Use clear, concise language
- Write in active voice
- Keep sentences focused
- Use consistent terminology
- Include examples where helpful

### 2. Formatting
- Use proper Markdown syntax
- Include appropriate spacing
- Format code blocks correctly
- Use lists for multiple items
- Include tables where appropriate

### 3. Links
- Use Obsidian-style links `[[document-name]]`
- Include descriptive link text
- Verify link validity
- Maintain bidirectional links
- Use aliases when needed `[[document-name|Display Text]]`

## 🔍 Content Requirements

### 1. Technical Documentation
- Include prerequisites
- Provide step-by-step instructions
- Document configuration details
- Include troubleshooting steps
- Add code examples

### 2. Process Documentation
- Define process scope
- List prerequisites
- Detail step sequence
- Include decision points
- Document exceptions

### 3. Project Documentation
- State objectives
- Define scope
- List stakeholders
- Include timeline
- Track progress

## 📊 Quality Standards

### 1. Accuracy
- Factually correct
- Up-to-date information
- Verified procedures
- Tested code examples
- Current references

### 2. Completeness
- All sections filled
- Required details included
- Examples provided
- Links verified
- Metadata complete

### 3. Clarity
- Clear structure
- Logical flow
- Consistent formatting
- Proper grammar
- Appropriate terminology

## 🔄 Maintenance

### 1. Regular Updates
- Review quarterly
- Update as needed
- Verify links
- Check references
- Update metadata

### 2. Version Control
- Use meaningful commits
- Follow branching strategy
- Review changes
- Update timestamps
- Track versions

## ⚠️ Common Issues
- Missing metadata
- Broken links
- Outdated content
- Inconsistent formatting
- Incomplete sections

## 🔗 Related Documents
- [[getting-started]]
- [[contribution-guidelines]]
- [[process-framework]]
- [[project-guidelines]]

## 📝 Change Log
| Date | Author | Changes |
|------|--------|---------|
| <% tp.date.now("YYYY-MM-DD") %> | | Initial version |

## 🏷️ Metadata
- **Status**: Active
- **Owner**: [Owner Name]
- **Last Review**: <% tp.date.now("YYYY-MM-DD") %>
- **Next Review**: <% tp.date.now("YYYY-MM-DD", 90) %>

---
*Last updated: <% tp.date.now("YYYY-MM-DD") %>* 