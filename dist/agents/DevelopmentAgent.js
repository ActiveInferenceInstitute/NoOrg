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
exports.DevelopmentAgent = void 0;
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const SharedStateManager_1 = require("../core/multiagent/SharedStateManager");
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * DevelopmentAgent specializes in software development tasks such as
 * code generation, code review, architecture design, and debugging.
 */
class DevelopmentAgent {
    /**
     * Create a new DevelopmentAgent
     * @param name Agent name
     * @param options Optional configuration
     */
    constructor(name, options) {
        this.isInitialized = false;
        this.codeCache = new Map();
        const timestamp = Date.now();
        const specialty = options?.specialty || 'fullstack';
        this.agent = {
            id: (0, uuid_1.v4)(),
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
        this.openAIClient = options?.openAIClient || new OpenAIClient_1.OpenAIClient();
        this.sharedState = options?.sharedState || SharedStateManager_1.SharedStateManager.getInstance();
    }
    /**
     * Get programming languages by specialty
     */
    getLanguagesBySpecialty(specialty) {
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
            // Initialize code cache
            this.codeCache.clear();
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
     * Generate code based on requirements
     * @param requirements Code requirements specification
     * @param options Code generation options
     */
    async generateCode(requirements, options) {
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
                maxTokens: 3000
            });
            // Extract the code from the response
            const generatedContent = response.choices[0].message.content;
            // Prepare a more structured response
            let result = { code: this.extractCodeBlocks(generatedContent), language };
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
                    maxTokens: 1000
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
                    maxTokens: 1500
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
        }
        catch (error) {
            console.error(`Error generating code: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Extract code blocks from a response string
     */
    extractCodeBlocks(content) {
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
    async reviewCode(code, options) {
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
                maxTokens: 2000
            });
            // Parse the JSON response
            const reviewResult = JSON.parse(response.choices[0].message.content);
            // Update agent status
            this.updateStatus('available');
            return {
                ...reviewResult,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
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
    async designArchitecture(requirements, options) {
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
                maxTokens: 3000
            });
            // Parse the JSON response
            const architectureResult = JSON.parse(response.choices[0].message.content);
            // Update agent status
            this.updateStatus('available');
            return {
                ...architectureResult,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error(`Error designing architecture: ${error.message}`);
            this.updateStatus('error');
            throw error;
        }
    }
    /**
     * Detect programming language from code snippet
     */
    detectLanguage(code) {
        // Simple language detection based on keywords and syntax
        if (code.includes('import React') || code.includes('function Component') || code.includes('className=') || code.includes('export default')) {
            return 'JavaScript';
        }
        else if (code.includes('interface ') || code.includes('type ') || code.includes('class ') && code.includes(': ')) {
            return 'TypeScript';
        }
        else if (code.includes('def ') || code.includes('import ') && !code.includes(';')) {
            return 'Python';
        }
        else if (code.includes('public class ') || code.includes('private ') && code.includes(';')) {
            return 'Java';
        }
        else if (code.includes('func ') && code.includes('package ')) {
            return 'Go';
        }
        else if (code.includes('namespace ') || code.includes('using ') && code.includes(';')) {
            return 'C#';
        }
        else if (code.includes('fn ') || code.includes('pub struct ')) {
            return 'Rust';
        }
        else if (code.includes('<?php')) {
            return 'PHP';
        }
        else {
            return 'Unknown';
        }
    }
    /**
     * Clean up expired cache entries
     */
    cleanCache() {
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
    async shutdown() {
        try {
            this.updateStatus('offline');
            this.isInitialized = false;
            this.codeCache.clear();
            return true;
        }
        catch (error) {
            console.error(`Error shutting down ${this.agent.name}:`, error);
            return false;
        }
    }
}
exports.DevelopmentAgent = DevelopmentAgent;
//# sourceMappingURL=DevelopmentAgent.js.map