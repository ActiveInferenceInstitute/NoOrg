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
exports.MarketingAgent = void 0;
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * MarketingAgent specializes in creating marketing strategies, campaign planning,
 * brand messaging, and audience targeting.
 */
class MarketingAgent {
    /**
     * Create a new MarketingAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name, options) {
        this.isInitialized = false;
        this.campaignCache = new Map();
        const timestamp = Date.now();
        this.agent = {
            id: (0, uuid_1.v4)(),
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
            // Initialize campaign cache
            this.campaignCache.clear();
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
     * Create a marketing campaign strategy
     * @param campaignBrief Brief for the marketing campaign
     * @param options Campaign strategy options
     */
    async createCampaignStrategy(campaignBrief, options) {
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
                max_tokens: 2000
            });
            // Process the results
            const strategyContent = response.content;
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
                max_tokens: 1000
            });
            // Parse the structured result
            const structuredResult = JSON.parse(extractionResponse.content);
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
        }
        catch (error) {
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
    async analyzeAudience(audienceDescription, options) {
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
                max_tokens: depth === 'comprehensive' ? 2500 : (depth === 'detailed' ? 1500 : 800)
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this audience analysis in JSON format:
        
        ANALYSIS: ${response.content}
        
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
                max_tokens: 1000
            });
            // Parse the structured result
            const result = JSON.parse(extractionResponse.content);
            // Update agent status
            this.updateStatus('available');
            return {
                ...result,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error(`Error analyzing audience: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Clean up expired cache entries
     */
    cleanCache() {
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
    async shutdown() {
        try {
            this.updateStatus('offline');
            this.isInitialized = false;
            this.campaignCache.clear();
            return true;
        }
        catch (error) {
            console.error(`Error shutting down ${this.agent.name}:`, error);
            return false;
        }
    }
}
exports.MarketingAgent = MarketingAgent;
//# sourceMappingURL=MarketingAgent.js.map