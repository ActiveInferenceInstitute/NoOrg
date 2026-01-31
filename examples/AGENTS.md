# Examples - Technical Documentation

## Overview

This directory contains comprehensive example implementations and demonstrations for the NoOrg Multi-Agent Framework. Examples are TypeScript-based implementations demonstrating various framework capabilities.

## Directory Structure

```text
examples/
├── README.md                               # Overview and usage
├── 1-event-storage-example.ts              # Event storage demo
├── 2-relationship-management-example.ts   # Relationship management
├── 3-state-management-example.ts          # State management
├── 4-workflow-engine-example.ts           # Workflow engine
├── 5-integrated-operations-example.ts     # Integrated operations
├── 6-openai-agent-example.ts              # OpenAI integration
├── 7-multi-unit-llm-flow-example.ts       # Multi-unit LLM flow
├── 8-hybrid-agent-workflow-example.ts     # Hybrid workflows (113KB)
├── 9-active-inference-pomdp-example.ts    # Active Inference POMDP
├── 9-calm-tech-org-ergonomics-example.ts  # Calm Tech ergonomics
├── 10-dynamic-org-generator-example.ts    # Dynamic org generator
├── comprehensive-multi-agent-workflow.ts  # Multi-agent workflow
├── run-*.js                               # Example runners
├── calm_tech/                             # Calm technology examples
├── cognicism/                             # Cognicism examples
├── integration-patterns/                  # Integration pattern examples
└── lexdao/                                # LexDAO examples (23 files)
```text

## Example Categories

### Core Framework Examples (1-5)

- Event storage and management
- Relationship management
- State management
- Workflow engine
- Integrated operations

### AI Integration Examples (6-7)

- OpenAI agent integration
- Multi-unit LLM flow coordination

### Advanced Pattern Examples (8-10)

- Hybrid agent workflows
- Active Inference POMDP modeling
- Dynamic organization generation
- Calm technology ergonomics

## Running Examples

```bash
# Run specific example
node examples/run-workflow-demo.js

# Run active inference demo
node examples/run-active-inference-demo.js

# Run dynamic org generator
node examples/run-dynamic-org-generator.js
```text

## Related Code

These examples demonstrate functionality from:

- [`src/agents/`](../src/agents/) - Agent implementations
- [`src/core/`](../src/core/) - Core infrastructure

## Related Documentation

- [Root README](../README.md)
- [Agent Documentation](../docs/agents/)
