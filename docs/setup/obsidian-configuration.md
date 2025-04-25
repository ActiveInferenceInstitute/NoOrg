---
title: Obsidian Configuration
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
tags: [setup, configuration, obsidian]
---

# Obsidian Configuration

## 📋 Overview
This document outlines the standard configuration for our Operations Knowledge Base Obsidian vault, ensuring consistent functionality and user experience across the team.

## 🔧 Core Settings

### Editor Settings
- **Default view mode**: Source mode
- **Default editing mode**: Source mode
- **Line width**: 100
- **Strict line breaks**: Disabled
- **Smart indent lists**: Enabled
- **Spell check**: Enabled
- **Auto pair brackets**: Enabled
- **Auto pair Markdown syntax**: Enabled

### Files & Links
- **Default location for new notes**: `docs/`
- **Default location for attachments**: `assets/`
- **Attachment filename format**: `YYYY-MM-DD-HHmm-{filename}`
- **Use [[Wikilinks]]**: Enabled
- **Use relative path links**: Enabled
- **Detect all file extensions**: Enabled

### Appearance
- **Theme**: Default dark/light based on system
- **Font size**: 16
- **Line height**: 1.5
- **Enable translucent window**: Enabled
- **Show inline title**: Enabled
- **Show tab title bar**: Enabled

## 🔌 Core Plugins

### Essential Plugins
1. **File Explorer**
   - Show attachments: Enabled
   - Sort order: By name (A to Z)

2. **Search**
   - Show more context: Enabled
   - Default search mode: Full-text

3. **Quick Switcher**
   - Include attachments: Disabled
   - Show all file types: Enabled

4. **Graph View**
   - Color groups:
     - Documentation: Blue
     - Templates: Green
     - Meta: Purple
     - Archive: Gray

5. **Backlinks**
   - Show backlinks in document: Enabled
   - Show unlinked mentions: Enabled

### Additional Core Plugins
- **Page Preview**: Enabled
- **Templates**: Enabled
- **Tag Pane**: Enabled
- **Outline**: Enabled
- **Starred**: Enabled
- **Daily Notes**: Disabled
- **Slides**: Disabled
- **Audio Recorder**: Disabled
- **Command Palette**: Enabled

## 🎨 Community Plugins

### Required Plugins
1. **Dataview**
   - Enable JavaScript Queries: Yes
   - Enable Inline Queries: Yes
   - Default Refresh Interval: 30s

2. **Templater**
   - Template folder: `templates/`
   - Trigger on new file creation: Yes
   - Default templates:
     - Meeting notes: `templates/meeting-template.md`
     - Process doc: `templates/process-template.md`

3. **Git**
   - Auto backup: Every 10 minutes
   - Backup folder: `.backup/`
   - Commit message template: "docs: {filename} - {changes}"

4. **Natural Language Dates**
   - Format: YYYY-MM-DD
   - Week starts on: Monday

### Optional Plugins
- **Calendar**
- **Advanced Tables**
- **Mind Map**
- **Excalidraw**
- **Kanban**

## ⌨️ Hotkey Configuration

### Essential Hotkeys
- **Quick Switcher**: Ctrl/Cmd + O
- **Command Palette**: Ctrl/Cmd + P
- **Search**: Ctrl/Cmd + F
- **Global Search**: Ctrl/Cmd + Shift + F
- **Toggle Edit/Preview**: Ctrl/Cmd + E
- **Open Graph View**: Ctrl/Cmd + G

### Custom Hotkeys
- **Insert Template**: Alt + T
- **Create New Note**: Ctrl/Cmd + N
- **Toggle Sidebar**: Ctrl/Cmd + B
- **Focus on Editor**: Ctrl/Cmd + 1
- **Focus on Sidebar**: Ctrl/Cmd + 2

## 🔄 Sync Configuration

### Git Sync
- Repository: `operations`
- Branch: `main`
- Auto sync: Enabled
- Sync interval: 5 minutes
- Conflict resolution: Local changes take precedence

### Backup Configuration
- Local backup: `.backup/`
- Cloud backup: Configured through Git
- Backup frequency: Every commit
- Retention period: 30 days

## 🔒 Security Settings

### Access Control
- Vault password: Required
- Lock on idle: 30 minutes
- Clear clipboard on exit: Enabled
- Restricted mode for plugins: Enabled

### Plugin Security
- Restricted mode: Enabled
- Safe mode: Disabled
- Trusted domains: Configured
- File recovery: Enabled

## 📱 Mobile Configuration

### Mobile-Specific Settings
- **Enable mobile toolbar**: Yes
- **Quick action buttons**:
  - New note
  - Search
  - Last note
  - Quick switcher
- **Gesture support**: Enabled
- **Mobile sync**: Git-based

## 🔍 Search Configuration

### Search Settings
- **Enable full-text search**: Yes
- **Include file names**: Yes
- **Include tags**: Yes
- **Include links**: Yes
- **Include embedded searches**: No
- **Default boolean mode**: AND
- **Case sensitivity**: Insensitive

## 📊 Performance Optimization

### Cache Settings
- **Cache limit**: 1000 files
- **Search cache**: Enabled
- **Link cache**: Enabled
- **Image cache**: Enabled

### Resource Management
- **Lazy loading**: Enabled
- **Reduce motion**: Optional
- **Hardware acceleration**: Enabled
- **Debug mode**: Disabled

## 🔄 Change Management

### Version Control
- Track configuration changes in Git
- Document changes in changelog
- Review settings quarterly
- Update documentation as needed

### Changelog
| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial configuration | Name |

## 📝 Related Documentation
- [[style-guide]]
- [[git-workflow]]
- [[backup-system]]
- [[mobile-workflows]]

---

*Last updated: <% tp.date.now("YYYY-MM-DD") %>* 