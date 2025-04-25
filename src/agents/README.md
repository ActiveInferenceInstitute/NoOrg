# Agents Framework

This directory contains the implementation of various agent types in the multi-agent operations framework. All agents extend the abstract base class `AbstractAgent`, which provides common functionality for initialization, status management, and shared state access.

## Agent Architecture

Agents in this framework follow a common architecture:

1. **AbstractAgent**: Base class that implements the core `Agent` interface and provides common functionality
2. **Specialized Agents**: Domain-specific implementations that extend AbstractAgent with specialized capabilities

Each agent is responsible for:
- Handling specific types of tasks based on its capabilities
- Managing its own state and status
- Coordinating with other agents through the shared state system
- Processing and generating responses using AI models (via OpenAIClient)

## Available Agent Types

The following agent types are currently implemented:

| Agent Type | File | Description |
|------------|------|-------------|
| Analysis | AnalysisAgent.ts | Performs data and information analysis |
| Creative Writing | CreativeWritingAgent.ts | Generates creative content and narratives |
| Customer Support | CustomerSupportAgent.ts | Handles customer service interactions |
| Data Analysis | DataAnalysisAgent.ts | Processes and analyzes numerical and statistical data |
| Development | DevelopmentAgent.ts | Assists with software development tasks |
| Final Review | FinalReviewAgent.ts | Performs final quality checks and reviews |
| Finance | FinanceAgent.ts | Handles financial analysis and planning |
| HR | HRAgent.ts | Manages human resources tasks |
| Legal | LegalAgent.ts | Provides legal analysis and documentation |
| Marketing | MarketingAgent.ts | Creates and analyzes marketing content |
| Planning | PlanningAgent.ts | Develops plans and strategies |
| Research | ResearchAgent.ts | Conducts research on specified topics |
| Review | ReviewAgent.ts | Reviews content and provides feedback |
| Revision | RevisionAgent.ts | Refines and improves existing content |
| Writing | WritingAgent.ts | Generates written content |

## Implementing a New Agent

To create a new agent type:

1. Create a new TypeScript file named `[YourAgent]Agent.ts`
2. Extend the `AbstractAgent` class
3. Implement the required `executeTask` method
4. Add any specialized methods and properties needed

Example template:

```typescript
import { AbstractAgent, AbstractAgentOptions } from './AbstractAgent';
import { Agent, AgentType } from './types';

// Optional: Define specialized task parameters
export interface YourAgentTaskParams {
    // Task-specific parameters
}

// Optional: Define specialized task result
export interface YourAgentTaskResult {
    // Task-specific result structure
}

export class YourAgent extends AbstractAgent {
    constructor(options: AbstractAgentOptions) {
        super({
            ...options,
            type: 'your-agent' as AgentType, // Add this to types.ts AgentType
        });
    }
    
    /**
     * Execute a task specific to this agent type
     */
    async executeTask(
        taskDetails: YourAgentTaskParams, 
        context?: any
    ): Promise<YourAgentTaskResult> {
        // Validate the agent is initialized
        if (!this.isInitialized) {
            throw new Error(`Agent ${this.name} is not initialized`);
        }
        
        // Update status to busy
        this.updateStatus('busy');
        
        try {
            // Implement task execution logic here
            
            // Update status to available
            this.updateStatus('available');
            
            // Return the task result
            return {
                // Task result data
            };
        } catch (error) {
            // Handle errors
            this.updateStatus('error');
            throw error;
        }
    }
    
    // Add any specialized methods
}
```

## Agent Types and Capabilities

The `types.ts` file defines the common interfaces and types used across all agents, including:

- `Agent`: The core interface that all agents implement
- `AgentType`: String literal type of valid agent types
- `Capability`: Enumeration of agent capabilities

When creating a new agent type, you may need to update these definitions in `types.ts`.

## Testing Agents

When implementing a new agent, ensure:

1. The agent can be properly initialized
2. The agent handles errors gracefully
3. The agent updates its status correctly
4. The agent integrates with the shared state system
5. The agent performs its specialized tasks correctly

## Related Documentation

- [Main Source Documentation](../README.md)
- [Multi-Agent System Overview](../docs/MultiAgentSystem_README.md)
- [Multi-Agent Coordinator](../docs/MultiAgentCoordinator.md) 