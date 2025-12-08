import { AgentConfig } from './types';
import { OpenAIClient } from './OpenAIClient';
import { SharedStateManager } from './SharedStateManager';
import { BaseAgentInterface } from './workflow_types';
/**
 * BaseAgent provides core functionality for all agents
 */
export declare abstract class BaseAgent implements BaseAgentInterface {
    protected openAIClient: OpenAIClient;
    protected sharedState: SharedStateManager;
    protected config: AgentConfig;
    protected status: 'idle' | 'busy' | 'error' | 'offline';
    protected lastError: Error | null;
    constructor(config: AgentConfig);
    /**
     * Initialize the agent
     */
    initialize(): Promise<void>;
    /**
     * Get agent information
     */
    getAgentInfo(): {
        name: string;
        type: string;
        status: string;
        lastError: Error | null;
    };
    /**
     * Update agent status
     */
    protected updateStatus(newStatus: 'idle' | 'busy' | 'error' | 'offline'): void;
    /**
     * Handle errors
     */
    protected handleError(error: Error): void;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
//# sourceMappingURL=BaseAgent.d.ts.map