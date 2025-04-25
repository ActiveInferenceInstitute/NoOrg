import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
export declare class RevisionAgent extends BaseAgent {
    constructor(name: string, config: AgentConfig);
    reviseContent(reviewData: any): Promise<{
        revisedContent: string;
        timestamp: string;
        processingTime: number;
    }>;
}
