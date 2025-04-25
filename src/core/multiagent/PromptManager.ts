import * as fs from 'fs';
import * as path from 'path';
import { PromptManager as IPromptManager } from './interfaces/PromptManager';

/**
 * Implementation of the PromptManager
 * Manages prompt templates and their rendering with variables
 */
export class PromptManager implements IPromptManager {
  private static instance: PromptManager;
  private templates: Map<string, string> = new Map();
  private promptsDir: string;

  /**
   * Get the singleton instance of PromptManager
   * @param promptsDir Directory containing prompt templates
   * @returns PromptManager instance
   */
  public static getInstance(promptsDir?: string): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager(promptsDir);
    }
    return PromptManager.instance;
  }

  /**
   * Constructor initializes the prompt manager
   * @param promptsDir Directory containing prompt templates
   */
  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir || path.join(process.cwd(), 'src/prompts');
    this.loadPromptsFromDirectory();
  }

  /**
   * Load all prompt templates from the prompts directory
   */
  private loadPromptsFromDirectory(): void {
    try {
      if (!fs.existsSync(this.promptsDir)) {
        fs.mkdirSync(this.promptsDir, { recursive: true });
        this.createDefaultTemplates();
        return;
      }

      const files = fs.readdirSync(this.promptsDir);
      for (const file of files) {
        if (file.endsWith('.txt') || file.endsWith('.md')) {
          const promptName = path.basename(file, path.extname(file));
          const promptPath = path.join(this.promptsDir, file);
          const content = fs.readFileSync(promptPath, 'utf8');
          this.templates.set(promptName, content);
        }
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }

  /**
   * Get a prompt with variables populated
   * @param name Prompt name
   * @param variables Variables to substitute in the prompt
   * @returns Populated prompt
   */
  async getPrompt(name: string, variables?: Record<string, unknown>): Promise<string> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Prompt template '${name}' not found`);
    }

    if (!variables) {
      return template;
    }

    // Replace variables in template
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Add a new prompt template
   * @param name Prompt name
   * @param template Prompt template
   */
  async addPrompt(name: string, template: string): Promise<void> {
    this.templates.set(name, template);

    // Save to file
    const promptPath = path.join(this.promptsDir, `${name}.txt`);
    try {
      if (!fs.existsSync(this.promptsDir)) {
        fs.mkdirSync(this.promptsDir, { recursive: true });
      }
      fs.writeFileSync(promptPath, template, 'utf8');
    } catch (error) {
      console.error(`Error saving prompt '${name}':`, error);
      throw error;
    }
  }

  /**
   * Update an existing prompt template
   * @param name Prompt name
   * @param template New prompt template
   */
  async updatePrompt(name: string, template: string): Promise<void> {
    if (!this.templates.has(name)) {
      throw new Error(`Prompt template '${name}' not found`);
    }

    await this.addPrompt(name, template);
  }

  /**
   * Delete a prompt template
   * @param name Prompt name
   */
  async deletePrompt(name: string): Promise<void> {
    if (!this.templates.has(name)) {
      throw new Error(`Prompt template '${name}' not found`);
    }

    this.templates.delete(name);

    // Delete file
    const promptPath = path.join(this.promptsDir, `${name}.txt`);
    try {
      if (fs.existsSync(promptPath)) {
        fs.unlinkSync(promptPath);
      }
    } catch (error) {
      console.error(`Error deleting prompt '${name}':`, error);
      throw error;
    }
  }

  /**
   * Create default prompt templates
   */
  createDefaultTemplates(): void {
    const defaults = {
      'research_task': `You are a research assistant. Please gather information on the following topic:
      
Topic: {{topic}}

Depth: {{depth}}

Please provide:
1. A comprehensive overview
2. Key facts and figures
3. Current developments
4. Different perspectives
5. Reliable sources

Your research should be thorough, balanced, and well-organized.`,

      'content_creation': `You are a creative content writer. Please create content on the following topic:
      
Topic: {{topic}}

Format: {{format}}

Tone: {{tone}}

Length: {{length}}

Keywords: {{keywords}}

Your content should be engaging, informative, and tailored to the specified format and tone.`,

      'task_coordination': `You are a coordination assistant. Please analyze the following task and determine the best agent to handle it:
      
Task: {{task}}

Available Agents:
{{agents}}

Required Capabilities:
{{capabilities}}

Please recommend the most suitable agent for this task based on the required capabilities and agent specialization.`
    };

    // Add default templates
    for (const [name, template] of Object.entries(defaults)) {
      this.templates.set(name, template);
      
      // Save to file if directory exists
      if (fs.existsSync(this.promptsDir)) {
        const promptPath = path.join(this.promptsDir, `${name}.txt`);
        fs.writeFileSync(promptPath, template, 'utf8');
      }
    }
  }
} 