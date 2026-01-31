# NoOrg Multi-Agent Framework - Agent Guidelines

## Overview

NoOrg is a comprehensive, production-ready framework for building resilient, scalable, and distributed multi-agent systems with advanced AI capabilities. This document provides guidance for AI agents working within this codebase.

## Repository Structure

```text
NoOrg/
├── agents/          # Legacy agent implementations (DEPRECATED - see src/agents/)
├── docs/            # Comprehensive documentation
│   ├── ARCHITECTURE.md # System visualizations and diagrams
│   └── GLOSSARY.md     # Core terminology and definitions
├── examples/        # Usage examples and demos
├── scripts/         # Build and utility scripts
├── src/             # Main source code
│   ├── agents/      # Active agent implementations (16+ specialized agents)
│   ├── config/      # Configuration management
│   ├── core/        # Core infrastructure (events, messaging, storage, multiagent)
│   ├── utils/       # Utility functions and helpers
│   └── ...
├── tests/           # Comprehensive test suite (unit, integration, system, performance)
└── units/           # Organizational unit definitions (markdown-based)
```text

## Key Technical Details

### Language & Runtime

- **Language**: TypeScript 5.8+
- **Runtime**: Node.js 18+
- **Package Manager**: npm
- **Build**: `npm run build`
- **Test**: `npm test`

### Core Architecture

1. **Multi-Agent Coordination**: `src/core/multiagent/`
   - `MultiAgentCoordinator`: Main coordination engine
   - `AgentDiscoveryService`: Agent registration and discovery
   - `AgentOrchestrator`: Task assignment and execution

2. **Integration Patterns**: `src/core/integration/patterns/`
   - Circuit Breaker, Bulkhead, Timeout, Retry, Rate Limiter

3. **Event System**: `src/core/events/`
   - Pub/sub messaging infrastructure

4. **Storage System**: `src/core/storage/`
   - In-memory and persistent storage

5. **Specialized Agents**: `src/agents/`
   - 19 production-ready agent types
   - All extend `AbstractAgent` or `BaseAgent` base class

6. **Organizational Units**: `units/`
   - 39+ organizational unit definitions
   - Complete governance hierarchy from Board to operational functions
   - Each unit has Charter, Policies, Processes, and Reports

## Agent Inventory

| Agent | Domain | Key Capabilities |
|-------|--------|-----------------|
| AnalysisAgent | Analytics | Data analysis, visualization, statistical reports |
| ActiveInferencePOMDPAgent | AI/Reasoning | POMDP-based decision making |
| CalmTechnologyAgent | UX/Design | Ergonomic, user-centric design patterns |
| CreativeWritingAgent | Content | Creative content generation and refinement |
| CustomerSupportAgent | Support | Customer service automation |
| DataAnalysisAgent | Analytics | Advanced data processing and insights |
| DevelopmentAgent | Engineering | Code generation, review, architecture design |
| FinalReviewAgent | QA | Quality assurance and final review |
| FinanceAgent | Finance | Financial analysis, budgeting, forecasting |
| HRAgent | HR | Human resources task automation |
| LegalAgent | Legal | Legal document processing |
| MarketingAgent | Marketing | Marketing strategy and campaigns |
| PlanningAgent | Planning | Strategic planning and coordination |
| ResearchAgent | Research | Information gathering, fact-checking, summarization |
| ReviewAgent | Review | Content evaluation and feedback |
| RevisionAgent | Content | Content improvement and editing |
| WritingAgent | Writing | Professional writing and content creation |

## Agent Guidelines

### When Working with Agent Code

1. **All agents extend AbstractAgent** (`src/agents/AbstractAgent.ts`)
2. **Each agent has AGENTS.md** with full interface documentation
3. **Test coverage required** - see `tests/unit/agents/`
4. **Follow TypeScript strict mode** - all types must be defined

### When Working with Core Infrastructure

1. **Event-driven architecture** - use EventSystem for cross-component communication
2. **Resilience patterns required** - wrap external calls with circuit breakers/retries
3. **State management** - use SharedStateManager for coordination
4. **Monitoring** - emit metrics for observability

### Code Conventions

```typescript
// All agents must:
// 1. Extend AbstractAgent
// 2. Implement executeTask()
// 3. Handle errors gracefully
// 4. Update status appropriately

export class CustomAgent extends AbstractAgent {
  async executeTask(taskDetails: any, context?: any): Promise<any> {
    try {
      this.updateStatus('busy');
      const result = await this.processTask(taskDetails);
      this.updateStatus('available');
      return result;
    } catch (error) {
      this.updateStatus('error');
      throw error;
    }
  }
}
```text

## Testing Requirements

- **Unit tests**: Required for all new functionality
- **Integration tests**: Required for multi-component features
- **Test commands**:
  - `npm test` - All tests
  - `npm run test:unit` - Unit tests only
  - `npm run test:integration` - Integration tests
  - `npm run test:coverage` - Coverage report

## Documentation Requirements

- Each directory should have `README.md` (general documentation)
- Code directories should have `AGENTS.md` (technical interface documentation)
- Follow existing documentation patterns in `src/agents/`

## Important Files

| File | Purpose |
|------|---------|
| `/README.md` | Project overview and quick start |
| `/src/agents/AGENTS.md` | Complete agent framework documentation |
| `/docs/core/index.md` | Core system documentation |
| `/package.json` | Dependencies and scripts |
| `/.env.example` | Environment configuration template |

## Environment Variables

Required:

- `OPENAI_API_KEY` - For agent AI functionality

Optional:

- `NODE_ENV` - production/development
- `LOG_LEVEL` - info/debug/warn/error
- `DEFAULT_MODEL` - OpenAI model (default: gpt-4o)

## Error Handling Standards

All agents and core components must follow these error handling patterns:

1. **Validate inputs** at method entry points - throw descriptive errors for invalid data
2. **Use structured logging** via the Logger class - never use `console.error` in agent code
3. **Wrap JSON.parse** calls in try-catch with meaningful fallback behavior
4. **Track timing** using `Date.now()` at method start, compute elapsed time properly
5. **Update agent status** to 'error' on failure, restore to 'available' on recovery
6. **Use integration patterns** (CircuitBreaker, Retry, Timeout) for external service calls

## Architecture Flow

```text
User Request
    ↓
MultiAgentCoordinator (Orchestration)
    ↓
AgentDiscoveryService (Find suitable agents)
    ↓
AgentOrchestrator (Task assignment)
    ↓
Specialized Agents (Parallel execution with resilience patterns)
    ↓
EventSystem (Pub/sub communication) + StorageSystem (Persistence)
    ↓
MonitoringSystem (Observability) → Result aggregation & return
```text

## Related Documentation

- [Core Documentation](docs/core/index.md)
- [Agent Framework](src/agents/AGENTS.md)
- [Integration Patterns](docs/core/integration/patterns/README.md)
- [Multi-Agent System](docs/agents/multiagent-system.md)
- [Development Guide](docs/development/index.md)
- [Organizational Units](units/README.md)
- [Unit Directory](units/unitdirectory.md)
