---
title: Obsidian Configuration
created: 2024-03-20
updated: 2024-03-20
tags: [configuration, obsidian, setup, plugins]
---

# Obsidian Configuration

## 📋 Overview
This document outlines the complete configuration setup for our Obsidian vault, including core settings, plugins, themes, and workspace layouts. This configuration ensures a consistent and efficient documentation environment.

## 🔧 Core Settings

### General Settings
```json
{
  "alwaysUpdateLinks": true,
  "newLinkFormat": "relative",
  "useMarkdownLinks": false,
  "attachmentFolderPath": "assets",
  "newFileLocation": "folder",
  "newFileFolderPath": "inbox",
  "showFrontmatter": true,
  "strictLineBreaks": true,
  "showLineNumber": true
}
```text

### Editor Settings
```json
{
  "spellcheck": true,
  "spellcheckDictionary": [
    "obsidian",
    "frontmatter",
    "yaml",
    "mermaid"
  ],
  "readableLineLength": true,
  "foldHeading": true,
  "foldIndent": true,
  "showIndentGuide": true,
  "tabSize": 2
}
```text

### Files & Links
```json
{
  "defaultViewMode": "source",
  "vimMode": false,
  "promptDelete": true,
  "trashOption": "system",
  "useTab": true,
  "pdfExportSettings": {
    "pageSize": "Letter",
    "landscape": false,
    "margin": "0",
    "downscalePercent": 100
  }
}
```text

## 🔌 Core Plugins

### Essential Plugins
1. **File Explorer**
   ```json
   {
     "showAttachments": true,
     "showUnsupportedFiles": false,
     "hideExtensions": true,
     "sortOrder": "alphabetical"
   }
   ```

2. **Search**
   ```json
   {
     "searchDelayMilliSeconds": 0,
     "defaultSearchType": "fuzzy",
     "explainSearch": false,
     "contextLength": 50,
     "matchingCaseSensitive": false
   }
   ```

3. **Quick Switcher**
   ```json
   {
     "showAllFileTypes": true,
     "showAttachments": false,
     "showExistingOnly": false,
     "showOpenFiles": true
   }
   ```

### Extended Plugins
1. **Graph View**
   ```json
   {
     "collapse-filter": true,
     "search": "",
     "showTags": true,
     "showAttachments": false,
     "hideUnresolved": false,
     "showOrphans": true,
     "collapse-color-groups": true,
     "colorGroups": [
       {
         "query": "tag:#meta",
         "color": {
           "a": 1,
           "rgb": 14701138
         }
       },
       {
         "query": "tag:#documentation",
         "color": {
           "a": 1,
           "rgb": 5431473
         }
       }
     ]
   }
   ```

2. **Backlinks**
   ```json
   {
     "showUnlinked": true,
     "showBacklinks": true,
     "unlinkedCollapsed": false,
     "backlinkCollapsed": false
   }
   ```

## 🎨 Community Plugins

### Core Functionality
1. **Dataview**
   ```javascript
   // Example query
   TABLE file.ctime AS "Created", file.mtime AS "Modified"
   FROM "docs"
   WHERE contains(tags, "documentation")
   SORT file.mtime DESC
   ```

2. **Templater**
   ```javascript
   // Template configuration
   {
     "templates_folder": "templates",
     "templates_pairs": [
       ["tp.date.now", "YYYY-MM-DD"],
       ["tp.file.title", ""],
       ["tp.file.creation_date", "YYYY-MM-DD HH:mm"]
     ],
     "trigger_on_file_creation": true,
     "enable_system_commands": false
   }
   ```

### Enhancement Plugins
1. **Calendar**
   ```json
   {
     "showWeeklyNote": true,
     "weekStart": "monday",
     "wordsPerDot": 250,
     "showTagCount": true
   }
   ```

2. **Advanced Tables**
   ```json
   {
     "formatType": "normal",
     "showMarkdownPreview": true,
     "autoFormat": true
   }
   ```

## 🎯 Workspace Layout

### Main Layout
```yaml
workspace:
  main:
    direction: vertical
    panels:
      - id: file-explorer
        width: 250
      - id: editor
        type: split
        direction: horizontal
      - id: outline
        width: 200
  right:
    direction: horizontal
    width: 300
    panels:
      - id: backlinks
      - id: tags
      - id: search
```text

### Panel Configuration
1. **File Explorer**
   - Show folders first
   - Collapse all on start
   - Custom sorting rules

2. **Editor Panel**
   - Live preview mode
   - Line numbers
   - Fold indicators

3. **Right Sidebar**
   - Backlinks panel
   - Local graph
   - Tag pane

## 🎨 Theme Configuration

### Visual Settings
```json
{
  "theme": "obsidian",
  "baseFontSize": 16,
  "monospaceFontFamily": "JetBrains Mono",
  "textFontFamily": "Inter",
  "accentColor": "#705DCF",
  "nativeMenus": false,
  "showViewHeader": true
}
```text

### Custom CSS
```css
/* Custom styling */
.markdown-preview-view {
  --text-normal: #2e3338;
  --background-primary: #ffffff;
  --background-secondary: #f5f6f8;
}

.theme-dark {
  --text-normal: #dcddde;
  --background-primary: #202225;
  --background-secondary: #2f3136;
}

/* Custom headers */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-accent);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
```text

## 🔐 Security Settings

### Sync Configuration
```json
{
  "syncDebug": false,
  "syncTimeout": 30000,
  "syncInterval": 5000,
  "autoSync": true,
  "syncOnStart": true
}
```text

### Backup Settings
```json
{
  "autoBackup": true,
  "backupInterval": 1440,
  "maxBackupCount": 10,
  "backupPath": "backup/"
}
```text

## 📱 Mobile Configuration

### Mobile Settings
```json
{
  "mobileToolbarCommands": [
    "editor:toggle-bold",
    "editor:toggle-italics",
    "editor:toggle-highlight",
    "editor:insert-link"
  ],
  "mobilePullAction": "command-palette",
  "mobileQuickOpen": true,
  "mobileSwipeNavigate": true
}
```text

### Mobile Sync
```json
{
  "syncOnMobile": true,
  "mobileSync": {
    "enabled": true,
    "interval": 5000,
    "onlyOnWifi": true
  }
}
```text

## 🔄 Hotkeys

### Global Hotkeys
```json
{
  "hotkeys": {
    "editor:toggle-bold": [
      {
        "modifiers": ["Mod"],
        "key": "b"
      }
    ],
    "editor:toggle-italics": [
      {
        "modifiers": ["Mod"],
        "key": "i"
      }
    ],
    "command-palette:open": [
      {
        "modifiers": ["Mod", "Shift"],
        "key": "p"
      }
    ],
    "quick-switcher:open": [
      {
        "modifiers": ["Mod"],
        "key": "o"
      }
    ]
  }
}
```text

### Custom Commands
```json
{
  "commands": [
    {
      "id": "workspace:split-vertical",
      "name": "Split vertically",
      "icon": "lucide-split-vertical",
      "hotkeys": [
        {
          "modifiers": ["Mod", "Shift"],
          "key": "\\"
        }
      ]
    }
  ]
}
```text

## 📚 References

### Internal Documentation
- [[plugin-configuration]]
- [[theme-customization]]
- [[mobile-setup]]
- [[backup-procedures]]

### External Resources
- [Obsidian Documentation](https://help.obsidian.md)
- [Community Plugins](https://obsidian.md/plugins)
- [Theme Gallery](https://obsidian.md/themes)

## 📅 Version History
- 2024-03-20: Initial configuration documentation
- [Future updates will be logged here]

---

*Last updated: 2024-03-20* 