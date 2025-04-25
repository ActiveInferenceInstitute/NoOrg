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
exports.CreativeWritingAgent = void 0;
const AbstractAgent_1 = require("./AbstractAgent"); // Import base class
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * CreativeWritingAgent specializes in generating creative content
 * like stories, blog posts, marketing copy, etc.
 * Extends the AbstractAgent base class.
 */
class CreativeWritingAgent extends AbstractAgent_1.AbstractAgent {
    /**
     * Create a new CreativeWritingAgent
     * @param name Agent name
     * @param options Optional configuration including required services
     */
    constructor(name, options) {
        const defaultCapabilities = [
            'text-generation',
            'creativity',
            'storytelling',
            'content-refinement',
            'style-adaptation'
        ];
        super({
            ...options,
            name,
            type: 'creative-writer', // Set agent type
            description: options.description || 'Creative writing agent that specializes in generating engaging content',
            capabilities: options.capabilities || defaultCapabilities,
            metadata: {
                specialty: 'creative content',
                creativityLevel: 0.9,
                cacheTTL: options.cacheTTL || 10800000, // Default 3 hour cache
                ...(options.metadata || {})
            },
            // Ensure openAIClient and sharedState are passed from options
        });
        // Cache is specific to this agent type
        this.contentCache = new Map();
        this.cacheTTL = options.cacheTTL || 10800000;
        // Initialization logic is now handled by the base class's initialize method
    }
    /**
     * Hook called during agent initialization.
     * Clears the content cache.
     */
    async onInitialize() {
        console.debug(`Initializing cache for ${this.name}...`);
        this.contentCache.clear();
        // Start periodic cache cleaning if needed (or handle within generateContent)
        // setInterval(() => this.cleanCache(), 60 * 60 * 1000); // e.g., clean every hour
    }
    /**
     * Hook called during agent shutdown.
     * Cleans the cache.
     */
    async onShutdown() {
        console.debug(`Cleaning cache for ${this.name} during shutdown...`);
        this.cleanCache();
    }
    // --- Core Task Execution --- 
    /**
     * Executes a task based on provided details.
     * This agent currently interprets tasks as requests to generate or refine content.
     * @param taskDetails - Object containing task details (e.g., { type: 'generate', prompt: '...' } or { type: 'refine', content: '...', feedback: '...' })
     * @param context - Optional context (not currently used by this agent).
     * @returns A promise resolving with the result (generated content, refinement details, etc.) or null on failure.
     */
    async executeTask(taskDetails, context) {
        // Update status via base class method
        this.updateStatus('busy');
        try {
            let result = null;
            switch (taskDetails?.type) {
                case 'generate':
                case 'generateContent': // Allow alias
                    if (!taskDetails.prompt)
                        throw new Error('Missing required field "prompt" for generate task.');
                    result = await this.generateContent(taskDetails.prompt, taskDetails.options);
                    break;
                case 'refine':
                case 'refineContent': // Allow alias
                    if (!taskDetails.content)
                        throw new Error('Missing required field "content" for refine task.');
                    if (!taskDetails.feedback)
                        throw new Error('Missing required field "feedback" for refine task.');
                    result = await this.refineContent(taskDetails.content, taskDetails.feedback);
                    break;
                case 'generateStylized':
                    if (!taskDetails.prompt)
                        throw new Error('Missing required field "prompt" for generateStylized task.');
                    if (!taskDetails.style)
                        throw new Error('Missing required field "style" for generateStylized task.');
                    result = await this.generateStylizedContent(taskDetails.prompt, taskDetails.style, taskDetails.options);
                    break;
                case 'clearCache':
                    this.contentCache.clear();
                    result = { success: true, message: "Cache cleared." };
                    break;
                default:
                    console.warn(`CreativeWritingAgent received unknown task type: ${taskDetails?.type}`);
                    throw new Error(`Unsupported task type: ${taskDetails?.type}`);
            }
            // Update status via base class method
            this.updateStatus('available');
            return result;
        }
        catch (error) {
            console.error(`Agent ${this.name} failed to execute task: ${error.message}`, error.stack);
            // Update status via base class method
            this.updateStatus('error');
            // Re-throw or return error details?
            // For now, return null or an error object might be better for the coordinator
            return { success: false, error: error.message };
        }
    }
    // --- Specific Agent Capabilities --- 
    /**
     * Generate creative content
     * @param contentPrompt Prompt for content generation
     * @param options Content generation options
     */
    async generateContent(contentPrompt, options) {
        const startTime = Date.now();
        // Status updates are handled by executeTask
        const format = options?.format || 'free-form';
        const tone = options?.tone || 'professional';
        const length = options?.length || 'medium';
        const style = options?.style || '';
        const keywords = options?.keywords || [];
        // Generate cache key
        const cacheKey = `${contentPrompt}-${format}-${tone}-${length}-${style}-${keywords.join(',')}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                this.cleanCache(); // Clean expired items before checking
                const cachedResult = this.contentCache.get(cacheKey);
                if (cachedResult) { // Cache TTL is handled by cleanCache
                    // Return cached content
                    console.debug(`Cache hit for prompt: "${contentPrompt.substring(0, 50)}..."`);
                    const wordCount = cachedResult.content.split(/\s+/).length;
                    const characterCount = cachedResult.content.length;
                    return {
                        content: cachedResult.content,
                        wordCount,
                        characterCount,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
                console.debug(`Cache miss for prompt: "${contentPrompt.substring(0, 50)}..."`);
            }
            // Prepare content generation prompt (using protected openAIClient from base class)
            let lengthInstruction = '';
            if (length === 'short')
                lengthInstruction = 'Create a concise piece around 150-250 words.';
            else if (length === 'medium')
                lengthInstruction = 'Write a balanced piece of approximately 400-600 words.';
            else
                lengthInstruction = 'Develop an in-depth piece of approximately 800-1200 words.';
            let formatInstruction = '';
            if (format === 'story')
                formatInstruction = 'Create an engaging narrative with characters, plot, and setting.';
            else if (format === 'blog-post')
                formatInstruction = 'Write an informative blog post with headings, paragraphs, and a clear structure. Start with a title line like "# Title". Use section headings like "## Section Title".';
            else if (format === 'marketing-copy')
                formatInstruction = 'Develop persuasive marketing copy that highlights benefits and includes a call to action.';
            else if (format === 'poem')
                formatInstruction = 'Compose a poem with appropriate structure, rhythm, and poetic devices.';
            else if (format === 'dialogue')
                formatInstruction = 'Create a realistic dialogue between characters that advances a narrative or makes a point.';
            else
                formatInstruction = 'Write content in any appropriate format for the topic.';
            let keywordsInstruction = '';
            if (keywords.length > 0) {
                keywordsInstruction = `Include the following keywords naturally in your content: ${keywords.join(', ')}.`;
            }
            let styleInstruction = '';
            if (style) {
                styleInstruction = `Write in the style of ${style}.`;
            }
            const prompt = `
                As the ${this.name}, an expert in creative writing, ${this.description}.
                Create ${format === 'free-form' ? 'content' : `a ${format}`} based on the following brief:
                
                BRIEF: ${contentPrompt}
                
                TONE: ${tone}
                
                ${formatInstruction}
                ${lengthInstruction}
                ${styleInstruction}
                ${keywordsInstruction}
                
                Adhere strictly to the format and length instructions. 
                Focus on creating high-quality, original content that engages the reader.
            `;
            // Execute content generation (call OpenAI)
            const temperature = options?.temperature ?? (format === 'poem' || format === 'story' ? 0.8 : 0.6);
            const maxTokens = length === 'short' ? 500 : (length === 'medium' ? 1000 : 2000);
            // Use the openAIClient inherited from the base class
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini', // Use preferredModel from base class
                temperature,
                max_tokens: maxTokens
            });
            // Process the result
            const generatedContent = response.content?.trim() || "";
            // Extract title and sections if blog post format
            let title;
            let sections;
            if (format === 'blog-post') {
                const lines = generatedContent.split('\n');
                const titleMatch = lines[0].match(/^#\s+(.+)$/); // Look for "# Title"
                if (titleMatch) {
                    title = titleMatch[1].trim();
                    // Remove the title line from the main content
                    // generatedContent = lines.slice(1).join('\n').trim(); 
                    // Keep title line for context if needed, or parse sections differently
                }
                sections = [];
                let currentSectionTitle = title || 'Introduction'; // Default if no # title
                let currentSectionContent = [];
                const sectionHeaderRegex = /^##\s+(.+)$/;
                for (const line of lines.slice(titleMatch ? 1 : 0)) { // Skip title line if found
                    const sectionMatch = line.match(sectionHeaderRegex);
                    if (sectionMatch) {
                        // Save previous section
                        if (currentSectionTitle) {
                            sections.push({ title: currentSectionTitle, content: currentSectionContent.join('\n').trim() });
                        }
                        // Start new section
                        currentSectionTitle = sectionMatch[1].trim();
                        currentSectionContent = [];
                    }
                    else {
                        currentSectionContent.push(line);
                    }
                }
                // Add the last section
                if (currentSectionTitle) {
                    sections.push({ title: currentSectionTitle, content: currentSectionContent.join('\n').trim() });
                }
                // If no sections were found but there is content, put it all in intro
                if (sections.length === 0 && generatedContent) {
                    sections = [{ title: title || 'Content', content: generatedContent }];
                }
            }
            // Calculate metrics
            const wordCount = generatedContent.split(/\s+/).filter(Boolean).length;
            const characterCount = generatedContent.length;
            const processingTime = Date.now() - startTime;
            // Cache the result
            this.contentCache.set(cacheKey, {
                prompt: contentPrompt,
                content: generatedContent,
                timestamp: Date.now(),
                expiry: Date.now() + this.cacheTTL
            });
            return {
                content: generatedContent,
                title,
                sections,
                wordCount,
                characterCount,
                processingTime,
                cached: false
            };
        }
        catch (error) {
            console.error(`Error during content generation for agent ${this.name}: ${error.message}`);
            // Rethrow the error to be caught by executeTask
            throw error;
        }
    }
    /**
     * Refine existing content based on feedback.
     * @param originalContent The content to refine.
     * @param feedback Instructions for refinement.
     */
    async refineContent(originalContent, feedback) {
        const startTime = Date.now();
        // Status updates handled by executeTask
        try {
            const prompt = `
                As the ${this.name}, an expert content refiner:
                Refine the following content based on the provided feedback.
                Clearly describe the changes you made in a section titled "CHANGES:".

                ORIGINAL CONTENT:
                ---
                ${originalContent}
                ---

                FEEDBACK FOR REFINEMENT:
                ---
                ${feedback}
                ---

                OUTPUT THE REFINED CONTENT BELOW:
            `;
            // Use the openAIClient from the base class
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini',
                temperature: 0.5, // Lower temperature for refinement
                max_tokens: Math.max(1000, originalContent.length * 2) // Allow ample space
            });
            const responseContent = response.content?.trim() || "";
            // Extract changes and refined content
            let refinedContent = responseContent;
            let changes = "No specific changes listed by the model.";
            const changesMarker = "CHANGES:";
            const changesIndex = responseContent.indexOf(changesMarker);
            if (changesIndex !== -1) {
                // Attempt to split based on the marker
                refinedContent = responseContent.substring(0, changesIndex).trim();
                // Check if the marker is at the end, meaning content might be above
                const potentialContentEndMarker = "OUTPUT THE REFINED CONTENT BELOW:";
                const contentEndIndex = refinedContent.lastIndexOf(potentialContentEndMarker);
                if (contentEndIndex !== -1) {
                    refinedContent = refinedContent.substring(contentEndIndex + potentialContentEndMarker.length).trim();
                }
                changes = responseContent.substring(changesIndex + changesMarker.length).trim();
            }
            else {
                console.warn("Could not find 'CHANGES:' marker in refinement response.");
                // If marker not found, assume the whole response is the content (heuristic)
                refinedContent = responseContent;
            }
            // Simple fallback if refined content looks empty after extraction
            if (!refinedContent && responseContent) {
                refinedContent = responseContent;
                changes = "(Could not automatically separate changes from content)";
            }
            const processingTime = Date.now() - startTime;
            return {
                refinedContent,
                changes,
                processingTime,
            };
        }
        catch (error) {
            console.error(`Error during content refinement for agent ${this.name}: ${error.message}`);
            throw error; // Rethrow for executeTask to handle
        }
    }
    /**
     * Generate content in a specific style (e.g., famous author, specific tone).
     * @param contentPrompt The core idea or topic.
     * @param style The target style description.
     * @param options Generation options.
     */
    async generateStylizedContent(contentPrompt, style, options) {
        const startTime = Date.now();
        // Status handled by executeTask
        try {
            const format = options?.format || 'free-form';
            const length = options?.length || 'medium';
            const examples = options?.examples || [];
            let lengthInstruction = '';
            if (length === 'short')
                lengthInstruction = 'Keep it concise (150-250 words).';
            else if (length === 'medium')
                lengthInstruction = 'Write approx 400-600 words.';
            else
                lengthInstruction = 'Write approx 800-1200 words.';
            let examplesInstruction = '';
            if (examples.length > 0) {
                examplesInstruction = `Here are examples of the target style:\n${examples.map(ex => `---\n${ex}\n---`).join('\n')}`;
            }
            const prompt = `
                As the ${this.name}, adopt the following style: **${style}**.
                Generate ${format === 'free-form' ? 'content' : `a ${format}`} based on this brief: ${contentPrompt}
                
                ${lengthInstruction}
                ${examplesInstruction}
                
                Emulate the requested style as closely as possible in tone, vocabulary, sentence structure, and overall feel.
            `;
            const temperature = options?.temperature ?? 0.7;
            const maxTokens = length === 'short' ? 500 : (length === 'medium' ? 1000 : 2000);
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini',
                temperature,
                max_tokens: maxTokens
            });
            const generatedContent = response.content?.trim() || "";
            const processingTime = Date.now() - startTime;
            // Heuristic for confidence: based on response length relative to request?
            // This is very basic and might not be accurate.
            const expectedChars = length === 'short' ? 200 * 5 : (length === 'medium' ? 500 * 5 : 1000 * 5);
            const styleConfidence = Math.min(1, generatedContent.length / expectedChars);
            return {
                content: generatedContent,
                styleConfidence,
                processingTime,
            };
        }
        catch (error) {
            console.error(`Error during stylized content generation for agent ${this.name}: ${error.message}`);
            throw error; // Rethrow for executeTask
        }
    }
    /**
     * Cleans expired items from the content cache.
     */
    cleanCache() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, value] of this.contentCache.entries()) {
            if (now > value.expiry) {
                this.contentCache.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.debug(`Cleaned ${cleanedCount} expired items from ${this.name} cache.`);
        }
    }
}
exports.CreativeWritingAgent = CreativeWritingAgent;
//# sourceMappingURL=CreativeWritingAgent.js.map