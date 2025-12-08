"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const axios_1 = __importDefault(require("axios"));
const OpenAIClient_1 = require("../../../src/core/multiagent/OpenAIClient");
(0, mocha_1.describe)('OpenAIClient', () => {
    let client;
    let axiosStub;
    (0, mocha_1.beforeEach)(() => {
        // Create a new client instance before each test
        client = new OpenAIClient_1.OpenAIClient({
            apiKey: 'test-api-key',
            defaultModel: 'o3-mini'
        });
        // Stub axios to prevent actual API calls
        axiosStub = sinon_1.default.stub(axios_1.default, 'post');
        axiosStub.resolves({
            data: {
                id: 'test-response-id',
                object: 'chat.completion',
                created: Date.now(),
                model: 'o3-mini',
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: 'This is a test response'
                        },
                        finish_reason: 'stop'
                    }
                ],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 5,
                    total_tokens: 15
                }
            }
        });
    });
    (0, mocha_1.afterEach)(() => {
        // Restore all stubs after each test
        sinon_1.default.restore();
    });
    (0, mocha_1.describe)('sendPrompt', () => {
        (0, mocha_1.it)('should send a string prompt to the OpenAI API', async () => {
            const result = await client.sendPrompt('Test prompt');
            (0, chai_1.expect)(axiosStub.calledOnce).to.be.true;
            (0, chai_1.expect)(axiosStub.firstCall.args[0]).to.include('/chat/completions');
            (0, chai_1.expect)(axiosStub.firstCall.args[1]).to.deep.include({
                model: 'o3-mini',
                messages: [{ role: 'user', content: 'Test prompt' }]
            });
            (0, chai_1.expect)(result.choices[0].message.content).to.equal('This is a test response');
        });
        (0, mocha_1.it)('should send message array prompts to the OpenAI API', async () => {
            const messages = [
                { role: 'system', content: 'You are a helpful assistant' },
                { role: 'user', content: 'Hello, who are you?' }
            ];
            const result = await client.sendPrompt(messages);
            (0, chai_1.expect)(axiosStub.calledOnce).to.be.true;
            (0, chai_1.expect)(axiosStub.firstCall.args[1].messages).to.deep.equal(messages);
            (0, chai_1.expect)(result.choices[0].message.content).to.equal('This is a test response');
        });
        (0, mocha_1.it)('should include custom options in the API request', async () => {
            const options = {
                model: 'o3-sonnet',
                temperature: 0.2,
                max_tokens: 1000,
                top_p: 0.8
            };
            await client.sendPrompt('Test with options', options);
            (0, chai_1.expect)(axiosStub.firstCall.args[1]).to.deep.include({
                model: 'o3-sonnet',
                temperature: 0.2,
                max_tokens: 1000,
                top_p: 0.8
            });
        });
        (0, mocha_1.it)('should handle API errors gracefully', async () => {
            // Restore the successful stub and create an error stub
            axiosStub.restore();
            axiosStub = sinon_1.default.stub(axios_1.default, 'post');
            axiosStub.rejects({
                response: {
                    data: {
                        error: {
                            message: 'Invalid API key'
                        }
                    }
                }
            });
            try {
                await client.sendPrompt('Test prompt');
                // Should not reach here
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('OpenAI API Error');
                (0, chai_1.expect)(error.message).to.include('Invalid API key');
            }
        });
    });
    (0, mocha_1.describe)('calculateCost', () => {
        (0, mocha_1.it)('should correctly calculate cost for prompt and completion tokens', () => {
            const model = 'o3-mini';
            const promptTokens = 1000;
            const completionTokens = 500;
            // o3-mini pricing: $0.0015 per 1K prompt tokens, $0.002 per 1K completion tokens
            const expectedCost = (1000 / 1000) * 0.0015 + (500 / 1000) * 0.002;
            const actualCost = client.calculateCost(model, promptTokens, completionTokens);
            (0, chai_1.expect)(actualCost).to.equal(expectedCost);
        });
        (0, mocha_1.it)('should fall back to default model pricing if model not found', () => {
            const model = 'non-existent-model';
            const promptTokens = 1000;
            const completionTokens = 500;
            // Should use o3-mini pricing (the default model)
            const expectedCost = (1000 / 1000) * 0.0015 + (500 / 1000) * 0.002;
            const actualCost = client.calculateCost(model, promptTokens, completionTokens);
            (0, chai_1.expect)(actualCost).to.equal(expectedCost);
        });
    });
    (0, mocha_1.describe)('getUsageStats', () => {
        (0, mocha_1.it)('should return empty usage stats when no requests have been made', async () => {
            const startDate = new Date(Date.now() - 86400000); // 24 hours ago
            const endDate = new Date();
            const stats = await client.getUsageStats(startDate, endDate);
            (0, chai_1.expect)(stats.totalTokens).to.equal(0);
            (0, chai_1.expect)(stats.totalCost).to.equal(0);
            (0, chai_1.expect)(stats.requests).to.equal(0);
            (0, chai_1.expect)(Object.keys(stats.usageByModel).length).to.equal(0);
            (0, chai_1.expect)(stats.usageHistory.length).to.equal(0);
        });
        (0, mocha_1.it)('should track usage after sending prompts', async () => {
            // Send a prompt to track usage
            await client.sendPrompt('Test prompt');
            const startDate = new Date(Date.now() - 86400000); // 24 hours ago
            const endDate = new Date();
            const stats = await client.getUsageStats(startDate, endDate);
            (0, chai_1.expect)(stats.totalTokens).to.equal(15); // 10 prompt + 5 completion from stub
            (0, chai_1.expect)(stats.requests).to.equal(1);
            (0, chai_1.expect)(Object.keys(stats.usageByModel)).to.include('o3-mini');
            (0, chai_1.expect)(stats.usageHistory.length).to.equal(1);
            (0, chai_1.expect)(stats.usageHistory[0].model).to.equal('o3-mini');
            (0, chai_1.expect)(stats.usageHistory[0].prompt_tokens).to.equal(10);
            (0, chai_1.expect)(stats.usageHistory[0].completion_tokens).to.equal(5);
        });
    });
    (0, mocha_1.describe)('getAvailableModels', () => {
        (0, mocha_1.it)('should fetch models from the OpenAI API', async () => {
            // Stub axios.get for models endpoint
            const getStub = sinon_1.default.stub(axios_1.default, 'get');
            getStub.resolves({
                data: {
                    data: [
                        { id: 'o3-mini' },
                        { id: 'o3-sonnet' },
                        { id: 'gpt-4' }
                    ]
                }
            });
            const models = await client.getAvailableModels();
            (0, chai_1.expect)(getStub.calledOnce).to.be.true;
            (0, chai_1.expect)(models).to.deep.equal(['o3-mini', 'o3-sonnet', 'gpt-4']);
        });
        (0, mocha_1.it)('should return predefined models if API request fails', async () => {
            // Stub axios.get to simulate error
            const getStub = sinon_1.default.stub(axios_1.default, 'get');
            getStub.rejects(new Error('Network error'));
            const models = await client.getAvailableModels();
            (0, chai_1.expect)(getStub.calledOnce).to.be.true;
            (0, chai_1.expect)(models.length).to.be.greaterThan(0);
            (0, chai_1.expect)(models).to.include('o3-mini');
            (0, chai_1.expect)(models).to.include('gpt-4');
        });
    });
    (0, mocha_1.describe)('getModelInfo', () => {
        (0, mocha_1.it)('should return model information for known models', async () => {
            const modelInfo = await client.getModelInfo('o3-mini');
            (0, chai_1.expect)(modelInfo).to.not.be.null;
            (0, chai_1.expect)(modelInfo?.id).to.equal('o3-mini');
            (0, chai_1.expect)(modelInfo?.promptCostPer1kTokens).to.equal(0.0015);
            (0, chai_1.expect)(modelInfo?.completionCostPer1kTokens).to.equal(0.002);
            (0, chai_1.expect)(modelInfo?.capabilities).to.include('text-generation');
        });
        (0, mocha_1.it)('should return null for unknown models', async () => {
            const modelInfo = await client.getModelInfo('non-existent-model');
            (0, chai_1.expect)(modelInfo).to.be.null;
        });
    });
    (0, mocha_1.describe)('getDefaultModel', () => {
        (0, mocha_1.it)('should return the configured default model', () => {
            (0, chai_1.expect)(client.getDefaultModel()).to.equal('o3-mini');
            // Create client with different default model
            const customClient = new OpenAIClient_1.OpenAIClient({
                apiKey: 'test-api-key',
                defaultModel: 'gpt-4'
            });
            (0, chai_1.expect)(customClient.getDefaultModel()).to.equal('gpt-4');
        });
    });
});
//# sourceMappingURL=test_openai_client.js.map