---
title: Obsidian Configuration Guide
created: 2024-03-20
updated: 2024-03-20
tags: [meta, configuration, obsidian, setup]
---

# Obsidian Configuration Guide

## 📋 Overview
This document outlines the standard configuration for Obsidian in the Operations Knowledge Base, ensuring consistent functionality and appearance across all users.

## ⚙️ Core Settings

### Editor Settings
```yaml
Default view mode: Source mode
Default editing mode: Source mode
Line width: 100
Strict line breaks: false
Show frontmatter: true
Show line numbers: true
Use tabs: false
Tab size: 2
```

### Files & Links
```yaml
Default location for new notes: In the folder specified by the template
Always update internal links: true
Default file location: docs/
Attachment folder path: assets/
```

### Appearance
```yaml
Theme: Minimal
Enable translucent window: true
Show inline title: true
Show tab title bar: true
Show status bar: true
```

## 🔌 Core Plugins

### Required Plugins
1. File Explorer
   - Enable folder collapse
   - Show attachment folder
2. Search
   - Enable regular expressions
   - Show more context
3. Quick Switcher
   - Enable fuzzy search
4. Graph View
   - Enable filters
   - Custom colors by tags
5. Backlinks
   - Show in document
   - Collapse by default
6. Outgoing Links
   - Show in document
7. Tags
   - Enable nested tags
8. Page Preview
   - Enable hover preview
9. Templates
   - Template folder: templates/

### Plugin Configuration
```yaml
backlinks:
  show-unlinked: true
  collapse-results: true

graph:
  show-arrows: true
  show-tags: true
  show-attachments: false
  collapse-filter: true

search:
  show-context: true
  explain-search-terms: true
```

## 🧩 Community Plugins

### Essential Plugins
1. Dataview
   - Enable JavaScript queries
   - Cache refresh interval: 30s
2. Calendar
   - Start week on Monday
   - Show week numbers
3. Templater
   - Template folder: templates/
   - Trigger on new file creation
4. Git
   - Auto backup: true
   - Backup interval: 10m
5. Natural Language Dates
   - Format: YYYY-MM-DD

### Optional Plugins
1. Advanced Tables
   - Enable format on paste
2. Mind Map
   - Auto-layout: true
3. Kanban
   - Enable drag and drop
4. Excalidraw
   - Save to assets/drawings/

## 🎨 Theme Configuration

### Color Scheme
```css
--background-primary: #ffffff
--background-secondary: #f5f6f8
--text-normal: #2e3338
--text-muted: #6e7681
--text-accent: #007acc
```

### Typography
```css
--font-text: 'Inter'
--font-monospace: 'Fira Code'
--font-size-normal: 16px
--line-height-normal: 1.5
```

### Custom CSS Snippets
1. `custom-callouts.css`
2. `custom-tags.css`
3. `custom-headers.css`

## 🔗 Workspace Layout

### Recommended Panels
```yaml
Left Sidebar:
  - File Explorer
  - Search
  - Bookmarks
  - Tags

Right Sidebar:
  - Backlinks
  - Outgoing Links
  - Calendar
  - Graph View
```

### Custom Workspaces
1. Writing
   - Focus mode
   - Hide sidebars
2. Research
   - Split panels
   - Show references
3. Planning
   - Calendar view
   - Tasks panel

## 📊 Graph View Settings

### Global Graph
```yaml
Forces:
  Center force: 1
  Repel force: 400
  Link force: 100
  Link distance: 30

Groups:
  Meta:
    Color: #ff0000
    Query: tag:#meta
  Process:
    Color: #00ff00
    Query: tag:#process
  Documentation:
    Color: #0000ff
    Query: tag:#documentation
```

### Local Graph
```yaml
Depth: 2
Show tags: true
Show attachments: false
Show external links: true
```

## 🔒 Security Settings

### Sync Settings
```yaml
End-to-end encryption: true
Exclude patterns:
  - "*.private"
  - "sensitive/*"
```

### Git Integration
```yaml
Auto commit: true
Commit message template: "docs: update {{files}}"
Backup branch: backup
```

## 🛠️ Hotkeys

### Essential Shortcuts
```yaml
Create new note: Ctrl/Cmd + N
Open quick switcher: Ctrl/Cmd + O
Open graph view: Ctrl/Cmd + G
Toggle edit/preview: Ctrl/Cmd + E
Open command palette: Ctrl/Cmd + P
```

### Custom Shortcuts
```yaml
Insert template: Alt + T
Create daily note: Alt + D
Toggle sidebar: Alt + S
Focus on editor: Alt + E
```

## 📱 Mobile Configuration

### Mobile-Specific Settings
```yaml
Enable swipe gestures: true
Keep screen awake: true
Default view: Preview
```

### Sync Settings
```yaml
Enable automatic sync: true
Sync on cellular: false
Sync attachments: true
```

## 🔄 Maintenance

### Regular Tasks
1. Update plugins monthly
2. Review and clean cache quarterly
3. Backup settings files
4. Test sync functionality

### Troubleshooting
1. Clear cache if issues occur
2. Disable problematic plugins
3. Update Obsidian regularly
4. Maintain logs of changes

## 📚 References

### Documentation
- [[style-guide]]
- [[metadata-standards]]
- [[git-workflow]]

### Resources
- [Obsidian Help](https://help.obsidian.md)
- [[obsidian-best-practices]]
- [[plugin-documentation]]

---

*Last updated: 2024-03-20* 