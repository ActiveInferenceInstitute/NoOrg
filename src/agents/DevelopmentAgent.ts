import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * DevelopmentAgent specializes in software development tasks such as
 * code generation, code review, architecture design, and debugging.
 */
export class DevelopmentAgent {
  private agent: Agent;
  private openAIClient: OpenAIClient;
  private sharedState: SharedStateManager;
  private isInitialized: boolean = false;
  private codeCache: Map<string, {
    query: string;
    result: any;
    timestamp: number;
    expiry: number;
  }> = new Map();
  
  /**
   * Create a new DevelopmentAgent
   * @param name Agent name
   * @param options Optional configuration
   */
  constructor(name: string, options?: {
    openAIClient?: OpenAIClient;
    sharedState?: SharedStateManager;
    preferredModel?: string;
    description?: string;
    cacheTTL?: number; // Cache time-to-live in ms (default 24 hours)
    specialty?: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile' | 'data-engineering';
  }) {
    const timestamp = Date.now();
    const specialty = options?.specialty || 'fullstack';
    this.agent = {
      id: uuidv4(),
      name,
      type: 'development',
      description: options?.description || `Software development agent specializing in ${specialty} development`,
      capabilities: [
        'code-generation',
        'code-review',
        'architecture-design',
        'debugging',
        'testing',
        'technical-documentation',
        'problem-solving'
      ],
      status: 'offline',
      metadata: {
        specialty: specialty,
        technicalLevel: 0.9,
        cacheTTL: options?.cacheTTL || 86400000, // Default 24 hour cache
        languages: this.getLanguagesBySpecialty(specialty)
      },
      preferredModel: options?.preferredModel || 'o3-mini',
      lastActive: timestamp,
      createdAt: timestamp
    };
    
    this.openAIClient = options?.openAIClient || new OpenAIClient();
    this.sharedState = options?.sharedState || SharedStateManager.getInstance();
  }
  
  /**
   * Get programming languages by specialty
   */
  private getLanguagesBySpecialty(specialty: string): string[] {
    switch (specialty) {
      case 'frontend':
        return ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Vue', 'Angular'];
      case 'backend':
        return ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'];
      case 'fullstack':
        return ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'HTML', 'CSS', 'SQL'];
      case 'devops':
        return ['Python', 'Bash', 'YAML', 'HCL', 'Go'];
      case 'mobile':
        return ['Swift', 'Kotlin', 'JavaScript', 'TypeScript', 'Dart'];
      case 'data-engineering':
        return ['Python', 'SQL', 'Scala', 'R'];
      default:
        return ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#'];
    }
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
      
      // Initialize code cache
      this.codeCache.clear();
      
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
   * Generate code based on requirements
   * @param requirements Code requirements specification
   * @param options Code generation options
   */
  async generateCode(requirements: string, options?: {
    language?: string;
    framework?: string;
    codeStyle?: 'functional' | 'object-oriented' | 'procedural';
    includeComments?: boolean;
    includeTests?: boolean;
    checkCache?: boolean;
  }): Promise<{
    code: string;
    language: string;
    documentation?: string;
    testCode?: string;
    explanation?: string;
    processingTime: number;
    cached?: boolean;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const language = options?.language || 'TypeScript';
    const framework = options?.framework || '';
    const codeStyle = options?.codeStyle || 'object-oriented';
    
    // Generate cache key
    const cacheKey = `${requirements}-${language}-${framework}-${codeStyle}-${options?.includeComments}-${options?.includeTests}`;
    
    try {
      // Check cache if enabled
      if (options?.checkCache !== false) {
        const cachedResult = this.codeCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 86400000)) {
          // Return cached result if still valid
          this.updateStatus('available');
          return {
            ...cachedResult.result,
            processingTime: Date.now() - startTime,
            cached: true
          };
        }
      }
      
      // Prepare code generation prompt
      let prompt = `
        As an expert software developer, write code that meets the following requirements:
        
        REQUIREMENTS: ${requirements}
        
        LANGUAGE: ${language}
        ${framework ? `FRAMEWORK: ${framework}` : ''}
        CODE STYLE: ${codeStyle}
        ${options?.includeComments === true ? 'Include clear, helpful comments explaining the code.' : 'Include minimal but necessary comments.'}
        ${options?.includeTests === true ? 'Include comprehensive unit tests for the code.' : ''}
        
        Ensure the code follows best practices, is efficient, secure, and maintainable.
      `;
      
      // Execute code generation (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.2, // Lower temperature for more predictable code
        max_tokens: 3000
      });
      
      // Extract the code from the response
      const generatedContent = response.content;
      
      // Prepare a more structured response
      let result: any = { code: this.extractCodeBlocks(generatedContent), language };
      
      // Add documentation if requested
      if (options?.includeComments === true) {
        const docPrompt = `
          Create concise documentation for the following code:
          
          ${result.code}
          
          Focus on explaining:
          1. The purpose of the code
          2. The main components and their interactions
          3. Any important design decisions or patterns used
          4. How to use the code properly
        `;
        
        const docResponse = await this.openAIClient.sendPrompt(docPrompt, {
          model: this.agent.preferredModel,
          temperature: 0.3,
          max_tokens: 1000
        });
        
        result.documentation = docResponse.choices[0].message.content;
      }
      
      // Generate separate test code if requested
      if (options?.includeTests === true && !result.code.includes('test')) {
        const testPrompt = `
          Create unit tests for the following code:
          
          ${result.code}
          
          Use appropriate testing frameworks for ${language}.
          Ensure comprehensive test coverage for all major functionality.
        `;
        
        const testResponse = await this.openAIClient.sendPrompt(testPrompt, {
          model: this.agent.preferredModel,
          temperature: 0.2,
          max_tokens: 1500
        });
        
        result.testCode = this.extractCodeBlocks(testResponse.choices[0].message.content);
      }
      
      // Cache the result
      this.codeCache.set(cacheKey, {
        query: requirements,
        result,
        timestamp: Date.now(),
        expiry: this.agent.metadata?.cacheTTL || 86400000
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
      console.error(`Error generating code: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Extract code blocks from a response string
   */
  private extractCodeBlocks(content: string): string {
    // Simple regex to extract code blocks with backticks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches.map(match => match[1]).join('\n\n');
    }
    
    // If no code blocks with backticks found, return the whole content
    return content;
  }
  
  /**
   * Review code and provide feedback
   * @param code Code to review
   * @param options Review options
   */
  async reviewCode(code: string, options?: {
    language?: string;
    focusAreas?: ('security' | 'performance' | 'style' | 'maintainability' | 'testing')[];
    severity?: 'strict' | 'balanced' | 'lenient';
  }): Promise<{
    issues: Array<{
      type: string;
      severity: 'critical' | 'major' | 'minor' | 'suggestion';
      description: string;
      line?: number;
      recommendation: string;
    }>;
    summary: string;
    score: number;
    strengths: string[];
    recommendations: string[];
    processingTime: number;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const language = options?.language || this.detectLanguage(code);
    const focusAreas = options?.focusAreas || ['security', 'performance', 'style', 'maintainability'];
    const severity = options?.severity || 'balanced';
    
    try {
      // Prepare code review prompt
      let prompt = `
        Perform a ${severity} code review of the following ${language} code:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Focus areas: ${focusAreas.join(', ')}
        
        Identify issues and provide a JSON response with the following structure:
        {
          "issues": [
            {
              "type": "security|performance|style|maintainability|testing",
              "severity": "critical|major|minor|suggestion",
              "description": "Description of the issue",
              "line": optional line number,
              "recommendation": "How to fix the issue"
            }
          ],
          "summary": "Overall review summary",
          "score": A score from 0-100 representing code quality,
          "strengths": ["Strength 1", "Strength 2", ...],
          "recommendations": ["Recommendation 1", "Recommendation 2", ...]
        }
      `;
      
      // Execute code review (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.1, // Lower temperature for more consistent reviews
        max_tokens: 2000
      });
      
      // Parse the JSON response
      const reviewResult = JSON.parse(response.content);
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...reviewResult,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error reviewing code: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Design software architecture based on requirements
   * @param requirements System requirements
   * @param options Architecture design options
   */
  async designArchitecture(requirements: string, options?: {
    type?: 'monolith' | 'microservices' | 'serverless' | 'hybrid';
    technologiesPreference?: string[];
    includeDataModel?: boolean;
    includeDeployment?: boolean;
    complexity?: 'simple' | 'moderate' | 'complex';
  }): Promise<{
    architecture: {
      overview: string;
      components: Array<{
        name: string;
        description: string;
        responsibilities: string[];
        technologies: string[];
        interfaces?: string[];
      }>;
      interactions: Array<{
        source: string;
        target: string;
        description: string;
        protocol?: string;
      }>;
    };
    dataModel?: {
      entities: Array<{
        name: string;
        properties: Array<{name: string, type: string, description: string}>;
        relationships: Array<{entity: string, type: string, description: string}>;
      }>;
    };
    deploymentModel?: {
      environments: string[];
      components: Array<{
        name: string;
        environment: string;
        resources: {cpu: string, memory: string, storage: string};
        scaling?: {min: number, max: number, metrics: string};
      }>;
    };
    diagrams?: {
      componentDiagram: string;
      dataDiagram?: string;
      deploymentDiagram?: string;
    };
    technologies: string[];
    processingTime: number;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const type = options?.type || 'hybrid';
    const complexity = options?.complexity || 'moderate';
    
    try {
      // Prepare architecture design prompt
      let prompt = `
        As a software architect, design a ${complexity} ${type} architecture that meets these requirements:
        
        REQUIREMENTS: ${requirements}
        
        ${options?.technologiesPreference ? `PREFERRED TECHNOLOGIES: ${options.technologiesPreference.join(', ')}` : ''}
        ${options?.includeDataModel ? 'Include a comprehensive data model with entities and relationships.' : ''}
        ${options?.includeDeployment ? 'Include a deployment model with environments and resource requirements.' : ''}
        
        Provide a detailed architecture design in JSON format with the following structure:
        {
          "architecture": {
            "overview": "High-level description of the architecture",
            "components": [
              {
                "name": "Component name",
                "description": "Component description",
                "responsibilities": ["Responsibility 1", "Responsibility 2", ...],
                "technologies": ["Technology 1", "Technology 2", ...],
                "interfaces": ["Interface 1", "Interface 2", ...]
              }
            ],
            "interactions": [
              {
                "source": "Source component",
                "target": "Target component",
                "description": "Interaction description",
                "protocol": "HTTP/gRPC/WebSocket/etc."
              }
            ]
          },
          ${options?.includeDataModel ? `
          "dataModel": {
            "entities": [
              {
                "name": "Entity name",
                "properties": [
                  {"name": "Property name", "type": "Property type", "description": "Property description"}
                ],
                "relationships": [
                  {"entity": "Related entity", "type": "one-to-many/many-to-many/etc.", "description": "Relationship description"}
                ]
              }
            ]
          },` : ''}
          ${options?.includeDeployment ? `
          "deploymentModel": {
            "environments": ["Dev", "Staging", "Production", ...],
            "components": [
              {
                "name": "Component name",
                "environment": "Environment",
                "resources": {"cpu": "CPU requirement", "memory": "Memory requirement", "storage": "Storage requirement"},
                "scaling": {"min": 1, "max": 5, "metrics": "Scaling metrics"}
              }
            ]
          },` : ''}
          "diagrams": {
            "componentDiagram": "ASCII/Text diagram showing component relationships"
            ${options?.includeDataModel ? `, "dataDiagram": "ASCII/Text diagram showing data model"` : ''}
            ${options?.includeDeployment ? `, "deploymentDiagram": "ASCII/Text diagram showing deployment"` : ''}
          },
          "technologies": ["Technology 1", "Technology 2", ...]
        }
      `;
      
      // Execute architecture design (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.2,
        max_tokens: 3000
      });
      
      // Parse the JSON response
      const architectureResult = JSON.parse(response.content);
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...architectureResult,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error designing architecture: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Detect programming language from code snippet
   */
  private detectLanguage(code: string): string {
    // Simple language detection based on keywords and syntax
    if (code.includes('import React') || code.includes('function Component') || code.includes('className=') || code.includes('export default')) {
      return 'JavaScript';
    } else if (code.includes('interface ') || code.includes('type ') || code.includes('class ') && code.includes(': ')) {
      return 'TypeScript';
    } else if (code.includes('def ') || code.includes('import ') && !code.includes(';')) {
      return 'Python';
    } else if (code.includes('public class ') || code.includes('private ') && code.includes(';')) {
      return 'Java';
    } else if (code.includes('func ') && code.includes('package ')) {
      return 'Go';
    } else if (code.includes('namespace ') || code.includes('using ') && code.includes(';')) {
      return 'C#';
    } else if (code.includes('fn ') || code.includes('pub struct ')) {
      return 'Rust';
    } else if (code.includes('<?php')) {
      return 'PHP';
    } else {
      return 'Unknown';
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const cacheTTL = this.agent.metadata?.cacheTTL || 86400000;
    
    for (const [key, value] of this.codeCache.entries()) {
      if (now - value.timestamp > cacheTTL) {
        this.codeCache.delete(key);
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
      this.codeCache.clear();
      return true;
    } catch (error) {
      console.error(`Error shutting down ${this.agent.name}:`, error);
      return false;
    }
  }
} 