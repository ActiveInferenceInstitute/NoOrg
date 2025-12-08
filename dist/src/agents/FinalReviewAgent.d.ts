import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { FinalReviewAgentInterface } from '../core/multiagent/workflow_types';
/**
 * FinalReviewAgent specializes in final content review and approval
 */
export declare class FinalReviewAgent extends BaseAgent implements FinalReviewAgentInterface {
    constructor(name: string, config: AgentConfig);
    performFinalReview(content: string, previousReviews: any[]): Promise<{
        approved: boolean;
        comments: string[];
        finalScore: number;
        processingTime: number;
    }>;
    generateFinalReport(content: string): Promise<string>;
    performFinalCheck(content: string): Promise<{
        passed: boolean;
        issues: string[];
        recommendations: string[];
        processingTime: number;
    }>;
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
//# sourceMappingURL=FinalReviewAgent.d.ts.map