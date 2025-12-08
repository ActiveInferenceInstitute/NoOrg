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
exports.LLMAgent = void 0;
const OpenAIClient_1 = require("../../../core/multiagent/OpenAIClient");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * An agent that uses an LLM to process inputs
 */
class LLMAgent {
    constructor(config) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unitId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unitName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "systemPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = config.id;
        this.name = config.name;
        this.unitId = config.unitId;
        this.unitName = config.unitName;
        this.description = config.description;
        this.systemPrompt = config.systemPrompt;
        // Ensure API key is set correctly
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        // Initialize the OpenAI client with the API key from environment variables
        this.llm = new OpenAIClient_1.OpenAIClient(process.env.OPENAI_API_KEY);
    }
    async process(input, context) {
        const logger = context.logger;
        logger.info(`LLMAgent ${this.name} processing input`);
        // Process the input to ensure it's not too large
        let processedInput = input;
        if (typeof input !== 'string') {
            // Try to simplify the input if it's a complex object
            if (input && typeof input === 'object') {
                // Create a simplified version that focuses on key information
                processedInput = this.simplifyInput(input);
            }
            processedInput = JSON.stringify(processedInput, null, 2);
        }
        const messages = [
            {
                role: 'system',
                content: this.systemPrompt
            },
            {
                role: 'user',
                content: processedInput
            }
        ];
        // Check if the input exceeds token limits (approximate calculation)
        const estimatedTokens = JSON.stringify(messages).length / 4; // Rough estimate: 4 chars ~= 1 token
        const config = context.config.LLM_CONFIG || {
            DEFAULT_MODEL: 'gpt-4',
            FALLBACK_MODEL: 'gpt-3.5-turbo-16k',
            TOKEN_LIMIT_THRESHOLD: 7000
        };
        const useDefaultModel = estimatedTokens < config.TOKEN_LIMIT_THRESHOLD;
        const modelToUse = useDefaultModel ? config.DEFAULT_MODEL : config.FALLBACK_MODEL;
        logger.info(`Using model ${modelToUse} for request with estimated ${estimatedTokens} tokens`);
        // Create the intermediates directory if it doesn't exist
        const intermediatesDir = path.join(context.config.OUTPUT_DIR || '', 'intermediates');
        fs.ensureDirSync(intermediatesDir);
        // Save the raw input to a file
        const inputFilename = `${this.id}_${Date.now()}_input.json`;
        fs.writeFileSync(path.join(intermediatesDir, inputFilename), JSON.stringify({
            agent: this.name,
            timestamp: new Date().toISOString(),
            model: modelToUse,
            system_prompt: this.systemPrompt,
            user_prompt: processedInput
        }, null, 2));
        try {
            // Make the API call to the LLM using the appropriate client method
            const prompt = processedInput;
            const options = {
                model: modelToUse,
                systemPrompt: this.systemPrompt,
                temperature: 0.7,
                maxTokens: config.DEFAULT_MAX_TOKENS || 2000
            };
            // Use sendPrompt if available, otherwise use createCompletion
            // @ts-ignore - We're being flexible about method names here
            const sendPromptMethod = typeof this.llm.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
            // @ts-ignore - Dynamic method call
            const response = await this.llm[sendPromptMethod](prompt, options);
            const responseContent = typeof response === 'string' ? response : response.choices[0].message.content;
            const responseUsage = typeof response === 'string' ? undefined : response.usage;
            logger.info(`Received response from LLM (${responseUsage?.total_tokens || 'unknown'} tokens)`);
            // Save the raw response to a file
            const outputFilename = `${this.id}_${Date.now()}_output.json`;
            fs.writeFileSync(path.join(intermediatesDir, outputFilename), JSON.stringify({
                agent: this.name,
                timestamp: new Date().toISOString(),
                model: modelToUse,
                raw_response: responseContent
            }, null, 2));
            // Parse the response if it looks like JSON
            let parsedResponse = responseContent;
            try {
                if (responseContent.includes('{') &&
                    responseContent.includes('}') &&
                    (responseContent.trim().startsWith('{') || responseContent.includes('```json'))) {
                    // Extract JSON from code blocks if needed
                    let jsonStr = responseContent;
                    if (jsonStr.includes('```json')) {
                        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                    }
                    else if (jsonStr.includes('```')) {
                        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                    }
                    // Remove markdown backticks if they exist
                    if (jsonStr.includes('`')) {
                        jsonStr = jsonStr.replace(/`/g, '');
                    }
                    // Try to parse the JSON
                    parsedResponse = JSON.parse(jsonStr);
                    logger.info('Successfully parsed JSON response');
                }
            }
            catch (err) {
                logger.warn(`Failed to parse JSON response: ${err}`);
                // Just use the raw text response if JSON parsing fails
            }
            return parsedResponse;
        }
        catch (error) {
            logger.error(`Error calling LLM API: ${error}`);
            return {
                error: `Failed to process with LLM: ${error}`,
                partial_input: processedInput.substring(0, 100) + '...'
            };
        }
    }
    simplifyInput(input) {
        // Make a deep copy to avoid modifying the original
        let result = JSON.parse(JSON.stringify(input));
        // If the input is an array, map each element to simplify it
        if (Array.isArray(result)) {
            if (result.length > 10) {
                // For large arrays, take a subset and summarize
                result = {
                    type: 'array',
                    length: result.length,
                    sample: result.slice(0, 3),
                    summary: `Array with ${result.length} items`
                };
            }
            else {
                // For smaller arrays, process each item
                result = result.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return this.simplifyInput(item);
                    }
                    return item;
                });
            }
        }
        // If it's an object, process each property
        else if (typeof result === 'object' && result !== null) {
            const keys = Object.keys(result);
            // For objects with too many properties, create a summary
            if (keys.length > 15) {
                const simplified = {
                    type: 'object',
                    keys: keys,
                    sample: {}
                };
                // Include a sample of a few key properties
                for (const key of keys.slice(0, 5)) {
                    simplified.sample[key] = result[key];
                }
                result = simplified;
            }
            else {
                // For smaller objects, process each property
                for (const key of keys) {
                    if (typeof result[key] === 'object' && result[key] !== null) {
                        result[key] = this.simplifyInput(result[key]);
                    }
                }
            }
        }
        return result;
    }
}
exports.LLMAgent = LLMAgent;
//# sourceMappingURL=LLMAgent.js.map