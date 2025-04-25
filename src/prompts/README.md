# Prompt Templates

This directory contains prompt templates used by agents for various tasks and communication patterns. These templates provide standardized formats for agent interactions and task execution.

## Available Prompt Templates

### Agent Coordination (agent_coordination.prompt)

Provides instructions for how agents should coordinate and collaborate with each other. Used to guide agent behavior when working together in multi-agent scenarios.

### Conflict Resolution (conflict_resolution.prompt)

Guidelines for resolving conflicts when multiple agents have different approaches or solutions. This prompt helps agents find common ground and reach consensus.

### Problem Decomposition (problem_decomposition.prompt)

Instructions for breaking down complex problems into smaller, manageable tasks. Helps agents analyze and structure their approach to challenging problems.

### State Synchronization (state_sync.prompt)

Guidelines for maintaining consistent state information across multiple agents. Helps ensure all agents have access to the same up-to-date information.

### System Role (system_role.prompt)

Defines the overall system behavior and constraints for agents. Sets the context and boundaries for the entire multi-agent system.

## Usage

Prompt templates are typically loaded at runtime and may contain placeholders that are filled in with specific context. Example usage:

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Load a prompt template
function loadPrompt(promptName: string): string {
  const promptPath = path.join(__dirname, `${promptName}.prompt`);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Fill in template variables
function formatPrompt(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// Example usage
const coordinationTemplate = loadPrompt('agent_coordination');
const formattedPrompt = formatPrompt(coordinationTemplate, {
  agent_name: 'ResearchAgent',
  task_description: 'Analyze market trends in renewable energy',
  collaboration_agents: 'AnalysisAgent, PlanningAgent'
});
```

## Creating New Prompt Templates

When creating new prompt templates:

1. Use clear, concise language
2. Include placeholders for dynamic content using `{{variable_name}}` syntax
3. Structure prompts with sections for context, instructions, and examples
4. Keep prompts focused on a single task or interaction pattern
5. Test prompts with different inputs to ensure they produce consistent results

## Prompt Best Practices

- Keep prompts concise but complete
- Include specific instructions for tone, format, and content
- Provide examples for complex tasks
- Use consistent formatting across similar prompt types
- Document the purpose and expected inputs for each prompt

## Related Documentation

- [Main Source Documentation](../README.md)
- [Agents Documentation](../agents/README.md) 