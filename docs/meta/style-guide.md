---
title: Documentation Style Guide
created: 2024-03-20
updated: 2024-03-20
tags: [meta, style, guidelines, documentation]
---

# Operations Knowledge Base Style Guide

## 📋 Overview
This style guide establishes consistent standards for all documentation in the Operations Knowledge Base. Following these guidelines ensures clarity, maintainability, and professionalism across all content.

## 📝 General Writing Guidelines

### Voice and Tone
- Use clear, professional language
- Write in active voice
- Be concise but thorough
- Maintain a helpful, instructive tone
- Avoid jargon unless necessary for technical accuracy

### Text Formatting
- Use **bold** for emphasis
- Use *italics* for technical terms on first use
- Use `code formatting` for:
  - Command line instructions
  - File paths
  - Code snippets
  - Configuration values

### Headers and Structure
- Use ATX-style headers (#)
- Maintain proper header hierarchy (H1 → H2 → H3)
- Include a table of contents for longer documents
- Keep sections focused and well-organized

## 🔗 Linking Conventions

### Internal Links
- Use [[wiki-style]] links for internal references
- Include descriptive link text
- Maintain bidirectional links where appropriate
- Use consistent naming for recurring concepts

### External Links
- Use standard Markdown links with descriptive text
- Include reference dates for external resources
- Note if links require authentication
- Consider archiving important external references

## 📑 Document Structure

### Frontmatter
```yaml
---
title: Document Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [relevant, tags, here]
---
```text

### Standard Sections
1. Overview/Introduction
2. Prerequisites (if applicable)
3. Main Content
4. Related Topics
5. References
6. Metadata

## 🏷️ Tagging System

### Core Tags
- meta: Documentation about documentation
- process: Operational processes
- policy: Official policies
- guide: How-to guides and tutorials
- reference: Reference materials

### Status Tags
- draft: Work in progress
- review: Ready for review
- approved: Officially approved
- archived: No longer active

### Topic Tags
- Use specific, consistent terminology
- Apply hierarchical tagging where appropriate
- Limit tags to essential categorization

## 📊 Diagrams and Visual Elements

### Mermaid Diagrams
- Use Mermaid for flowcharts and diagrams
- Include descriptive titles
- Add legends where necessary
- Keep diagrams focused and readable

### Images and Screenshots
- Use clear, high-resolution images
- Include descriptive alt text
- Caption complex visuals
- Compress images appropriately

## 🔤 Formatting Conventions

### Lists
- Use ordered lists for sequential steps
- Use unordered lists for related items
- Maintain consistent capitalization
- Use parallel structure

### Code Blocks
````markdown
```language
# Include language identifier
# Use appropriate formatting
# Include comments for clarity
```text
````

### Tables
- Include headers
- Align content appropriately
- Use consistent formatting
- Keep tables focused

## 📏 File Organization

### File Naming
- Use lowercase with hyphens
- Be descriptive but concise
- Include category prefixes when helpful
- Maintain consistent naming patterns

### Directory Structure
- Organize by topic/function
- Use clear, descriptive names
- Maintain logical hierarchy
- Include README files

## ✅ Quality Standards

### Documentation Requirements
- Clear purpose/scope
- Accurate content
- Complete information
- Current/updated
- Properly formatted
- Correctly linked
- Appropriate tags

### Review Process
1. Self-review
2. Peer review
3. Technical review (if needed)
4. Final approval

## 🔄 Maintenance

### Regular Updates
- Review content quarterly
- Update timestamps
- Verify links
- Check for accuracy

### Version Control
- Use meaningful commit messages
- Document significant changes
- Maintain change history
- Follow git workflow

## 📚 References

### Style Guides
- [[documentation-hierarchy]]
- [[metadata-standards]]
- [[linking-guidelines]]

### Tools and Resources
- [[obsidian-configuration]]
- [[markdown-reference]]
- [[mermaid-guide]]

---

*Last updated: 2024-03-20* 