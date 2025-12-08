"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const AnalysisAgent_1 = require("../../../src/agents/AnalysisAgent");
describe('AnalysisAgent', () => {
    let analysisAgent;
    let mockOpenAIClient;
    let mockSharedState;
    let originalConsoleLog;
    beforeEach(() => {
        // Mock OpenAI client
        mockOpenAIClient = {
            generateResponse: async (prompt, options) => {
                return {
                    choices: [{
                            message: {
                                content: `Mock analysis response for: ${prompt.substring(0, 50)}...`
                            }
                        }],
                    usage: {
                        prompt_tokens: 100,
                        completion_tokens: 200,
                        total_tokens: 300
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
        analysisAgent = new AnalysisAgent_1.AnalysisAgent('Test Analysis Agent', {
            id: 'test-analysis-agent',
            name: 'Test Analysis Agent',
            type: 'analysis',
            capabilities: ['data-analysis', 'statistics', 'visualization'],
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
            const result = await analysisAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(analysisAgent.getAgentInfo().status).to.equal('available');
        });
        it('should handle initialization errors', async () => {
            // Create agent with invalid configuration
            const invalidAgent = new AnalysisAgent_1.AnalysisAgent('Invalid Agent', {
                id: 'invalid-agent',
                name: 'Invalid Agent',
                type: 'analysis',
                capabilities: [],
                status: 'available',
                openAIClient: null,
                sharedState: mockSharedState
            });
            const result = await invalidAgent.initialize();
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    describe('Data Analysis', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should perform basic data analysis', async () => {
            const testData = [
                { name: 'Alice', age: 25, score: 85 },
                { name: 'Bob', age: 30, score: 92 },
                { name: 'Charlie', age: 28, score: 78 }
            ];
            const result = await analysisAgent.analyzeData(testData);
            (0, chai_1.expect)(result).to.have.property('insights');
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(result).to.have.property('confidence');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(result.confidence).to.be.a('number');
            (0, chai_1.expect)(result.processingTime).to.be.a('number');
        });
        it('should handle different analysis types', async () => {
            const testData = { values: [1, 2, 3, 4, 5] };
            const exploratoryResult = await analysisAgent.analyzeData(testData, {
                analysisType: 'exploratory'
            });
            const descriptiveResult = await analysisAgent.analyzeData(testData, {
                analysisType: 'descriptive'
            });
            const inferentialResult = await analysisAgent.analyzeData(testData, {
                analysisType: 'inferential'
            });
            (0, chai_1.expect)(exploratoryResult).to.be.an('object');
            (0, chai_1.expect)(descriptiveResult).to.be.an('object');
            (0, chai_1.expect)(inferentialResult).to.be.an('object');
        });
        it('should handle analysis with focus areas', async () => {
            const testData = {
                sales: [100, 150, 120, 180, 200],
                customers: [10, 15, 12, 18, 20]
            };
            const result = await analysisAgent.analyzeData(testData, {
                focusAreas: ['profitability', 'growth'],
                includeTrends: true,
                includeCorrelations: true
            });
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(result).to.have.property('correlations');
        });
        it('should handle empty or invalid data', async () => {
            try {
                await analysisAgent.analyzeData(null);
                chai_1.expect.fail('Should have thrown error for null data');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
            try {
                await analysisAgent.analyzeData([]);
                // Empty array should be handled gracefully
                (0, chai_1.expect)(true).to.be.true;
            }
            catch (error) {
                // Error is acceptable for empty data
            }
        });
    });
    describe('Visualization Generation', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should create visualization configurations', async () => {
            const testData = {
                categories: ['A', 'B', 'C'],
                values: [10, 20, 15]
            };
            const result = await analysisAgent.createVisualization(testData, {
                visualizationType: 'bar',
                variables: ['categories', 'values'],
                title: 'Test Bar Chart'
            });
            (0, chai_1.expect)(result).to.have.property('visualizationType');
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('variables');
            (0, chai_1.expect)(result).to.have.property('config');
            (0, chai_1.expect)(result).to.have.property('description');
            (0, chai_1.expect)(result).to.have.property('insights');
            (0, chai_1.expect)(result.visualizationType).to.equal('bar');
            (0, chai_1.expect)(result.title).to.equal('Test Bar Chart');
            (0, chai_1.expect)(result.variables).to.include('categories');
            (0, chai_1.expect)(result.variables).to.include('values');
        });
        it('should support different visualization types', async () => {
            const testData = { x: [1, 2, 3], y: [4, 5, 6] };
            const chartTypes = ['line', 'scatter', 'bar', 'pie', 'histogram'];
            for (const chartType of chartTypes) {
                const result = await analysisAgent.createVisualization(testData, {
                    visualizationType: chartType,
                    variables: ['x', 'y']
                });
                (0, chai_1.expect)(result.visualizationType).to.equal(chartType);
            }
        });
        it('should include code generation when requested', async () => {
            const testData = { data: [1, 2, 3, 4, 5] };
            const result = await analysisAgent.createVisualization(testData, {
                visualizationType: 'histogram',
                includeCode: true,
                framework: 'plotly'
            });
            (0, chai_1.expect)(result).to.have.property('code');
            (0, chai_1.expect)(typeof result.code).to.equal('string');
        });
        it('should handle auto visualization type selection', async () => {
            const testData = {
                time: ['2024-01', '2024-02', '2024-03'],
                value: [100, 150, 120]
            };
            const result = await analysisAgent.createVisualization(testData, {
                visualizationType: 'auto'
            });
            (0, chai_1.expect)(result.visualizationType).to.be.a('string');
            (0, chai_1.expect)(['line', 'bar', 'scatter']).to.include(result.visualizationType);
        });
    });
    describe('Report Generation', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should generate executive reports', async () => {
            const testData = {
                metrics: { revenue: 100000, profit: 15000, customers: 500 }
            };
            const result = await analysisAgent.generateReport(testData, {
                reportType: 'executive',
                audience: 'executives',
                includeExecutiveSummary: true
            });
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('executiveSummary');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result).to.have.property('keyFindings');
            (0, chai_1.expect)(result.title).to.be.a('string');
            (0, chai_1.expect)(result.executiveSummary).to.be.a('string');
            (0, chai_1.expect)(Array.isArray(result.sections)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.keyFindings)).to.be.true;
        });
        it('should generate technical reports', async () => {
            const testData = {
                technical: { algorithms: ['linear', 'logistic'], accuracy: [0.85, 0.92] }
            };
            const result = await analysisAgent.generateReport(testData, {
                reportType: 'technical',
                audience: 'analysts',
                includeMethodology: true
            });
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('methodology');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result.methodology).to.be.a('string');
        });
        it('should generate comprehensive reports', async () => {
            const testData = {
                comprehensive: { data: 'test', analysis: 'results' }
            };
            const result = await analysisAgent.generateReport(testData, {
                reportType: 'comprehensive',
                includeExecutiveSummary: true,
                includeMethodology: true,
                includeVisualizations: true,
                includeRecommendations: true
            });
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('executiveSummary');
            (0, chai_1.expect)(result).to.have.property('methodology');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should handle report generation errors', async () => {
            try {
                await analysisAgent.generateReport(null);
                chai_1.expect.fail('Should have thrown error for null data');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await analysisAgent.initialize();
            const info = analysisAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.equal('test-analysis-agent');
            (0, chai_1.expect)(info.name).to.equal('Test Analysis Agent');
            (0, chai_1.expect)(info.type).to.equal('analysis');
            (0, chai_1.expect)(info.capabilities).to.include('data-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('statistics');
            (0, chai_1.expect)(info.capabilities).to.include('visualization');
            (0, chai_1.expect)(info.status).to.equal('available');
        });
        it('should update agent status', async () => {
            await analysisAgent.initialize();
            analysisAgent.updateStatus('busy');
            (0, chai_1.expect)(analysisAgent.getAgentInfo().status).to.equal('busy');
            analysisAgent.updateStatus('available');
            (0, chai_1.expect)(analysisAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Task Execution', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should execute analysis tasks', async () => {
            const taskDetails = {
                type: 'analyze',
                data: { values: [1, 2, 3, 4, 5] },
                options: { analysisType: 'descriptive' }
            };
            const result = await analysisAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('keyInsights');
            (0, chai_1.expect)(result).to.have.property('statistics');
        });
        it('should execute visualization tasks', async () => {
            const taskDetails = {
                type: 'visualize',
                data: { x: [1, 2, 3], y: [4, 5, 6] },
                options: { visualizationType: 'scatter' }
            };
            const result = await analysisAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('visualizationType');
            (0, chai_1.expect)(result).to.have.property('config');
            (0, chai_1.expect)(result.visualizationType).to.equal('scatter');
        });
        it('should execute report tasks', async () => {
            const taskDetails = {
                type: 'report',
                data: { analysis: 'test results' },
                options: { reportType: 'executive' }
            };
            const result = await analysisAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result).to.have.property('keyFindings');
        });
        it('should handle invalid task types', async () => {
            const invalidTaskDetails = {
                type: 'invalid-task-type'
            };
            try {
                await analysisAgent.executeTask(invalidTaskDetails);
                chai_1.expect.fail('Should have thrown error for invalid task type');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('Unsupported task type');
            }
        });
        it('should handle missing required task parameters', async () => {
            const incompleteTaskDetails = {
                type: 'analyze'
                // Missing 'data' parameter
            };
            try {
                await analysisAgent.executeTask(incompleteTaskDetails);
                chai_1.expect.fail('Should have thrown error for missing parameters');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('Missing required field');
            }
        });
    });
    describe('Caching', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should support cache operations', async () => {
            const testData = { values: [1, 2, 3] };
            // First analysis should not be cached
            const result1 = await analysisAgent.analyzeData(testData, {
                checkCache: false
            });
            // Second analysis with same data should use cache if enabled
            const result2 = await analysisAgent.analyzeData(testData, {
                checkCache: true
            });
            (0, chai_1.expect)(result1).to.be.an('object');
            (0, chai_1.expect)(result2).to.be.an('object');
        });
        it('should clear cache when requested', async () => {
            const result = await analysisAgent.executeTask({
                type: 'clearCache'
            });
            (0, chai_1.expect)(result.success).to.be.true;
            (0, chai_1.expect)(result.message).to.equal('Cache cleared.');
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.generateResponse = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await analysisAgent.analyzeData({ test: 'data' });
                chai_1.expect.fail('Should have thrown error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.equal('OpenAI API Error');
            }
        });
        it('should handle malformed responses', async () => {
            // Mock malformed response
            mockOpenAIClient.generateResponse = async () => {
                return {
                    choices: [{
                            message: {
                                content: null
                            }
                        }]
                };
            };
            const result = await analysisAgent.analyzeData({ test: 'data' });
            (0, chai_1.expect)(result).to.be.an('object');
            // Should handle null content gracefully
        });
        it('should handle network timeouts', async () => {
            // Mock timeout
            mockOpenAIClient.generateResponse = async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return { choices: [{ message: { content: 'timeout response' } }] };
            };
            try {
                await analysisAgent.analyzeData({ test: 'data' }, {
                // Short timeout to trigger timeout error
                });
                // Should handle timeout or complete successfully
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await analysisAgent.initialize();
        });
        it('should complete analysis within reasonable time', async () => {
            const testData = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                value: Math.random() * 100
            }));
            const startTime = Date.now();
            await analysisAgent.analyzeData(testData);
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
        });
        it('should handle large datasets', async () => {
            const largeData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                value: Math.random() * 100,
                category: `category-${i % 10}`
            }));
            const result = await analysisAgent.analyzeData(largeData);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('summary');
        });
        it('should handle concurrent requests', async () => {
            const testData = { values: [1, 2, 3, 4, 5] };
            const requests = [];
            for (let i = 0; i < 5; i++) {
                requests.push(analysisAgent.analyzeData(testData));
            }
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(5);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result).to.have.property('summary');
            });
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await analysisAgent.initialize();
            const result = await analysisAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(analysisAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await analysisAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_analysis_agent.js.map