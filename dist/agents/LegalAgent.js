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
exports.LegalAgent = void 0;
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * LegalAgent specializes in legal document generation, contract review,
 * legal research, and compliance analysis.
 */
class LegalAgent {
    /**
     * Create a new LegalAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name, options) {
        this.isInitialized = false;
        this.legalCache = new Map();
        const timestamp = Date.now();
        const specialty = options?.specialty || 'contracts';
        this.agent = {
            id: (0, uuid_1.v4)(),
            name,
            type: 'legal',
            description: options?.description || `Legal agent specializing in ${specialty} ${options?.jurisdiction ? `for ${options.jurisdiction} jurisdiction` : ''}`,
            capabilities: [
                'document-generation',
                'contract-review',
                'legal-research',
                'compliance-analysis',
                'risk-assessment',
                'legal-writing',
                'term-extraction'
            ],
            status: 'offline',
            metadata: {
                specialty: specialty,
                jurisdiction: options?.jurisdiction || 'general',
                precisionLevel: 0.95,
                formalityLevel: 0.9,
                cacheTTL: options?.cacheTTL || 172800000 // Default 48 hour cache
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
            // Initialize legal cache
            this.legalCache.clear();
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
     * Generate a legal document
     * @param documentType Type of legal document
     * @param documentParameters Document parameters
     * @param options Document generation options
     */
    async generateLegalDocument(documentType, documentParameters, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const complexity = options?.complexity || 'standard';
        const format = options?.format || 'plain';
        // Generate cache key
        const cacheKey = `document-${documentType}-${JSON.stringify(documentParameters).substring(0, 100)}-${complexity}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.legalCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 172800000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare document generation prompt
            let prompt = `
        As a legal professional, create a ${complexity} ${documentType} with the following parameters:
        
        DOCUMENT TYPE: ${documentType}
        ${documentParameters.parties ? `PARTIES: ${JSON.stringify(documentParameters.parties)}` : ''}
        ${documentParameters.purpose ? `PURPOSE: ${documentParameters.purpose}` : ''}
        ${documentParameters.jurisdiction ? `JURISDICTION: ${documentParameters.jurisdiction}` : this.agent.metadata?.jurisdiction !== 'general' ? `JURISDICTION: ${this.agent.metadata?.jurisdiction}` : ''}
        ${documentParameters.effectiveDate ? `EFFECTIVE DATE: ${documentParameters.effectiveDate}` : ''}
        ${documentParameters.termLength ? `TERM LENGTH: ${documentParameters.termLength}` : ''}
        ${documentParameters.specialTerms ? `SPECIAL TERMS:\n${documentParameters.specialTerms.map(t => `- ${t}`).join('\n')}` : ''}
        ${documentParameters.keyProvisions ? `KEY PROVISIONS:\n${documentParameters.keyProvisions.map(p => `- ${p}`).join('\n')}` : ''}
        
        OUTPUT FORMAT: ${format}
        ${options?.includeDefinitions ? 'Please include a definitions section.' : ''}
        ${options?.includeSectionHeadings ? 'Please include clear section headings.' : ''}
        
        The document should:
        1. Be legally sound and appropriate for ${documentParameters.jurisdiction || this.agent.metadata?.jurisdiction || 'general use'}
        2. Use clear, precise legal language
        3. Include all necessary components for this type of document
        4. Be organized in logical sections
        5. Include a plain language summary of key points
        6. Note any potential issues or recommendations
      `;
            // Execute document generation (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.2,
                maxTokens: 4000
            });
            // Process the document
            const documentContent = response.choices[0].message.content;
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this legal document in JSON format:
        
        DOCUMENT: ${documentContent}
        
        Extract into the following structure:
        {
          "title": "Document title",
          "content": "The full document content",
          "sections": [
            {
              "heading": "Section heading",
              "content": "Section content"
            }
          ],
          ${options?.includeDefinitions ? `
          "definitions": {
            "term1": "definition1",
            "term2": "definition2"
          },` : ''}
          "plainLanguageSummary": "Simple explanation of the document",
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ],
          "warnings": [
            "Warning 1",
            "Warning 2"
          ]
        }
      `;
            const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
                model: this.agent.preferredModel,
                temperature: 0.1,
                maxTokens: 3000
            });
            // Parse the structured result
            const result = JSON.parse(extractionResponse.choices[0].message.content);
            // Cache the result
            this.legalCache.set(cacheKey, {
                query: `${documentType}-generation`,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 172800000
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
            console.error(`Error generating legal document: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Review a contract or legal document
     * @param document Document to review
     * @param options Review options
     */
    async reviewLegalDocument(document, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const thoroughness = options?.thoroughness || 'detailed';
        const focusAreas = options?.focusAreas || ['risks', 'obligations', 'rights'];
        // Generate cache key - using a hash of the document to avoid too long keys
        const documentHash = document.split('').reduce((acc, char) => {
            return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
        }, 0).toString(16);
        const cacheKey = `document-review-${documentHash}-${thoroughness}-${focusAreas.join(',')}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.legalCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 172800000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare document review prompt
            let prompt = `
        As a legal professional, perform a ${thoroughness} review of the following ${options?.documentType || 'legal document'}:
        
        DOCUMENT: ${document}
        
        FOCUS AREAS: ${focusAreas.join(', ')}
        ${options?.perspective ? `PERSPECTIVE: ${options.perspective}` : 'PERSPECTIVE: neutral'}
        ${options?.jurisdiction ? `JURISDICTION: ${options.jurisdiction}` : this.agent.metadata?.jurisdiction !== 'general' ? `JURISDICTION: ${this.agent.metadata?.jurisdiction}` : ''}
        
        Provide a structured review that includes:
        1. A summary of the document
        2. Identification of all parties involved
        3. Analysis of key terms, categorized appropriately
        4. Identification of potential issues, risks, or ambiguities
        5. Analysis of missing elements or provisions
        6. Specific recommendations for improvements or clarifications
        
        For each key term, include:
        - The term itself
        - The category (obligation, right, restriction, etc.)
        - A summary of what it means
        - Implications for the parties
        - Risk level (if applicable)
        
        For each issue, include:
        - Description of the issue
        - Severity (minor, moderate, major)
        - Recommendation for addressing it
      `;
            // Execute document review (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.2,
                maxTokens: 3500
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this legal document review in JSON format:
        
        REVIEW: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "summary": "Document summary",
          "parties": ["Party 1", "Party 2"],
          "keyTerms": [
            {
              "term": "Term description",
              "category": "Term category",
              "summary": "Term summary",
              "implications": "Implications for parties",
              "risk": "low|medium|high"
            }
          ],
          "issues": [
            {
              "description": "Issue description",
              "severity": "minor|moderate|major",
              "recommendation": "How to address the issue"
            }
          ],
          "missingElements": [
            "Missing element 1",
            "Missing element 2"
          ],
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
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
            this.legalCache.set(cacheKey, {
                query: 'document-review',
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 172800000
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
            console.error(`Error reviewing legal document: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Conduct legal research on a topic
     * @param researchQuery Legal research query
     * @param options Research options
     */
    async conductLegalResearch(researchQuery, options) {
        // Update agent status
        this.updateStatus('busy');
        const startTime = Date.now();
        const depth = options?.depth || 'detailed';
        const jurisdiction = options?.jurisdiction || this.agent.metadata?.jurisdiction || 'general';
        // Generate cache key
        const cacheKey = `legal-research-${researchQuery.substring(0, 100)}-${jurisdiction}-${depth}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                const cachedResult = this.legalCache.get(cacheKey);
                if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 172800000)) {
                    // Return cached result if still valid
                    this.updateStatus('available');
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
            }
            // Prepare legal research prompt
            let prompt = `
        As a legal researcher, conduct ${depth} research on the following legal query:
        
        QUERY: ${researchQuery}
        JURISDICTION: ${jurisdiction}
        ${options?.specificArea ? `SPECIFIC AREA OF LAW: ${options.specificArea}` : ''}
        ${options?.includeCaseReferences ? 'Include relevant case references.' : ''}
        ${options?.includeStatutes ? 'Include relevant statutes.' : ''}
        ${options?.includeRegulations ? 'Include relevant regulations.' : ''}
        
        Provide a structured research report that includes:
        1. A summary of findings
        2. Key findings in bullet points
        3. Relevant laws, regulations, and cases
        4. Legal analysis of the issue
        5. Practical recommendations (if applicable)
        6. Limitations of this research
        7. Suggestions for further research
        
        For each relevant law, include:
        - The type (statute, regulation, case, legal principle)
        - The reference or citation
        - A summary of its content
        - Its relevance to the query
      `;
            // Execute legal research (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.agent.preferredModel,
                temperature: 0.3,
                maxTokens: 3500
            });
            // Extract structured information from the response
            const extractionPrompt = `
        Extract the following information from this legal research in JSON format:
        
        RESEARCH: ${response.choices[0].message.content}
        
        Extract into the following structure:
        {
          "summary": "Research summary",
          "keyFindings": [
            "Key finding 1",
            "Key finding 2"
          ],
          "relevantLaw": [
            {
              "type": "statute|regulation|case|legal principle",
              "reference": "Citation or reference",
              "summary": "Content summary",
              "relevance": "Relevance to the query"
            }
          ],
          "analysis": "Legal analysis",
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ],
          "limitations": [
            "Limitation 1",
            "Limitation 2"
          ],
          "furtherResearchSuggestions": [
            "Suggestion 1",
            "Suggestion 2"
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
            this.legalCache.set(cacheKey, {
                query: researchQuery,
                result,
                timestamp: Date.now(),
                expiry: this.agent.metadata?.cacheTTL || 172800000
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
            console.error(`Error conducting legal research: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Clean up expired cache entries
     */
    cleanCache() {
        const now = Date.now();
        const cacheTTL = this.agent.metadata?.cacheTTL || 172800000;
        for (const [key, value] of this.legalCache.entries()) {
            if (now - value.timestamp > cacheTTL) {
                this.legalCache.delete(key);
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
            this.legalCache.clear();
            return true;
        }
        catch (error) {
            console.error(`Error shutting down ${this.agent.name}:`, error);
            return false;
        }
    }
}
exports.LegalAgent = LegalAgent;
//# sourceMappingURL=LegalAgent.js.map