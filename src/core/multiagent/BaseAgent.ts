import { AgentConfig } from './types';
import { OpenAIClient } from './OpenAIClient';
import { SharedStateManager } from './SharedStateManager';
import { BaseAgentInterface } from './workflow_types';

/**
 * BaseAgent provides core functionality for all agents
 */
export abstract class BaseAgent implements BaseAgentInterface {
  protected openAIClient: OpenAIClient;
  protected sharedState: SharedStateManager;
  protected config: AgentConfig;
  protected status: 'idle' | 'busy' | 'error' | 'offline' = 'idle';
  protected lastError: Error | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openAIClient = (config.openAIClient as OpenAIClient) || new OpenAIClient();
    this.sharedState = (config.sharedState as SharedStateManager) || SharedStateManager.getInstance();
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    try {
      this.status = 'idle';
      this.lastError = null;
      await this.sharedState.registerAgent(this.config.name, this);
    } catch (error: any) {
      this.status = 'error';
      this.lastError = error;
      throw error;
    }
  }

  /**
   * Get agent information
   */
  getAgentInfo(): {
    name: string;
    type: string;
    status: string;
    lastError: Error | null;
  } {
    return {
      name: this.config.name,
      type: this.constructor.name,
      status: this.status,
      lastError: this.lastError
    };
  }

  /**
   * Update agent status
   */
  protected updateStatus(newStatus: 'idle' | 'busy' | 'error' | 'offline'): void {
    this.status = newStatus;
    this.sharedState.updateAgentStatus(this.config.name, newStatus);
  }

  /**
   * Handle errors
   */
  protected handleError(error: Error): void {
    this.status = 'error';
    this.lastError = error;
    this.sharedState.updateAgentStatus(this.config.name, 'error');
  }

  /**
   * Shutdown the agent
   */
  async shutdown(): Promise<boolean> {
    try {
      this.updateStatus('offline');
      return true;
    } catch (error: any) {
      this.handleError(error);
      return false;
    }
  }
} 