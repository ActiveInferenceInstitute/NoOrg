"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRAgent = void 0;
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * HRAgent specializes in human resources tasks such as job description creation,
 * interview question generation, employee onboarding, and policy development.
 */
class HRAgent {
    /**
     * Create a new HRAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name, options) {
        Object.defineProperty(this, "agent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openAIClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sharedState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "hrCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        const timestamp = Date.now();
        const specialty = options?.specialty || 'recruitment';
        this.agent = {
            id: (0, uuid_1.v4)(),
            name,
            type: 'hr',
            description: options?.description || `Human resources agent specializing in ${specialty}`,
            capabilities: [
                'job-description-creation',
                'interview-question-generation',
                'employee-onboarding',
                'policy-development',
                'performance-evaluation',
                'compensation-analysis',
                'professional-communication'
            ],
            status: 'offline',
            metadata: {
                specialty: specialty,
                empathyLevel: 0.8,
                formalityLevel: 0.7,
                cacheTTL: options?.cacheTTL || 604800000 // Default 7 day cache (HR docs change infrequently)
            },
            preferredModel: options?.preferredModel || 'o3-mini',
            lastActive: timestamp,
            createdAt: timestamp
        };
        this.openAIClient = options?.openAIClient || new OpenAIClient_1.OpenAIClient();
        this.sharedState = options?.sharedState || SharedStateManager_1.SharedStateManager.getInstance();
    }
    /**
     * Initialize the agent
     */
    async initialize() {
        if (this.isInitialized)
            return true;
        try {
            // Register agent state in shared state
            this.sharedState.setState(`agents.${this.agent.id}`, {
                id: this.agent.id,
                name: this.agent.name,
                type: this.agent.type,
                capabilities: this.agent.capabilities,
                status: 'initializing',
                lastActive: Date.now()
            });
            // Initialize HR cache
            this.hrCache.clear();
            // Mark agent as available
            this.agent.status = 'available';
            this.sharedState.setState(`agents.${this.agent.id}.status`, 'available');
            this.isInitialized = true;
            return true;
        }
        catch (error) {
            console.error(`Failed to initialize ${this.agent.name}: ${error.message}`);
            this.agent.status = 'error';
            this.sharedState.setState(`agents.${this.agent.id}.status`, 'error');
            return false;
        }
    }
    /**
     * Get the agent's information
     */
    getAgentInfo() {
        return { ...this.agent };
    }
    /**
     * Update the agent's status
     * @param status New status
     */
    updateStatus(status) {
        this.agent.status = status;
        this.agent.lastActive = Date.now();
        this.sharedState.setState(`agents.${this.agent.id}.status`, status);
        this.sharedState.setState(`agents.${this.agent.id}.lastActive`, this.agent.lastActive);
        return true;
    }
    /**
     * Create a job description
     * @param jobTitle Job title
     * @param options Job description options
     */
    async createJobDescription(jobTitle, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const experienceLevel = options?.experienceLevel || 'mid';
        // Generate cache key
        const cacheKey = `job-description-${jobTitle}-${options?.department || ''}-${experienceLevel}-${options?.location || ''}-${options?.remoteOption || false}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.hrCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 604800000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare job description prompt
            let prompt = `
        As an HR professional, create a comprehensive job description for the following position:
        
        JOB TITLE: ${jobTitle}
        ${options?.department ? `DEPARTMENT: ${options.department}` : ''}
        EXPERIENCE LEVEL: ${experienceLevel}
        ${options?.location ? `LOCATION: ${options.location}` : ''}
        ${options?.remoteOption !== undefined ? `REMOTE OPTION: ${options.remoteOption ? 'Yes' : 'No'}` : ''}
        
        ${options?.responsibilities ? `KEY RESPONSIBILITIES:\n${options.responsibilities.map(r => `- ${r}`).join('\n')}` : 'Please include key responsibilities for this role.'}
        
        ${options?.requiredSkills ? `REQUIRED SKILLS:\n${options.requiredSkills.map(s => `- ${s}`).join('\n')}` : 'Please include required skills for this role.'}
        
        ${options?.preferredSkills ? `PREFERRED SKILLS:\n${options.preferredSkills.map(s => `- ${s}`).join('\n')}` : ''}
        
        ${options?.education ? `EDUCATION: ${options.education}` : ''}
        
        ${options?.companyDescription ? `ABOUT THE COMPANY: ${options.companyDescription}` : ''}
        
        The job description should include:
        1. A brief but compelling overview of the position
        2. Detailed list of responsibilities
        3. Required qualifications and skills
        4. Preferred qualifications (if applicable)
        5. Information about benefits (if available)
        6. Brief company description (if provided)
        7. Application instructions
      `;
            // Execute job description generation (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.4,
                maxTokens: 2000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this job description in JSON format:
        
        JOB DESCRIPTION: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "title": "Job title",
          "summary": "Job overview/summary paragraph",
          "responsibilities": ["Responsibility 1", "Responsibility 2", ...],
          "requiredQualifications": ["Required qualification 1", "Required qualification 2", ...],
          "preferredQualifications": ["Preferred qualification 1", "Preferred qualification 2", ...],
          "benefits": ["Benefit 1", "Benefit 2", ...],
          "aboutCompany": "Company description paragraph",
          "applicationProcess": "How to apply paragraph"
        }
      `;
            const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
                model: this.agent.preferredModel,
                temperature: 0.1,
                maxTokens: 1500
            });
            // Parse the structured result
            const result = JSON.parse(extractionResponse.choices[0].message.content);
            // Cache the result
            this.hrCache.set(cacheKey, {
                query: jobTitle,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 604800000
            });
            // Clean up old cache entries
            this.cleanCache();
            // Update agent status
            this.updateStatus('available');
            return {
                ...result,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error(`Error creating job description: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Generate interview questions
     * @param jobTitle Job title
     * @param options Interview question options
     */
    async generateInterviewQuestions(jobTitle, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const questionTypes = options?.questionTypes || ['technical', 'behavioral', 'situational'];
        const experienceLevel = options?.experienceLevel || 'mid';
        const numberOfQuestions = options?.numberOfQuestions || 10;
        // Generate cache key
        const cacheKey = `interview-questions-${jobTitle}-${questionTypes.join(',')}-${experienceLevel}-${options?.skillsToAssess?.join(',') || ''}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.hrCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 604800000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare interview questions prompt
            let prompt = `
        As an HR professional, generate ${numberOfQuestions} interview questions for a ${experienceLevel}-level ${jobTitle} position.
        
        QUESTION TYPES: ${questionTypes.join(', ')}
        ${options?.skillsToAssess ? `SKILLS TO ASSESS: ${options.skillsToAssess.join(', ')}` : ''}
        ${options?.includeIdealAnswers ? 'Please include ideal answers for each question.' : ''}
        
        For each question, provide:
        1. The question itself
        2. The type of question (technical, behavioral, situational, or cultural-fit)
        3. What the question is designed to assess
        4. ${options?.includeIdealAnswers ? 'An ideal answer or key points to look for' : ''}
        5. Potential follow-up questions
        6. Scoring guidelines for evaluating responses
        
        Also provide a suggested interview structure that incorporates these questions effectively.
      `;
            // Execute interview questions generation (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.5,
                maxTokens: 3000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from these interview questions in JSON format:
        
        INTERVIEW CONTENT: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "questions": [
            {
              "type": "technical|behavioral|situational|cultural-fit",
              "question": "The question text",
              "purpose": "What this question assesses",
              ${options?.includeIdealAnswers ? `"idealAnswer": "The ideal answer or key points",` : ''}
              "followUp": ["Follow-up question 1", "Follow-up question 2"],
              "scoringGuidelines": "How to score the response"
            }
          ],
          "interviewStructure": "Suggested interview structure paragraph"
        }
      `;
            const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
                model: this.agent.preferredModel,
                temperature: 0.1,
                maxTokens: 2500
            });
            // Parse the structured result
            const result = JSON.parse(extractionResponse.choices[0].message.content);
            // Limit to the requested number of questions
            if (result.questions.length > numberOfQuestions) {
                result.questions = result.questions.slice(0, numberOfQuestions);
            }
            // Cache the result
            this.hrCache.set(cacheKey, {
                query: jobTitle,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 604800000
            });
            // Clean up old cache entries
            this.cleanCache();
            // Update agent status
            this.updateStatus('available');
            return {
                ...result,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error(`Error generating interview questions: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Create an onboarding plan
     * @param roleName Role name
     * @param options Onboarding plan options
     */
    async createOnboardingPlan(roleName, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const duration = options?.duration || 90; // Default 90 days onboarding
        try {
            // Prepare onboarding plan prompt
            let prompt = `
        As an HR professional, create a comprehensive onboarding plan for a new ${roleName}.
        
        ${options?.department ? `DEPARTMENT: ${options.department}` : ''}
        DURATION: ${duration} days
        ${options?.isRemote !== undefined ? `REMOTE WORK: ${options.isRemote ? 'Yes' : 'No'}` : ''}
        
        Include the following in the onboarding plan:
        1. A brief overview of the onboarding process
        2. A timeline with phases and activities
        ${options?.includeSetupTasks ? '3. Setup tasks (equipment, accounts, access, etc.)' : ''}
        ${options?.includeTrainings ? '4. Required trainings with descriptions and durations' : ''}
        ${options?.includeTeamIntroductions ? '5. Team introductions with roles and meeting purposes' : ''}
        6. Resources for the new employee
        7. Check-in points and evaluations during the onboarding period
        
        For each activity, specify who is responsible (HR, manager, IT, etc.)
      `;
            // Execute onboarding plan generation (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.4,
                maxTokens: 3000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this onboarding plan in JSON format:
        
        ONBOARDING PLAN: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "overview": "Overview paragraph",
          "timeline": [
            {
              "phase": "Phase name (e.g., Week 1, First day, etc.)",
              "duration": "Duration of this phase",
              "activities": [
                {
                  "name": "Activity name",
                  "description": "Activity description",
                  "responsible": "Who is responsible"
                }
              ]
            }
          ],
          ${options?.includeSetupTasks ? `"setupTasks": ["Setup task 1", "Setup task 2", ...],` : ''}
          ${options?.includeTrainings ? `
          "requiredTrainings": [
            {
              "name": "Training name",
              "description": "Training description",
              "duration": "Training duration"
            }
          ],` : ''}
          ${options?.includeTeamIntroductions ? `
          "teamIntroductions": [
            {
              "name": "Team member or department",
              "role": "Their role",
              "purpose": "Purpose of the introduction"
            }
          ],` : ''}
          "resources": ["Resource 1", "Resource 2", ...],
          "checkpoints": [
            {
              "timing": "When the checkpoint occurs",
              "focus": "What to discuss/evaluate",
              "participants": ["Participant 1", "Participant 2", ...]
            }
          ]
        }
      `;
            const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
                model: this.agent.preferredModel,
                temperature: 0.1,
                maxTokens: 2500
            });
            // Parse the structured result
            const result = JSON.parse(extractionResponse.choices[0].message.content);
            // Update agent status
            this.updateStatus('available');
            return {
                ...result,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error(`Error creating onboarding plan: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Clean up expired cache entries
     */
    cleanCache() {
        const now = Date.now();
        const cacheTTL = this.agent.metadata?.cacheTTL || 604800000;
        for (const [key, value] of this.hrCache.entries()) {
            if (now - value.timestamp > cacheTTL) {
                this.hrCache.delete(key);
            }
        }
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        try {
            this.updateStatus('offline');
            this.isInitialized = false;
            this.hrCache.clear();
            return true;
        }
        catch (error) {
            console.error(`Error shutting down ${this.agent.name}:`, error);
            return false;
        }
    }
}
exports.HRAgent = HRAgent;
//# sourceMappingURL=HRAgent.js.map