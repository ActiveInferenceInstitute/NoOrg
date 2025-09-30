import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * HRAgent specializes in human resources tasks such as job description creation,
 * interview question generation, employee onboarding, and policy development.
 */
export class HRAgent {
  private agent: Agent;
  private openAIClient: OpenAIClient;
  private sharedState: SharedStateManager;
  private isInitialized: boolean = false;
  private hrCache: Map<string, {
    query: string;
    result: any;
    timestamp: number;
    expiry: number;
  }> = new Map();
  
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
    cacheTTL?: number; // Cache time-to-live in ms (default 7 days)
    specialty?: 'recruitment' | 'employee-relations' | 'benefits' | 'compliance' | 'training';
  }) {
    const timestamp = Date.now();
    const specialty = options?.specialty || 'recruitment';
    this.agent = {
      id: uuidv4(),
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
    
    this.openAIClient = options?.openAIClient || new OpenAIClient();
    this.sharedState = options?.sharedState || SharedStateManager.getInstance();
  }
  
  /**
   * Initialize the agent
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
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
    } catch (error: any) {
      console.error(`Failed to initialize ${this.agent.name}: ${error.message}`);
      this.agent.status = 'error';
      this.sharedState.setState(`agents.${this.agent.id}.status`, 'error');
      return false;
    }
  }
  
  /**
   * Get the agent's information
   */
  getAgentInfo(): Agent {
    return { ...this.agent };
  }
  
  /**
   * Update the agent's status
   * @param status New status
   */
  updateStatus(status: Agent['status']): boolean {
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
  async createJobDescription(jobTitle: string, options?: {
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
  }> {
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
    } catch (error: any) {
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
  async generateInterviewQuestions(jobTitle: string, options?: {
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
  }> {
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
    } catch (error: any) {
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
  async createOnboardingPlan(roleName: string, options?: {
    department?: string;
    duration?: number; // Duration in days
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
  }> {
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
    } catch (error: any) {
      console.error(`Error creating onboarding plan: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
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
  async shutdown(): Promise<boolean> {
    try {
      this.updateStatus('offline');
      this.isInitialized = false;
      this.hrCache.clear();
      return true;
    } catch (error) {
      console.error(`Error shutting down ${this.agent.name}:`, error);
      return false;
    }
  }
} 