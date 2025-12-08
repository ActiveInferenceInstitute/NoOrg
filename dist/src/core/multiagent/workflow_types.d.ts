import { BaseAgent } from './BaseAgent';
import { Agent } from './types';
export interface ResearchPath {
    id: string;
    name: string;
    aspects: string[];
}
export interface WorkflowStage {
    id: string;
    type: string;
    title: string;
    description: string;
    agent: BaseAgent;
    dependsOn?: string[];
    next: string[];
    metadata?: Record<string, any>;
}
export interface AgentWithInfo extends BaseAgent {
    initialize(): Promise<boolean>;
    getAgentInfo(): Agent;
    shutdown(): Promise<boolean>;
}
/**
 * Base interface for all agents
 */
export interface BaseAgentInterface {
    initialize(): Promise<void>;
    getAgentInfo(): {
        name: string;
        type: string;
        status: string;
        lastError: Error | null;
    };
    shutdown(): Promise<boolean>;
}
/**
 * Interface for research agents
 */
export interface ResearchAgentInterface extends BaseAgentInterface {
    researchTopic(topic: string, scope: {
        aspects: string[];
        depth: string;
    }): Promise<any>;
    extractInformation(document: string, extractionQuery: string): Promise<{
        query: string;
        extraction: string;
        confidence: number;
        processingTime: number;
    }>;
    summarizeDocument(document: string, options?: {
        length?: 'short' | 'medium' | 'long';
        focus?: string;
        bulletPoints?: boolean;
    }): Promise<{
        summary: string;
        keyPoints?: string[];
        wordCount: number;
        processingTime: number;
    }>;
    factCheck(statement: string, context?: string): Promise<{
        statement: string;
        isFactual: boolean;
        confidence: number;
        explanation: string;
        corrections?: string;
        processingTime: number;
    }>;
}
/**
 * Interface for analysis agents
 */
export interface AnalysisAgentInterface extends BaseAgentInterface {
    analyzeData(data: any): Promise<{
        insights: string[];
        trends: string[];
        recommendations: string[];
        confidence: number;
        processingTime: number;
    }>;
    generateReport(data: any, format: 'text' | 'json' | 'markdown'): Promise<string>;
}
/**
 * Interface for planning agents
 */
export interface PlanningAgentInterface extends BaseAgentInterface {
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
/**
 * Interface for writing agents
 */
export interface WritingAgentInterface extends BaseAgentInterface {
    generateContent(topic: string, requirements: string[]): Promise<{
        content: string;
        metadata: {
            wordCount: number;
            sections: string[];
            keywords: string[];
        };
    }>;
    editContent(content: string, changes: string[]): Promise<string>;
}
/**
 * Interface for review agents
 */
export interface ReviewAgentInterface extends BaseAgentInterface {
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
/**
 * Interface for final review agents
 */
export interface FinalReviewAgentInterface extends ReviewAgentInterface {
    performFinalCheck(content: string): Promise<{
        passed: boolean;
        issues: string[];
        recommendations: string[];
        processingTime: number;
    }>;
    generateFinalReport(content: string): Promise<string>;
}
//# sourceMappingURL=workflow_types.d.ts.map