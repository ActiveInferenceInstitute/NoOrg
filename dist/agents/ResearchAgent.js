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
exports.ResearchAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * ResearchAgent specializes in gathering and analyzing information
 * from various sources including search results and provided context
 */
class ResearchAgent extends BaseAgent_1.BaseAgent {
    /**
     * Create a new ResearchAgent
     * @param name Agent name
     * @param config Agent configuration
     */
    constructor(name, config) {
        super({ ...config, name });
        this.researchCache = new Map();
    }
    /**
     * Conduct research on a topic
     * @param topic Research topic
     * @param scope Research scope
     * @returns Research results
     */
    async researchTopic(topic, scope) {
        this.updateStatus('busy');
        try {
            const prompt = `Research the following topic comprehensively: ${topic}
      Focus on these aspects: ${scope.aspects.join(', ')}
      Provide detailed information, including:
      1. Current state and developments
      2. Key challenges and opportunities
      3. Future implications
      4. Supporting evidence and sources
      5. Expert opinions and perspectives`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                maxTokens: 2000
            });
            this.updateStatus('idle');
            return {
                topic,
                scope,
                findings: response,
                timestamp: new Date().toISOString(),
                processingTime: Date.now()
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Extract key information from a document
     * @param document Document text
     * @param extractionQuery What to extract
     * @returns Extracted information
     */
    async extractInformation(document, extractionQuery) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            // Prepare extraction prompt
            const prompt = `
        Please extract the following information from the provided document:
        
        EXTRACTION QUERY: ${extractionQuery}
        
        DOCUMENT:
        ${document.length > 3000 ? document.substring(0, 3000) + "..." : document}
        
        Please provide only the extracted information in a clear, structured format.
        If the requested information is not in the document, please state "Information not found in document."
      `;
            // Execute the extraction (call OpenAI)
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.2, // Very low temperature for extraction
                maxTokens: 500
            });
            // Process the results
            const extraction = response;
            this.updateStatus('idle');
            // Return the results
            return {
                query: extractionQuery,
                extraction,
                confidence: 0.9,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Summarize a document
     * @param document Document to summarize
     * @param options Summarization options
     * @returns Summary
     */
    async summarizeDocument(document, options) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            // Prepare summarization prompt
            const length = options?.length || 'medium';
            const focus = options?.focus ? `with a focus on ${options.focus}` : '';
            const format = options?.bulletPoints ? 'bullet points' : 'paragraph form';
            let maxTokens = 0;
            if (length === 'short')
                maxTokens = 150;
            else if (length === 'medium')
                maxTokens = 300;
            else
                maxTokens = 500;
            const prompt = `
        Please provide a ${length} summary of the following document ${focus} in ${format}:
        
        DOCUMENT:
        ${document.length > 4000 ? document.substring(0, 4000) + "..." : document}
        
        ${options?.bulletPoints ? 'Also provide 3-5 key takeaways from the document.' : ''}
      `;
            // Execute the summarization (call OpenAI)
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.3,
                maxTokens: maxTokens
            });
            // Process the results
            const summaryText = response;
            // Extract key points if bullet points were requested
            let keyPoints = undefined;
            if (options?.bulletPoints) {
                const bulletMatch = summaryText.match(/Key Takeaways?:?([\s\S]+)/i);
                if (bulletMatch) {
                    keyPoints = bulletMatch[1]
                        .split(/\n+/)
                        .filter(line => line.trim().match(/^[•\-*]|\d+\./))
                        .map(line => line.replace(/^[•\-*]|\d+\./, '').trim());
                }
            }
            // Count words in summary
            const wordCount = summaryText.split(/\s+/).length;
            this.updateStatus('idle');
            // Return the results
            return {
                summary: summaryText,
                keyPoints,
                wordCount,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Fact check a statement
     * @param statement Statement to fact check
     * @param context Optional context for fact checking
     * @returns Fact check results
     */
    async factCheck(statement, context) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            // Prepare fact checking prompt
            const prompt = `
        Please fact check the following statement:
        
        STATEMENT: "${statement}"
        
        ${context ? `CONTEXT: ${context}` : ''}
        
        Analyze the statement for factual accuracy. If it contains inaccuracies, explain what's incorrect and provide corrections.
        
        Format your response as:
        - Factual (Yes/No/Partially):
        - Confidence (0-100%):
        - Explanation:
        - Corrections (if needed):
      `;
            // Execute the fact check (call OpenAI)
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.2,
                maxTokens: 500
            });
            // Process the results
            const factCheckText = response;
            // Parse the structured response
            const factualMatch = factCheckText.match(/Factual.*?:\s*(Yes|No|Partially)/i);
            const confidenceMatch = factCheckText.match(/Confidence.*?:\s*(\d+)%/i);
            const explanationMatch = factCheckText.match(/Explanation.*?:\s*([\s\S]+?)(?:$|Corrections)/i);
            const correctionsMatch = factCheckText.match(/Corrections.*?:\s*([\s\S]+)$/i);
            // Extract values from matches
            const isFactual = factualMatch ? factualMatch[1].toLowerCase() === 'yes' : false;
            const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) / 100 : 0.5;
            const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
            const corrections = correctionsMatch ? correctionsMatch[1].trim() : undefined;
            this.updateStatus('idle');
            // Return the results
            return {
                statement,
                isFactual,
                confidence,
                explanation,
                corrections,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Clean up old entries from the cache
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, entry] of this.researchCache.entries()) {
            if (now - entry.timestamp > entry.expiry) {
                this.researchCache.delete(key);
            }
        }
    }
    /**
     * Shutdown the agent
     */
    async shutdown() {
        try {
            this.updateStatus('offline');
            this.researchCache.clear();
            return true;
        }
        catch (error) {
            this.handleError(error);
            return false;
        }
    }
}
exports.ResearchAgent = ResearchAgent;
//# sourceMappingURL=ResearchAgent.js.map