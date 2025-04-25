import { PromptManager as IPromptManager } from './interfaces/PromptManager';
/**
 * Implementation of the PromptManager
 * Manages prompt templates and their rendering with variables
 */
export declare class PromptManager implements IPromptManager {
    private static instance;
    private templates;
    private promptsDir;
    /**
     * Get the singleton instance of PromptManager
     * @param promptsDir Directory containing prompt templates
     * @returns PromptManager instance
     */
    static getInstance(promptsDir?: string): PromptManager;
    /**
     * Constructor initializes the prompt manager
     * @param promptsDir Directory containing prompt templates
     */
    constructor(promptsDir?: string);
    /**
     * Load all prompt templates from the prompts directory
     */
    private loadPromptsFromDirectory;
    /**
     * Get a prompt with variables populated
     * @param name Prompt name
     * @param variables Variables to substitute in the prompt
     * @returns Populated prompt
     */
    getPrompt(name: string, variables?: Record<string, unknown>): Promise<string>;
    /**
     * Add a new prompt template
     * @param name Prompt name
     * @param template Prompt template
     */
    addPrompt(name: string, template: string): Promise<void>;
    /**
     * Update an existing prompt template
     * @param name Prompt name
     * @param template New prompt template
     */
    updatePrompt(name: string, template: string): Promise<void>;
    /**
     * Delete a prompt template
     * @param name Prompt name
     */
    deletePrompt(name: string): Promise<void>;
    /**
     * Create default prompt templates
     */
    createDefaultTemplates(): void;
}
