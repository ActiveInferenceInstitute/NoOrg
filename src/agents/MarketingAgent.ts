import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * MarketingAgent specializes in creating marketing strategies, campaign planning,
 * brand messaging, and audience targeting.
 */
export class MarketingAgent {
  private agent: Agent;
  private openAIClient: OpenAIClient;
  private sharedState: SharedStateManager;
  private isInitialized: boolean = false;
  private campaignCache: Map<string, {
    campaign: string;
    result: any;
    timestamp: number;
    expiry: number;
  }> = new Map();
  
  /**
   * Create a new MarketingAgent
   * @param name Agent name
   * @param options Optional configuration
   */
  constructor(name: string, options?: {
    openAIClient?: OpenAIClient;
    sharedState?: SharedStateManager;
    preferredModel?: string;
    description?: string;
    cacheTTL?: number; // Cache time-to-live in ms (default 12 hours)
  }) {
    const timestamp = Date.now();
    this.agent = {
      id: uuidv4(),
      name,
      type: 'marketing',
      description: options?.description || 'Marketing agent that specializes in campaign strategy and content planning',
      capabilities: [
        'market-analysis',
        'campaign-planning',
        'brand-messaging',
        'audience-targeting',
        'content-strategy',
        'trend-analysis',
        'creativity'
      ],
      status: 'offline',
      metadata: {
        specialty: 'marketing strategy',
        creativityLevel: 0.8,
        analyticalLevel: 0.7,
        cacheTTL: options?.cacheTTL || 43200000 // Default 12 hour cache
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
      
      // Initialize campaign cache
      this.campaignCache.clear();
      
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
   * Create a marketing campaign strategy
   * @param campaignBrief Brief for the marketing campaign
   * @param options Campaign strategy options
   */
  async createCampaignStrategy(campaignBrief: string, options?: {
    audience?: string;
    budget?: string;
    timeline?: string;
    channels?: string[];
    goals?: string[];
    industry?: string;
    competitorAnalysis?: boolean;
    checkCache?: boolean;
  }): Promise<{
    strategy: string;
    targetAudience: string;
    channels: string[];
    timeline: string;
    budgetAllocation?: Record<string, string>;
    kpis: string[];
    recommendations: string[];
    processingTime: number;
    cached?: boolean;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const cacheKey = `${campaignBrief}-${options?.audience || ''}-${options?.budget || ''}-${options?.channels?.join(',') || ''}`;
    
    try {
      // Check cache if enabled
      if (options?.checkCache !== false) {
        const cachedResult = this.campaignCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 43200000)) {
          // Return cached strategy if still valid
          this.updateStatus('available');
          return {
            ...cachedResult.result,
            processingTime: Date.now() - startTime,
            cached: true
          };
        }
      }
      
      // Prepare campaign strategy prompt
      let prompt = `
        As a marketing strategist, create a comprehensive marketing campaign strategy based on the following brief:
        
        CAMPAIGN BRIEF: ${campaignBrief}
        
        ${options?.audience ? `TARGET AUDIENCE: ${options.audience}` : 'Please identify the most suitable target audience.'}
        ${options?.budget ? `BUDGET: ${options.budget}` : ''}
        ${options?.timeline ? `TIMELINE: ${options.timeline}` : ''}
        ${options?.channels ? `PREFERRED CHANNELS: ${options.channels.join(', ')}` : ''}
        ${options?.goals ? `CAMPAIGN GOALS: ${options.goals.join(', ')}` : ''}
        ${options?.industry ? `INDUSTRY: ${options.industry}` : ''}
        ${options?.competitorAnalysis ? 'Please include competitor analysis in your strategy.' : ''}
        
        Provide a detailed strategy that includes:
        1. Target audience definition and segmentation
        2. Key messaging and positioning
        3. Channel selection and tactical approach for each channel
        4. Timeline and phasing
        5. Budget allocation (if budget provided)
        6. KPIs and success metrics
        7. Recommendations for implementation
      `;
      
      // Execute strategy creation (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.7,
        maxTokens: 2000
      });
      
      // Process the results
      const strategyContent = response.choices[0].message.content;
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this marketing campaign strategy in JSON format:
        
        STRATEGY: ${strategyContent}
        
        Extract into the following structure:
        {
          "strategy": "Brief summary of the overall strategy",
          "targetAudience": "Description of the target audience",
          "channels": ["Channel 1", "Channel 2", ...],
          "timeline": "Timeline information",
          "budgetAllocation": {"Channel 1": "Amount", "Channel 2": "Amount", ...}, // If available
          "kpis": ["KPI 1", "KPI 2", ...],
          "recommendations": ["Recommendation 1", "Recommendation 2", ...]
        }
      `;
      
      const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
        model: this.agent.preferredModel,
        temperature: 0.1,
        maxTokens: 1000
      });
      
      // Parse the structured result
      const structuredResult = JSON.parse(extractionResponse.choices[0].message.content);
      
      // Add the full strategy text
      structuredResult.fullStrategy = strategyContent;
      
      // Cache the result
      this.campaignCache.set(cacheKey, {
        campaign: campaignBrief,
        result: structuredResult,
        timestamp: Date.now(),
        expiry: this.agent.metadata?.cacheTTL || 43200000
      });
      
      // Clean up old cache entries
      this.cleanCache();
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...structuredResult,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error creating campaign strategy: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Analyze audience demographics and preferences
   * @param audienceDescription Description of the target audience
   * @param options Analysis options
   */
  async analyzeAudience(audienceDescription: string, options?: {
    industry?: string;
    depth?: 'basic' | 'detailed' | 'comprehensive';
    includePersonas?: boolean;
    region?: string;
  }): Promise<{
    segments: {name: string, description: string, preferences: string[], channels: string[]}[];
    personas?: {name: string, age: number, occupation: string, interests: string[], pain_points: string[], goals: string[]}[];
    recommendations: string[];
    insights: string[];
    processingTime: number;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const depth = options?.depth || 'detailed';
    
    try {
      // Prepare audience analysis prompt
      let prompt = `
        As a marketing audience analyst, provide a ${depth} analysis of the following audience:
        
        AUDIENCE: ${audienceDescription}
        ${options?.industry ? `INDUSTRY: ${options.industry}` : ''}
        ${options?.region ? `REGION: ${options.region}` : ''}
        
        Include:
        1. Audience segmentation with clear segment descriptions
        2. Channel preferences for each segment
        3. Key insights about the audience
        4. Strategic recommendations for targeting this audience
        ${options?.includePersonas ? '5. Detailed audience personas with demographics, interests, pain points, and goals' : ''}
      `;
      
      // Execute audience analysis (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.6,
        maxTokens: depth === 'comprehensive' ? 2500 : (depth === 'detailed' ? 1500 : 800)
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this audience analysis in JSON format:
        
        ANALYSIS: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "segments": [
            {
              "name": "Segment name",
              "description": "Segment description",
              "preferences": ["Preference 1", "Preference 2"],
              "channels": ["Channel 1", "Channel 2"]
            }
          ],
          ${options?.includePersonas ? `
          "personas": [
            {
              "name": "Persona name",
              "age": 30,
              "occupation": "Occupation",
              "interests": ["Interest 1", "Interest 2"],
              "pain_points": ["Pain point 1", "Pain point 2"],
              "goals": ["Goal 1", "Goal 2"]
            }
          ],` : ''}
          "recommendations": ["Recommendation 1", "Recommendation 2"],
          "insights": ["Insight 1", "Insight 2"]
        }
      `;
      
      const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
        model: this.agent.preferredModel,
        temperature: 0.1,
        maxTokens: 1000
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
      console.error(`Error analyzing audience: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const cacheTTL = this.agent.metadata?.cacheTTL || 43200000;
    
    for (const [key, value] of this.campaignCache.entries()) {
      if (now - value.timestamp > cacheTTL) {
        this.campaignCache.delete(key);
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
      this.campaignCache.clear();
      return true;
    } catch (error) {
      console.error(`Error shutting down ${this.agent.name}:`, error);
      return false;
    }
  }
} 