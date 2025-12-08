"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const CustomerSupportAgent_1 = require("../../../src/agents/CustomerSupportAgent");
describe('CustomerSupportAgent', () => {
    let supportAgent;
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
                                content: `Mock customer support response for: ${prompt.substring(0, 50)}...`
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
        supportAgent = new CustomerSupportAgent_1.CustomerSupportAgent('Test Support Agent', {
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
            const result = await supportAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(supportAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await supportAgent.initialize();
            const info = supportAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('issue-resolution');
            (0, chai_1.expect)(info.capabilities).to.include('product-information');
            (0, chai_1.expect)(info.capabilities).to.include('troubleshooting');
            (0, chai_1.expect)(info.capabilities).to.include('customer-service');
            (0, chai_1.expect)(info.capabilities).to.include('email-response');
            (0, chai_1.expect)(info.capabilities).to.include('query-classification');
            (0, chai_1.expect)(info.capabilities).to.include('sentiment-analysis');
        });
        it('should support different support levels', async () => {
            const tier1Agent = new CustomerSupportAgent_1.CustomerSupportAgent('Tier 1 Support', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                supportLevel: 'tier1'
            });
            const tier3Agent = new CustomerSupportAgent_1.CustomerSupportAgent('Tier 3 Support', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                supportLevel: 'tier3'
            });
            await tier1Agent.initialize();
            await tier3Agent.initialize();
            (0, chai_1.expect)(tier1Agent.getAgentInfo().metadata?.supportLevel).to.equal('tier1');
            (0, chai_1.expect)(tier3Agent.getAgentInfo().metadata?.supportLevel).to.equal('tier3');
        });
        it('should support different communication tones', async () => {
            const formalAgent = new CustomerSupportAgent_1.CustomerSupportAgent('Formal Support', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                tone: 'formal'
            });
            const friendlyAgent = new CustomerSupportAgent_1.CustomerSupportAgent('Friendly Support', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                tone: 'friendly'
            });
            await formalAgent.initialize();
            await friendlyAgent.initialize();
            (0, chai_1.expect)(formalAgent.getAgentInfo().metadata?.tone).to.equal('formal');
            (0, chai_1.expect)(friendlyAgent.getAgentInfo().metadata?.tone).to.equal('friendly');
        });
    });
    describe('Inquiry Response', () => {
        beforeEach(async () => {
            await supportAgent.initialize();
        });
        it('should respond to customer inquiries', async () => {
            const inquiry = 'My account is not working properly. I cannot log in.';
            const result = await supportAgent.respondToInquiry(inquiry);
            (0, chai_1.expect)(result).to.have.property('response');
            (0, chai_1.expect)(result).to.have.property('classification');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(typeof result.response).to.equal('string');
            (0, chai_1.expect)(result.response.length).to.be.greaterThan(0);
            (0, chai_1.expect)(result.classification).to.be.an('object');
            (0, chai_1.expect)(result.classification).to.have.property('category');
            (0, chai_1.expect)(result.classification).to.have.property('sentiment');
            (0, chai_1.expect)(result.classification).to.have.property('complexity');
            (0, chai_1.expect)(result.classification).to.have.property('urgency');
        });
        it('should classify inquiries correctly', async () => {
            const inquiries = [
                { text: 'How do I reset my password?', expectedCategory: 'technical' },
                { text: 'I love your product!', expectedSentiment: 'positive' },
                { text: 'This is urgent - my data is corrupted!', expectedUrgency: 'urgent' },
                { text: 'Can you explain the billing cycle?', expectedComplexity: 'simple' }
            ];
            for (const inquiry of inquiries) {
                const result = await supportAgent.respondToInquiry(inquiry.text);
                (0, chai_1.expect)(result.classification.category).to.be.a('string');
                (0, chai_1.expect)(result.classification.sentiment).to.be.oneOf(['positive', 'neutral', 'negative']);
                (0, chai_1.expect)(result.classification.complexity).to.be.oneOf(['simple', 'moderate', 'complex']);
                (0, chai_1.expect)(result.classification.urgency).to.be.oneOf(['low', 'medium', 'high', 'urgent']);
            }
        });
        it('should include customer context in responses', async () => {
            const inquiry = 'I need help with my subscription';
            const customerContext = {
                name: 'John Doe',
                accountAge: '2 years',
                previousInteractions: [
                    { issue: 'login problem', resolution: 'password reset', date: '2024-01-15' }
                ],
                accountStatus: 'premium',
                subscription: 'monthly'
            };
            const result = await supportAgent.respondToInquiry(inquiry, {
                customerContext
            });
            (0, chai_1.expect)(result.response).to.be.a('string');
            (0, chai_1.expect)(result.response.length).to.be.greaterThan(0);
        });
        it('should handle different response formats', async () => {
            const inquiry = 'How do I contact support?';
            const formats = ['email', 'chat', 'ticket', 'social'];
            for (const format of formats) {
                const result = await supportAgent.respondToInquiry(inquiry, {
                    responseFormat: format
                });
                (0, chai_1.expect)(result.response).to.be.a('string');
                (0, chai_1.expect)(result.response.length).to.be.greaterThan(0);
            }
        });
        it('should handle priority levels', async () => {
            const inquiry = 'Critical system failure affecting all users';
            const priorities = ['low', 'medium', 'high', 'urgent'];
            for (const priority of priorities) {
                const result = await supportAgent.respondToInquiry(inquiry, {
                    priorityLevel: priority
                });
                (0, chai_1.expect)(result.response).to.be.a('string');
                (0, chai_1.expect)(result.classification.urgency).to.be.oneOf(['low', 'medium', 'high', 'urgent']);
            }
        });
        it('should include next steps when requested', async () => {
            const inquiry = 'I need to cancel my subscription';
            const result = await supportAgent.respondToInquiry(inquiry, {
                includeNextSteps: true
            });
            (0, chai_1.expect)(result.response).to.be.a('string');
            (0, chai_1.expect)(result.response.length).to.be.greaterThan(0);
        });
        it('should handle empty inquiries', async () => {
            try {
                await supportAgent.respondToInquiry('');
                chai_1.expect.fail('Should have thrown error for empty inquiry');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Troubleshooting Guide Creation', () => {
        beforeEach(async () => {
            await supportAgent.initialize();
        });
        it('should create troubleshooting guides', async () => {
            const issue = 'Cannot connect to the internet';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('overview');
            (0, chai_1.expect)(result).to.have.property('steps');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(typeof result.title).to.equal('string');
            (0, chai_1.expect)(typeof result.overview).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.steps)).to.be.true;
            (0, chai_1.expect)(result.steps.length).to.be.greaterThan(0);
        });
        it('should include step details in troubleshooting guides', async () => {
            const issue = 'Email not syncing';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            (0, chai_1.expect)(result.steps).to.be.an('array');
            result.steps.forEach(step => {
                (0, chai_1.expect)(step).to.have.property('step');
                (0, chai_1.expect)(step).to.have.property('title');
                (0, chai_1.expect)(step).to.have.property('description');
                (0, chai_1.expect)(step).to.have.property('expectedOutcome');
                (0, chai_1.expect)(step.step).to.be.a('number');
                (0, chai_1.expect)(step.title).to.be.a('string');
                (0, chai_1.expect)(step.description).to.be.a('string');
                (0, chai_1.expect)(step.expectedOutcome).to.be.a('string');
            });
        });
        it('should support different user levels', async () => {
            const issue = 'Software installation failed';
            const userLevels = ['beginner', 'intermediate', 'advanced'];
            for (const userLevel of userLevels) {
                const result = await supportAgent.createTroubleshootingGuide(issue, {
                    userLevel: userLevel
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.title).to.be.a('string');
                (0, chai_1.expect)(Array.isArray(result.steps)).to.be.true;
            }
        });
        it('should include prerequisites when applicable', async () => {
            const issue = 'Cannot access admin panel';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            if (result.prerequisites && result.prerequisites.length > 0) {
                (0, chai_1.expect)(Array.isArray(result.prerequisites)).to.be.true;
                result.prerequisites.forEach(prereq => {
                    (0, chai_1.expect)(typeof prereq).to.equal('string');
                });
            }
        });
        it('should include alternative solutions', async () => {
            const issue = 'Slow application performance';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            (0, chai_1.expect)(result).to.have.property('alternativeSolutions');
            (0, chai_1.expect)(Array.isArray(result.alternativeSolutions)).to.be.true;
        });
        it('should include prevention tips', async () => {
            const issue = 'Data loss during backup';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            (0, chai_1.expect)(result).to.have.property('preventionTips');
            (0, chai_1.expect)(Array.isArray(result.preventionTips)).to.be.true;
        });
        it('should include related issues', async () => {
            const issue = 'Login authentication failure';
            const result = await supportAgent.createTroubleshootingGuide(issue);
            (0, chai_1.expect)(result).to.have.property('relatedIssues');
            (0, chai_1.expect)(Array.isArray(result.relatedIssues)).to.be.true;
        });
        it('should handle empty issues', async () => {
            try {
                await supportAgent.createTroubleshootingGuide('');
                chai_1.expect.fail('Should have thrown error for empty issue');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Sentiment Analysis', () => {
        beforeEach(async () => {
            await supportAgent.initialize();
        });
        it('should analyze customer sentiment', async () => {
            const feedback = 'I am extremely satisfied with the excellent customer service and fast response time!';
            const result = await supportAgent.analyzeSentiment(feedback);
            (0, chai_1.expect)(result).to.have.property('overallSentiment');
            (0, chai_1.expect)(result).to.have.property('sentimentScore');
            (0, chai_1.expect)(result).to.have.property('keyPhrases');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(result.overallSentiment).to.be.oneOf(['very negative', 'negative', 'neutral', 'positive', 'very positive']);
            (0, chai_1.expect)(result.sentimentScore).to.be.a('number');
            (0, chai_1.expect)(result.sentimentScore).to.be.at.least(-1);
            (0, chai_1.expect)(result.sentimentScore).to.be.at.most(1);
            (0, chai_1.expect)(Array.isArray(result.keyPhrases)).to.be.true;
        });
        it('should detect different sentiment levels', async () => {
            const feedbacks = [
                { text: 'This is absolutely terrible! I hate it!', expected: 'negative' },
                { text: 'It\'s okay, nothing special.', expected: 'neutral' },
                { text: 'Pretty good service overall.', expected: 'positive' },
                { text: 'Amazing! Best experience ever!', expected: 'positive' }
            ];
            for (const feedback of feedbacks) {
                const result = await supportAgent.analyzeSentiment(feedback.text);
                (0, chai_1.expect)(result.overallSentiment).to.be.a('string');
                (0, chai_1.expect)(result.sentimentScore).to.be.a('number');
                if (feedback.expected === 'negative') {
                    (0, chai_1.expect)(result.sentimentScore).to.be.below(0);
                }
                else if (feedback.expected === 'neutral') {
                    (0, chai_1.expect)(result.sentimentScore).to.be.closeTo(0, 0.3);
                }
                else if (feedback.expected === 'positive') {
                    (0, chai_1.expect)(result.sentimentScore).to.be.above(0);
                }
            }
        });
        it('should extract key phrases', async () => {
            const feedback = 'The user interface is intuitive and the customer support is responsive and helpful.';
            const result = await supportAgent.analyzeSentiment(feedback);
            (0, chai_1.expect)(Array.isArray(result.keyPhrases)).to.be.true;
            (0, chai_1.expect)(result.keyPhrases.length).to.be.greaterThan(0);
            // Key phrases should relate to the feedback content
            const keyPhrasesText = result.keyPhrases.join(' ').toLowerCase();
            (0, chai_1.expect)(keyPhrasesText).to.include('interface');
        });
        it('should include topics when requested', async () => {
            const feedback = 'The mobile app crashes frequently and the website is slow. Great product otherwise!';
            const result = await supportAgent.analyzeSentiment(feedback, {
                includeTopics: true
            });
            (0, chai_1.expect)(result).to.have.property('topics');
            (0, chai_1.expect)(Array.isArray(result.topics)).to.be.true;
            if (result.topics && result.topics.length > 0) {
                result.topics.forEach(topic => {
                    (0, chai_1.expect)(topic).to.have.property('name');
                    (0, chai_1.expect)(topic).to.have.property('sentiment');
                    (0, chai_1.expect)(topic).to.have.property('mentions');
                });
            }
        });
        it('should include actionable insights when requested', async () => {
            const feedback = 'The checkout process is confusing and takes too long.';
            const result = await supportAgent.analyzeSentiment(feedback, {
                includeActionableInsights: true
            });
            (0, chai_1.expect)(result).to.have.property('actionableInsights');
            (0, chai_1.expect)(Array.isArray(result.actionableInsights)).to.be.true;
        });
        it('should include suggestions when requested', async () => {
            const feedback = 'I had trouble finding the help documentation.';
            const result = await supportAgent.analyzeSentiment(feedback, {
                includeSuggestions: true
            });
            (0, chai_1.expect)(result).to.have.property('suggestions');
            (0, chai_1.expect)(Array.isArray(result.suggestions)).to.be.true;
        });
        it('should handle empty feedback', async () => {
            try {
                await supportAgent.analyzeSentiment('');
                chai_1.expect.fail('Should have thrown error for empty feedback');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await supportAgent.initialize();
            const info = supportAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.be.a('string');
            (0, chai_1.expect)(info.name).to.equal('Test Support Agent');
            (0, chai_1.expect)(info.type).to.equal('customer-support');
            (0, chai_1.expect)(info.capabilities).to.include('customer-service');
            (0, chai_1.expect)(info.capabilities).to.include('issue-resolution');
            (0, chai_1.expect)(info.status).to.equal('available');
            (0, chai_1.expect)(info.metadata).to.have.property('supportLevel');
            (0, chai_1.expect)(info.metadata).to.have.property('tone');
            (0, chai_1.expect)(info.metadata).to.have.property('empathyLevel');
        });
        it('should update status during operations', async () => {
            await supportAgent.initialize();
            (0, chai_1.expect)(supportAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = supportAgent.respondToInquiry('This is a very long inquiry that requires detailed analysis and response');
            // Status should remain available during processing (implementation dependent)
            (0, chai_1.expect)(supportAgent.getAgentInfo().status).to.equal('available');
            await longOperation;
            (0, chai_1.expect)(supportAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Product Knowledge Management', () => {
        it('should update product knowledge', async () => {
            await supportAgent.initialize();
            const newKnowledge = {
                'product.features': ['Feature A', 'Feature B', 'Feature C'],
                'troubleshooting.common': ['Issue 1 solution', 'Issue 2 solution'],
                'pricing.plans': ['Basic', 'Premium', 'Enterprise']
            };
            const result = supportAgent.updateProductKnowledge(newKnowledge);
            (0, chai_1.expect)(result).to.be.true;
            // Verify knowledge was updated (if accessible)
            const info = supportAgent.getAgentInfo();
            (0, chai_1.expect)(info.metadata?.productKnowledge).to.be.an('object');
        });
        it('should handle empty product knowledge updates', async () => {
            await supportAgent.initialize();
            const result = supportAgent.updateProductKnowledge({});
            (0, chai_1.expect)(result).to.be.true;
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await supportAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await supportAgent.respondToInquiry('test inquiry');
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
            const result = await supportAgent.respondToInquiry('test inquiry');
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.response).to.be.a('string');
        });
        it('should handle network timeouts', async () => {
            // Mock timeout
            mockOpenAIClient.sendPrompt = async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return { choices: [{ message: { content: 'timeout response' } }] };
            };
            try {
                await supportAgent.respondToInquiry('test inquiry');
                // Should handle timeout or complete successfully
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await supportAgent.initialize();
        });
        it('should complete inquiry response within reasonable time', async () => {
            const inquiry = 'I need help with my account settings and configuration options.';
            const startTime = Date.now();
            await supportAgent.respondToInquiry(inquiry);
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
        });
        it('should handle concurrent requests', async () => {
            const inquiries = [
                'How do I reset my password?',
                'My app is crashing frequently.',
                'I need to update my billing information.',
                'Can you explain the new features?'
            ];
            const requests = inquiries.map(inquiry => supportAgent.respondToInquiry(inquiry));
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(4);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.response).to.be.a('string');
            });
        });
        it('should handle large inquiries', async () => {
            const largeInquiry = 'A'.repeat(2000) + ' - Please help me with this issue that I am experiencing with your service.';
            const result = await supportAgent.respondToInquiry(largeInquiry);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.response).to.be.a('string');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await supportAgent.initialize();
            const result = await supportAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(supportAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await supportAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_customer_support_agent.js.map