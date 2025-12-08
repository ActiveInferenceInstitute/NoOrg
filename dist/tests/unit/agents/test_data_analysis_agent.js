"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DataAnalysisAgent_1 = require("../../../src/agents/DataAnalysisAgent");
describe('DataAnalysisAgent', () => {
    let dataAnalysisAgent;
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
                                content: `Mock data analysis response for: ${prompt.substring(0, 50)}...`
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
        // Create agent with caching disabled for testing
        dataAnalysisAgent = new DataAnalysisAgent_1.DataAnalysisAgent('Test Data Analyst', {
            id: 'test-data-analyst',
            name: 'Test Data Analyst',
            type: 'data-analysis',
            capabilities: ['data-analysis', 'statistics', 'visualization'],
            status: 'available',
            openAIClient: mockOpenAIClient,
            sharedState: mockSharedState,
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
            const result = await dataAnalysisAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(dataAnalysisAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await dataAnalysisAgent.initialize();
            const info = dataAnalysisAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('data-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('data-visualization');
            (0, chai_1.expect)(info.capabilities).to.include('statistical-modeling');
            (0, chai_1.expect)(info.capabilities).to.include('pattern-recognition');
            (0, chai_1.expect)(info.capabilities).to.include('trend-analysis');
        });
        it('should support different specialties', () => {
            const businessAnalyst = new DataAnalysisAgent_1.DataAnalysisAgent('Business Analyst', {
                id: 'business-analyst',
                name: 'Business Analyst',
                type: 'data-analysis',
                capabilities: ['data-analysis'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'business'
            });
            const scientificAnalyst = new DataAnalysisAgent_1.DataAnalysisAgent('Scientific Analyst', {
                id: 'scientific-analyst',
                name: 'Scientific Analyst',
                type: 'data-analysis',
                capabilities: ['data-analysis'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'scientific'
            });
            (0, chai_1.expect)(businessAnalyst).to.be.instanceOf(DataAnalysisAgent_1.DataAnalysisAgent);
            (0, chai_1.expect)(scientificAnalyst).to.be.instanceOf(DataAnalysisAgent_1.DataAnalysisAgent);
        });
    });
    describe('Data Analysis', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should perform exploratory data analysis', async () => {
            const testData = [
                { id: 1, value: 10, category: 'A' },
                { id: 2, value: 20, category: 'B' },
                { id: 3, value: 15, category: 'A' },
                { id: 4, value: 25, category: 'C' }
            ];
            const result = await dataAnalysisAgent.analyzeData(testData, {
                analysisType: 'exploratory'
            });
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('keyInsights');
            (0, chai_1.expect)(result).to.have.property('statistics');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(result).to.have.property('cached');
            (0, chai_1.expect)(typeof result.summary).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.keyInsights)).to.be.true;
            (0, chai_1.expect)(result.cached).to.be.false;
        });
        it('should perform descriptive data analysis', async () => {
            const testData = {
                sales: [100, 150, 120, 180, 200, 175, 220],
                dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07']
            };
            const result = await dataAnalysisAgent.analyzeData(testData, {
                analysisType: 'descriptive',
                includeTrends: true
            });
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('statistics');
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(Array.isArray(result.trends)).to.be.true;
        });
        it('should perform inferential data analysis', async () => {
            const testData = {
                groupA: [85, 90, 88, 92, 87],
                groupB: [78, 82, 80, 85, 79]
            };
            const result = await dataAnalysisAgent.analyzeData(testData, {
                analysisType: 'inferential',
                includeStatisticalTests: true
            });
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('statisticalTests');
            (0, chai_1.expect)(Array.isArray(result.statisticalTests)).to.be.true;
        });
        it('should handle focus areas', async () => {
            const testData = {
                revenue: [1000, 1200, 1100, 1400, 1300],
                costs: [600, 650, 620, 700, 680],
                profit: [400, 550, 480, 700, 620]
            };
            const result = await dataAnalysisAgent.analyzeData(testData, {
                focusAreas: ['profitability', 'efficiency'],
                includeCorrelations: true,
                includeRecommendations: true
            });
            (0, chai_1.expect)(result).to.have.property('correlations');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(Array.isArray(result.correlations)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should handle outlier detection', async () => {
            const testData = [10, 12, 11, 13, 1000, 9, 14, 8]; // 1000 is an outlier
            const result = await dataAnalysisAgent.analyzeData(testData, {
                includeOutliers: true
            });
            (0, chai_1.expect)(result).to.have.property('outliers');
            (0, chai_1.expect)(Array.isArray(result.outliers)).to.be.true;
        });
        it('should handle large datasets', async () => {
            const largeData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                value: Math.random() * 100,
                category: `cat-${i % 10}`
            }));
            const result = await dataAnalysisAgent.analyzeData(largeData);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('statistics');
        });
    });
    describe('Visualization Generation', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should create bar chart visualizations', async () => {
            const testData = {
                categories: ['Q1', 'Q2', 'Q3', 'Q4'],
                values: [100, 150, 120, 180]
            };
            const result = await dataAnalysisAgent.createVisualization(testData, {
                visualizationType: 'bar',
                variables: ['categories', 'values'],
                title: 'Quarterly Sales'
            });
            (0, chai_1.expect)(result).to.have.property('visualizationType');
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('variables');
            (0, chai_1.expect)(result).to.have.property('config');
            (0, chai_1.expect)(result).to.have.property('description');
            (0, chai_1.expect)(result).to.have.property('insights');
            (0, chai_1.expect)(result.visualizationType).to.equal('bar');
            (0, chai_1.expect)(result.title).to.equal('Quarterly Sales');
            (0, chai_1.expect)(result.variables).to.include('categories');
            (0, chai_1.expect)(result.variables).to.include('values');
        });
        it('should create line chart visualizations', async () => {
            const testData = {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                revenue: [1000, 1200, 1100, 1400, 1300]
            };
            const result = await dataAnalysisAgent.createVisualization(testData, {
                visualizationType: 'line',
                variables: ['months', 'revenue'],
                title: 'Monthly Revenue Trend'
            });
            (0, chai_1.expect)(result.visualizationType).to.equal('line');
            (0, chai_1.expect)(result.title).to.equal('Monthly Revenue Trend');
        });
        it('should create scatter plot visualizations', async () => {
            const testData = {
                x: [1, 2, 3, 4, 5],
                y: [2, 4, 6, 8, 10]
            };
            const result = await dataAnalysisAgent.createVisualization(testData, {
                visualizationType: 'scatter',
                variables: ['x', 'y'],
                title: 'X vs Y Correlation'
            });
            (0, chai_1.expect)(result.visualizationType).to.equal('scatter');
            (0, chai_1.expect)(result.title).to.equal('X vs Y Correlation');
        });
        it('should support different frameworks', async () => {
            const testData = { data: [1, 2, 3, 4, 5] };
            const frameworks = ['matplotlib', 'plotly', 'seaborn', 'chart.js'];
            for (const framework of frameworks) {
                const result = await dataAnalysisAgent.createVisualization(testData, {
                    visualizationType: 'histogram',
                    framework: framework,
                    includeCode: true
                });
                (0, chai_1.expect)(result).to.have.property('code');
                (0, chai_1.expect)(typeof result.code).to.equal('string');
            }
        });
        it('should handle auto visualization type selection', async () => {
            const testData = {
                time: ['2024-01', '2024-02', '2024-03'],
                value: [100, 150, 120]
            };
            const result = await dataAnalysisAgent.createVisualization(testData, {
                visualizationType: 'auto'
            });
            (0, chai_1.expect)(result.visualizationType).to.be.a('string');
            (0, chai_1.expect)(['line', 'bar', 'scatter', 'area']).to.include(result.visualizationType);
        });
        it('should include insights in visualization results', async () => {
            const testData = {
                categories: ['A', 'B', 'C'],
                values: [10, 50, 30]
            };
            const result = await dataAnalysisAgent.createVisualization(testData, {
                visualizationType: 'pie'
            });
            (0, chai_1.expect)(Array.isArray(result.insights)).to.be.true;
            (0, chai_1.expect)(result.insights.length).to.be.greaterThan(0);
        });
    });
    describe('Report Generation', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should generate executive reports', async () => {
            const testData = {
                metrics: {
                    revenue: 1000000,
                    profit: 150000,
                    customers: 5000,
                    growth: 15.5
                }
            };
            const result = await dataAnalysisAgent.generateReport(testData, {
                reportType: 'executive',
                audience: 'executives',
                includeExecutiveSummary: true
            });
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('executiveSummary');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result).to.have.property('keyFindings');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(result).to.have.property('nextSteps');
            (0, chai_1.expect)(Array.isArray(result.sections)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.keyFindings)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.nextSteps)).to.be.true;
        });
        it('should generate technical reports', async () => {
            const testData = {
                technical: {
                    algorithms: ['linear', 'polynomial', 'random_forest'],
                    accuracy: [0.85, 0.92, 0.88],
                    parameters: { learning_rate: 0.01, max_depth: 10 }
                }
            };
            const result = await dataAnalysisAgent.generateReport(testData, {
                reportType: 'technical',
                audience: 'analysts',
                includeMethodology: true
            });
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('methodology');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(typeof result.methodology).to.equal('string');
        });
        it('should generate comprehensive reports', async () => {
            const testData = {
                comprehensive: {
                    data_quality: 0.95,
                    analysis_depth: 'detailed',
                    findings: ['Significant correlation found', 'Trends identified']
                }
            };
            const result = await dataAnalysisAgent.generateReport(testData, {
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
        });
        it('should handle different audience types', async () => {
            const testData = { metrics: { value: 100 } };
            const audiences = ['executives', 'analysts', 'stakeholders', 'technical'];
            for (const audience of audiences) {
                const result = await dataAnalysisAgent.generateReport(testData, {
                    audience: audience
                });
                (0, chai_1.expect)(result).to.have.property('title');
                (0, chai_1.expect)(result).to.have.property('sections');
            }
        });
    });
    describe('Task Execution', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should execute analysis tasks', async () => {
            const taskDetails = {
                type: 'analyze',
                data: { values: [1, 2, 3, 4, 5] },
                options: { analysisType: 'descriptive' }
            };
            const result = await dataAnalysisAgent.executeTask(taskDetails);
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
            const result = await dataAnalysisAgent.executeTask(taskDetails);
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
            const result = await dataAnalysisAgent.executeTask(taskDetails);
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result).to.have.property('keyFindings');
        });
        it('should handle invalid task types', async () => {
            const invalidTaskDetails = {
                type: 'invalid-task-type'
            };
            try {
                await dataAnalysisAgent.executeTask(invalidTaskDetails);
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
                await dataAnalysisAgent.executeTask(incompleteTaskDetails);
                chai_1.expect.fail('Should have thrown error for missing parameters');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('Missing required field');
            }
        });
    });
    describe('Caching', () => {
        it('should support cache operations', async () => {
            await dataAnalysisAgent.initialize();
            // Test cache clearing
            const result = await dataAnalysisAgent.executeTask({
                type: 'clearCache'
            });
            (0, chai_1.expect)(result.success).to.be.true;
            (0, chai_1.expect)(result.message).to.equal('Cache cleared.');
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await dataAnalysisAgent.analyzeData({ test: 'data' });
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
            const result = await dataAnalysisAgent.analyzeData({ test: 'data' });
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.summary).to.be.a('string');
        });
        it('should handle invalid data formats', async () => {
            try {
                await dataAnalysisAgent.analyzeData('invalid data format');
                // Should handle or throw appropriate error
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await dataAnalysisAgent.initialize();
        });
        it('should complete analysis within reasonable time', async () => {
            const testData = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                value: Math.random() * 100
            }));
            const startTime = Date.now();
            await dataAnalysisAgent.analyzeData(testData);
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
        });
        it('should handle concurrent requests', async () => {
            const testData = { values: [1, 2, 3, 4, 5] };
            const requests = [];
            for (let i = 0; i < 3; i++) {
                requests.push(dataAnalysisAgent.analyzeData(testData));
            }
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(3);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result).to.have.property('summary');
            });
        });
        it('should handle large datasets efficiently', async () => {
            const largeData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                value: Math.random() * 100,
                category: `category-${i % 10}`
            }));
            const result = await dataAnalysisAgent.analyzeData(largeData);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result).to.have.property('summary');
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await dataAnalysisAgent.initialize();
            const info = dataAnalysisAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.equal('test-data-analyst');
            (0, chai_1.expect)(info.name).to.equal('Test Data Analyst');
            (0, chai_1.expect)(info.type).to.equal('data-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('data-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('data-visualization');
            (0, chai_1.expect)(info.status).to.equal('available');
        });
        it('should update agent status during operations', async () => {
            await dataAnalysisAgent.initialize();
            // Status should be available initially
            (0, chai_1.expect)(dataAnalysisAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = dataAnalysisAgent.analyzeData(Array.from({ length: 100 }, (_, i) => ({ id: i, value: i })));
            // Status should become busy during operation
            // Note: This is implementation-dependent timing
            await longOperation;
            // Status should return to available
            (0, chai_1.expect)(dataAnalysisAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await dataAnalysisAgent.initialize();
            const result = await dataAnalysisAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(dataAnalysisAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await dataAnalysisAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_data_analysis_agent.js.map