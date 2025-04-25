const { OpenAI } = require("openai"); // Import OpenAI class for v4+
require('dotenv').config(); // To load API key from .env

/**
 * Simple client for interacting with an LLM API (e.g., OpenAI v4+).
 */
class LLMClient {
    constructor(config = {}) {
        this.logger = config.logger || console; // Use provided logger or console
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            this.logger.warn("[LLMClient] WARNING: OPENAI_API_KEY not found. LLM calls will fail.");
            this.openai = null;
        } else {
            try {
                // Instantiate the OpenAI client directly
                this.openai = new OpenAI({ apiKey: this.apiKey });
                this.logger.log("[LLMClient] Initialized OpenAI Client (v4+).");
            } catch (error) {
                this.logger.error(`[LLMClient] Failed to initialize OpenAI client: ${error.message}`);
                this.openai = null;
            }
        }
        this.defaultModel = config.defaultModel || "gpt-4o-mini"; // Updated default
    }

    /**
     * Sends a list of messages to the LLM API.
     * @param {Array<object>} messages - Array of message objects ({ role: 'user'/'system'/'assistant', content: '...' }).
     * @param {object} options - Optional parameters like model, max_tokens, temperature.
     * @returns {Promise<object>} - { content: string, usage: object | null, error: string | null, fullResponse: object | null }
     */
    async sendMessages(messages, options = {}) {
        if (!this.openai) {
            this.logger.warn("[LLMClient] LLM Client not initialized. Skipping call.");
            return {
                content: "[LLM SKIPPED - No Client/API Key]",
                usage: null,
                error: "LLM Client not initialized or API Key missing.",
                fullResponse: null,
            };
        }

        const model = options.model || this.defaultModel;
        const max_tokens = options.max_tokens || 2000;
        const temperature = options.temperature !== undefined ? options.temperature : 0.7;

        this.log('info', `Sending ${messages.length} messages to ${model} (temp: ${temperature}, max_tokens: ${max_tokens})...`);
        // Log messages for debugging (optional, can be verbose)
        // this.log('debug', `Messages: ${JSON.stringify(messages, null, 2)}`);

        try {
            // Use the v4+ chat completions method
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: messages,
                max_tokens: max_tokens,
                temperature: temperature,
            });

            // Access response data according to v4+ structure
            const responseContent = completion.choices[0]?.message?.content || "";
            const usage = completion.usage || null;
            this.log('info', `Received response (${usage?.total_tokens || 'N/A'} tokens).`);

            return {
                content: responseContent.trim(),
                usage: usage,
                error: null,
                fullResponse: completion, // Store raw completion object
            };
        } catch (error) {
            this.log('error', `LLM API call failed: ${error.message}`);
            let errorMessage = error.message;
            // Error structure might differ slightly in v4+, adjust if needed
            if (error.response) { 
                errorMessage += ` | Status: ${error.response.status} | Data: ${JSON.stringify(error.response.data)}`;
                this.log('error', `LLM API Error Details - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            } else {
                 errorMessage = error.toString(); // Fallback for non-API errors
            }
            return {
                content: `[LLM ERROR: ${errorMessage}]`,
                usage: null,
                error: errorMessage,
                fullResponse: error.response ? error.response.data : error, // Store error details
            };
        }
    }

    // Simple internal logging helper
    log(level, message) {
        const prefix = `[LLMClient]`;
        if (level === 'error') this.logger.error(`${prefix} ERROR: ${message}`);
        else if (level === 'warn') this.logger.warn(`${prefix} WARN: ${message}`);
        else this.logger.log(`${prefix} INFO: ${message}`); // Default to log for info/debug
    }
}

module.exports = { LLMClient }; 