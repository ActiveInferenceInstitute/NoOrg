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
exports.DataAnalysisAgent = void 0;
const AbstractAgent_1 = require("./AbstractAgent"); // Import base class
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * DataAnalysisAgent specializes in analyzing datasets, extracting insights,
 * creating visualizations, and generating statistical reports.
 * Extends the AbstractAgent base class.
 */
class DataAnalysisAgent extends AbstractAgent_1.AbstractAgent {
    /**
     * Create a new DataAnalysisAgent
     * @param name Agent name
     * @param options Optional configuration including required services
     */
    constructor(name, options) {
        const defaultCapabilities = [
            'data-analysis',
            'data-visualization',
            'statistical-modeling',
            'pattern-recognition',
            'trend-analysis',
            'insight-generation',
            'reporting',
            'anomaly-detection',
            'correlation-analysis'
        ];
        const specialty = options.specialty || 'business';
        super({
            ...options,
            name,
            type: 'data-analysis', // Set agent type
            description: options.description || `Data analysis agent specializing in ${specialty} analytics`,
            capabilities: options.capabilities || defaultCapabilities,
            metadata: {
                specialty: specialty,
                analyticalLevel: 0.95,
                precisionLevel: 0.9,
                cacheTTL: options.cacheTTL || 86400000, // Default 24 hour cache
                ...(options.metadata || {})
            },
        });
        // Cache is specific to this agent type
        this.analysisCache = new Map();
        this.cacheTTL = options.cacheTTL || 86400000;
        this.specialty = specialty;
        // Initialization logic handled by base class
    }
    /**
     * Hook called during agent initialization.
     * Clears the analysis cache.
     */
    async onInitialize() {
        console.debug(`Initializing cache for ${this.name}...`);
        this.analysisCache.clear();
    }
    /**
     * Hook called during agent shutdown.
     * Cleans the cache.
     */
    async onShutdown() {
        console.debug(`Cleaning cache for ${this.name} during shutdown...`);
        this.cleanCache();
    }
    // --- Core Task Execution --- 
    /**
     * Executes a task based on provided details.
     * Routes tasks to specific methods like analyzeData, createVisualization, etc.
     * @param taskDetails - Object containing task details (e.g., { type: 'analyze', data: {...}, options: {...} })
     * @param context - Optional context (not currently used).
     * @returns A promise resolving with the task result or an error object.
     */
    async executeTask(taskDetails, context) {
        this.updateStatus('busy');
        try {
            let result = null;
            console.info(`Agent ${this.name} received task of type: ${taskDetails?.type}`);
            if (!taskDetails?.type) {
                throw new Error('Task details must include a "type" field.');
            }
            switch (taskDetails.type) {
                case 'analyze':
                case 'analyzeData':
                    if (!taskDetails.data)
                        throw new Error('Missing required field "data" for analyze task.');
                    result = await this.analyzeData(taskDetails.data, taskDetails.options);
                    break;
                case 'visualize':
                case 'createVisualization':
                    if (!taskDetails.data)
                        throw new Error('Missing required field "data" for visualize task.');
                    result = await this.createVisualization(taskDetails.data, taskDetails.options);
                    break;
                case 'report':
                case 'generateReport':
                    if (!taskDetails.data)
                        throw new Error('Missing required field "data" for report task.');
                    result = await this.generateReport(taskDetails.data, taskDetails.options);
                    break;
                case 'clearCache':
                    this.analysisCache.clear();
                    result = { success: true, message: "Cache cleared." };
                    break;
                default:
                    throw new Error(`Unsupported task type for DataAnalysisAgent: ${taskDetails.type}`);
            }
            this.updateStatus('available');
            return result; // Return successful result
        }
        catch (error) {
            console.error(`Agent ${this.name} failed to execute task type "${taskDetails?.type}": ${error.message}`, error.stack);
            this.updateStatus('error');
            return { success: false, error: error.message }; // Return error object
        }
    }
    // --- Specific Agent Capabilities --- 
    /**
     * Analyze dataset and extract insights.
     * @param data Dataset to analyze (expected format: array of objects or similar structure).
     * @param options Analysis options.
     * @returns A promise resolving with the analysis results.
     */
    async analyzeData(data, options) {
        const startTime = Date.now();
        const analysisType = options?.analysisType || 'exploratory';
        // Generate cache key - using a hash of the data + options to avoid long keys and ensure specificity
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const optionsString = JSON.stringify(options || {});
        const cacheKeyMaterial = `${dataString}-${optionsString}`;
        // Basic hash function (replace with crypto if available and needed for robustness)
        let hash = 0;
        for (let i = 0; i < cacheKeyMaterial.length; i++) {
            const char = cacheKeyMaterial.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        const cacheKey = `analysis-${hash.toString(16)}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                this.cleanCache(); // Clean expired items
                const cachedResult = this.analysisCache.get(cacheKey);
                if (cachedResult) {
                    console.debug(`Cache hit for data analysis: ${cacheKey}`);
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
                console.debug(`Cache miss for data analysis: ${cacheKey}`);
            }
            // Prepare data analysis prompt
            const dataPreview = typeof data === 'string' ? data.substring(0, 2000) : JSON.stringify(data, null, 2).substring(0, 2000); // Preview large data
            // --- Build prompt string using an array for clarity --- 
            let promptLines = [
                `As a ${this.specialty} Data Analyst, perform a ${analysisType} analysis on the following dataset preview:`,
                ``,
                `DATA PREVIEW (first ~2000 chars):`,
                '```json', // Use simple strings for code block fences
                dataPreview,
                '```',
                `(Assume the full dataset follows this structure)`,
                ``,
            ];
            // Add optional focus areas
            if (options?.focusAreas && options.focusAreas.length > 0) {
                promptLines.push(`FOCUS AREAS: ${options.focusAreas.join(', ')}`);
            }
            else {
                promptLines.push('Analyze the most important aspects of this dataset.');
            }
            // Add other optional instructions
            if (options?.includeVisualizationSuggestions)
                promptLines.push('Include suggestions for effective visualizations.');
            if (options?.includeStatisticalTests)
                promptLines.push('Include relevant statistical tests and their interpretations.');
            if (options?.includeTrends)
                promptLines.push('Identify and describe significant trends in the data.');
            if (options?.includeCorrelations)
                promptLines.push('Analyze correlations between variables.');
            if (options?.includeOutliers)
                promptLines.push('Identify and analyze outliers in the data.');
            if (options?.includeRecommendations)
                promptLines.push('Provide actionable recommendations based on the analysis.');
            // Add analysis requirements section header
            promptLines.push(``);
            promptLines.push(`Provide a comprehensive analysis including:`);
            // Build the numbered list dynamically
            let itemNumber = 1;
            promptLines.push(`${itemNumber++}. A concise summary of the dataset structure and key variables.`);
            promptLines.push(`${itemNumber++}. Key insights discovered (3-5 bullet points).`);
            promptLines.push(`${itemNumber++}. Important summary statistics (mean, median, std dev, counts, etc. as relevant).`);
            if (options?.includeVisualizationSuggestions)
                promptLines.push(`${itemNumber++}. Suggestions for effective visualizations (type, variables, purpose).`);
            if (options?.includeStatisticalTests)
                promptLines.push(`${itemNumber++}. Results and interpretations of relevant statistical tests (e.g., t-test, ANOVA, chi-square).`);
            if (options?.includeTrends)
                promptLines.push(`${itemNumber++}. Identified trends and their significance.`);
            if (options?.includeCorrelations)
                promptLines.push(`${itemNumber++}. Analysis of significant correlations (variables, coefficient, strength, direction).`);
            if (options?.includeOutliers)
                promptLines.push(`${itemNumber++}. Identification and analysis of notable outliers.`);
            if (options?.includeRecommendations)
                promptLines.push(`${itemNumber++}. Actionable recommendations based on the findings.`);
            // Add final formatting instruction
            promptLines.push(``);
            promptLines.push(`Format the output clearly. If providing JSON snippets for specific sections like statistics or visualizations, ensure they are valid JSON.`);
            // Join the lines into the final prompt string
            const prompt = promptLines.join('\n'); // Use newline character
            // --- End prompt construction ---
            // Execute data analysis (call OpenAI)
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini', // Use model from base class
                temperature: 0.1, // Low temperature for accurate analysis
                max_tokens: 3500 // Allow for detailed analysis
            });
            const analysisText = response.content?.trim() || "";
            // --- Attempt to extract structured information --- 
            // This is heuristic. A more robust approach might involve function calling or more specific prompts.
            let extractedResult = {
                summary: "Could not extract summary.",
                keyInsights: [],
                statistics: {},
            };
            // Basic Regex/String parsing (could be improved with dedicated parsing logic or LLM function calling)
            try {
                extractedResult.summary = analysisText.match(/1\.\s*Summary:\s*([\s\S]*?)(?:[\n\n]2\.|\n## |$)/im)?.[1]?.trim() ||
                    analysisText.match(/Summary:\s*([\s\S]*?)(?:[\n\n]Key Insights:|\n## |$)/im)?.[1]?.trim() ||
                    "Summary not extracted.";
                const insightsMatch = analysisText.match(/(?:2\.|Key Insights:)\s*([\s\S]*?)(?:[\n\n]3\.|\n## |$)/im);
                if (insightsMatch) {
                    extractedResult.keyInsights = insightsMatch[1].split(/[\n\s]*[-*•]\s+/).map(s => s.trim()).filter(Boolean);
                }
                // Add more extraction logic for statistics, visualizations, etc. as needed, potentially using JSON parsing if model provides it.
                // Placeholder for now:
                extractedResult.statistics = { note: "Statistics extraction not fully implemented." };
                if (options?.includeVisualizationSuggestions)
                    extractedResult.visualizationSuggestions = [{ type: "placeholder", description: "Viz extraction not implemented.", variables: [], purpose: "" }];
                // ... etc for other sections ...
                // As a fallback, put the whole text in the summary if extraction fails badly
                if (extractedResult.summary === "Summary not extracted." && !extractedResult.keyInsights.length) {
                    extractedResult.summary = analysisText;
                }
            }
            catch (parseError) {
                console.warn(`Could not fully parse structured analysis results: ${parseError.message}`);
                // Fallback: return the raw text in the summary
                if (extractedResult.summary === "Summary not extracted." && !extractedResult.keyInsights.length) {
                    extractedResult.summary = analysisText;
                }
            }
            // --- End Extraction --- 
            const processingTime = Date.now() - startTime;
            const finalResult = {
                ...extractedResult,
                processingTime,
                cached: false
            };
            // Cache the result
            this.analysisCache.set(cacheKey, {
                query: cacheKey, // Store the key itself as query identifier
                result: finalResult,
                timestamp: Date.now(),
                expiry: Date.now() + this.cacheTTL
            });
            return finalResult;
        }
        catch (error) {
            console.error(`Error during data analysis for agent ${this.name}: ${error.message}`);
            throw error; // Rethrow for executeTask to handle
        }
    }
    /**
     * Suggests and optionally generates configuration/code for data visualizations.
     * @param data Dataset (can be the raw data or analysis results).
     * @param options Visualization options.
     * @returns A promise resolving with visualization details.
     */
    async createVisualization(data, options) {
        const startTime = Date.now();
        const vizType = options?.visualizationType || 'auto';
        // Cache key generation (similar to analyzeData)
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const optionsString = JSON.stringify(options || {});
        const cacheKeyMaterial = `${dataString}-${optionsString}`;
        let hash = 0;
        for (let i = 0; i < cacheKeyMaterial.length; i++) {
            const char = cacheKeyMaterial.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        const cacheKey = `viz-${hash.toString(16)}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                this.cleanCache();
                const cachedResult = this.analysisCache.get(cacheKey);
                if (cachedResult) {
                    console.debug(`Cache hit for visualization: ${cacheKey}`);
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
                console.debug(`Cache miss for visualization: ${cacheKey}`);
            }
            const dataPreview = typeof data === 'string' ? data.substring(0, 1500) : JSON.stringify(data, null, 2).substring(0, 1500);
            const framework = options?.framework || 'plotly'; // Default to plotly for rich JSON configs
            let prompt = `
                As a Data Visualization expert:
                Dataset Preview:
                \`\`\`json
                ${dataPreview}
                \`\`\`

                Task: Design a ${vizType === 'auto' ? 'suitable' : vizType} visualization.
                ${options?.variables ? `Focus on variables: ${options.variables.join(', ')}.` : 'Identify key variables to visualize.'}
                ${options?.purpose ? `Purpose: ${options.purpose}.` : 'Purpose: Explore data patterns.'}
                ${options?.title ? `Suggested Title: ${options.title}` : 'Suggest a clear title.'}
                Framework: ${framework}
                ${options?.includeCode ? `Include a code snippet to generate this visualization using ${framework}.` : 'Provide the configuration/parameters needed.'}

                Output a JSON object containing:
                - "visualizationType": (string) The type of visualization chosen (e.g., 'bar', 'line').
                - "title": (string) A suitable title for the plot.
                - "variables": (string[]) The main variables used.
                - "config": (object) A configuration object suitable for ${framework} (e.g., layout, traces for Plotly; options for Chart.js). This should contain the core parameters to generate the plot.
                - "description": (string) A brief description of the visualization.
                - "insights": (string[]) Key insights revealed by this visualization (2-3 bullet points).
                ${options?.includeCode ? '- "code": (string) Code snippet in ${framework}. Ensure it is executable assuming data is in a suitable structure (e.g., pandas DataFrame for Python, array of objects for JS).' : ''}

                Ensure the output is a single, valid JSON object.
            `;
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini',
                temperature: 0.2,
                max_tokens: 2000,
            });
            let vizResult;
            try {
                vizResult = JSON.parse(response.content?.trim() || "{}");
            }
            catch (e) {
                console.error("Failed to parse JSON response for visualization.", e);
                console.log("Raw response:", response.content);
                // Attempt to generate a fallback error structure
                throw new Error("Failed to generate valid JSON configuration for the visualization.");
            }
            const processingTime = Date.now() - startTime;
            const finalResult = {
                ...vizResult,
                processingTime,
                cached: false
            };
            // Cache the result
            this.analysisCache.set(cacheKey, {
                query: cacheKey,
                result: finalResult,
                timestamp: Date.now(),
                expiry: Date.now() + this.cacheTTL
            });
            return finalResult;
        }
        catch (error) {
            console.error(`Error during visualization creation for agent ${this.name}: ${error.message}`);
            throw error; // Rethrow
        }
    }
    /**
     * Generates a formatted report based on data analysis.
     * @param data Raw data or prior analysis results.
     * @param options Report generation options.
     * @returns A promise resolving with the report structure.
     */
    async generateReport(data, options) {
        const startTime = Date.now();
        const reportType = options?.reportType || 'comprehensive';
        const audience = options?.audience || 'stakeholders';
        // Cache key generation
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const optionsString = JSON.stringify(options || {});
        const cacheKeyMaterial = `${dataString}-${optionsString}`;
        let hash = 0;
        for (let i = 0; i < cacheKeyMaterial.length; i++) {
            const char = cacheKeyMaterial.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        const cacheKey = `report-${hash.toString(16)}`;
        try {
            // Check cache if enabled
            if (options?.checkCache !== false) {
                this.cleanCache();
                const cachedResult = this.analysisCache.get(cacheKey);
                if (cachedResult) {
                    console.debug(`Cache hit for report generation: ${cacheKey}`);
                    return {
                        ...cachedResult.result,
                        processingTime: Date.now() - startTime,
                        cached: true
                    };
                }
                console.debug(`Cache miss for report generation: ${cacheKey}`);
            }
            const dataPreview = typeof data === 'string' ? data.substring(0, 1500) : JSON.stringify(data, null, 2).substring(0, 1500);
            // Determine required sections based on options
            const defaultSections = ['Introduction', 'Key Findings', 'Analysis Details'];
            if (options?.includeRecommendations !== false)
                defaultSections.push('Recommendations');
            if (options?.includeMethodology)
                defaultSections.push('Methodology');
            if (reportType === 'executive')
                defaultSections.splice(1, defaultSections.length - 1, 'Key Findings and Recommendations'); // Simplify for exec
            const targetSections = options?.sections || defaultSections;
            let prompt = `
                As a ${this.specialty} Data Analyst, generate a ${reportType} report for a ${audience} audience based on the data/analysis provided.
                
                DATA/ANALYSIS PREVIEW:
                \`\`\`json
                ${dataPreview}
                \`\`\`
                (This might be raw data or results from a previous analysis step)

                REPORT REQUIREMENTS:
                - Generate a suitable overall report title.
                ${options?.includeExecutiveSummary || reportType === 'executive' ? '- Include a concise Executive Summary (1-2 paragraphs).' : ''}
                - Structure the report with the following sections: ${targetSections.join(', ')}.
                - For each section, provide detailed and relevant content suitable for the ${audience}.
                - Extract key findings (3-5 bullet points).
                ${options?.includeRecommendations !== false ? '- Provide clear, actionable recommendations.' : ''}
                ${options?.includeMethodology ? '- Briefly describe the methodology used (if applicable based on input).' : ''}
                ${options?.includeVisualizations ? '- Describe or reference key visualizations that support the findings (assume they can be generated separately or are part of the input data).' : ''}
                - Suggest potential next steps.

                Output the report as a well-structured JSON object with keys: "title", "executiveSummary" (optional), "sections" (array of {title, content, visualizations?: [...]}), "methodology" (optional), "keyFindings" (array of strings), "recommendations" (optional array of strings), "nextSteps" (optional array of strings).
                Ensure the JSON is valid.
            `;
            const response = await this.openAIClient.sendPrompt(prompt, {
                model: this.preferredModel || 'o3-mini',
                temperature: 0.3,
                max_tokens: 3800,
            });
            let reportResult;
            try {
                reportResult = JSON.parse(response.content?.trim() || "{}");
            }
            catch (e) {
                console.error("Failed to parse JSON response for report generation.", e);
                console.log("Raw response:", response.content);
                throw new Error("Failed to generate valid JSON report structure.");
            }
            const processingTime = Date.now() - startTime;
            const finalResult = {
                ...reportResult,
                processingTime,
                cached: false
            };
            // Cache the result
            this.analysisCache.set(cacheKey, {
                query: cacheKey,
                result: finalResult,
                timestamp: Date.now(),
                expiry: Date.now() + this.cacheTTL
            });
            return finalResult;
        }
        catch (error) {
            console.error(`Error during report generation for agent ${this.name}: ${error.message}`);
            throw error; // Rethrow
        }
    }
    /**
     * Cleans expired items from the analysis cache.
     */
    cleanCache() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, value] of this.analysisCache.entries()) {
            if (now > value.expiry) {
                this.analysisCache.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.debug(`Cleaned ${cleanedCount} expired items from ${this.name} cache.`);
        }
    }
}
exports.DataAnalysisAgent = DataAnalysisAgent;
//# sourceMappingURL=DataAnalysisAgent.js.map