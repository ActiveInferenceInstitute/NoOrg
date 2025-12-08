import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
/**
 * HRAgent specializes in human resources tasks such as job description creation,
 * interview question generation, employee onboarding, and policy development.
 */
export declare class HRAgent {
    private agent;
    private openAIClient;
    private sharedState;
    private isInitialized;
    private hrCache;
    /**
     * Create a new HRAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name: string, options?: {
        openAIClient?: OpenAIClient;
        sharedState?: SharedStateManager;
        preferredModel?: string;
        description?: string;
        cacheTTL?: number;
        specialty?: 'recruitment' | 'employee-relations' | 'benefits' | 'compliance' | 'training';
    });
    /**
     * Initialize the agent
     */
    initialize(): Promise<boolean>;
    /**
     * Get the agent's information
     */
    getAgentInfo(): Agent;
    /**
     * Update the agent's status
     * @param status New status
     */
    updateStatus(status: Agent['status']): boolean;
    /**
     * Create a job description
     * @param jobTitle Job title
     * @param options Job description options
     */
    createJobDescription(jobTitle: string, options?: {
        department?: string;
        experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
        responsibilities?: string[];
        requiredSkills?: string[];
        preferredSkills?: string[];
        education?: string;
        location?: string;
        remoteOption?: boolean;
        companyDescription?: string;
        checkCache?: boolean;
    }): Promise<{
        title: string;
        summary: string;
        responsibilities: string[];
        requiredQualifications: string[];
        preferredQualifications: string[];
        benefits?: string[];
        aboutCompany?: string;
        applicationProcess?: string;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Generate interview questions
     * @param jobTitle Job title
     * @param options Interview question options
     */
    generateInterviewQuestions(jobTitle: string, options?: {
        questionTypes?: ('technical' | 'behavioral' | 'situational' | 'cultural-fit')[];
        experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
        skillsToAssess?: string[];
        numberOfQuestions?: number;
        includeIdealAnswers?: boolean;
        checkCache?: boolean;
    }): Promise<{
        questions: Array<{
            type: string;
            question: string;
            purpose: string;
            idealAnswer?: string;
            followUp?: string[];
            scoringGuidelines?: string;
        }>;
        interviewStructure?: string;
        processingTime: number;
        cached?: boolean;
    }>;
    /**
     * Create an onboarding plan
     * @param roleName Role name
     * @param options Onboarding plan options
     */
    createOnboardingPlan(roleName: string, options?: {
        department?: string;
        duration?: number;
        includeTrainings?: boolean;
        includeTeamIntroductions?: boolean;
        includeSetupTasks?: boolean;
        isRemote?: boolean;
    }): Promise<{
        overview: string;
        timeline: Array<{
            phase: string;
            duration: string;
            activities: Array<{
                name: string;
                description: string;
                responsible: string;
            }>;
        }>;
        setupTasks?: string[];
        requiredTrainings?: Array<{
            name: string;
            description: string;
            duration: string;
        }>;
        teamIntroductions?: Array<{
            name: string;
            role: string;
            purpose: string;
        }>;
        resources?: string[];
        checkpoints?: Array<{
            timing: string;
            focus: string;
            participants: string[];
        }>;
        processingTime: number;
    }>;
    /**
     * Clean up expired cache entries
     */
    private cleanCache;
    /**
     * Shutdown the agent
     */
    shutdown(): Promise<boolean>;
}
//# sourceMappingURL=HRAgent.d.ts.map