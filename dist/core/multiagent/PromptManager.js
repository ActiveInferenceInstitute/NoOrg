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
exports.PromptManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Implementation of the PromptManager
 * Manages prompt templates and their rendering with variables
 */
class PromptManager {
    /**
     * Get the singleton instance of PromptManager
     * @param promptsDir Directory containing prompt templates
     * @returns PromptManager instance
     */
    static getInstance(promptsDir) {
        if (!PromptManager.instance) {
            PromptManager.instance = new PromptManager(promptsDir);
        }
        return PromptManager.instance;
    }
    /**
     * Constructor initializes the prompt manager
     * @param promptsDir Directory containing prompt templates
     */
    constructor(promptsDir) {
        this.templates = new Map();
        this.promptsDir = promptsDir || path.join(process.cwd(), 'src/prompts');
        this.loadPromptsFromDirectory();
    }
    /**
     * Load all prompt templates from the prompts directory
     */
    loadPromptsFromDirectory() {
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
        }
        catch (error) {
            console.error('Error loading prompts:', error);
        }
    }
    /**
     * Get a prompt with variables populated
     * @param name Prompt name
     * @param variables Variables to substitute in the prompt
     * @returns Populated prompt
     */
    async getPrompt(name, variables) {
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
    async addPrompt(name, template) {
        this.templates.set(name, template);
        // Save to file
        const promptPath = path.join(this.promptsDir, `${name}.txt`);
        try {
            if (!fs.existsSync(this.promptsDir)) {
                fs.mkdirSync(this.promptsDir, { recursive: true });
            }
            fs.writeFileSync(promptPath, template, 'utf8');
        }
        catch (error) {
            console.error(`Error saving prompt '${name}':`, error);
            throw error;
        }
    }
    /**
     * Update an existing prompt template
     * @param name Prompt name
     * @param template New prompt template
     */
    async updatePrompt(name, template) {
        if (!this.templates.has(name)) {
            throw new Error(`Prompt template '${name}' not found`);
        }
        await this.addPrompt(name, template);
    }
    /**
     * Delete a prompt template
     * @param name Prompt name
     */
    async deletePrompt(name) {
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
        }
        catch (error) {
            console.error(`Error deleting prompt '${name}':`, error);
            throw error;
        }
    }
    /**
     * Create default prompt templates
     */
    createDefaultTemplates() {
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
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map