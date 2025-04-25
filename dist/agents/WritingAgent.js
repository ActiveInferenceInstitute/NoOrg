"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritingAgent = void 0;
const BaseAgent_1 = require("../core/multiagent/BaseAgent");
/**
 * WritingAgent specializes in content creation and editing
 */
class WritingAgent extends BaseAgent_1.BaseAgent {
    constructor(name, config) {
        super({ ...config, name });
    }
    async writeContent(topic, outline, style = 'professional') {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Write content for: ${topic}
      
      Outline:
      ${outline.map(item => `- ${item}`).join('\n')}
      
      Style: ${style}
      
      Please provide:
      1. Main content
      2. Section breakdown
      3. Metadata (word count, reading time, keywords)`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n').filter(section => section.trim());
            const wordCount = sections.join(' ').split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
            return {
                content: sections.join('\n\n'),
                sections,
                metadata: {
                    wordCount,
                    readingTime,
                    keywords: this.extractKeywords(sections.join(' '))
                }
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async editContent(content, changes) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Edit the following content based on changes:
      
      Content:
      ${content}
      
      Changes:
      ${changes.map(item => `- ${item}`).join('\n')}
      
      Please provide the edited content.`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            return response.trim();
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async generateContent(topic, requirements) {
        this.updateStatus('busy');
        const startTime = Date.now();
        try {
            const prompt = `Generate content for: ${topic}
      
      Requirements:
      ${requirements.map(item => `- ${item}`).join('\n')}
      
      Please provide comprehensive content that meets the requirements.`;
            const response = await this.openAIClient.generateResponse(prompt, {
                model: this.config.preferredModel || 'o3-mini',
                temperature: 0.7,
                max_tokens: 2000
            });
            this.updateStatus('idle');
            const sections = response.split('\n\n').filter(section => section.trim());
            const wordCount = sections.join(' ').split(/\s+/).length;
            return {
                content: response.trim(),
                metadata: {
                    wordCount,
                    sections,
                    keywords: this.extractKeywords(sections.join(' '))
                }
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    extractKeywords(text) {
        // Simple keyword extraction - can be enhanced with NLP libraries
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
        const wordFreq = new Map();
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 3) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        });
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
}
exports.WritingAgent = WritingAgent;
//# sourceMappingURL=WritingAgent.js.map