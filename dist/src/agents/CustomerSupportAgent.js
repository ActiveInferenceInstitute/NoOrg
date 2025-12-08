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
exports.CustomerSupportAgent = void 0;
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * CustomerSupportAgent specializes in handling customer inquiries,
 * troubleshooting issues, and providing support responses.
 */
class CustomerSupportAgent {
    /**
     * Create a new CustomerSupportAgent
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
        Object.defineProperty(this, "responseCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        const timestamp = Date.now();
        const supportLevel = options?.supportLevel || 'tier1';
        const tone = options?.tone || 'professional';
        this.agent = {
            id: (0, uuid_1.v4)(),
            name,
            type: 'customer-support',
            description: options?.description || `Customer support agent (${supportLevel})`,
            capabilities: [
                'issue-resolution',
                'product-information',
                'troubleshooting',
                'customer-service',
                'email-response',
                'query-classification',
                'sentiment-analysis'
            ],
            status: 'offline',
            metadata: {
                supportLevel,
                tone,
                empathyLevel: 0.9,
                productKnowledge: options?.productKnowledge || {},
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
            // Initialize response cache
            this.responseCache.clear();
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
     * Respond to a customer inquiry
     * @param inquiry Customer inquiry/question
     * @param options Response options
     */
    async respondToInquiry(inquiry, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const responseFormat = options?.responseFormat || 'email';
        const priorityLevel = options?.priorityLevel || 'medium';
        // Generate cache key
        const cacheKey = `inquiry-${inquiry.toLowerCase().replace(/\s+/g, '-').substring(0, 100)}-${responseFormat}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.responseCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 43200000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare customer support prompt
            let prompt = `
        As a ${this.agent.metadata?.tone || 'professional'} customer support agent, respond to the following inquiry:
        
        CUSTOMER INQUIRY: ${inquiry}
        
        ${options?.customerContext ? `CUSTOMER CONTEXT: ${JSON.stringify(options.customerContext)}` : ''}
        ${options?.productContext ? `PRODUCT CONTEXT: ${JSON.stringify(options.productContext)}` : this.agent.metadata?.productKnowledge ? `PRODUCT CONTEXT: ${JSON.stringify(this.agent.metadata.productKnowledge)}` : ''}
        PRIORITY LEVEL: ${priorityLevel}
        RESPONSE FORMAT: ${responseFormat}
        
        Your response should:
        1. Be ${this.agent.metadata?.tone || 'professional'} and empathetic
        2. Address the customer's issue directly
        3. Provide clear and accurate information
        ${options?.includeNextSteps ? '4. Include next steps or follow-up actions' : ''}
        ${options?.includeRelatedResources ? '5. Suggest related resources when appropriate' : ''}
        
        Also classify the inquiry by:
        1. Category and subcategory (e.g., "technical issue > login problem")
        2. Customer sentiment (positive, neutral, negative)
        3. Complexity (simple, moderate, complex)
        4. Urgency (low, medium, high, urgent)
        
        Include any suggested actions for the support team and indicate if escalation is needed.
      `;
            // Execute inquiry response (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.4,
                maxTokens: 2000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this customer support response in JSON format:
        
        SUPPORT RESPONSE: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "response": "The customer-facing response",
          "classification": {
            "category": "Main inquiry category",
            "subCategory": "Sub-category (if applicable)",
            "sentiment": "positive|neutral|negative",
            "complexity": "simple|moderate|complex",
            "urgency": "low|medium|high|urgent"
          },
          "suggestedActions": [
            "Suggested action 1",
            "Suggested action 2"
          ],
          "relatedResources": [
            "Related resource 1",
            "Related resource 2"
          ],
          "internalNotes": "Notes for the support team (not for the customer)",
          "escalationNeeded": true/false,
          "escalationReason": "Reason for escalation (if needed)"
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
            this.responseCache.set(cacheKey, {
                query: inquiry,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 43200000
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
            console.error(`Error responding to inquiry: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Generate a troubleshooting guide for a specific issue
     * @param issue The issue to troubleshoot
     * @param options Troubleshooting options
     */
    async createTroubleshootingGuide(issue, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const userLevel = options?.userLevel || 'intermediate';
        const format = options?.format || 'step-by-step';
        // Generate cache key
        const cacheKey = `troubleshooting-${issue.toLowerCase().replace(/\s+/g, '-').substring(0, 100)}-${userLevel}-${format}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.responseCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 43200000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare troubleshooting guide prompt
            let prompt = `
        As a technical support specialist, create a ${format} troubleshooting guide for the following issue:
        
        ISSUE: ${issue}
        
        ${options?.productContext ? `PRODUCT CONTEXT: ${JSON.stringify(options.productContext)}` : this.agent.metadata?.productKnowledge ? `PRODUCT CONTEXT: ${JSON.stringify(this.agent.metadata.productKnowledge)}` : ''}
        USER LEVEL: ${userLevel}
        ${options?.platform ? `PLATFORM: ${options.platform}` : ''}
        ${options?.version ? `VERSION: ${options.version}` : ''}
        ${options?.includeImages ? 'Include image references where helpful.' : ''}
        ${options?.includeVideos ? 'Include video references where helpful.' : ''}
        
        The troubleshooting guide should include:
        1. A clear title and overview of the issue
        2. Any prerequisites or required tools
        3. Step-by-step instructions to resolve the issue
        4. Expected outcome for each step
        5. Common problems that might occur during each step and how to address them
        6. Alternative solutions if the main approach doesn't work
        7. Tips to prevent the issue from recurring
        8. Related issues that might have similar symptoms
        
        Make the guide appropriate for a ${userLevel} user.
      `;
            // Execute troubleshooting guide generation (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.3,
                maxTokens: 3000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this troubleshooting guide in JSON format:
        
        TROUBLESHOOTING GUIDE: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "title": "Guide title",
          "overview": "Issue overview",
          "prerequisites": [
            "Prerequisite 1",
            "Prerequisite 2"
          ],
          "steps": [
            {
              "step": 1,
              "title": "Step title",
              "description": "Step description",
              "expectedOutcome": "What should happen after this step",
              "troubleshooting": [
                "What to do if X happens",
                "What to do if Y happens"
              ]
            }
          ],
          "alternativeSolutions": [
            "Alternative solution 1",
            "Alternative solution 2"
          ],
          "preventionTips": [
            "Prevention tip 1",
            "Prevention tip 2"
          ],
          "relatedIssues": [
            "Related issue 1",
            "Related issue 2"
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
            // Cache the result
            this.responseCache.set(cacheKey, {
                query: issue,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 43200000
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
            console.error(`Error creating troubleshooting guide: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Analyze customer sentiment from feedback
     * @param feedback Customer feedback text
     * @param options Analysis options
     */
    async analyzeSentiment(feedback, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        // Generate cache key
        const cacheKey = `sentiment-${feedback.toLowerCase().replace(/\s+/g, '-').substring(0, 100)}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.responseCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 43200000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare sentiment analysis prompt
            let prompt = `
        As a customer feedback analyst, analyze the sentiment in the following customer feedback:
        
        CUSTOMER FEEDBACK: ${feedback}
        
        Provide a detailed sentiment analysis that includes:
        1. Overall sentiment classification (very negative, negative, neutral, positive, very positive)
        2. A sentiment score between -1.0 (very negative) and 1.0 (very positive)
        3. Key phrases from the feedback that indicate sentiment
        ${options?.includeTopics ? '4. Main topics mentioned and the sentiment toward each' : ''}
        ${options?.includeActionableInsights ? '5. Actionable insights derived from the feedback' : ''}
        ${options?.includeSuggestions ? '6. Suggestions for how to respond to or address the feedback' : ''}
      `;
            // Execute sentiment analysis (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.1,
                maxTokens: 2000
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this sentiment analysis in JSON format:
        
        SENTIMENT ANALYSIS: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "overallSentiment": "very negative|negative|neutral|positive|very positive",
          "sentimentScore": a number between -1.0 and 1.0,
          "keyPhrases": [
            "Key phrase 1",
            "Key phrase 2"
          ],
          ${options?.includeTopics ? `
          "topics": [
            {
              "name": "Topic name",
              "sentiment": "negative|neutral|positive",
              "mentions": number of mentions
            }
          ],` : ''}
          ${options?.includeActionableInsights ? `
          "actionableInsights": [
            "Insight 1",
            "Insight 2"
          ],` : ''}
          ${options?.includeSuggestions ? `
          "suggestions": [
            "Suggestion 1",
            "Suggestion 2"
          ]` : ''}
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
            this.responseCache.set(cacheKey, {
                query: feedback,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 43200000
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
            console.error(`Error analyzing sentiment: ${error.message}`);
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
        for (const [key, value] of this.responseCache.entries()) {
            if (now - value.timestamp > cacheTTL) {
                this.responseCache.delete(key);
            }
        }
    }
    /**
     * Update product knowledge
     * @param knowledge Product knowledge to update
     */
    updateProductKnowledge(knowledge) {
        try {
            this.agent.metadata = {
                ...this.agent.metadata,
                productKnowledge: {
                    ...this.agent.metadata?.productKnowledge,
                    ...knowledge
                }
            };
            // Update shared state
            this.sharedState.setState(`agents.${this.agent.id}.metadata.productKnowledge`, this.agent.metadata?.productKnowledge);
            return true;
        }
        catch (error) {
            console.error(`Error updating product knowledge: ${error}`);
            return false;
        }
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        try {
            this.updateStatus('offline');
            this.isInitialized = false;
            this.responseCache.clear();
            return true;
        }
        catch (error) {
            console.error(`Error shutting down ${this.agent.name}:`, error);
            return false;
        }
    }
}
exports.CustomerSupportAgent = CustomerSupportAgent;
//# sourceMappingURL=CustomerSupportAgent.js.map