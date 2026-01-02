# Prompt Templates

Prompt templates used by agents for various tasks.

## Overview

This directory contains prompt templates in various formats (.prompt, .txt) used by agents throughout the system.

## Structure

Templates are organized by:
- Agent type
- Task type
- Communication pattern

## Usage

Templates are loaded by the PromptManager:

```typescript
import { PromptManager } from '../core/multiagent/PromptManager';

const promptManager = PromptManager.getInstance();
const prompt = await promptManager.getPrompt('analysis-prompt', {
  data: analysisData
});
```

## Related Documentation

- [Prompt Manager](../../core/multiagent/README.md#prompt-manager)
- [Source Code Documentation](../README.md)
