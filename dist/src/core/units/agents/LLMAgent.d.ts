import { Agent, WorkflowContext } from './types';
/**
 * An agent that uses an LLM to process inputs
 */
export declare class LLMAgent implements Agent {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    systemPrompt: string;
    private llm;
    constructor(config: {
        id: string;
        name: string;
        unitId: string;
        unitName: string;
        description: string;
        systemPrompt: string;
    });
    process(input: any, context: WorkflowContext): Promise<any>;
    private simplifyInput;
}
//# sourceMappingURL=LLMAgent.d.ts.map