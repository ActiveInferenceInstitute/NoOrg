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
exports.DataGenerationManager = void 0;
const crypto = __importStar(require("crypto"));
const OpenAIClient_1 = require("../core/multiagent/OpenAIClient");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * DataGenerationManager provides dynamic, context-aware data generation
 * capabilities for workflows, replacing hardcoded content with LLM-generated
 * data appropriate for the current project context.
 */
class DataGenerationManager {
    /**
     * Create a new DataGenerationManager
     *
     * @param apiKey OpenAI API key for LLM-based generation
     * @param context Application context (domain, objective, etc.)
     * @param outputDir Directory to store outputs and cache
     */
    constructor(apiKey, context, outputDir) {
        this.cacheEnabled = true;
        this.llm = new OpenAIClient_1.OpenAIClient(apiKey);
        this.context = context;
        this.outputDir = outputDir;
        this.cacheDir = path.join(outputDir, 'cache', 'data-generation');
        // Ensure cache directory exists
        if (this.cacheEnabled) {
            fs.ensureDirSync(this.cacheDir);
        }
    }
    /**
     * Generate locations data appropriate for the current project context
     *
     * @param count Number of locations to generate
     * @param options Optional configuration for generation
     * @returns Array of location objects
     */
    async generateLocations(count, options = {}) {
        const cacheKey = `locations-${count}-${options.coverage || 'medium'}-${JSON.stringify(this.context.DOMAIN)}`;
        const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
        // Check cache if enabled
        if (this.cacheEnabled && options.useCache !== false && fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                return cached;
            }
            catch (err) {
                console.warn('Failed to read from cache, will generate fresh data');
            }
        }
        // If we're dealing with a very specific domain that doesn't need locations
        // like nanorobotics or similar, we'll generate synthetic data instead of using LLM
        if (this.isNonGeographicDomain()) {
            return this.generateSyntheticLocations(count, options);
        }
        // Use LLM to generate domain-appropriate locations
        try {
            const prompt = `Generate ${count} sample locations relevant to a ${this.context.DOMAIN} project with the objective: "${this.context.OBJECTIVE}".

Each location should include:
- A unique ID (format: "loc-N" where N is the number)
- A realistic name based on the type of location
- Realistic latitude and longitude coordinates
- A type classification relevant to this domain
- A priority rating from 1-10
- If applicable, a recommended sensor type

Format as JSON array. Example:
[
  {
    "id": "loc-1",
    "name": "Research Lab 1",
    "lat": 42.3601,
    "lng": -71.0589,
    "type": "Laboratory",
    "priority": 8,
    "recommended_sensor": "high-precision-scanner"
  }
]`;
            // We'll use sendPrompt or createCompletion depending on what's available
            // @ts-ignore - Dynamic method call
            const sendPromptMethod = typeof this.llm.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
            // @ts-ignore - Dynamic method call
            const response = await this.llm[sendPromptMethod](prompt, {
                temperature: 0.7,
                systemPrompt: `You are a data generation expert that creates realistic, domain-appropriate sample data.`
            });
            const responseContent = typeof response === 'string' ? response : response.choices[0].message.content;
            // Parse the JSON from the response
            let jsonStr = responseContent;
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
            }
            else if (jsonStr.includes('```')) {
                jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
            }
            // Clean up any markdown formatting
            if (jsonStr.includes('`')) {
                jsonStr = jsonStr.replace(/`/g, '');
            }
            const locations = JSON.parse(jsonStr);
            // Cache the result if caching is enabled
            if (this.cacheEnabled) {
                fs.writeFileSync(cacheFile, JSON.stringify(locations, null, 2));
            }
            return locations;
        }
        catch (error) {
            console.error('Error generating locations with LLM:', error);
            // Fall back to synthetic locations if LLM fails
            return this.generateSyntheticLocations(count, options);
        }
    }
    /**
     * Generate sensor readings data based on the project domain
     *
     * @param locationName Location name to generate readings for
     * @param timestamp Timestamp for the readings
     * @returns Object with appropriate readings for the domain
     */
    async generateDomainSpecificReadings(locationName, timestamp) {
        const cacheKey = `readings-${locationName}-${timestamp}`;
        const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
        // Check cache if enabled
        if (this.cacheEnabled && fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                return cached;
            }
            catch (err) {
                console.warn('Failed to read from cache, will generate fresh data');
            }
        }
        // Create a seed value for deterministic generation
        const seed = crypto.createHash('md5').update(locationName + timestamp).digest('hex');
        const seedNum = parseInt(seed.substring(0, 8), 16);
        try {
            const prompt = `Generate realistic sensor readings for a location named "${locationName}" in a ${this.context.DOMAIN} project with the objective: "${this.context.OBJECTIVE}".

The readings should include metrics that would be relevant to measure for this specific domain and project objective. For each metric, provide:
- A realistic numeric value with appropriate precision
- The unit of measurement
- A brief description if needed

Format as a JSON object. For timestamp, use: ${timestamp}

Example format (but with metrics relevant to ${this.context.DOMAIN}):
{
  "timestamp": "${timestamp}",
  "metrics": {
    "temperature": 22.7,
    "humidity": 45.3,
    "pressure": 1013.2
  },
  "units": {
    "temperature": "°C",
    "humidity": "%",
    "pressure": "hPa"
  },
  "status": "normal",
  "quality_index": 87
}`;
            // We'll use sendPrompt or createCompletion depending on what's available
            // @ts-ignore - Dynamic method call
            const sendPromptMethod = typeof this.llm.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
            // @ts-ignore - Dynamic method call
            const response = await this.llm[sendPromptMethod](prompt, {
                temperature: 0.7,
                systemPrompt: `You are a domain expert in ${this.context.DOMAIN} who creates realistic sensor data.`
            });
            const responseContent = typeof response === 'string' ? response : response.choices[0].message.content;
            // Parse the JSON from the response
            let jsonStr = responseContent;
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
            }
            else if (jsonStr.includes('```')) {
                jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
            }
            // Clean up any markdown formatting
            if (jsonStr.includes('`')) {
                jsonStr = jsonStr.replace(/`/g, '');
            }
            const readings = JSON.parse(jsonStr);
            // Cache the result if caching is enabled
            if (this.cacheEnabled) {
                fs.writeFileSync(cacheFile, JSON.stringify(readings, null, 2));
            }
            return readings;
        }
        catch (error) {
            console.error('Error generating domain readings with LLM:', error);
            // Fall back to synthetic data based on domain
            return this.generateSyntheticReadings(locationName, timestamp);
        }
    }
    /**
     * Generate neural data specifically for the project domain
     * This replaces the hardcoded ant brain/neural data generator
     *
     * @param locations Array of locations to generate data for
     * @returns Complete API response object with neural data
     */
    async generateNeuralData(locations) {
        const timestamp = new Date().toISOString();
        const responseData = {
            data_source: `${this.context.DOMAIN} Data`,
            retrieved_at: timestamp,
            locations: [],
            metadata: {
                data_quality: 'high',
                units: {}
            },
            analysis_summary: ""
        };
        // Generate data for each location
        for (const location of locations) {
            const readings = await this.generateDomainSpecificReadings(location.name, timestamp);
            responseData.locations.push({
                name: location.name,
                coordinates: {
                    lat: location.lat,
                    lng: location.lng
                },
                readings
            });
            // Update metadata units if available
            if (readings.units) {
                responseData.metadata.units = {
                    ...responseData.metadata.units,
                    ...readings.units
                };
            }
        }
        // Generate a summary with LLM
        try {
            const summaryPrompt = `Analyze this ${this.context.DOMAIN} data and provide a brief summary of the findings:
${JSON.stringify(responseData.locations.map(l => l.readings), null, 2)}`;
            // We'll use sendPrompt or createCompletion depending on what's available
            // @ts-ignore - Dynamic method call
            const sendPromptMethod = typeof this.llm.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
            // @ts-ignore - Dynamic method call
            const response = await this.llm[sendPromptMethod](summaryPrompt, {
                temperature: 0.7,
                systemPrompt: `You are a data analyst specializing in ${this.context.DOMAIN}. Provide concise, insightful summaries of data.`
            });
            const responseContent = typeof response === 'string' ? response : response.choices[0].message.content;
            responseData.analysis_summary = responseContent.trim();
        }
        catch (error) {
            console.error('Error generating analysis summary:', error);
            responseData.analysis_summary = `${this.context.DOMAIN} data shows varied readings across locations with generally acceptable quality for analysis.`;
        }
        return responseData;
    }
    /**
     * Create a complete visualization config based on the project domain
     *
     * @param data The data to visualize
     * @param visType Type of visualization to generate
     * @returns Visualization configuration
     */
    async generateVisualizationConfig(data, visType) {
        try {
            const prompt = `Create a ${visType} visualization configuration for this ${this.context.DOMAIN} data:
${JSON.stringify(data, null, 2)}

The visualization should best represent the data for a project with the objective: "${this.context.OBJECTIVE}".

Return only a JSON configuration object that describes the visualization.`;
            // We'll use sendPrompt or createCompletion depending on what's available
            // @ts-ignore - Dynamic method call
            const sendPromptMethod = typeof this.llm.sendPrompt === 'function' ? 'sendPrompt' : 'createCompletion';
            // @ts-ignore - Dynamic method call
            const response = await this.llm[sendPromptMethod](prompt, {
                temperature: 0.7,
                systemPrompt: `You are a data visualization expert specializing in ${this.context.DOMAIN} data.`
            });
            const responseContent = typeof response === 'string' ? response : response.choices[0].message.content;
            // Parse the JSON from the response
            let jsonStr = responseContent;
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
            }
            else if (jsonStr.includes('```')) {
                jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
            }
            // Clean up any markdown formatting
            if (jsonStr.includes('`')) {
                jsonStr = jsonStr.replace(/`/g, '');
            }
            const config = JSON.parse(jsonStr);
            return config;
        }
        catch (error) {
            console.error(`Error generating ${visType} visualization config:`, error);
            // Return a simple default configuration
            return {
                type: visType,
                title: `${this.context.DOMAIN} Data Visualization`,
                data: this.summarizeData(data)
            };
        }
    }
    /**
     * Helper method to determine if the domain is non-geographic
     */
    isNonGeographicDomain() {
        const nonGeoKeywords = [
            'nano', 'micro', 'molecular', 'quantum', 'gene', 'neural',
            'brain', 'cellular', 'atomic', 'robotic', 'bot'
        ];
        const domainLower = (this.context.DOMAIN || '').toLowerCase();
        return nonGeoKeywords.some(keyword => domainLower.includes(keyword));
    }
    /**
     * Generate synthetic location data when LLM generation fails or isn't appropriate
     */
    generateSyntheticLocations(count, options = {}) {
        // Center around a default point with some variation
        const centerLat = options.centerPoint?.lat || 40.7128; // NYC default
        const centerLng = options.centerPoint?.lng || -74.0060;
        const radius = options.radius || 0.05;
        return Array(count).fill(0).map((_, i) => {
            // Generate stable but seemingly random coordinates
            const hash = crypto.createHash('md5').update(`location-${i}`).digest('hex');
            const lat = centerLat + (parseInt(hash.substring(0, 8), 16) % 1000 - 500) / 10000;
            const lng = centerLng + (parseInt(hash.substring(8, 16), 16) % 1000 - 500) / 10000;
            // Generate location types appropriate for the domain
            let locationTypes;
            if (this.context.DOMAIN?.toLowerCase().includes('neuro') ||
                this.context.DOMAIN?.toLowerCase().includes('brain')) {
                locationTypes = ['Lab', 'Research Center', 'Sample Site', 'Processing Lab', 'Imaging Facility'];
            }
            else if (this.context.DOMAIN?.toLowerCase().includes('air') ||
                this.context.DOMAIN?.toLowerCase().includes('environment')) {
                locationTypes = ['School', 'Park', 'Community Center', 'Library', 'Government Building'];
            }
            else {
                locationTypes = ['Site', 'Facility', 'Center', 'Station', 'Unit'];
            }
            const type = locationTypes[parseInt(hash.substring(16, 18), 16) % locationTypes.length];
            // Basic required fields
            const result = {
                id: `loc-${i + 1}`,
                name: `${type} ${i + 1}`,
                lat,
                lng,
                type,
                priority: parseInt(hash.substring(18, 20), 16) % 10 + 1, // 1-10 priority
            };
            // Add sensor recommendations if appropriate for the domain
            if (this.context.DOMAIN?.toLowerCase().includes('air')) {
                result.recommended_sensor = parseInt(hash.substring(20, 22), 16) % 3 === 0 ? 'sen-aq3000' :
                    parseInt(hash.substring(20, 22), 16) % 3 === 1 ? 'sen-aq2000' : 'sen-aq1000';
            }
            else if (this.context.DOMAIN?.toLowerCase().includes('neuro') ||
                this.context.DOMAIN?.toLowerCase().includes('brain')) {
                result.recommended_sensor = parseInt(hash.substring(20, 22), 16) % 3 === 0 ? 'neural-scanner-pro' :
                    parseInt(hash.substring(20, 22), 16) % 3 === 1 ? 'bci-scanner-v2' : 'standard-neural-probe';
            }
            return result;
        });
    }
    /**
     * Generate synthetic readings for when LLM generation fails
     */
    generateSyntheticReadings(locationName, timestamp) {
        const seed = crypto.createHash('md5').update(locationName + timestamp).digest('hex');
        const seedNum = parseInt(seed.substring(0, 8), 16);
        // Different readings based on domain
        if (this.context.DOMAIN?.toLowerCase().includes('neuro') ||
            this.context.DOMAIN?.toLowerCase().includes('brain')) {
            return {
                neuronal_activity: (75 + (seedNum % 25)) * (1 + Math.sin(seedNum % 10) * 0.2),
                synapse_density: (450 + (seedNum % 150)) * (1 + Math.cos(seedNum % 10) * 0.15),
                neural_integrity: (85 + (seedNum % 15)) * 0.01 * (1 + Math.sin(seedNum % 7) * 0.1),
                cellular_viability: (90 + (seedNum % 10)) * 0.01 * (1 + Math.cos(seedNum % 8) * 0.05),
                imaging_quality: (0.8 + (seedNum % 2) * 0.1) * (1 + Math.sin(seedNum % 5) * 0.1),
                quality_index: 85 + (seedNum % 15),
                category: ['Excellent', 'Good', 'Acceptable'][seedNum % 3],
                timestamp
            };
        }
        else if (this.context.DOMAIN?.toLowerCase().includes('air') ||
            this.context.DOMAIN?.toLowerCase().includes('environment')) {
            return {
                pm25: (10 + (seedNum % 30)) * (1 + Math.sin(seedNum % 10) * 0.3),
                pm10: (20 + (seedNum % 50)) * (1 + Math.cos(seedNum % 8) * 0.25),
                o3: (0.03 + (seedNum % 10) * 0.01) * (1 + Math.sin(seedNum % 7) * 0.2),
                no2: (0.01 + (seedNum % 5) * 0.01) * (1 + Math.cos(seedNum % 9) * 0.15),
                co: (0.1 + (seedNum % 10) * 0.1) * (1 + Math.sin(seedNum % 6) * 0.1),
                aqi: 50 + (seedNum % 50),
                category: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups'][seedNum % 3],
                timestamp
            };
        }
        else {
            // Generic readings for other domains
            return {
                value: (50 + (seedNum % 100)) * (1 + Math.sin(seedNum % 10) * 0.2),
                reading1: (100 + (seedNum % 200)) * (1 + Math.cos(seedNum % 8) * 0.15),
                reading2: (200 + (seedNum % 300)) * (1 + Math.sin(seedNum % 7) * 0.1),
                quality: (0.7 + (seedNum % 3) * 0.1) * (1 + Math.cos(seedNum % 9) * 0.05),
                index: 70 + (seedNum % 30),
                status: ['Normal', 'Elevated', 'Warning'][seedNum % 3],
                timestamp
            };
        }
    }
    /**
     * Create a simplified version of data for visualization
     */
    summarizeData(data) {
        // If it's an array, summarize each item
        if (Array.isArray(data)) {
            if (data.length > 5) {
                // For large arrays, take a subset
                return {
                    summary: `${data.length} items`,
                    sample: data.slice(0, 5)
                };
            }
            return data;
        }
        // If it's an object with locations, extract them
        else if (data?.locations && Array.isArray(data.locations)) {
            return {
                summary: `${data.locations.length} locations`,
                locations: data.locations.slice(0, 5)
            };
        }
        // Otherwise just return the data
        return data;
    }
}
exports.DataGenerationManager = DataGenerationManager;
//# sourceMappingURL=DataGenerationManager.js.map