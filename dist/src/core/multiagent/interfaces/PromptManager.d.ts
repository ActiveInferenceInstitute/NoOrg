/**
 * Interface for the PromptManager
 * Defines methods for managing prompt templates
 */
export interface PromptManager {
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
//# sourceMappingURL=PromptManager.d.ts.map