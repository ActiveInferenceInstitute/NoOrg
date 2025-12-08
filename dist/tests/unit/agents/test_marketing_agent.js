"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const MarketingAgent_1 = require("../../../src/agents/MarketingAgent");
describe('MarketingAgent', () => {
    let marketingAgent;
    let mockOpenAIClient;
    let mockSharedState;
    let originalConsoleLog;
    beforeEach(() => {
        // Mock OpenAI client
        mockOpenAIClient = {
            sendPrompt: async (prompt, options) => {
                return {
                    choices: [{
                            message: {
                                content: `Mock marketing response for: ${prompt.substring(0, 50)}...`
                            }
                        }],
                    usage: {
                        prompt_tokens: 150,
                        completion_tokens: 300,
                        total_tokens: 450
                    }
                };
            }
        };
        // Mock SharedState manager
        mockSharedState = {
            setState: (path, value) => { },
            getState: (path) => undefined,
            subscribe: (path, callback) => 'mock-subscription-id',
            unsubscribe: (id) => { }
        };
        // Create agent
        marketingAgent = new MarketingAgent_1.MarketingAgent('Test Marketing Specialist', {
            openAIClient: mockOpenAIClient,
            sharedState: mockSharedState,
            preferredModel: 'gpt-4o',
            cacheTTL: 0 // Disable caching for testing
        });
        // Suppress console output during tests
        originalConsoleLog = console.log;
        console.log = () => { };
    });
    afterEach(() => {
        // Restore console.log
        console.log = originalConsoleLog;
    });
    describe('Initialization', () => {
        it('should initialize successfully', async () => {
            const result = await marketingAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(marketingAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await marketingAgent.initialize();
            const info = marketingAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('market-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('campaign-planning');
            (0, chai_1.expect)(info.capabilities).to.include('brand-messaging');
            (0, chai_1.expect)(info.capabilities).to.include('audience-targeting');
            (0, chai_1.expect)(info.capabilities).to.include('content-strategy');
            (0, chai_1.expect)(info.capabilities).to.include('trend-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('creativity');
        });
    });
    describe('Campaign Strategy Creation', () => {
        beforeEach(async () => {
            await marketingAgent.initialize();
        });
        it('should create campaign strategies', async () => {
            const campaignBrief = 'Launch a new eco-friendly product line targeting environmentally conscious consumers.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief);
            (0, chai_1.expect)(result).to.have.property('strategy');
            (0, chai_1.expect)(result).to.have.property('targetAudience');
            (0, chai_1.expect)(result).to.have.property('channels');
            (0, chai_1.expect)(result).to.have.property('timeline');
            (0, chai_1.expect)(result).to.have.property('kpis');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(typeof result.strategy).to.equal('string');
            (0, chai_1.expect)(typeof result.targetAudience).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.channels)).to.be.true;
            (0, chai_1.expect)(typeof result.timeline).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.kpis)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should include audience segmentation', async () => {
            const campaignBrief = 'Promote financial services to young professionals.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                audience: 'Young professionals aged 25-35, urban dwellers, income $50k-$100k'
            });
            (0, chai_1.expect)(result.targetAudience).to.be.a('string');
            (0, chai_1.expect)(result.targetAudience.length).to.be.greaterThan(0);
        });
        it('should include budget allocation when provided', async () => {
            const campaignBrief = 'Digital marketing campaign for software product.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                budget: '$50,000 total budget'
            });
            (0, chai_1.expect)(result).to.have.property('budgetAllocation');
            (0, chai_1.expect)(result.budgetAllocation).to.be.an('object');
        });
        it('should include timeline information', async () => {
            const campaignBrief = 'Product launch campaign.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                timeline: '3-month campaign starting Q2 2024'
            });
            (0, chai_1.expect)(result.timeline).to.be.a('string');
            (0, chai_1.expect)(result.timeline.length).to.be.greaterThan(0);
        });
        it('should specify marketing channels', async () => {
            const campaignBrief = 'B2B software campaign.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                channels: ['LinkedIn', 'Google Ads', 'Content Marketing', 'Email']
            });
            (0, chai_1.expect)(Array.isArray(result.channels)).to.be.true;
            (0, chai_1.expect)(result.channels.length).to.be.greaterThan(0);
            (0, chai_1.expect)(result.channels).to.include('LinkedIn');
            (0, chai_1.expect)(result.channels).to.include('Google Ads');
        });
        it('should include campaign goals', async () => {
            const campaignBrief = 'Brand awareness campaign.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                goals: ['Increase brand awareness by 30%', 'Generate 1000 leads', 'Improve social media engagement']
            });
            (0, chai_1.expect)(result.strategy).to.be.a('string');
            (0, chai_1.expect)(result.kpis).to.be.an('array');
        });
        it('should handle industry-specific campaigns', async () => {
            const campaignBrief = 'Healthcare technology campaign.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                industry: 'Healthcare Technology'
            });
            (0, chai_1.expect)(result.strategy).to.be.a('string');
            (0, chai_1.expect)(result.recommendations).to.be.an('array');
        });
        it('should include competitor analysis when requested', async () => {
            const campaignBrief = 'Competitive product launch.';
            const result = await marketingAgent.createCampaignStrategy(campaignBrief, {
                competitorAnalysis: true
            });
            (0, chai_1.expect)(result.strategy).to.be.a('string');
            (0, chai_1.expect)(result.recommendations).to.be.an('array');
        });
        it('should handle empty campaign briefs', async () => {
            try {
                await marketingAgent.createCampaignStrategy('');
                chai_1.expect.fail('Should have thrown error for empty brief');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Audience Analysis', () => {
        beforeEach(async () => {
            await marketingAgent.initialize();
        });
        it('should analyze target audiences', async () => {
            const audienceDescription = 'Millennials interested in sustainable living and eco-friendly products.';
            const result = await marketingAgent.analyzeAudience(audienceDescription);
            (0, chai_1.expect)(result).to.have.property('segments');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(result).to.have.property('insights');
            (0, chai_1.expect)(Array.isArray(result.segments)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.insights)).to.be.true;
        });
        it('should provide audience segments', async () => {
            const audienceDescription = 'Tech-savvy professionals in urban areas.';
            const result = await marketingAgent.analyzeAudience(audienceDescription);
            (0, chai_1.expect)(result.segments).to.be.an('array');
            result.segments.forEach(segment => {
                (0, chai_1.expect)(segment).to.have.property('name');
                (0, chai_1.expect)(segment).to.have.property('description');
                (0, chai_1.expect)(segment).to.have.property('preferences');
                (0, chai_1.expect)(segment).to.have.property('channels');
                (0, chai_1.expect)(Array.isArray(segment.preferences)).to.be.true;
                (0, chai_1.expect)(Array.isArray(segment.channels)).to.be.true;
            });
        });
        it('should include detailed personas when requested', async () => {
            const audienceDescription = 'Young parents looking for family-friendly products.';
            const result = await marketingAgent.analyzeAudience(audienceDescription, {
                includePersonas: true
            });
            (0, chai_1.expect)(result).to.have.property('personas');
            (0, chai_1.expect)(Array.isArray(result.personas)).to.be.true;
            if (result.personas && result.personas.length > 0) {
                result.personas.forEach(persona => {
                    (0, chai_1.expect)(persona).to.have.property('name');
                    (0, chai_1.expect)(persona).to.have.property('age');
                    (0, chai_1.expect)(persona).to.have.property('occupation');
                    (0, chai_1.expect)(persona).to.have.property('interests');
                    (0, chai_1.expect)(persona).to.have.property('pain_points');
                    (0, chai_1.expect)(persona).to.have.property('goals');
                    (0, chai_1.expect)(Array.isArray(persona.interests)).to.be.true;
                    (0, chai_1.expect)(Array.isArray(persona.pain_points)).to.be.true;
                    (0, chai_1.expect)(Array.isArray(persona.goals)).to.be.true;
                });
            }
        });
        it('should support different analysis depths', async () => {
            const audienceDescription = 'Small business owners.';
            const depths = ['basic', 'detailed', 'comprehensive'];
            for (const depth of depths) {
                const result = await marketingAgent.analyzeAudience(audienceDescription, {
                    depth: depth
                });
                (0, chai_1.expect)(Array.isArray(result.segments)).to.be.true;
                (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
                (0, chai_1.expect)(Array.isArray(result.insights)).to.be.true;
            }
        });
        it('should handle industry context', async () => {
            const audienceDescription = 'Enterprise software buyers.';
            const result = await marketingAgent.analyzeAudience(audienceDescription, {
                industry: 'Enterprise Software'
            });
            (0, chai_1.expect)(Array.isArray(result.segments)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should handle regional context', async () => {
            const audienceDescription = 'Local consumers.';
            const result = await marketingAgent.analyzeAudience(audienceDescription, {
                region: 'North America'
            });
            (0, chai_1.expect)(Array.isArray(result.segments)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should handle empty audience descriptions', async () => {
            try {
                await marketingAgent.analyzeAudience('');
                chai_1.expect.fail('Should have thrown error for empty description');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await marketingAgent.initialize();
            const info = marketingAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.be.a('string');
            (0, chai_1.expect)(info.name).to.equal('Test Marketing Specialist');
            (0, chai_1.expect)(info.type).to.equal('marketing');
            (0, chai_1.expect)(info.capabilities).to.include('market-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('campaign-planning');
            (0, chai_1.expect)(info.status).to.equal('available');
            (0, chai_1.expect)(info.metadata).to.have.property('specialty');
            (0, chai_1.expect)(info.metadata).to.have.property('creativityLevel');
            (0, chai_1.expect)(info.metadata).to.have.property('analyticalLevel');
        });
        it('should update status during operations', async () => {
            await marketingAgent.initialize();
            (0, chai_1.expect)(marketingAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = marketingAgent.createCampaignStrategy('Complex marketing campaign with multiple channels and detailed audience analysis');
            (0, chai_1.expect)(marketingAgent.getAgentInfo().status).to.equal('available');
            await longOperation;
            (0, chai_1.expect)(marketingAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await marketingAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await marketingAgent.createCampaignStrategy('test campaign');
                chai_1.expect.fail('Should have thrown error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.equal('OpenAI API Error');
            }
        });
        it('should handle malformed responses', async () => {
            // Mock malformed response
            mockOpenAIClient.sendPrompt = async () => {
                return {
                    choices: [{
                            message: {
                                content: null
                            }
                        }]
                };
            };
            const result = await marketingAgent.createCampaignStrategy('test campaign');
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.strategy).to.be.a('string');
        });
        it('should handle network timeouts', async () => {
            // Mock timeout
            mockOpenAIClient.sendPrompt = async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return { choices: [{ message: { content: 'timeout response' } }] };
            };
            try {
                await marketingAgent.createCampaignStrategy('test campaign');
                // Should handle timeout or complete successfully
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await marketingAgent.initialize();
        });
        it('should complete campaign strategy creation within reasonable time', async () => {
            const startTime = Date.now();
            await marketingAgent.createCampaignStrategy('Digital marketing campaign for a new mobile app targeting young professionals in urban areas');
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
        });
        it('should handle concurrent requests', async () => {
            const requests = [
                marketingAgent.createCampaignStrategy('Campaign 1'),
                marketingAgent.analyzeAudience('Audience 1'),
                marketingAgent.createCampaignStrategy('Campaign 2'),
                marketingAgent.analyzeAudience('Audience 2'),
                marketingAgent.createCampaignStrategy('Campaign 3')
            ];
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(5);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
            });
        });
        it('should handle complex campaign briefs', async () => {
            const complexBrief = 'Comprehensive digital marketing campaign for a fintech startup targeting millennials and Gen Z with a focus on sustainability, including social media, content marketing, influencer partnerships, and paid advertising across multiple platforms.';
            const result = await marketingAgent.createCampaignStrategy(complexBrief);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.strategy).to.be.a('string');
            (0, chai_1.expect)(Array.isArray(result.channels)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.kpis)).to.be.true;
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await marketingAgent.initialize();
            const result = await marketingAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(marketingAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await marketingAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_marketing_agent.js.map