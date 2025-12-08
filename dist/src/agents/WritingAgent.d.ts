import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { WritingAgentInterface } from '../core/multiagent/workflow_types';
/**
 * WritingAgent specializes in content creation and editing
 */
export declare class WritingAgent extends BaseAgent implements WritingAgentInterface {
    constructor(name: string, config: AgentConfig);
    writeContent(topic: string, outline: string[], style?: string): Promise<{
        content: string;
        sections: string[];
        metadata: {
            wordCount: number;
            readingTime: number;
            keywords: string[];
        };
    }>;
    editContent(content: string, changes: string[]): Promise<string>;
    generateContent(topic: string, requirements: string[]): Promise<{
        content: string;
        metadata: {
            wordCount: number;
            sections: string[];
            keywords: string[];
        };
    }>;
    private extractKeywords;
}
//# sourceMappingURL=WritingAgent.d.ts.map