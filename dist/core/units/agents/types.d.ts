import { ILogger } from '../workflow/WorkflowEngine';
import { EventSystem } from '../../events/EventSystem';
/**
 * Base interface for all agent types
 */
export interface Agent {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    process: (input: any, context: WorkflowContext) => Promise<any>;
}
/**
 * The context provided to agents during workflow execution
 */
export interface WorkflowContext {
    config: {
        OUTPUT_DIR?: string;
        OPENAI_API_KEY?: string;
        PROJECT_ID?: string;
        VERSION?: string;
        ORGANIZATION?: string;
        DOMAIN?: string;
        OBJECTIVE?: string;
        CONSTRAINTS?: string;
        TARGET_USERS?: string;
        LLM_CONFIG?: {
            DEFAULT_MODEL: string;
            FALLBACK_MODEL: string;
            TOKEN_LIMIT_THRESHOLD: number;
            DEFAULT_MAX_TOKENS: number;
        };
    };
    outputs: Record<string, any>;
    currentStage?: string;
    logger: ILogger;
    eventSystem: EventSystem;
    startTime: number;
    metrics: {
        stageMetrics: Record<string, {
            startTime: number;
            endTime?: number;
            duration?: number;
            agentType: string;
        }>;
    };
}
/**
 * Represents an organizational unit within the workflow
 */
export interface OrganizationalUnit {
    id: string;
    name: string;
    description: string;
    agents: Agent[];
}
/**
 * Represents a stage in the workflow
 */
export interface WorkflowStage {
    id: string;
    name: string;
    description: string;
    unit: OrganizationalUnit;
    agent: Agent;
    prepareInput: (context: WorkflowContext) => any;
    dependencies: string[];
    outputKey: string;
}
