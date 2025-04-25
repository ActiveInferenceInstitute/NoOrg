import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * LegalAgent specializes in legal document generation, contract review,
 * legal research, and compliance analysis.
 */
export class LegalAgent {
  private agent: Agent;
  private openAIClient: OpenAIClient;
  private sharedState: SharedStateManager;
  private isInitialized: boolean = false;
  private legalCache: Map<string, {
    query: string;
    result: any;
    timestamp: number;
    expiry: number;
  }> = new Map();
  
  /**
   * Create a new LegalAgent
   * @param name Agent name
   * @param options Optional configuration
   */
  constructor(name: string, options?: {
    openAIClient?: OpenAIClient;
    sharedState?: SharedStateManager;
    preferredModel?: string;
    description?: string;
    cacheTTL?: number; // Cache time-to-live in ms (default 48 hours)
    specialty?: 'contracts' | 'compliance' | 'ip' | 'corporate' | 'litigation';
    jurisdiction?: string;
  }) {
    const timestamp = Date.now();
    const specialty = options?.specialty || 'contracts';
    this.agent = {
      id: uuidv4(),
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
      
      // Initialize legal cache
      this.legalCache.clear();
      
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
   * Generate a legal document
   * @param documentType Type of legal document
   * @param documentParameters Document parameters
   * @param options Document generation options
   */
  async generateLegalDocument(
    documentType: 'contract' | 'agreement' | 'policy' | 'terms' | 'letter' | 'memo' | 'waiver', 
    documentParameters: {
      parties?: {name: string; type: string; address?: string}[];
      purpose?: string;
      jurisdiction?: string;
      effectiveDate?: string;
      termLength?: string;
      specialTerms?: string[];
      keyProvisions?: string[];
    },
    options?: {
      complexity?: 'simple' | 'standard' | 'comprehensive';
      format?: 'plain' | 'markdown' | 'html';
      includeDefinitions?: boolean;
      includeSectionHeadings?: boolean;
      checkCache?: boolean;
    }
  ): Promise<{
    title: string;
    content: string;
    sections: Array<{heading: string; content: string}>;
    definitions?: Record<string, string>;
    plainLanguageSummary?: string;
    recommendations?: string[];
    warnings?: string[];
    processingTime: number;
    cached?: boolean;
  }> {
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
        max_tokens: 4000
      });
      
      // Process the document
      const documentContent = response.content;
      
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
        max_tokens: 3000
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
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
    } catch (error: any) {
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
  async reviewLegalDocument(document: string, options?: {
    focusAreas?: ('risks' | 'obligations' | 'rights' | 'termination' | 'indemnification' | 'confidentiality' | 'ip')[];
    perspective?: 'neutral' | 'party1' | 'party2';
    thoroughness?: 'basic' | 'detailed' | 'comprehensive';
    documentType?: string;
    jurisdiction?: string;
    checkCache?: boolean;
  }): Promise<{
    summary: string;
    parties: string[];
    keyTerms: Array<{
      term: string;
      category: string;
      summary: string;
      implications: string;
      risk?: 'low' | 'medium' | 'high';
    }>;
    issues: Array<{
      description: string;
      severity: 'minor' | 'moderate' | 'major';
      recommendation: string;
    }>;
    missingElements?: string[];
    recommendations: string[];
    processingTime: number;
    cached?: boolean;
  }> {
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
        max_tokens: 3500
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this legal document review in JSON format:
        
        REVIEW: ${response.content}
        
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
        max_tokens: 2500
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
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
    } catch (error: any) {
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
  async conductLegalResearch(researchQuery: string, options?: {
    jurisdiction?: string;
    depth?: 'basic' | 'detailed' | 'comprehensive';
    includeCaseReferences?: boolean;
    includeStatutes?: boolean;
    includeRegulations?: boolean;
    specificArea?: string;
    checkCache?: boolean;
  }): Promise<{
    summary: string;
    keyFindings: string[];
    relevantLaw: Array<{
      type: 'statute' | 'regulation' | 'case' | 'legal principle';
      reference: string;
      summary: string;
      relevance: string;
    }>;
    analysis: string;
    recommendations?: string[];
    limitations: string[];
    furtherResearchSuggestions?: string[];
    processingTime: number;
    cached?: boolean;
  }> {
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
        max_tokens: 3500
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this legal research in JSON format:
        
        RESEARCH: ${response.content}
        
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
        max_tokens: 2500
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
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
    } catch (error: any) {
      console.error(`Error conducting legal research: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
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
  async shutdown(): Promise<boolean> {
    try {
      this.updateStatus('offline');
      this.isInitialized = false;
      this.legalCache.clear();
      return true;
    } catch (error) {
      console.error(`Error shutting down ${this.agent.name}:`, error);
      return false;
    }
  }
} 