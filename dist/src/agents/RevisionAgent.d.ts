import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
export declare class RevisionAgent extends BaseAgent {
    constructor(config: AgentConfig);
    reviseContent(reviewData: any): Promise<{
        revisedContent: string;
        timestamp: string;
        processingTime: number;
    }>;
}
//# sourceMappingURL=RevisionAgent.d.ts.map