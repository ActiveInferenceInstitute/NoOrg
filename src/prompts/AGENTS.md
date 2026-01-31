# Prompt Templates Technical Documentation

## Overview

This directory contains prompt templates used throughout the NoOrg multi-agent framework. These templates provide structured, reusable prompts for various agent operations and communication patterns.

## Template Types

### Agent Coordination Prompts
- **agent_coordination.prompt**: Template for coordinating multiple agents on complex tasks
- **conflict_resolution.prompt**: Template for resolving conflicts between agents
- **state_sync.prompt**: Template for synchronizing state between agents
- **task_coordination.txt**: Template for coordinating task execution

### Content Creation Prompts
- **content_creation.txt**: Template for content generation tasks
- **research_task.txt**: Template for research-oriented tasks

### System Prompts
- **system_role.prompt**: Template defining system-level roles and behaviors

## Template Structure

All templates use variable substitution syntax with `{{variableName}}` placeholders.

### Common Variables
- `{{task_description}}`: Description of the task to be performed
- `{{agent_details}}`: Information about available agents
- `{{shared_state}}`: Current shared state information
- `{{responsibilities}}`: Specific responsibilities for the agent

## Usage

### Programmatic Access

```typescript
import { PromptManager } from '../core/multiagent/PromptManager';

const promptManager = PromptManager.getInstance('./prompts');
const prompt = await promptManager.getPrompt('agent_coordination', {
  task_description: 'Analyze sales data',
  agent_details: 'Research Agent, Analysis Agent',
  shared_state: '{}'
});
```text

### Template Variables

Templates support dynamic variable substitution:

```typescript
const filledPrompt = await promptManager.getPrompt('research_task', {
  topic: 'Machine Learning',
  depth: 'comprehensive',
  sources: ['academic papers', 'industry reports']
});
```text

## Template Categories

### Communication Patterns
Templates for agent-to-agent and agent-to-system communication:
- Coordination and delegation
- Conflict resolution
- State synchronization

### Task Execution
Templates for specific task types:
- Research and analysis
- Content creation
- Problem solving

### System Integration
Templates for system-level operations:
- Role definition
- Error handling
- Status reporting

## File Format

Templates are stored as `.prompt` or `.txt` files with UTF-8 encoding. Variables are denoted with double curly braces: `{{variableName}}`.

## Related Components

- **PromptManager**: Core class for loading and processing templates
- **Agent Communication**: Uses templates for structured agent interactions
- **Task Coordination**: Leverages templates for task-specific prompts

## Maintenance

When adding new templates:
1. Follow the variable naming convention
2. Include comprehensive variable documentation
3. Test template rendering with PromptManager
4. Update this documentation

## Security Considerations

Templates should:
- Avoid hardcoded sensitive information
- Use parameterized variables for dynamic content
- Validate variable inputs before substitution
- Follow principle of least privilege in prompt construction