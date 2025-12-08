import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { ReviewAgentInterface } from '../core/multiagent/workflow_types';
/**
 * ReviewAgent specializes in content review and feedback
 */
export declare class ReviewAgent extends BaseAgent implements ReviewAgentInterface {
    constructor(name: string, config: AgentConfig);
    reviewContent(content: string, criteria: string[]): Promise<{
        score: number;
        feedback: string[];
        improvements: string[];
        processingTime: number;
    }>;
    validateContent(content: string, rules: string[]): Promise<{
        isValid: boolean;
        violations: string[];
        suggestions: string[];
    }>;
}
//# sourceMappingURL=ReviewAgent.d.ts.map