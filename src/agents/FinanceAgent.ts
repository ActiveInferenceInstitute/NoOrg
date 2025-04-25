import { Agent } from './types';
import { OpenAIClient } from '../core/multiagent/OpenAIClient';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * FinanceAgent specializes in financial analysis, reporting, budgeting,
 * forecasting, and other finance-related tasks.
 */
export class FinanceAgent {
  private agent: Agent;
  private openAIClient: OpenAIClient;
  private sharedState: SharedStateManager;
  private isInitialized: boolean = false;
  private financeCache: Map<string, {
    query: string;
    result: any;
    timestamp: number;
    expiry: number;
  }> = new Map();
  
  /**
   * Create a new FinanceAgent
   * @param name Agent name
   * @param options Optional configuration
   */
  constructor(name: string, options?: {
    openAIClient?: OpenAIClient;
    sharedState?: SharedStateManager;
    preferredModel?: string;
    description?: string;
    cacheTTL?: number; // Cache time-to-live in ms (default 24 hours)
    specialty?: 'financial-analysis' | 'budgeting' | 'forecasting' | 'investment' | 'accounting';
  }) {
    const timestamp = Date.now();
    const specialty = options?.specialty || 'financial-analysis';
    this.agent = {
      id: uuidv4(),
      name,
      type: 'finance',
      description: options?.description || `Finance agent specializing in ${specialty}`,
      capabilities: [
        'financial-analysis',
        'reporting',
        'budgeting',
        'forecasting',
        'investment-analysis',
        'data-analysis',
        'risk-assessment'
      ],
      status: 'offline',
      metadata: {
        specialty: specialty,
        analyticalLevel: 0.9,
        precisionLevel: 0.95,
        cacheTTL: options?.cacheTTL || 86400000 // Default 24 hour cache
      },
      preferredModel: options?.preferredModel || 'o3-mini',
      lastActive: timestamp,
      createdAt: timestamp
    };
    
    this.openAIClient = options?.openAIClient || new OpenAIClient();
    this.sharedState = options?.sharedState || SharedStateManager.getInstance();
  }
  
  /**
   * Initialize the agent
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Register agent state in shared state
      this.sharedState.setState(`agents.${this.agent.id}`, {
        id: this.agent.id,
        name: this.agent.name,
        type: this.agent.type,
        capabilities: this.agent.capabilities,
        status: 'initializing',
        lastActive: Date.now()
      });
      
      // Initialize finance cache
      this.financeCache.clear();
      
      // Mark agent as available
      this.agent.status = 'available';
      this.sharedState.setState(`agents.${this.agent.id}.status`, 'available');
      
      this.isInitialized = true;
      return true;
    } catch (error: any) {
      console.error(`Failed to initialize ${this.agent.name}: ${error.message}`);
      this.agent.status = 'error';
      this.sharedState.setState(`agents.${this.agent.id}.status`, 'error');
      return false;
    }
  }
  
  /**
   * Get the agent's information
   */
  getAgentInfo(): Agent {
    return { ...this.agent };
  }
  
  /**
   * Update the agent's status
   * @param status New status
   */
  updateStatus(status: Agent['status']): boolean {
    this.agent.status = status;
    this.agent.lastActive = Date.now();
    this.sharedState.setState(`agents.${this.agent.id}.status`, status);
    this.sharedState.setState(`agents.${this.agent.id}.lastActive`, this.agent.lastActive);
    return true;
  }
  
  /**
   * Analyze financial data
   * @param financialData Financial data to analyze
   * @param options Analysis options
   */
  async analyzeFinancialData(financialData: any, options?: {
    analysisType?: 'basic' | 'detailed' | 'comprehensive';
    focusAreas?: ('profitability' | 'liquidity' | 'solvency' | 'efficiency' | 'growth')[];
    timeframe?: 'quarter' | 'year' | 'multi-year';
    includeBenchmarks?: boolean;
    includeRecommendations?: boolean;
    checkCache?: boolean;
  }): Promise<{
    summary: string;
    keyMetrics: Record<string, number | string>;
    analysis: Record<string, string>;
    trends?: Array<{
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      significance: string;
    }>;
    ratios?: Record<string, number>;
    recommendations?: string[];
    benchmarks?: Record<string, any>;
    visualizationSuggestions?: string[];
    processingTime: number;
    cached?: boolean;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const analysisType = options?.analysisType || 'detailed';
    const focusAreas = options?.focusAreas || ['profitability', 'liquidity', 'efficiency'];
    
    // Generate cache key - using a hash of the financial data to avoid too long keys
    const dataHash = JSON.stringify(financialData).split('').reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
    }, 0).toString(16);
    const cacheKey = `financial-analysis-${dataHash}-${analysisType}-${focusAreas.join(',')}`;
    
    try {
      // Check cache if enabled
      if (options?.checkCache !== false) {
        const cachedResult = this.financeCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 86400000)) {
          // Return cached result if still valid
          this.updateStatus('available');
          return {
            ...cachedResult.result,
            processingTime: Date.now() - startTime,
            cached: true
          };
        }
      }
      
      // Prepare financial analysis prompt
      let prompt = `
        As a financial analyst, perform a ${analysisType} analysis of the following financial data:
        
        FINANCIAL DATA:
        ${JSON.stringify(financialData, null, 2)}
        
        FOCUS AREAS: ${focusAreas.join(', ')}
        TIMEFRAME: ${options?.timeframe || 'year'}
        ${options?.includeBenchmarks ? 'Please include industry benchmarks in your analysis.' : ''}
        ${options?.includeRecommendations ? 'Please include actionable recommendations based on the analysis.' : ''}
        
        Provide a structured analysis that includes:
        1. A summary of the financial situation
        2. Key financial metrics and their values
        3. Detailed analysis of each focus area
        4. Significant trends and their implications
        5. Key financial ratios and their interpretation
        ${options?.includeRecommendations ? '6. Strategic recommendations based on the analysis' : ''}
        ${options?.includeBenchmarks ? '7. Comparison to industry benchmarks' : ''}
        8. Suggestions for helpful visualizations based on this data
      `;
      
      // Execute financial analysis (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.1, // Low temperature for accurate financial analysis
        max_tokens: 3000
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this financial analysis in JSON format:
        
        ANALYSIS: ${response.content}
        
        Extract into the following structure:
        {
          "summary": "Overall summary of the financial situation",
          "keyMetrics": {
            "metric1": value1,
            "metric2": value2
          },
          "analysis": {
            "profitability": "Analysis of profitability",
            "liquidity": "Analysis of liquidity",
            "efficiency": "Analysis of efficiency"
            // Include other focus areas as needed
          },
          "trends": [
            {
              "metric": "Metric name",
              "trend": "increasing|decreasing|stable",
              "significance": "Explanation of significance"
            }
          ],
          "ratios": {
            "ratio1": value1,
            "ratio2": value2
          }
          ${options?.includeRecommendations ? `,
          "recommendations": [
            "Recommendation 1",
            "Recommendation 2"
          ]` : ''}
          ${options?.includeBenchmarks ? `,
          "benchmarks": {
            "metric1": {
              "company": value,
              "industry": value
            }
          }` : ''}
          ,
          "visualizationSuggestions": [
            "Suggestion 1",
            "Suggestion 2"
          ]
        }
      `;
      
      const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
        model: this.agent.preferredModel,
        temperature: 0.1,
        max_tokens: 2000
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
      // Cache the result
      this.financeCache.set(cacheKey, {
        query: 'financial-analysis',
        result,
        timestamp: Date.now(),
        expiry: this.agent.metadata?.cacheTTL || 86400000
      });
      
      // Clean up old cache entries
      this.cleanCache();
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...result,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error analyzing financial data: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Create a budget plan
   * @param budgetParameters Budget parameters
   * @param options Budget creation options
   */
  async createBudget(budgetParameters: {
    totalAmount: number;
    currency?: string;
    period: 'monthly' | 'quarterly' | 'annual';
    categories?: {name: string; allocation?: number}[];
    historicalData?: any;
  }, options?: {
    level?: 'simple' | 'detailed' | 'comprehensive';
    includeContingency?: boolean;
    includeVisualizations?: boolean;
    includeForecast?: boolean;
    checkCache?: boolean;
  }): Promise<{
    summary: string;
    totalBudget: number;
    currency: string;
    period: string;
    categories: Array<{
      name: string;
      allocation: number;
      percentage: number;
      subcategories?: Array<{
        name: string;
        allocation: number;
        percentage: number;
      }>;
    }>;
    contingency?: number;
    notes?: string[];
    visualizations?: Array<{
      type: string;
      description: string;
      data: any;
    }>;
    forecast?: Array<{
      period: string;
      projectedAmount: number;
      notes?: string;
    }>;
    processingTime: number;
    cached?: boolean;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const level = options?.level || 'detailed';
    const currency = budgetParameters.currency || 'USD';
    
    // Generate cache key
    const cacheKey = `budget-${budgetParameters.totalAmount}-${currency}-${budgetParameters.period}-${level}`;
    
    try {
      // Check cache if enabled
      if (options?.checkCache !== false) {
        const cachedResult = this.financeCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 86400000)) {
          // Return cached result if still valid
          this.updateStatus('available');
          return {
            ...cachedResult.result,
            processingTime: Date.now() - startTime,
            cached: true
          };
        }
      }
      
      // Prepare budget creation prompt
      let prompt = `
        As a financial planner, create a ${level} ${budgetParameters.period} budget with the following parameters:
        
        TOTAL BUDGET: ${budgetParameters.totalAmount} ${currency}
        PERIOD: ${budgetParameters.period}
        ${budgetParameters.categories ? `REQUESTED CATEGORIES: ${JSON.stringify(budgetParameters.categories)}` : 'Please suggest appropriate budget categories.'}
        ${budgetParameters.historicalData ? `HISTORICAL DATA: ${JSON.stringify(budgetParameters.historicalData)}` : ''}
        ${options?.includeContingency ? 'Please include a contingency allocation in the budget.' : ''}
        ${options?.includeVisualizations ? 'Please suggest visualizations for this budget.' : ''}
        ${options?.includeForecast ? 'Please include a forecast for future periods.' : ''}
        
        The budget should include:
        1. A summary of the budget
        2. Total budget amount
        3. Detailed breakdown of budget categories and allocations
        4. Percentage allocation for each category
        ${level === 'detailed' || level === 'comprehensive' ? '5. Subcategories for each major category' : ''}
        ${options?.includeContingency ? '6. Contingency allocation' : ''}
        7. Helpful notes or guidelines for budget management
        ${options?.includeVisualizations ? '8. Visualization recommendations for the budget' : ''}
        ${options?.includeForecast ? '9. Budget forecast for future periods' : ''}
      `;
      
      // Execute budget creation (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.3,
        max_tokens: 2500
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this budget plan in JSON format:
        
        BUDGET PLAN: ${response.content}
        
        Extract into the following structure:
        {
          "summary": "Budget summary",
          "totalBudget": total budget amount,
          "currency": "${currency}",
          "period": "${budgetParameters.period}",
          "categories": [
            {
              "name": "Category name",
              "allocation": allocation amount,
              "percentage": percentage of total budget,
              ${level === 'detailed' || level === 'comprehensive' ? `
              "subcategories": [
                {
                  "name": "Subcategory name",
                  "allocation": allocation amount,
                  "percentage": percentage of category
                }
              ],` : ''}
            }
          ],
          ${options?.includeContingency ? `"contingency": contingency amount,` : ''}
          "notes": [
            "Budget note 1",
            "Budget note 2"
          ]
          ${options?.includeVisualizations ? `,
          "visualizations": [
            {
              "type": "chart type",
              "description": "What this visualization shows",
              "data": {
                // Simplified representation of the data for this visualization
              }
            }
          ]` : ''}
          ${options?.includeForecast ? `,
          "forecast": [
            {
              "period": "Future period",
              "projectedAmount": projected amount,
              "notes": "Forecast notes"
            }
          ]` : ''}
        }
      `;
      
      const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
        model: this.agent.preferredModel,
        temperature: 0.1,
        max_tokens: 2000
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
      // Cache the result
      this.financeCache.set(cacheKey, {
        query: 'budget-creation',
        result,
        timestamp: Date.now(),
        expiry: this.agent.metadata?.cacheTTL || 86400000
      });
      
      // Clean up old cache entries
      this.cleanCache();
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...result,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error creating budget: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Create a financial forecast
   * @param historicalData Historical financial data
   * @param options Forecast options
   */
  async createForecast(historicalData: any, options?: {
    forecastPeriod?: number;
    periodType?: 'months' | 'quarters' | 'years';
    includeScenarios?: boolean;
    scenarioTypes?: ('optimistic' | 'pessimistic' | 'most-likely')[];
    includeTrendAnalysis?: boolean;
    includeAssumptions?: boolean;
    checkCache?: boolean;
  }): Promise<{
    summary: string;
    baselineForecast: Array<{
      period: string;
      metrics: Record<string, number>;
    }>;
    scenarios?: Record<string, Array<{
      period: string;
      metrics: Record<string, number>;
      assumptions?: string[];
    }>>;
    trends?: Array<{
      metric: string;
      description: string;
      impact: string;
    }>;
    assumptions?: string[];
    risks?: Array<{
      description: string;
      impact: 'low' | 'medium' | 'high';
      mitigationStrategy?: string;
    }>;
    forecastMethodology?: string;
    visualizationSuggestions?: string[];
    processingTime: number;
    cached?: boolean;
  }> {
    // Update agent status
    this.updateStatus('busy');
    
    const startTime = Date.now();
    const forecastPeriod = options?.forecastPeriod || 4;
    const periodType = options?.periodType || 'quarters';
    
    // Generate cache key - using a hash of the historical data to avoid too long keys
    const dataHash = JSON.stringify(historicalData).split('').reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
    }, 0).toString(16);
    const cacheKey = `forecast-${dataHash}-${forecastPeriod}-${periodType}`;
    
    try {
      // Check cache if enabled
      if (options?.checkCache !== false) {
        const cachedResult = this.financeCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < (this.agent.metadata?.cacheTTL || 86400000)) {
          // Return cached result if still valid
          this.updateStatus('available');
          return {
            ...cachedResult.result,
            processingTime: Date.now() - startTime,
            cached: true
          };
        }
      }
      
      // Prepare forecast creation prompt
      let prompt = `
        As a financial forecaster, create a ${forecastPeriod}-${periodType} financial forecast based on the following historical data:
        
        HISTORICAL DATA:
        ${JSON.stringify(historicalData, null, 2)}
        
        FORECAST PERIOD: ${forecastPeriod} ${periodType}
        ${options?.includeScenarios ? `SCENARIOS: ${options.scenarioTypes?.join(', ') || 'optimistic, pessimistic, most-likely'}` : ''}
        ${options?.includeTrendAnalysis ? 'Include trend analysis in the forecast.' : ''}
        ${options?.includeAssumptions ? 'Include key assumptions in the forecast.' : ''}
        
        The forecast should include:
        1. A summary of the forecast
        2. Baseline forecast for each period
        ${options?.includeScenarios ? '3. Alternative scenarios (optimistic, pessimistic, etc.)' : ''}
        ${options?.includeTrendAnalysis ? '4. Analysis of key trends affecting the forecast' : ''}
        ${options?.includeAssumptions ? '5. Key assumptions underlying the forecast' : ''}
        6. Potential risks and their impact
        7. Brief explanation of the forecasting methodology
        8. Suggestions for visualizations to represent the forecast data
      `;
      
      // Execute forecast creation (call OpenAI)
      const response = await this.openAIClient.sendPrompt(prompt, {
        model: this.agent.preferredModel,
        temperature: 0.2,
        max_tokens: 3000
      });
      
      // Extract structured information from the response
      const extractionPrompt = `
        Extract the following information from this financial forecast in JSON format:
        
        FORECAST: ${response.content}
        
        Extract into the following structure:
        {
          "summary": "Forecast summary",
          "baselineForecast": [
            {
              "period": "Period label",
              "metrics": {
                "revenue": value,
                "expenses": value,
                "profit": value
                // Include other metrics as applicable
              }
            }
          ],
          ${options?.includeScenarios ? `
          "scenarios": {
            "optimistic": [
              {
                "period": "Period label",
                "metrics": {
                  "revenue": value,
                  "expenses": value,
                  "profit": value
                },
                "assumptions": ["Assumption 1", "Assumption 2"]
              }
            ],
            "pessimistic": [
              {
                "period": "Period label",
                "metrics": {
                  "revenue": value,
                  "expenses": value,
                  "profit": value
                },
                "assumptions": ["Assumption 1", "Assumption 2"]
              }
            ]
          },` : ''}
          ${options?.includeTrendAnalysis ? `
          "trends": [
            {
              "metric": "Metric name",
              "description": "Trend description",
              "impact": "Impact on forecast"
            }
          ],` : ''}
          ${options?.includeAssumptions ? `
          "assumptions": [
            "Assumption 1",
            "Assumption 2"
          ],` : ''}
          "risks": [
            {
              "description": "Risk description",
              "impact": "low|medium|high",
              "mitigationStrategy": "How to mitigate this risk"
            }
          ],
          "forecastMethodology": "Description of methodology used",
          "visualizationSuggestions": [
            "Suggestion 1",
            "Suggestion 2"
          ]
        }
      `;
      
      const extractionResponse = await this.openAIClient.sendPrompt(extractionPrompt, {
        model: this.agent.preferredModel,
        temperature: 0.1,
        max_tokens: 2500
      });
      
      // Parse the structured result
      const result = JSON.parse(extractionResponse.content);
      
      // Cache the result
      this.financeCache.set(cacheKey, {
        query: 'financial-forecast',
        result,
        timestamp: Date.now(),
        expiry: this.agent.metadata?.cacheTTL || 86400000
      });
      
      // Clean up old cache entries
      this.cleanCache();
      
      // Update agent status
      this.updateStatus('available');
      
      return {
        ...result,
        processingTime: Date.now() - startTime
      };
    } catch (error: any) {
      console.error(`Error creating financial forecast: ${error.message}`);
      this.updateStatus('error');
      throw error;
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const cacheTTL = this.agent.metadata?.cacheTTL || 86400000;
    
    for (const [key, value] of this.financeCache.entries()) {
      if (now - value.timestamp > cacheTTL) {
        this.financeCache.delete(key);
      }
    }
  }
  
  /**
   * Shutdown the agent
   */
  async shutdown(): Promise<boolean> {
    try {
      this.updateStatus('offline');
      this.isInitialized = false;
      this.financeCache.clear();
      return true;
    } catch (error) {
      console.error(`Error shutting down ${this.agent.name}:`, error);
      return false;
    }
  }
} 