import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { PlanningAgentInterface } from '../core/multiagent/workflow_types';
/**
 * PlanningAgent specializes in creating and validating plans
 */
export declare class PlanningAgent extends BaseAgent implements PlanningAgentInterface {
    constructor(name: string, config: AgentConfig);
    createPlan(topic: string, requirements: string[]): Promise<{
        outline: string[];
        milestones: string[];
        dependencies: string[];
        timeline: string;
    }>;
    validatePlan(plan: any): Promise<{
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    }>;
}
