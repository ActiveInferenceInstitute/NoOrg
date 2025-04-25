---
title: Obsidian Settings Configuration
created: 2024-03-20
updated: 2024-03-20
tags: [configuration, obsidian, settings, setup]
---

# Obsidian Settings Configuration

## 📋 Overview
This document provides a comprehensive configuration guide for our Obsidian vault, ensuring consistent settings across all users and optimal functionality for our documentation system.

## 🔌 Core Plugins Configuration

### Essential Plugins
1. **File Explorer**
   ```yaml
   file_explorer:
     enabled: true
     settings:
       show_attachments: true
       hide_extensions: true
       sort_by: name
       folders_first: true
       collapse_on_start: false
   ```
   - Links to [[file-organization]] guidelines
   - See [[attachment-handling]] for media files

2. **Graph View**
   ```yaml
   graph_view:
     enabled: true
     settings:
       show_tags: true
       show_attachments: false
       show_existing_files: true
       color_groups:
         - query: "tag:#meta"
           color: "#e91e63"
         - query: "tag:#process"
           color: "#2196f3"
   ```
   - Related to [[knowledge-graph]] visualization
   - See [[graph-customization]] for detailed styling

3. **Search**
   ```yaml
   search:
     enabled: true
     settings:
       fuzzy_match: true
       match_case_sensitive: false
       explain_search_term: true
       show_context: true
   ```
   - Integrated with [[search-configuration]]
   - See [[advanced-search]] features

## 🎨 Theme Configuration

### Visual Settings
```json
{
  "theme": {
    "name": "Minimal",
    "light": {
      "accent": "#007AFF",
      "background": {
        "primary": "#FFFFFF",
        "secondary": "#F5F6F8"
      }
    },
    "dark": {
      "accent": "#0A84FF",
      "background": {
        "primary": "#1E1E1E",
        "secondary": "#252525"
      }
    }
  }
}
```

### Typography
```css
/* Custom typography configuration */
body {
  --font-text: 'Inter', -apple-system, system-ui, sans-serif;
  --font-monospace: 'JetBrains Mono', 'Fira Code', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
  
  --font-size-normal: 16px;
  --line-height-normal: 1.6;
  --line-width: 42em;
}
```

## ⌨️ Hotkey Configuration

### Editor Hotkeys
```yaml
hotkeys:
  editor:
    toggle_bold: "Mod+B"
    toggle_italic: "Mod+I"
    toggle_code: "Mod+`"
    insert_link: "Mod+K"
  
  navigation:
    quick_switcher: "Mod+O"
    back: "Mod+["
    forward: "Mod+]"
    graph_view: "Mod+G"
```

### Custom Commands
```json
{
  "custom_commands": {
    "insert_template": {
      "key": "Mod+T",
      "template": "default"
    },
    "create_daily_note": {
      "key": "Mod+D",
      "template": "daily"
    }
  }
}
```

## 🔌 Community Plugins

### Core Functionality
1. **Dataview**
   ```yaml
   dataview:
     enabled: true
     settings:
       enable_javascript_queries: true
       refresh_interval: 1000
       enable_inline_fields: true
       enable_inline_arrays: true
   ```
   - See [[dataview-automation]] for usage
   - Related to [[metadata-management]]

2. **Templater**
   ```yaml
   templater:
     enabled: true
     settings:
       template_folder: "templates"
       trigger_on_new_file: true
       templates:
         - name: "Default Note"
           path: "templates/default.md"
         - name: "Meeting Note"
           path: "templates/meeting.md"
   ```
   - Links to [[template-management]]
   - See [[templater-workflows]]

## 📱 Mobile Configuration

### Mobile Settings
```yaml
mobile:
  enable_swipe: true
  keep_screen_on: true
  default_view: "preview"
  toolbar_commands:
    - "editor:toggle-bold"
    - "editor:toggle-italic"
    - "editor:toggle-code"
    - "editor:insert-link"
```

### Sync Configuration
```json
{
  "sync": {
    "auto_sync": true,
    "sync_interval": 5000,
    "sync_on_start": true,
    "sync_on_save": true,
    "sync_on_mobile": true
  }
}
```

## 🔒 Security Settings

### Access Control
```yaml
security:
  require_password: true
  password_timeout: 30  # minutes
  auto_lock: true
  lock_on_exit: true
```

### Backup Configuration
```json
{
  "backup": {
    "enabled": true,
    "interval": 1440,  # minutes
    "max_backups": 10,
    "backup_path": "backup/",
    "exclude": [
      ".trash",
      ".git",
      "node_modules"
    ]
  }
}
```

## 🔄 Integration Settings

### Git Integration
```yaml
git:
  enabled: true
  settings:
    auto_commit: true
    commit_interval: 10  # minutes
    commit_message_template: "docs: update {{files}}"
    backup_branch: "backup"
```

### External Tools
```json
{
  "external_tools": {
    "default_markdown_editor": "VSCode",
    "image_editor": "default",
    "pdf_viewer": "default"
  }
}
```

## 📊 Performance Settings

### Cache Configuration
```yaml
cache:
  max_cache_size: 5120  # MB
  cache_timeout: 3600   # seconds
  enable_memory_cache: true
  enable_disk_cache: true
```

### Search Optimization
```json
{
  "search_optimization": {
    "index_delay": 0,
    "index_throttle": 0,
    "fuzzy_match_threshold": 0.5,
    "max_search_results": 50
  }
}
```

## 📚 References

### Internal Documentation
- [[obsidian-configuration]]
- [[plugin-management]]
- [[theme-customization]]
- [[mobile-setup]]

### External Resources
- [Obsidian Documentation](https://help.obsidian.md)
- [Community Plugins](https://obsidian.md/plugins)
- [Theme Gallery](https://obsidian.md/themes)

## 📅 Version History
- 2024-03-20: Initial configuration documentation
- [Future updates will be logged here]

---

*Last updated: 2024-03-20* 