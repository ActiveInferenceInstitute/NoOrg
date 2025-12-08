"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DevelopmentAgent_1 = require("../../../src/agents/DevelopmentAgent");
describe('DevelopmentAgent', () => {
    let developmentAgent;
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
                                content: `Mock development response for: ${prompt.substring(0, 50)}...`
                            }
                        }],
                    usage: {
                        prompt_tokens: 200,
                        completion_tokens: 400,
                        total_tokens: 600
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
        developmentAgent = new DevelopmentAgent_1.DevelopmentAgent('Test Developer', {
            id: 'test-developer',
            name: 'Test Developer',
            type: 'development',
            capabilities: ['code-generation', 'code-review', 'architecture-design'],
            status: 'available',
            openAIClient: mockOpenAIClient,
            sharedState: mockSharedState
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
            const result = await developmentAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(developmentAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await developmentAgent.initialize();
            const info = developmentAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('code-generation');
            (0, chai_1.expect)(info.capabilities).to.include('code-review');
            (0, chai_1.expect)(info.capabilities).to.include('architecture-design');
            (0, chai_1.expect)(info.capabilities).to.include('debugging');
            (0, chai_1.expect)(info.capabilities).to.include('testing');
        });
        it('should support different specialties', () => {
            const frontendDev = new DevelopmentAgent_1.DevelopmentAgent('Frontend Developer', {
                id: 'frontend-dev',
                name: 'Frontend Developer',
                type: 'development',
                capabilities: ['code-generation'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'frontend'
            });
            const backendDev = new DevelopmentAgent_1.DevelopmentAgent('Backend Developer', {
                id: 'backend-dev',
                name: 'Backend Developer',
                type: 'development',
                capabilities: ['code-generation'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'backend'
            });
            (0, chai_1.expect)(frontendDev).to.be.instanceOf(DevelopmentAgent_1.DevelopmentAgent);
            (0, chai_1.expect)(backendDev).to.be.instanceOf(DevelopmentAgent_1.DevelopmentAgent);
        });
    });
    describe('Code Generation', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should generate code from requirements', async () => {
            const requirements = 'Create a user authentication system with login and registration';
            const result = await developmentAgent.generateCode(requirements);
            (0, chai_1.expect)(result).to.have.property('code');
            (0, chai_1.expect)(result).to.have.property('language');
            (0, chai_1.expect)(result).to.have.property('documentation');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(typeof result.code).to.equal('string');
            (0, chai_1.expect)(result.code.length).to.be.greaterThan(0);
            (0, chai_1.expect)(result.language).to.equal('TypeScript');
        });
        it('should support different programming languages', async () => {
            const requirements = 'Create a data processing function';
            const languages = ['JavaScript', 'Python', 'Java', 'Go'];
            for (const language of languages) {
                const result = await developmentAgent.generateCode(requirements, {
                    language: language
                });
                (0, chai_1.expect)(result.language).to.equal(language);
                (0, chai_1.expect)(typeof result.code).to.equal('string');
            }
        });
        it('should support different code styles', async () => {
            const requirements = 'Create a class hierarchy';
            const styles = ['functional', 'object-oriented', 'procedural'];
            for (const style of styles) {
                const result = await developmentAgent.generateCode(requirements, {
                    codeStyle: style
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.code).to.be.a('string');
            }
        });
        it('should include comments when requested', async () => {
            const requirements = 'Create a sorting algorithm';
            const result = await developmentAgent.generateCode(requirements, {
                includeComments: true
            });
            (0, chai_1.expect)(result.documentation).to.be.a('string');
            (0, chai_1.expect)(result.documentation.length).to.be.greaterThan(0);
        });
        it('should include tests when requested', async () => {
            const requirements = 'Create a calculator class';
            const result = await developmentAgent.generateCode(requirements, {
                includeTests: true
            });
            (0, chai_1.expect)(result).to.have.property('testCode');
            (0, chai_1.expect)(typeof result.testCode).to.equal('string');
        });
        it('should handle empty requirements', async () => {
            try {
                await developmentAgent.generateCode('');
                chai_1.expect.fail('Should have thrown error for empty requirements');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Code Review', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should review code and provide feedback', async () => {
            const codeToReview = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
            const result = await developmentAgent.reviewCode(codeToReview);
            (0, chai_1.expect)(result).to.have.property('issues');
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('score');
            (0, chai_1.expect)(result).to.have.property('strengths');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(Array.isArray(result.issues)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.strengths)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
            (0, chai_1.expect)(result.score).to.be.a('number');
            (0, chai_1.expect)(result.score).to.be.at.least(0);
            (0, chai_1.expect)(result.score).to.be.at.most(100);
        });
        it('should support different focus areas', async () => {
            const codeToReview = `
        const data = [];
        for (let i = 0; i < 1000; i++) {
          data.push(i);
        }
      `;
            const focusAreas = ['security', 'performance', 'style', 'maintainability'];
            for (const focus of focusAreas) {
                const result = await developmentAgent.reviewCode(codeToReview, {
                    focusAreas: [focus]
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.issues).to.be.an('array');
            }
        });
        it('should support different severity levels', async () => {
            const codeToReview = 'console.log("Hello World");';
            const severities = ['strict', 'balanced', 'lenient'];
            for (const severity of severities) {
                const result = await developmentAgent.reviewCode(codeToReview, {
                    severity: severity
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.score).to.be.a('number');
            }
        });
        it('should detect different programming languages', async () => {
            const jsCode = 'function test() { return true; }';
            const pyCode = 'def test():\n    return True';
            const jsResult = await developmentAgent.reviewCode(jsCode);
            const pyResult = await developmentAgent.reviewCode(pyCode, {
                language: 'Python'
            });
            (0, chai_1.expect)(jsResult).to.be.an('object');
            (0, chai_1.expect)(pyResult).to.be.an('object');
        });
        it('should handle empty code', async () => {
            try {
                await developmentAgent.reviewCode('');
                chai_1.expect.fail('Should have thrown error for empty code');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Architecture Design', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should design software architecture', async () => {
            const requirements = 'Build a scalable e-commerce platform';
            const result = await developmentAgent.designArchitecture(requirements);
            (0, chai_1.expect)(result).to.have.property('architecture');
            (0, chai_1.expect)(result).to.have.property('technologies');
            (0, chai_1.expect)(result).to.have.property('diagrams');
            (0, chai_1.expect)(result.architecture).to.have.property('overview');
            (0, chai_1.expect)(result.architecture).to.have.property('components');
            (0, chai_1.expect)(result.architecture).to.have.property('interactions');
            (0, chai_1.expect)(Array.isArray(result.architecture.components)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.architecture.interactions)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.technologies)).to.be.true;
        });
        it('should support different architecture types', async () => {
            const requirements = 'Design a microservices system';
            const types = ['monolith', 'microservices', 'serverless', 'hybrid'];
            for (const type of types) {
                const result = await developmentAgent.designArchitecture(requirements, {
                    type: type
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.architecture).to.be.an('object');
            }
        });
        it('should include data model when requested', async () => {
            const requirements = 'Design a user management system';
            const result = await developmentAgent.designArchitecture(requirements, {
                includeDataModel: true
            });
            (0, chai_1.expect)(result).to.have.property('dataModel');
            (0, chai_1.expect)(result.dataModel).to.have.property('entities');
            (0, chai_1.expect)(Array.isArray(result.dataModel.entities)).to.be.true;
        });
        it('should include deployment model when requested', async () => {
            const requirements = 'Design a scalable web application';
            const result = await developmentAgent.designArchitecture(requirements, {
                includeDeployment: true
            });
            (0, chai_1.expect)(result).to.have.property('deploymentModel');
            (0, chai_1.expect)(result.deploymentModel).to.have.property('environments');
            (0, chai_1.expect)(result.deploymentModel).to.have.property('components');
            (0, chai_1.expect)(Array.isArray(result.deploymentModel.environments)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.deploymentModel.components)).to.be.true;
        });
        it('should support technology preferences', async () => {
            const requirements = 'Build a modern web application';
            const technologies = ['React', 'Node.js', 'PostgreSQL', 'Docker'];
            const result = await developmentAgent.designArchitecture(requirements, {
                technologiesPreference: technologies
            });
            (0, chai_1.expect)(result.technologies).to.be.an('array');
            (0, chai_1.expect)(result.technologies.length).to.be.greaterThan(0);
        });
        it('should handle empty requirements', async () => {
            try {
                await developmentAgent.designArchitecture('');
                chai_1.expect.fail('Should have thrown error for empty requirements');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Task Execution', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should handle code generation tasks', async () => {
            const taskDetails = {
                type: 'generate',
                requirements: 'Create a REST API for user management'
            };
            const result = await developmentAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.have.property('code');
            (0, chai_1.expect)(result).to.have.property('language');
            (0, chai_1.expect)(typeof result.code).to.equal('string');
        });
        it('should handle code review tasks', async () => {
            const taskDetails = {
                type: 'review',
                code: 'function test() { return true; }',
                options: { focusAreas: ['security'] }
            };
            const result = await developmentAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.have.property('issues');
            (0, chai_1.expect)(result).to.have.property('score');
            (0, chai_1.expect)(Array.isArray(result.issues)).to.be.true;
        });
        it('should handle architecture design tasks', async () => {
            const taskDetails = {
                type: 'design',
                requirements: 'Design a scalable system',
                options: { type: 'microservices' }
            };
            const result = await developmentAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.have.property('architecture');
            (0, chai_1.expect)(result.architecture).to.have.property('components');
        });
        it('should handle invalid task types', async () => {
            const invalidTaskDetails = {
                type: 'invalid-task-type'
            };
            try {
                await developmentAgent.executeTask(invalidTaskDetails);
                chai_1.expect.fail('Should have thrown error for invalid task type');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('Unsupported task type');
            }
        });
        it('should handle missing required task parameters', async () => {
            const incompleteTaskDetails = {
                type: 'generate'
                // Missing 'requirements' parameter
            };
            try {
                await developmentAgent.executeTask(incompleteTaskDetails);
                chai_1.expect.fail('Should have thrown error for missing parameters');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('Missing required field');
            }
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await developmentAgent.generateCode('test requirements');
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
            const result = await developmentAgent.generateCode('test requirements');
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.code).to.be.a('string');
        });
        it('should handle code review errors', async () => {
            // Mock API error for code review
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('Code review API error');
            };
            try {
                await developmentAgent.reviewCode('test code');
                chai_1.expect.fail('Should have thrown error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.equal('Code review API error');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await developmentAgent.initialize();
        });
        it('should complete code generation within reasonable time', async () => {
            const requirements = 'Create a simple calculator class';
            const startTime = Date.now();
            await developmentAgent.generateCode(requirements);
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
        });
        it('should handle concurrent requests', async () => {
            const requirements = 'Create a utility function';
            const requests = [];
            for (let i = 0; i < 3; i++) {
                requests.push(developmentAgent.generateCode(requirements));
            }
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(3);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.code).to.be.a('string');
            });
        });
        it('should handle large requirements', async () => {
            const largeRequirements = 'A'.repeat(2000) + ' - create a comprehensive system for this';
            const result = await developmentAgent.generateCode(largeRequirements);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.code).to.be.a('string');
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await developmentAgent.initialize();
            const info = developmentAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.equal('test-developer');
            (0, chai_1.expect)(info.name).to.equal('Test Developer');
            (0, chai_1.expect)(info.type).to.equal('development');
            (0, chai_1.expect)(info.capabilities).to.include('code-generation');
            (0, chai_1.expect)(info.capabilities).to.include('code-review');
            (0, chai_1.expect)(info.status).to.equal('available');
        });
        it('should update agent status during operations', async () => {
            await developmentAgent.initialize();
            // Status should be available initially
            (0, chai_1.expect)(developmentAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = developmentAgent.generateCode('A'.repeat(1000));
            // Status should become busy during operation
            // Note: This is implementation-dependent timing
            await longOperation;
            // Status should return to available
            (0, chai_1.expect)(developmentAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await developmentAgent.initialize();
            const result = await developmentAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(developmentAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await developmentAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_development_agent.js.map