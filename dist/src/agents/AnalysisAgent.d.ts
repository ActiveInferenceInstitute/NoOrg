import { BaseAgent } from '../core/multiagent/BaseAgent';
import { AgentConfig } from '../core/multiagent/types';
import { AnalysisAgentInterface } from '../core/multiagent/workflow_types';
/**
 * AnalysisAgent specializes in analyzing data and generating reports
 */
export declare class AnalysisAgent extends BaseAgent implements AnalysisAgentInterface {
    constructor(name: string, config: AgentConfig);
    analyzeData(data: any): Promise<{
        insights: string[];
        trends: string[];
        recommendations: string[];
        confidence: number;
        processingTime: number;
    }>;
    generateReport(data: any, format: 'text' | 'json' | 'markdown'): Promise<string>;
}
//# sourceMappingURL=AnalysisAgent.d.ts.map