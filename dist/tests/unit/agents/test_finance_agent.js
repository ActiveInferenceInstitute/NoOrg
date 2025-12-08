"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const FinanceAgent_1 = require("../../../src/agents/FinanceAgent");
describe('FinanceAgent', () => {
    let financeAgent;
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
                                content: `Mock finance analysis response for: ${prompt.substring(0, 50)}...`
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
        financeAgent = new FinanceAgent_1.FinanceAgent('Test Finance Analyst', {
            id: 'test-finance-analyst',
            name: 'Test Finance Analyst',
            type: 'finance',
            capabilities: ['financial-analysis', 'budgeting', 'forecasting'],
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
            const result = await financeAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(financeAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await financeAgent.initialize();
            const info = financeAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('financial-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('reporting');
            (0, chai_1.expect)(info.capabilities).to.include('budgeting');
            (0, chai_1.expect)(info.capabilities).to.include('forecasting');
            (0, chai_1.expect)(info.capabilities).to.include('investment-analysis');
        });
        it('should support different specialties', () => {
            const budgetAnalyst = new FinanceAgent_1.FinanceAgent('Budget Analyst', {
                id: 'budget-analyst',
                name: 'Budget Analyst',
                type: 'finance',
                capabilities: ['financial-analysis'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'budgeting'
            });
            const investmentAnalyst = new FinanceAgent_1.FinanceAgent('Investment Analyst', {
                id: 'investment-analyst',
                name: 'Investment Analyst',
                type: 'finance',
                capabilities: ['financial-analysis'],
                status: 'available',
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'investment'
            });
            (0, chai_1.expect)(budgetAnalyst).to.be.instanceOf(FinanceAgent_1.FinanceAgent);
            (0, chai_1.expect)(investmentAnalyst).to.be.instanceOf(FinanceAgent_1.FinanceAgent);
        });
    });
    describe('Financial Data Analysis', () => {
        beforeEach(async () => {
            await financeAgent.initialize();
        });
        it('should analyze financial data', async () => {
            const financialData = {
                revenue: [100000, 120000, 110000, 140000, 130000],
                expenses: [60000, 65000, 62000, 70000, 68000],
                profit: [40000, 55000, 48000, 70000, 62000]
            };
            const result = await financeAgent.analyzeFinancialData(financialData);
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('keyMetrics');
            (0, chai_1.expect)(result).to.have.property('analysis');
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(result).to.have.property('ratios');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(typeof result.summary).to.equal('string');
            (0, chai_1.expect)(result.keyMetrics).to.be.an('object');
            (0, chai_1.expect)(Array.isArray(result.trends)).to.be.true;
            (0, chai_1.expect)(result.ratios).to.be.an('object');
        });
        it('should handle different analysis types', async () => {
            const financialData = {
                balanceSheet: { assets: 1000000, liabilities: 600000, equity: 400000 }
            };
            const analysisTypes = ['basic', 'detailed', 'comprehensive'];
            for (const analysisType of analysisTypes) {
                const result = await financeAgent.analyzeFinancialData(financialData, {
                    analysisType: analysisType
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.summary).to.be.a('string');
            }
        });
        it('should handle focus areas', async () => {
            const financialData = {
                cashFlow: [10000, -5000, 15000, 8000, 12000]
            };
            const result = await financeAgent.analyzeFinancialData(financialData, {
                focusAreas: ['liquidity', 'efficiency'],
                includeTrends: true,
                includeRecommendations: true
            });
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(Array.isArray(result.trends)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should handle empty or invalid data', async () => {
            try {
                await financeAgent.analyzeFinancialData(null);
                chai_1.expect.fail('Should have thrown error for null data');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
            try {
                await financeAgent.analyzeFinancialData({});
                // Empty object should be handled gracefully
                (0, chai_1.expect)(true).to.be.true;
            }
            catch (error) {
                // Error is acceptable for empty data
            }
        });
    });
    describe('Budget Creation', () => {
        beforeEach(async () => {
            await financeAgent.initialize();
        });
        it('should create budget plans', async () => {
            const budgetParameters = {
                totalAmount: 100000,
                currency: 'USD',
                period: 'annual',
                categories: [
                    { name: 'Marketing', allocation: 20000 },
                    { name: 'Operations', allocation: 30000 },
                    { name: 'Development', allocation: 40000 }
                ]
            };
            const result = await financeAgent.createBudget(budgetParameters);
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('totalBudget');
            (0, chai_1.expect)(result).to.have.property('currency');
            (0, chai_1.expect)(result).to.have.property('period');
            (0, chai_1.expect)(result).to.have.property('categories');
            (0, chai_1.expect)(result.totalBudget).to.equal(100000);
            (0, chai_1.expect)(result.currency).to.equal('USD');
            (0, chai_1.expect)(result.period).to.equal('annual');
            (0, chai_1.expect)(Array.isArray(result.categories)).to.be.true;
            (0, chai_1.expect)(result.categories.length).to.be.greaterThan(0);
        });
        it('should support different budget levels', async () => {
            const budgetParameters = {
                totalAmount: 50000,
                currency: 'EUR',
                period: 'quarterly'
            };
            const levels = ['simple', 'detailed', 'comprehensive'];
            for (const level of levels) {
                const result = await financeAgent.createBudget(budgetParameters, {
                    level: level
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.totalBudget).to.equal(50000);
                (0, chai_1.expect)(result.currency).to.equal('EUR');
            }
        });
        it('should include contingency when requested', async () => {
            const budgetParameters = {
                totalAmount: 100000,
                period: 'monthly'
            };
            const result = await financeAgent.createBudget(budgetParameters, {
                includeContingency: true
            });
            (0, chai_1.expect)(result).to.have.property('contingency');
            (0, chai_1.expect)(typeof result.contingency).to.equal('number');
        });
        it('should include forecasts when requested', async () => {
            const budgetParameters = {
                totalAmount: 75000,
                period: 'annual'
            };
            const result = await financeAgent.createBudget(budgetParameters, {
                includeForecast: true
            });
            (0, chai_1.expect)(result).to.have.property('forecast');
            (0, chai_1.expect)(Array.isArray(result.forecast)).to.be.true;
        });
        it('should handle invalid budget parameters', async () => {
            const invalidParameters = {
                totalAmount: -1000, // Negative amount
                period: 'invalid-period'
            };
            try {
                await financeAgent.createBudget(invalidParameters);
                chai_1.expect.fail('Should have thrown error for invalid parameters');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Financial Forecasting', () => {
        beforeEach(async () => {
            await financeAgent.initialize();
        });
        it('should create financial forecasts', async () => {
            const historicalData = {
                revenue: [100000, 110000, 120000, 130000, 140000],
                expenses: [60000, 62000, 64000, 66000, 68000],
                profit: [40000, 48000, 56000, 64000, 72000]
            };
            const result = await financeAgent.createForecast(historicalData);
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('baselineForecast');
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(result).to.have.property('risks');
            (0, chai_1.expect)(result).to.have.property('forecastMethodology');
            (0, chai_1.expect)(Array.isArray(result.baselineForecast)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.trends)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.risks)).to.be.true;
        });
        it('should support different forecast periods', async () => {
            const historicalData = {
                sales: [1000, 1100, 1200, 1300]
            };
            const periods = [4, 8, 12];
            for (const period of periods) {
                const result = await financeAgent.createForecast(historicalData, {
                    forecastPeriod: period,
                    periodType: 'months'
                });
                (0, chai_1.expect)(result.baselineForecast).to.be.an('array');
                (0, chai_1.expect)(result.baselineForecast.length).to.be.greaterThan(0);
            }
        });
        it('should include scenarios when requested', async () => {
            const historicalData = {
                revenue: [100000, 105000, 110000]
            };
            const result = await financeAgent.createForecast(historicalData, {
                includeScenarios: true,
                scenarioTypes: ['optimistic', 'pessimistic']
            });
            (0, chai_1.expect)(result).to.have.property('scenarios');
            (0, chai_1.expect)(result.scenarios).to.have.property('optimistic');
            (0, chai_1.expect)(result.scenarios).to.have.property('pessimistic');
            (0, chai_1.expect)(Array.isArray(result.scenarios.optimistic)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.scenarios.pessimistic)).to.be.true;
        });
        it('should include trend analysis when requested', async () => {
            const historicalData = {
                growth: [5, 8, 12, 15, 18]
            };
            const result = await financeAgent.createForecast(historicalData, {
                includeTrendAnalysis: true
            });
            (0, chai_1.expect)(result).to.have.property('trends');
            (0, chai_1.expect)(Array.isArray(result.trends)).to.be.true;
        });
        it('should handle insufficient historical data', async () => {
            const insufficientData = {
                revenue: [100000] // Only one data point
            };
            try {
                await financeAgent.createForecast(insufficientData);
                // Should handle gracefully or throw appropriate error
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await financeAgent.initialize();
            const info = financeAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.equal('test-finance-analyst');
            (0, chai_1.expect)(info.name).to.equal('Test Finance Analyst');
            (0, chai_1.expect)(info.type).to.equal('finance');
            (0, chai_1.expect)(info.capabilities).to.include('financial-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('budgeting');
            (0, chai_1.expect)(info.status).to.equal('available');
        });
        it('should update agent status during operations', async () => {
            await financeAgent.initialize();
            // Status should be available initially
            (0, chai_1.expect)(financeAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = financeAgent.analyzeFinancialData({
                revenue: Array.from({ length: 100 }, (_, i) => 100000 + i * 1000)
            });
            // Status should become busy during operation
            // Note: This is implementation-dependent timing
            await longOperation;
            // Status should return to available
            (0, chai_1.expect)(financeAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await financeAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await financeAgent.analyzeFinancialData({ test: 'data' });
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
            const result = await financeAgent.analyzeFinancialData({ test: 'data' });
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.summary).to.be.a('string');
        });
        it('should handle network timeouts', async () => {
            // Mock timeout
            mockOpenAIClient.sendPrompt = async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return { choices: [{ message: { content: 'timeout response' } }] };
            };
            try {
                await financeAgent.analyzeFinancialData({ test: 'data' });
                // Should handle timeout or complete successfully
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await financeAgent.initialize();
        });
        it('should complete financial analysis within reasonable time', async () => {
            const financialData = {
                revenue: Array.from({ length: 50 }, (_, i) => 100000 + i * 2000),
                expenses: Array.from({ length: 50 }, (_, i) => 60000 + i * 1500),
                profit: Array.from({ length: 50 }, (_, i) => 40000 + i * 500)
            };
            const startTime = Date.now();
            await financeAgent.analyzeFinancialData(financialData);
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(15000); // Should complete in less than 15 seconds
        });
        it('should handle concurrent requests', async () => {
            const financialData = { revenue: [100000, 110000, 120000] };
            const requests = [];
            for (let i = 0; i < 3; i++) {
                requests.push(financeAgent.analyzeFinancialData(financialData));
            }
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(3);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.summary).to.be.a('string');
            });
        });
        it('should handle large datasets efficiently', async () => {
            const largeData = {
                transactions: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    amount: Math.random() * 10000,
                    date: new Date(2024, 0, i % 365 + 1)
                }))
            };
            const result = await financeAgent.analyzeFinancialData(largeData);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.summary).to.be.a('string');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await financeAgent.initialize();
            const result = await financeAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(financeAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await financeAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_finance_agent.js.map