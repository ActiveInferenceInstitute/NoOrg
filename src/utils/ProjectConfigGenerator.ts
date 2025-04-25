/**
 * Project Configuration Generator
 * 
 * Generates contextually appropriate project configuration using LLM
 * instead of hardcoded values. This makes the workflow examples more
 * flexible and domain-agnostic.
 */

import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Generates project configuration for any domain using LLM
 */
export class ProjectConfigGenerator {
  private static instance: ProjectConfigGenerator;
  private openaiClient: OpenAIClient;
  private cacheDir: string;
  private cacheEnabled: boolean = true;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(apiKey: string) {
    this.openaiClient = new OpenAIClient(apiKey);
    this.cacheDir = path.join(__dirname, '../../output/cache/project-configs');
    
    // Ensure cache directory exists
    if (this.cacheEnabled) {
      fs.ensureDirSync(this.cacheDir);
    }
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(apiKey: string): ProjectConfigGenerator {
    if (!ProjectConfigGenerator.instance) {
      ProjectConfigGenerator.instance = new ProjectConfigGenerator(apiKey);
    }
    return ProjectConfigGenerator.instance;
  }

  /**
   * Generate a project configuration based on domain and objective
   * 
   * @param domain Project domain (e.g., "Environmental monitoring")
   * @param objective Project objective (or null to generate one)
   * @param options Additional options
   * @returns Complete project configuration
   */
  public async generateConfig(
    domain: string,
    objective?: string,
    options: {
      useCache?: boolean;
      constraints?: string;
      targetUsers?: string;
      llmConfig?: {
        defaultModel?: string;
        fallbackModel?: string;
        tokenLimitThreshold?: number;
        defaultMaxTokens?: number;
      };
    } = {}
  ): Promise<Record<string, any>> {
    const cacheKey = `config-${domain.replace(/\s+/g, '-').toLowerCase()}-${objective ? 'custom' : 'generated'}`;
    const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
    
    // Check cache if enabled
    if (this.cacheEnabled && options.useCache !== false && fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return cached;
      } catch (err) {
        console.warn('Failed to read config from cache, will generate fresh config');
      }
    }
    
    // If objective is not provided, generate one with the LLM
    let projectObjective = objective;
    if (!projectObjective) {
      projectObjective = await this.generateObjective(domain);
    }
    
    // Use LLM to generate complementary configuration elements
    const configElements = await this.generateConfigElements(domain, projectObjective);
    
    // Create the complete configuration
    const config = {
      DOMAIN: domain,
      OBJECTIVE: projectObjective,
      CONSTRAINTS: options.constraints || configElements.constraints,
      TARGET_USERS: options.targetUsers || configElements.targetUsers,
      LLM_CONFIG: {
        DEFAULT_MODEL: options.llmConfig?.defaultModel || process.env.DEFAULT_MODEL || 'gpt-4o',
        FALLBACK_MODEL: options.llmConfig?.fallbackModel || 'gpt-3.5-turbo-16k',
        TOKEN_LIMIT_THRESHOLD: options.llmConfig?.tokenLimitThreshold || 8000,
        DEFAULT_MAX_TOKENS: options.llmConfig?.defaultMaxTokens || 
                           (process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000)
      }
    };
    
    // Cache the result if caching is enabled
    if (this.cacheEnabled) {
      fs.writeFileSync(cacheFile, JSON.stringify(config, null, 2));
    }
    
    return config;
  }
  
  /**
   * Generate a realistic project objective for a given domain
   */
  private async generateObjective(domain: string): Promise<string> {
    try {
      const prompt = `Generate a specific, realistic project objective for a project in the domain of "${domain}".
The objective should be a single sentence that clearly states what the project aims to achieve.
Example: "Develop a community air quality monitoring network with real-time alerts and data visualization."

Respond with just the objective text, no additional commentary.`;

      // We'll use sendPrompt or createCompletion depending on what's available
      // @ts-ignore - Dynamic method call
      const sendPromptMethod = typeof this.openaiClient.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
      
      // @ts-ignore - Dynamic method call
      const response = await this.openaiClient[sendPromptMethod](prompt, {
        temperature: 0.7,
        systemPrompt: 'You are a project planning expert that creates realistic project objectives.'
      });
      
      const responseContent = typeof response === 'string' ? response : response.content;
      return responseContent.trim().replace(/^"/, '').replace(/"$/, '');
    } catch (error) {
      console.error('Error generating project objective:', error);
      return `Develop an innovative solution for ${domain}`;
    }
  }
  
  /**
   * Generate complementary configuration elements (constraints, target users)
   */
  private async generateConfigElements(domain: string, objective: string): Promise<{
    constraints: string;
    targetUsers: string;
  }> {
    try {
      const prompt = `Generate realistic project constraints and target users for a project with:
- Domain: "${domain}"
- Objective: "${objective}"

Format as JSON with these fields:
{
  "constraints": "Comma-separated list of key constraints",
  "targetUsers": "Comma-separated list of target user groups"
}`;

      // We'll use sendPrompt or createCompletion depending on what's available
      // @ts-ignore - Dynamic method call
      const sendPromptMethod = typeof this.openaiClient.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
      
      // @ts-ignore - Dynamic method call
      const response = await this.openaiClient[sendPromptMethod](prompt, {
        temperature: 0.7,
        systemPrompt: 'You are a project planning expert that creates realistic project parameters.'
      });
      
      const responseContent = typeof response === 'string' ? response : response.content;
      
      // Parse the JSON from the response
      let jsonStr = responseContent;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      // Clean up any markdown formatting
      if (jsonStr.includes('`')) {
        jsonStr = jsonStr.replace(/`/g, '');
      }
      
      const elements = JSON.parse(jsonStr);
      return {
        constraints: elements.constraints,
        targetUsers: elements.targetUsers
      };
    } catch (error) {
      console.error('Error generating project elements:', error);
      return {
        constraints: `Must be cost-effective, scalable, and user-friendly`,
        targetUsers: `Researchers, industry professionals, and end users in the ${domain} field`
      };
    }
  }
  
  /**
   * For testing: add an example usage method
   */
  public static async example() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return;
    }
    
    const generator = ProjectConfigGenerator.getInstance(apiKey);
    
    // Example 1: Generate with just a domain
    const config1 = await generator.generateConfig('Renewable Energy');
    console.log('Config 1 (auto-generated objective):');
    console.log(config1);
    
    // Example 2: Generate with domain and objective
    const config2 = await generator.generateConfig(
      'Healthcare Technology',
      'Develop a remote patient monitoring system for chronic disease management'
    );
    console.log('\nConfig 2 (provided objective):');
    console.log(config2);
    
    // Example 3: Generate with custom options
    const config3 = await generator.generateConfig(
      'Education Technology',
      'Create an adaptive learning platform for K-12 mathematics',
      {
        constraints: 'Must work offline, support multiple languages, and comply with COPPA',
        targetUsers: 'Teachers, students (ages 5-18), parents, school administrators'
      }
    );
    console.log('\nConfig 3 (with custom options):');
    console.log(config3);
  }
} 