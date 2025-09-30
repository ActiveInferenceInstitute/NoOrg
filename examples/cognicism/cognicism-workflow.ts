/**
 * Cognicism Hybrid Agent Workflow - Comprehensive Implementation
 * 
 * This implementation demonstrates:
 * - Cognicism framework principles in a practical workflow
 * - Iris model and Ŧrust mechanism implementation with advanced features
 * - FourThought dialectic process for knowledge generation
 * - Semantic ledger for storing collective knowledge with vector search
 * - Advanced visualization of belief staking and community dynamics
 * - Integration with Cognify optimization framework
 * - Multi-agent coordination and workflow orchestration
 * - Advanced trust mechanisms and source evaluation
 * - Real-time visualization and analytics
 *
 * Features Added:
 * - Advanced source embedding and trust calculation algorithms
 * - Temporal embeddings for time-aware processing
 * - Social proof of impact mechanisms
 * - Prophet incentive systems for accurate predictions
 * - Regenerative wisdom tensor computations
 * - Advanced uncertainty quantification
 * - Multi-dimensional valence assessment
 * - Community consensus mechanisms
 * - Advanced workflow optimization using Cognify principles
 */

import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../../src/core/multiagent/LLMClientInterface';
import { WorkflowEngine, ILogger } from '../../src/core/units/workflow/WorkflowEngine';
import { EventSystem } from '../../src/core/events/EventSystem';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import axios from 'axios';
import { LLMAgent } from '../../src/core/units/agents/LLMAgent'; // Corrected import path

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify API key loading
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
  process.exit(1);
} else {
  // Hide full key in logs but show enough to verify it's loading
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`OPENAI_API_KEY loaded: ${maskedKey}`);
}

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `cognicism-framework-${timestamp}`;
// Initialize outputDir with a default value
let outputDir: string = path.join('output', runId);

// Comprehensive Cognicism Framework Configuration
interface CognicismConfig {
  // Core framework settings
  framework: {
    version: string;
    domain: string;
    objective: string;
    constraints: string[];
    targetUsers: string[];
    enableAdvancedFeatures: boolean;
    enableRealTimeAnalytics: boolean;
  };

  // AI and LLM configuration
  llm: {
    defaultModel: string;
    fallbackModel: string;
    tokenLimitThreshold: number;
    defaultMaxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    timeoutMs: number;
  };

  // Trust and source configuration
  trust: {
    initialTrustValue: number;
    trustUpdateRate: number;
    socialProofWeight: number;
    prophetWeight: number;
    temporalWeight: number;
    consensusWeight: number;
    enableAdvancedTrustCalculation: boolean;
  };

  // FourThought configuration
  fourThought: {
    minThoughtsPerCategory: number;
    maxThoughtsPerCategory: number;
    enableBeliefStaking: boolean;
    enableCommunityConsensus: boolean;
    uncertaintyThresholds: {
      veryLow: number;
      low: number;
      medium: number;
      high: number;
      veryHigh: number;
    };
  };

  // Semantic ledger configuration
  semanticLedger: {
    embeddingDimensions: number;
    enableVectorSearch: boolean;
    searchResultLimit: number;
    enableIntentAnalysis: boolean;
    storageFormat: 'json' | 'vector_db' | 'hybrid';
  };

  // Visualization configuration
  visualization: {
    enableInteractiveCharts: boolean;
    enableAnimations: boolean;
    defaultChartLibrary: 'plotly' | 'd3' | 'chartjs';
    animationFrameRate: number;
    colorSchemes: Record<string, Record<string, string>>;
  };

  // Workflow configuration
  workflow: {
    maxConcurrentStages: number;
    stageTimeoutMs: number;
    enableStageMetrics: boolean;
    enableWorkflowVisualization: boolean;
    retryFailedStages: boolean;
    maxRetries: number;
  };

  // Output and logging configuration
  output: {
    baseDirectory: string;
    enableDetailedLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    saveIntermediateResults: boolean;
    compressOutputFiles: boolean;
  };

  // Advanced features configuration
  advanced: {
    enableTemporalEmbeddings: boolean;
    enableSocialProof: boolean;
    enableProphetIncentives: boolean;
    enableRegenerativeWisdom: boolean;
    enableMultiDimensionalValence: boolean;
    enableCommunityConsensus: boolean;
  };
}

// Configure the project parameters with comprehensive settings
const PROJECT_CONFIG: CognicismConfig = {
  framework: {
    version: '1.0.0',
    domain: 'Cognicism Framework Implementation',
    objective: 'Implement a practical demonstration of the Cognicism framework for collaborative knowledge generation',
    constraints: [
      'Must showcase Iris model, FourThought process, Semantic Ledger, and Ŧrust dynamics',
      'Must integrate advanced trust mechanisms and source evaluation',
      'Must support real-time visualization and analytics',
      'Must enable community consensus and belief staking mechanisms'
    ],
    targetUsers: [
      'Research communities',
      'Distributed knowledge networks',
      'Collaborative decision-making groups',
      'Democratic AI systems',
      'Academic institutions',
      'Policy-making organizations'
    ],
    enableAdvancedFeatures: true,
    enableRealTimeAnalytics: true
  },

  llm: {
    defaultModel: process.env.DEFAULT_MODEL || 'gpt-4o',
    fallbackModel: 'gpt-3.5-turbo-16k',
    tokenLimitThreshold: 8000,
    defaultMaxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 2000,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    timeoutMs: 30000
  },

  trust: {
    initialTrustValue: 0.5,
    trustUpdateRate: 0.1,
    socialProofWeight: 0.2,
    prophetWeight: 0.15,
    temporalWeight: 0.05,
    consensusWeight: 0.1,
    enableAdvancedTrustCalculation: true
  },

  fourThought: {
    minThoughtsPerCategory: 1,
    maxThoughtsPerCategory: 3,
    enableBeliefStaking: true,
    enableCommunityConsensus: true,
    uncertaintyThresholds: {
      veryLow: 0.1,
      low: 0.3,
      medium: 0.5,
      high: 0.7,
      veryHigh: 0.9
    }
  },

  semanticLedger: {
    embeddingDimensions: 100,
    enableVectorSearch: true,
    searchResultLimit: 15,
    enableIntentAnalysis: true,
    storageFormat: 'hybrid'
  },

  visualization: {
    enableInteractiveCharts: true,
    enableAnimations: true,
    defaultChartLibrary: 'plotly',
    animationFrameRate: 30,
    colorSchemes: {
      trust: {
        high: '#4CAF50',
        medium: '#FFC107',
        low: '#F44336'
      },
      thoughtTypes: {
        prediction: '#90CAF9',
        reflection: '#A5D6A7',
        statement: '#FFCC80',
        question: '#CE93D8'
      },
      valence: {
        positive: '#4CAF50',
        neutral: '#9E9E9E',
        negative: '#F44336'
      }
    }
  },

  workflow: {
    maxConcurrentStages: 3,
    stageTimeoutMs: 60000,
    enableStageMetrics: true,
    enableWorkflowVisualization: true,
    retryFailedStages: true,
    maxRetries: 2
  },

  output: {
    baseDirectory: 'output',
    enableDetailedLogging: true,
    logLevel: 'info',
    saveIntermediateResults: true,
    compressOutputFiles: false
  },

  advanced: {
    enableTemporalEmbeddings: true,
    enableSocialProof: true,
    enableProphetIncentives: true,
    enableRegenerativeWisdom: true,
    enableMultiDimensionalValence: true,
    enableCommunityConsensus: true
  }
};

// Use the existing FileLogger class for compatibility
class FileLogger implements ILogger {
  private logFile: string;
  
  constructor(filename: string) {
    this.logFile = filename;
    // Create log directory if it doesn't exist
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    // Initialize log file
    fs.writeFileSync(this.logFile, `=== Cognicism Workflow - ${new Date().toISOString()} ===\n\n`);
  }
  
  log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.log(message);
    fs.appendFileSync(this.logFile, `[LOG] ${message}\n`);
  }
  
  error(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.error(`ERROR: ${message}`);
    fs.appendFileSync(this.logFile, `[ERROR] ${message}\n`);
  }
  
  info(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.info(`INFO: ${message}`);
    fs.appendFileSync(this.logFile, `[INFO] ${message}\n`);
  }
  
  warn(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.warn(`WARN: ${message}`);
    fs.appendFileSync(this.logFile, `[WARN] ${message}\n`);
  }
}

// Simple logger factory function
function createLogger(name: string, level: string, options: { console: boolean, file: string }) {
  return new FileLogger(options.file);
}

// Define the agent interfaces
interface Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  process: (input: any, context: WorkflowContext) => Promise<any>;
}

// Cognicism-specific agent interfaces and types
interface Thought {
  type: 'prediction' | 'reflection' | 'statement' | 'question';
  content: string;
  timestamp: string;
  author: string;
  id?: string; // Added optional id
  valence?: number; // -1 to 1 scale for moral valence
  uncertainty?: number; // 0 to 1 scale for uncertainty
  trustScore?: number; // The Ŧrust score associated with this thought
}

interface SourceEmbedding {
  id: string;
  name: string;
  description: string;
  reliability: number; // 0-1 score of historical reliability
  expertise: number; // 0-1 score in relevant domain
  alignment: number; // -1 to 1 score of alignment with community values
  embedding?: number[]; // Vector representation (simulated)
  temporalEmbedding?: TemporalEmbedding; // Time-aware representation
  socialProofScore?: number; // Social proof of impact score
  prophetScore?: number; // Prediction accuracy tracking
  regenerativeWisdom?: RegenerativeWisdomTensor; // Wisdom tensor representation
}

interface TemporalEmbedding {
  timestamp: string;
  recency: number; // 0-1 score of how recent the information is
  relevance: number; // 0-1 score of temporal relevance to current context
  periodicity?: number[]; // Sinusoidal embeddings for cyclical patterns
}

interface RegenerativeWisdomTensor {
  dimensions: number[];
  values: number[];
  compressionRatio: number; // How much knowledge was compressed
  regenerationPotential: number; // Ability to regenerate lost information
}

interface ProphetIncentive {
  sourceId: string;
  predictionId: string;
  accuracy: number; // 0-1 score of prediction accuracy
  reward: number; // Calculated reward for accurate prediction
  timestamp: string;
}

interface SocialProofMetrics {
  sourceId: string;
  communityValidation: number; // How much the community validates this source
  impactScore: number; // Measured impact on community decisions
  consensusAlignment: number; // Alignment with community consensus
}

// IrisAgent - Core Cognicism belief encoding model with advanced features
class IrisAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  systemPrompt: string;
  private llm: OpenAIClient;
  private sources: SourceEmbedding[] = [];
  private thoughts: Thought[] = [];
  private trustDistribution: Map<string, number> = new Map();
  private prophetIncentives: ProphetIncentive[] = [];
  private socialProofMetrics: SocialProofMetrics[] = [];
  private temporalContext: Map<string, TemporalEmbedding> = new Map();
  private communityConsensus: Map<string, number> = new Map(); // Track community agreement
  private epistemicNetwork: Map<string, Set<string>> = new Map(); // Track knowledge relationships
  private beliefRevisionHistory: Array<{timestamp: string, beliefId: string, oldBelief: any, newBelief: any}> = [];
  private metacognitiveState: { confidence: number, certainty: number, coherence: number } = { confidence: 0.5, certainty: 0.5, coherence: 0.5 };
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    systemPrompt: string;
    initialSources?: SourceEmbedding[];
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt;
    
    if (config.initialSources) {
      this.sources = config.initialSources;
      // Initialize trust distribution based on sources
      config.initialSources.forEach(source => {
        this.trustDistribution.set(source.id, 0.5); // Initial neutral trust
      });
    }
    
    // Ensure API key is set correctly
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    // Initialize the OpenAI client with the API key from environment variables
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`IrisAgent ${this.name} processing input`);
    
    // Process the input
    let processedInput = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    
    // Prepare context about current trust distribution and previous thoughts
    const trustContext = Array.from(this.trustDistribution.entries())
      .map(([sourceId, trustValue]) => {
        const source = this.sources.find(s => s.id === sourceId);
        return `${source?.name || sourceId}: ${trustValue.toFixed(2)}`;
      })
      .join('\n');
    
    // Get recent thoughts
    const recentThoughts = this.thoughts
      .slice(-5)
      .map(t => `[${t.type.toUpperCase()}] ${t.author}: ${t.content}`)
      .join('\n');
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt
      },
      {
        role: 'user',
        content: `
# Current Ŧrust Distribution
${trustContext}

# Recent Thoughts
${recentThoughts}

# New Input
${processedInput}

Respond using the FourThought protocol. Generate 1-2 thoughts in each category:
1. PREDICTIONS - future-oriented claims that can be verified later
2. REFLECTIONS - insights about past events or patterns
3. STATEMENTS - factual claims or observations
4. QUESTIONS - inquiries to guide further exploration

For each thought, include:
- Moral valence (-1 to 1, where -1 is morally problematic, 0 is neutral, 1 is morally positive)
- Uncertainty (0 to 1, where 0 is certain, 1 is highly uncertain)

Format your response as JSON with an array of thoughts.
`
      }
    ];
    
    // Save the intermediates
    const intermediatesDir = path.join(context.config.OUTPUT_DIR || '', 'intermediates');
    fs.ensureDirSync(intermediatesDir);
    
    const inputFilename = `${this.id}_${Date.now()}_input.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, inputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        system_prompt: this.systemPrompt,
        user_prompt: processedInput,
        trust_context: trustContext,
        recent_thoughts: recentThoughts
      }, null, 2)
    );
    
    const modelToUse = context.config.LLM_CONFIG.DEFAULT_MODEL;
    logger.info(`Using model ${modelToUse} for Iris response`);
    
    const response = await this.llm.createChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: context.config.LLM_CONFIG.DEFAULT_MAX_TOKENS || 2000,
      model: modelToUse
    });
    
    const content = response.choices[0]?.message?.content || '';
    
    // Save the raw output
    const outputFilename = `${this.id}_${Date.now()}_output.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, outputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        raw_response: content
      }, null, 2)
    );
    
    // Parse the response
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```([\s\S]*?)```/) ||
                       [null, content];
      const jsonContent = jsonMatch[1] || content;
      
      // Parse the thoughts
      const thoughts = JSON.parse(jsonContent);
      
      // Add the new thoughts to our collection
      if (Array.isArray(thoughts)) {
        const newThoughts = thoughts.map(t => ({
          ...t,
          timestamp: new Date().toISOString(),
          author: this.name,
          trustScore: this.calculateThoughtTrust(t)
        }));
        
        this.thoughts = [...this.thoughts, ...newThoughts];
        
        // Update our semantic ledger with these new thoughts
        this.updateSemanticLedger(newThoughts, context);
      }
      
      return {
        thoughts: thoughts,
        trust_distribution: Object.fromEntries(this.trustDistribution),
        sources: this.sources,
        __metadata: {
          model: modelToUse,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`Error processing Iris response: ${error}`);
      return { 
        error: String(error),
        raw_content: content,
        __metadata: {
          model: modelToUse,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  private calculateThoughtTrust(thought: any): number {
    // Simple trust calculation based on thought attributes
    // In a real implementation, this would be more sophisticated
    const baseScore = 0.5; // Default neutral score
    
    // Adjust based on uncertainty - less uncertain thoughts get higher trust
    const uncertaintyFactor = thought.uncertainty ? 1 - thought.uncertainty : 0.5;
    
    // Type-specific adjustments
    const typeMultiplier = 
      thought.type === 'statement' ? 1.1 :
      thought.type === 'prediction' ? 0.9 :
      thought.type === 'reflection' ? 1.0 :
      thought.type === 'question' ? 0.8 : 1.0;
    
    return Math.min(1, Math.max(0, baseScore * uncertaintyFactor * typeMultiplier));
  }
  
  private updateSemanticLedger(thoughts: Thought[], context: WorkflowContext): void {
    // In a real implementation, this would update a vector database or similar
    // For this demo, we'll just write to a JSON file
    const ledgerDir = path.join(context.config.OUTPUT_DIR || '', 'semantic_ledger');
    fs.ensureDirSync(ledgerDir);
    
    const ledgerFile = path.join(ledgerDir, `ledger_${this.id}.json`);
    
    let ledger: Thought[] = []; // Explicitly type ledger array
    if (fs.existsSync(ledgerFile)) {
      try {
        ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      } catch (e) {
        ledger = [];
      }
    }
    
    // Add the new thoughts to the ledger
    ledger = [...ledger, ...thoughts];
    
    // Write back to disk
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2));
    
    // Update our in-memory cache
    // Apply to 10-dynamic-o...
    this.thoughts = ledger; // Corrected variable
  }
  
  // Add a source to the Iris model
  addSource(source: SourceEmbedding): void {
    this.sources.push(source);
    this.trustDistribution.set(source.id, 0.5); // Initial neutral trust
  }
  
  // Update trust for a source based on feedback
  updateSourceTrust(sourceId: string, feedback: number): void {
    const currentTrust = this.trustDistribution.get(sourceId) || 0.5;
    const learningRate = 0.1; // How quickly trust updates
    
    // Enhanced trust update with social proof and temporal factors
    const source = this.sources.find(s => s.id === sourceId);
    const socialProof = source?.socialProofScore || 0.5;
    const temporalRelevance = this.calculateTemporalRelevance(sourceId);

    // Multi-factor trust calculation
    const baseUpdate = feedback * learningRate;
    const socialProofBonus = socialProof * 0.05; // 5% bonus for social proof
    const temporalBonus = temporalRelevance * 0.02; // 2% bonus for temporal relevance

    const newTrust = currentTrust + baseUpdate + socialProofBonus + temporalBonus;
    this.trustDistribution.set(sourceId, Math.min(1, Math.max(0, newTrust)));

    // Update social proof metrics
    this.updateSocialProofMetrics(sourceId, feedback);
  }

  // Calculate temporal relevance for a source
  private calculateTemporalRelevance(sourceId: string): number {
    const temporalEmbedding = this.temporalContext.get(sourceId);
    if (!temporalEmbedding) return 0.5;

    const now = new Date();
    const sourceTime = new Date(temporalEmbedding.timestamp);
    const hoursDiff = (now.getTime() - sourceTime.getTime()) / (1000 * 60 * 60);

    // Exponential decay with half-life of 24 hours
    const recencyScore = Math.exp(-hoursDiff / 24);
    return (recencyScore + temporalEmbedding.relevance) / 2;
  }

  // Update social proof metrics for a source
  private updateSocialProofMetrics(sourceId: string, feedback: number): void {
    const existingMetrics = this.socialProofMetrics.find(m => m.sourceId === sourceId);
    const currentConsensus = this.communityConsensus.get(sourceId) || 0.5;

    if (existingMetrics) {
      // Update existing metrics with exponential moving average
      const alpha = 0.1; // Learning rate for social proof updates
      existingMetrics.communityValidation = (1 - alpha) * existingMetrics.communityValidation + alpha * (feedback > 0 ? 1 : 0);
      existingMetrics.impactScore = (1 - alpha) * existingMetrics.impactScore + alpha * Math.abs(feedback);
      existingMetrics.consensusAlignment = (1 - alpha) * existingMetrics.consensusAlignment + alpha * currentConsensus;
    } else {
      // Create new metrics
      this.socialProofMetrics.push({
        sourceId,
        communityValidation: feedback > 0 ? 1 : 0,
        impactScore: Math.abs(feedback),
        consensusAlignment: currentConsensus
      });
    }
  }

  // Calculate prophet incentive for accurate predictions
  calculateProphetIncentive(predictionId: string, actualOutcome: boolean, sourceId: string): number {
    const prediction = this.thoughts.find(t => t.id === predictionId);
    if (!prediction || prediction.type !== 'prediction') return 0;

    // Calculate accuracy based on valence and uncertainty
    const predictedValence = prediction.valence || 0;
    const uncertainty = prediction.uncertainty || 0.5;
    const actualValence = actualOutcome ? 1 : -1;

    // Accuracy calculation considering uncertainty
    const accuracy = 1 - Math.abs(predictedValence - actualValence) * (1 - uncertainty);

    // Calculate reward based on accuracy and current trust
    const currentTrust = this.trustDistribution.get(sourceId) || 0.5;
    const baseReward = accuracy * currentTrust * 0.1; // Scale reward appropriately

    // Store the incentive
    this.prophetIncentives.push({
      sourceId,
      predictionId,
      accuracy,
      reward: baseReward,
      timestamp: new Date().toISOString()
    });

    return baseReward;
  }

  // Generate temporal embedding for a source
  generateTemporalEmbedding(sourceId: string, timestamp: string): TemporalEmbedding {
    const now = new Date();
    const sourceTime = new Date(timestamp);
    const hoursDiff = (now.getTime() - sourceTime.getTime()) / (1000 * 60 * 60);

    // Calculate recency (exponential decay)
    const recency = Math.exp(-hoursDiff / 24); // 24-hour half-life

    // Calculate relevance based on source characteristics
    const source = this.sources.find(s => s.id === sourceId);
    const relevance = source ? (source.reliability + source.expertise) / 2 : 0.5;

    // Generate sinusoidal periodicity embeddings (24-hour and 7-day cycles)
    const periodicity = [
      Math.sin(2 * Math.PI * (now.getHours() / 24)), // Daily cycle
      Math.cos(2 * Math.PI * (now.getHours() / 24)),
      Math.sin(2 * Math.PI * (now.getDay() / 7)), // Weekly cycle
      Math.cos(2 * Math.PI * (now.getDay() / 7))
    ];

    const embedding: TemporalEmbedding = {
      timestamp,
      recency,
      relevance,
      periodicity
    };

    this.temporalContext.set(sourceId, embedding);
    return embedding;
  }

  // Compute regenerative wisdom tensor for a source
  computeRegenerativeWisdomTensor(sourceId: string): RegenerativeWisdomTensor {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source) {
      return {
        dimensions: [1],
        values: [0],
        compressionRatio: 0,
        regenerationPotential: 0
      };
    }

    // Create a tensor representation based on source characteristics
    const baseValues = [
      source.reliability,
      source.expertise,
      source.alignment,
      source.socialProofScore || 0.5,
      source.prophetScore || 0.5
    ];

    // Calculate compression ratio (simulated)
    const originalSize = baseValues.length * 4; // Assume 4 bytes per value
    const compressedSize = Math.floor(originalSize * 0.3); // 70% compression
    const compressionRatio = originalSize / compressedSize;

    // Calculate regeneration potential based on source quality
    const regenerationPotential = (source.reliability + source.expertise + (source.alignment + 1) / 2) / 3;

    return {
      dimensions: [baseValues.length],
      values: baseValues,
      compressionRatio,
      regenerationPotential
    };
  }

  // Advanced trust calculation with multiple factors
  private calculateAdvancedTrust(sourceId: string): number {
    const source = this.sources.find(s => s.id === sourceId);
    if (!source) return 0.5;

    const baseTrust = this.trustDistribution.get(sourceId) || 0.5;

    // Factor in social proof
    const socialProof = source.socialProofScore || 0.5;
    const socialProofWeight = 0.2;

    // Factor in prophet score
    const prophetScore = source.prophetScore || 0.5;
    const prophetWeight = 0.15;

    // Factor in regenerative wisdom
    const wisdomTensor = this.computeRegenerativeWisdomTensor(sourceId);
    const wisdomScore = wisdomTensor.regenerationPotential;
    const wisdomWeight = 0.1;

    // Factor in temporal relevance
    const temporalRelevance = this.calculateTemporalRelevance(sourceId);
    const temporalWeight = 0.05;

    // Factor in community consensus
    const consensus = this.communityConsensus.get(sourceId) || 0.5;
    const consensusWeight = 0.1;

    // Weighted combination
    const advancedTrust = (
      baseTrust * (1 - socialProofWeight - prophetWeight - wisdomWeight - temporalWeight - consensusWeight) +
      socialProof * socialProofWeight +
      prophetScore * prophetWeight +
      wisdomScore * wisdomWeight +
      temporalRelevance * temporalWeight +
      consensus * consensusWeight
    );

    return Math.min(1, Math.max(0, advancedTrust));
  }

  // Advanced epistemic network management
  addEpistemicRelation(beliefId1: string, beliefId2: string, relationType: 'supports' | 'contradicts' | 'implies' | 'analogous'): void {
    if (!this.epistemicNetwork.has(beliefId1)) {
      this.epistemicNetwork.set(beliefId1, new Set());
    }
    if (!this.epistemicNetwork.has(beliefId2)) {
      this.epistemicNetwork.set(beliefId2, new Set());
    }

    // Add bidirectional relation for supported/contradicted relationships
    if (relationType === 'supports' || relationType === 'contradicts') {
      this.epistemicNetwork.get(beliefId1)?.add(`${relationType}:${beliefId2}`);
      this.epistemicNetwork.get(beliefId2)?.add(`supported_by:${beliefId1}`);
    } else {
      this.epistemicNetwork.get(beliefId1)?.add(`${relationType}:${beliefId2}`);
    }
  }

  // Metacognitive state updates
  updateMetacognitiveState(updates: Partial<typeof this.metacognitiveState>): void {
    this.metacognitiveState = { ...this.metacognitiveState, ...updates };

    // Ensure values stay within bounds
    this.metacognitiveState.confidence = Math.min(1, Math.max(0, this.metacognitiveState.confidence));
    this.metacognitiveState.certainty = Math.min(1, Math.max(0, this.metacognitiveState.certainty));
    this.metacognitiveState.coherence = Math.min(1, Math.max(0, this.metacognitiveState.coherence));
  }

  // Belief revision tracking
  recordBeliefRevision(beliefId: string, oldBelief: any, newBelief: any): void {
    this.beliefRevisionHistory.push({
      timestamp: new Date().toISOString(),
      beliefId,
      oldBelief,
      newBelief
    });

    // Limit history to prevent memory bloat
    if (this.beliefRevisionHistory.length > 1000) {
      this.beliefRevisionHistory = this.beliefRevisionHistory.slice(-500);
    }
  }

  // Advanced coherence assessment
  assessBeliefCoherence(beliefId: string): number {
    const relations = this.epistemicNetwork.get(beliefId) || new Set();
    let coherenceScore = 0.5; // Base coherence

    // Check for contradictions
    const contradictions = Array.from(relations).filter(r => r.startsWith('contradicts:')).length;
    coherenceScore -= contradictions * 0.2; // Penalty for contradictions

    // Check for supporting evidence
    const supports = Array.from(relations).filter(r => r.startsWith('supports:')).length;
    coherenceScore += supports * 0.1; // Bonus for supporting evidence

    // Check for implications
    const implications = Array.from(relations).filter(r => r.startsWith('implies:')).length;
    coherenceScore += implications * 0.05; // Bonus for logical implications

    return Math.min(1, Math.max(0, coherenceScore));
  }

  // Cross-domain knowledge transfer
  transferKnowledge(fromDomain: string, toDomain: string, knowledgeItem: any): number {
    // Simulate knowledge transfer between domains
    const transferSuccess = Math.random() * 0.8 + 0.2; // 20-100% success rate

    if (transferSuccess > 0.7) { // Successful transfer
      // Create new thought in target domain with adjusted confidence
      const transferredThought: Thought = {
        type: 'statement',
        content: `Transferred from ${fromDomain}: ${knowledgeItem.content}`,
        author: `KnowledgeTransfer-${fromDomain}`,
        timestamp: new Date().toISOString(),
        valence: knowledgeItem.valence * transferSuccess,
        uncertainty: knowledgeItem.uncertainty * (1.2 - transferSuccess), // Increase uncertainty for transfers
        trustScore: knowledgeItem.trustScore * transferSuccess
      };

      this.thoughts.push(transferredThought);
      return transferSuccess;
    }

    return 0;
  }

  // Multi-agent belief synchronization
  synchronizeBeliefs(otherAgent: IrisAgent, beliefIds: string[]): number {
    let syncCount = 0;

    for (const beliefId of beliefIds) {
      const myBelief = this.thoughts.find(t => t.id === beliefId);
      const otherBelief = otherAgent.thoughts.find(t => t.id === beliefId);

      if (myBelief && otherBelief) {
        // Calculate belief similarity
        const similarity = this.calculateBeliefSimilarity(myBelief, otherBelief);

        if (similarity > 0.7) { // High similarity threshold
          // Update trust based on agreement
          const agreementBonus = similarity * 0.1;
          const currentTrust = this.trustDistribution.get(otherAgent.id) || 0.5;
          this.trustDistribution.set(otherAgent.id, Math.min(1, currentTrust + agreementBonus));

          syncCount++;
        }
      }
    }

    return syncCount / beliefIds.length; // Return synchronization ratio
  }

  // Calculate belief similarity
  private calculateBeliefSimilarity(belief1: Thought, belief2: Thought): number {
    // Simple similarity based on content overlap and valence agreement
    const contentSimilarity = this.calculateTextSimilarity(belief1.content, belief2.content);
    const valenceSimilarity = 1 - Math.abs((belief1.valence || 0) - (belief2.valence || 0));
    const uncertaintySimilarity = 1 - Math.abs((belief1.uncertainty || 0.5) - (belief2.uncertainty || 0.5));

    return (contentSimilarity + valenceSimilarity + uncertaintySimilarity) / 3;
  }

  // Calculate text similarity using simple word overlap
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  // Advanced uncertainty propagation
  propagateUncertainty(beliefId: string, context: WorkflowContext): number {
    const belief = this.thoughts.find(t => t.id === beliefId);
    if (!belief) return 0.5;

    let propagatedUncertainty = belief.uncertainty || 0.5;

    // Factor in metacognitive state
    const metacognitivePenalty = (1 - this.metacognitiveState.confidence) * 0.1;
    propagatedUncertainty += metacognitivePenalty;

    // Factor in epistemic network coherence
    const coherence = this.assessBeliefCoherence(beliefId);
    const coherencePenalty = (1 - coherence) * 0.1;
    propagatedUncertainty += coherencePenalty;

    // Factor in temporal decay
    const temporalDecay = this.calculateTemporalRelevance(belief.author || '');
    propagatedUncertainty += (1 - temporalDecay) * 0.05;

    return Math.min(1, Math.max(0, propagatedUncertainty));
  }

  // Get comprehensive agent analytics
  getComprehensiveAnalytics(): {
    totalThoughts: number;
    averageTrust: number;
    epistemicNetworkSize: number;
    metacognitiveState: typeof this.metacognitiveState;
    beliefRevisionRate: number;
    knowledgeTransferCapability: number;
    coherenceScore: number;
  } {
    const totalThoughts = this.thoughts.length;
    const averageTrust = Array.from(this.trustDistribution.values()).reduce((a, b) => a + b, 0) / Math.max(1, this.trustDistribution.size);
    const epistemicNetworkSize = Array.from(this.epistemicNetwork.values()).reduce((total, relations) => total + relations.size, 0);

    // Calculate belief revision rate (revisions per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentRevisions = this.beliefRevisionHistory.filter(r => r.timestamp > oneHourAgo).length;
    const beliefRevisionRate = recentRevisions;

    // Calculate overall coherence
    const coherenceScores = this.thoughts.map(t => this.assessBeliefCoherence(t.id || '')).filter(s => !isNaN(s));
    const coherenceScore = coherenceScores.length > 0 ? coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length : 0.5;

    return {
      totalThoughts,
      averageTrust,
      epistemicNetworkSize,
      metacognitiveState: { ...this.metacognitiveState },
      beliefRevisionRate,
      knowledgeTransferCapability: 0.8, // Simulated capability score
      coherenceScore
    };
  }
}

// FourThought Agent for dialectic process with advanced features
class FourThoughtAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  private llm: OpenAIClient;
  private topic: string;
  private thoughtLog: Thought[] = [];
  private beliefStaking: Map<string, number> = new Map(); // Track belief stakes
  private communityConsensus: Map<string, number> = new Map(); // Community agreement levels
  private dialecticHistory: Array<{thesis: Thought, antithesis: Thought, synthesis?: Thought, timestamp: string}> = [];
  private cognitiveBiases: Map<string, number> = new Map(); // Track and mitigate biases
  private argumentationFramework: Map<string, {premises: string[], conclusion: string, validity: number}> = new Map();
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    topic: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.topic = config.topic;
    
    // Ensure API key is set correctly
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    // Initialize the OpenAI client with the API key from environment variables
    this.llm = new OpenAIClient(process.env.OPENAI_API_KEY);
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`FourThoughtAgent ${this.name} processing input`);
    
    // Format the input appropriately
    const processedInput = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    
    // Prepare the system prompt
    const systemPrompt = `
You are implementing the FourThought protocol for dialectic reasoning and belief tracking.
The topic you are exploring is: ${this.topic}

The FourThought protocol generates four types of thoughts:
1. PREDICTIONS - future-oriented claims that can be verified later
2. REFLECTIONS - insights about past events or patterns
3. STATEMENTS - factual claims or observations
4. QUESTIONS - inquiries to guide further exploration

For each thought, also assess:
- Moral valence (-1 to 1, where -1 is morally problematic, 0 is neutral, 1 is morally positive)
- Uncertainty (0 to 1, where 0 is certain, 1 is highly uncertain)

Focus on generating thoughts that are coherent, insightful, and advance understanding of the topic.
`;
    
    // Create the user message that includes previous thoughts for context
    const recentThoughts = this.thoughtLog
      .slice(-5)
      .map(t => `[${t.type.toUpperCase()}] ${t.content} (Valence: ${t.valence}, Uncertainty: ${t.uncertainty})`)
      .join('\n');
    
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `
TOPIC: ${this.topic}

PREVIOUS THOUGHTS:
${recentThoughts || "No previous thoughts yet."}

NEW INPUT:
${processedInput}

Generate 2-3 thoughts in each FourThought category. Ensure they represent diverse perspectives and help advance understanding of the topic.

Format your response as JSON with the following structure:
{
  "predictions": [
    {"content": "string", "valence": number, "uncertainty": number},
    ...
  ],
  "reflections": [...],
  "statements": [...],
  "questions": [...]
}
` 
      }
    ];
    
    // Create the intermediates directory if it doesn't exist
    const intermediatesDir = path.join(context.config.OUTPUT_DIR || '', 'intermediates');
    fs.ensureDirSync(intermediatesDir);
    
    // Save the raw input to a file
    const inputFilename = `${this.id}_${Date.now()}_input.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, inputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        topic: this.topic,
        input: processedInput,
        recent_thoughts: recentThoughts
      }, null, 2)
    );
    
    const modelToUse = context.config.LLM_CONFIG.DEFAULT_MODEL;
    logger.info(`Using model ${modelToUse} for FourThought response`);
    
    const response = await this.llm.createChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: context.config.LLM_CONFIG.DEFAULT_MAX_TOKENS || 2000,
      model: modelToUse
    });
    
    const content = response.choices[0]?.message?.content || '';
    
    // Save the raw output to a file
    const outputFilename = `${this.id}_${Date.now()}_output.json`;
    fs.writeFileSync(
      path.join(intermediatesDir, outputFilename),
      JSON.stringify({ 
        agent: this.name,
        timestamp: new Date().toISOString(),
        raw_response: content
      }, null, 2)
    );
    
    // Parse the response
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```([\s\S]*?)```/) ||
                       [null, content];
      const jsonContent = jsonMatch[1] || content;
      
      // Parse the thoughts
      const thoughtCategories = JSON.parse(jsonContent);
      
      // Process all thoughts into a flat array
      const allThoughts: Thought[] = [];
      
      // Process each category
      for (const type of ['predictions', 'reflections', 'statements', 'questions']) {
        const typeThoughts = thoughtCategories[type] || [];
        for (const thought of typeThoughts) {
          allThoughts.push({
            type: type.substring(0, type.length - 1) as 'prediction' | 'reflection' | 'statement' | 'question',
            content: thought.content,
            valence: thought.valence,
            uncertainty: thought.uncertainty,
            timestamp: new Date().toISOString(),
            author: this.name
          });
        }
      }
      
      // Add the new thoughts to our log
      this.thoughtLog = [...this.thoughtLog, ...allThoughts];
      
      return {
        thoughts: thoughtCategories,
        all_thoughts: allThoughts,
        topic: this.topic,
        thought_count: allThoughts.length,
        __metadata: {
          model: modelToUse,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error(`Error processing FourThought response: ${error}`);
      return { 
        error: String(error),
        raw_content: content,
        __metadata: {
          model: modelToUse,
          input_file: inputFilename,
          output_file: outputFilename,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Stake a belief with confidence level
  stakeBelief(thoughtId: string, confidence: number): void {
    this.beliefStaking.set(thoughtId, Math.min(1, Math.max(0, confidence)));
  }

  // Update community consensus for a thought
  updateCommunityConsensus(thoughtId: string, agreement: number): void {
    const currentConsensus = this.communityConsensus.get(thoughtId) || 0.5;
    const alpha = 0.1; // Learning rate for consensus updates
    const newConsensus = (1 - alpha) * currentConsensus + alpha * agreement;
    this.communityConsensus.set(thoughtId, newConsensus);
  }

  // Advanced uncertainty quantification using multiple factors
  private calculateAdvancedUncertainty(thought: any): number {
    // Base uncertainty from the thought
    let uncertainty = thought.uncertainty || 0.5;

    // Factor in thought type - questions tend to be more uncertain
    const typeMultiplier = {
      'prediction': 1.0,
      'reflection': 0.9,
      'statement': 0.8,
      'question': 1.2
    };

    uncertainty *= typeMultiplier[thought.type] || 1.0;

    // Factor in community consensus - higher consensus = lower uncertainty
    const thoughtId = thought.id || `${thought.content}_${thought.timestamp}`;
    const consensus = this.communityConsensus.get(thoughtId) || 0.5;
    uncertainty *= (1 - consensus * 0.3); // Up to 30% reduction in uncertainty

    // Factor in belief staking - higher stakes = lower uncertainty
    const stake = this.beliefStaking.get(thoughtId) || 0.5;
    uncertainty *= (1 - stake * 0.2); // Up to 20% reduction in uncertainty

    return Math.min(1, Math.max(0, uncertainty));
  }

  // Multi-dimensional valence assessment
  private calculateMultidimensionalValence(thought: any): { moral: number; epistemic: number; pragmatic: number; aesthetic: number } {
    const baseValence = thought.valence || 0;

    // Moral valence - alignment with ethical principles
    const moralKeywords = ['ethical', 'moral', 'right', 'wrong', 'justice', 'fairness', 'harm', 'benefit'];
    const moralScore = this.calculateKeywordAlignment(thought.content, moralKeywords);

    // Epistemic valence - truth-seeking and knowledge value
    const epistemicKeywords = ['truth', 'knowledge', 'evidence', 'fact', 'understanding', 'learning'];
    const epistemicScore = this.calculateKeywordAlignment(thought.content, epistemicKeywords);

    // Pragmatic valence - practical utility and effectiveness
    const pragmaticKeywords = ['useful', 'practical', 'effective', 'solution', 'implementation', 'action'];
    const pragmaticScore = this.calculateKeywordAlignment(thought.content, pragmaticKeywords);

    // Aesthetic valence - beauty, elegance, and coherence
    const aestheticKeywords = ['beautiful', 'elegant', 'coherent', 'harmonious', 'inspiring', 'creative'];
    const aestheticScore = this.calculateKeywordAlignment(thought.content, aestheticKeywords);

    // Normalize scores
    const totalScore = moralScore + epistemicScore + pragmaticScore + aestheticScore;
    if (totalScore === 0) {
      return { moral: 0, epistemic: 0, pragmatic: 0, aesthetic: 0 };
    }

    return {
      moral: (moralScore / totalScore) * baseValence,
      epistemic: (epistemicScore / totalScore) * baseValence,
      pragmatic: (pragmaticScore / totalScore) * baseValence,
      aesthetic: (aestheticScore / totalScore) * baseValence
    };
  }

  // Calculate keyword alignment score
  private calculateKeywordAlignment(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        score += 1;
      }
    }

    // Normalize by content length and keyword count
    return score / Math.max(1, keywords.length);
  }

  // Get comprehensive thought analytics
  getThoughtAnalytics(): {
    totalThoughts: number;
    typeDistribution: Record<string, number>;
    averageUncertainty: number;
    averageValence: number;
    consensusDistribution: Record<string, number>;
    stakingDistribution: Record<string, number>;
  } {
    if (this.thoughtLog.length === 0) {
      return {
        totalThoughts: 0,
        typeDistribution: {},
        averageUncertainty: 0,
        averageValence: 0,
        consensusDistribution: {},
        stakingDistribution: {}
      };
    }

    const typeDistribution: Record<string, number> = {};
    let totalUncertainty = 0;
    let totalValence = 0;
    const consensusDistribution: Record<string, number> = {};
    const stakingDistribution: Record<string, number> = {};

    for (const thought of this.thoughtLog) {
      // Type distribution
      const type = thought.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;

      // Uncertainty and valence
      totalUncertainty += thought.uncertainty || 0.5;
      totalValence += thought.valence || 0;

      // Consensus distribution
      const thoughtId = thought.id || `${thought.content}_${thought.timestamp}`;
      const consensus = this.communityConsensus.get(thoughtId) || 0.5;
      const consensusBucket = this.getDistributionBucket(consensus);
      consensusDistribution[consensusBucket] = (consensusDistribution[consensusBucket] || 0) + 1;

      // Staking distribution
      const stake = this.beliefStaking.get(thoughtId) || 0.5;
      const stakeBucket = this.getDistributionBucket(stake);
      stakingDistribution[stakeBucket] = (stakingDistribution[stakeBucket] || 0) + 1;
    }

    return {
      totalThoughts: this.thoughtLog.length,
      typeDistribution,
      averageUncertainty: totalUncertainty / this.thoughtLog.length,
      averageValence: totalValence / this.thoughtLog.length,
      consensusDistribution,
      stakingDistribution
    };
  }

  // Helper method to create distribution buckets
  private getDistributionBucket(value: number): string {
    if (value < 0.2) return 'very_low';
    if (value < 0.4) return 'low';
    if (value < 0.6) return 'medium';
    if (value < 0.8) return 'high';
    return 'very_high';
  }

  // Dialectic synthesis process
  performDialecticSynthesis(thesisId: string, antithesisId: string): Thought | null {
    const thesis = this.thoughtLog.find(t => t.id === thesisId);
    const antithesis = this.thoughtLog.find(t => t.id === antithesisId);

    if (!thesis || !antithesis) return null;

    // Create synthesis through contradiction resolution
    const synthesisContent = `Synthesis of "${thesis.content.substring(0, 50)}..." and "${antithesis.content.substring(0, 50)}..."`;

    const synthesis: Thought = {
      type: 'statement',
      content: synthesisContent,
      author: this.name,
      timestamp: new Date().toISOString(),
      valence: (thesis.valence || 0 + antithesis.valence || 0) / 2,
      uncertainty: Math.max(thesis.uncertainty || 0.5, antithesis.uncertainty || 0.5) * 0.8 // Reduced uncertainty through synthesis
    };

    this.thoughtLog.push(synthesis);

    // Record the dialectic process
    this.dialecticHistory.push({
      thesis,
      antithesis,
      synthesis,
      timestamp: new Date().toISOString()
    });

    return synthesis;
  }

  // Cognitive bias detection and mitigation
  detectCognitiveBiases(thought: Thought): string[] {
    const biases: string[] = [];
    const content = thought.content.toLowerCase();

    // Confirmation bias detection
    if (content.includes('obviously') || content.includes('clearly') || content.includes('everyone knows')) {
      biases.push('confirmation_bias');
      this.updateBiasScore('confirmation_bias', 0.1);
    }

    // Anchoring bias detection
    if (content.includes('first') || content.includes('initial') || content.includes('starting point')) {
      biases.push('anchoring_bias');
      this.updateBiasScore('anchoring_bias', 0.1);
    }

    // Availability heuristic
    if (content.includes('recent') || content.includes('just happened') || content.includes('in the news')) {
      biases.push('availability_heuristic');
      this.updateBiasScore('availability_heuristic', 0.1);
    }

    return biases;
  }

  // Update bias tracking scores
  private updateBiasScore(biasType: string, increment: number): void {
    const currentScore = this.cognitiveBiases.get(biasType) || 0;
    this.cognitiveBiases.set(biasType, Math.min(1, currentScore + increment));
  }

  // Argumentation framework construction
  buildArgumentation(premises: string[], conclusion: string): { validity: number, strength: number } {
    const argumentId = `arg_${Date.now()}`;

    // Assess logical validity (simplified)
    const validity = this.assessLogicalValidity(premises, conclusion);

    // Assess argument strength based on premise quality
    const premiseStrength = premises.length * 0.2; // More premises = stronger argument
    const strength = Math.min(1, validity * 0.7 + premiseStrength * 0.3);

    this.argumentationFramework.set(argumentId, {
      premises,
      conclusion,
      validity
    });

    return { validity, strength };
  }

  // Assess logical validity (simplified implementation)
  private assessLogicalValidity(premises: string[], conclusion: string): number {
    // Simple keyword-based validity assessment
    const premiseKeywords = premises.join(' ').toLowerCase();
    const conclusionKeywords = conclusion.toLowerCase();

    let validityScore = 0.5; // Base validity

    // Check for logical indicators
    if (conclusionKeywords.includes('therefore') || conclusionKeywords.includes('thus') || conclusionKeywords.includes('hence')) {
      validityScore += 0.2;
    }

    // Check for premise support
    const premiseWords = new Set(premiseKeywords.split(/\s+/));
    const conclusionWords = new Set(conclusionKeywords.split(/\s+/));
    const overlap = new Set([...premiseWords].filter(x => conclusionWords.has(x)));

    validityScore += Math.min(0.3, overlap.size * 0.05);

    return Math.min(1, validityScore);
  }

  // Advanced uncertainty quantification using multiple factors
  private calculateAdvancedUncertainty(thought: any): number {
    // Base uncertainty from the thought
    let uncertainty = thought.uncertainty || 0.5;

    // Factor in thought type - questions tend to be more uncertain
    const typeMultiplier = {
      'prediction': 1.0,
      'reflection': 0.9,
      'statement': 0.8,
      'question': 1.2
    };

    uncertainty *= typeMultiplier[thought.type] || 1.0;

    // Factor in community consensus - higher consensus = lower uncertainty
    const thoughtId = thought.id || `${thought.content}_${thought.timestamp}`;
    const consensus = this.communityConsensus.get(thoughtId) || 0.5;
    uncertainty *= (1 - consensus * 0.3); // Up to 30% reduction in uncertainty

    // Factor in belief staking - higher stakes = lower uncertainty
    const stake = this.beliefStaking.get(thoughtId) || 0.5;
    uncertainty *= (1 - stake * 0.2); // Up to 20% reduction in uncertainty

    // Factor in cognitive biases - biases increase uncertainty
    const biases = this.detectCognitiveBiases(thought);
    uncertainty += biases.length * 0.1; // Penalty for detected biases

    return Math.min(1, Math.max(0, uncertainty));
  }

  // Multi-dimensional valence assessment
  private calculateMultidimensionalValence(thought: any): { moral: number; epistemic: number; pragmatic: number; aesthetic: number } {
    const baseValence = thought.valence || 0;

    // Moral valence - alignment with ethical principles
    const moralKeywords = ['ethical', 'moral', 'right', 'wrong', 'justice', 'fairness', 'harm', 'benefit', 'virtue', 'vice', 'duty', 'obligation'];
    const moralScore = this.calculateKeywordAlignment(thought.content, moralKeywords);

    // Epistemic valence - truth-seeking and knowledge value
    const epistemicKeywords = ['truth', 'knowledge', 'evidence', 'fact', 'understanding', 'learning', 'wisdom', 'insight', 'discovery', 'verification'];
    const epistemicScore = this.calculateKeywordAlignment(thought.content, epistemicKeywords);

    // Pragmatic valence - practical utility and effectiveness
    const pragmaticKeywords = ['useful', 'practical', 'effective', 'solution', 'implementation', 'action', 'outcome', 'result', 'efficiency', 'optimization'];
    const pragmaticScore = this.calculateKeywordAlignment(thought.content, pragmaticKeywords);

    // Aesthetic valence - beauty, elegance, and coherence
    const aestheticKeywords = ['beautiful', 'elegant', 'coherent', 'harmonious', 'inspiring', 'creative', 'artistic', 'symmetry', 'balance', 'grace'];
    const aestheticScore = this.calculateKeywordAlignment(thought.content, aestheticKeywords);

    // Normalize scores
    const totalScore = moralScore + epistemicScore + pragmaticScore + aestheticScore;
    if (totalScore === 0) {
      return { moral: 0, epistemic: 0, pragmatic: 0, aesthetic: 0 };
    }

    return {
      moral: (moralScore / totalScore) * baseValence,
      epistemic: (epistemicScore / totalScore) * baseValence,
      pragmatic: (pragmaticScore / totalScore) * baseValence,
      aesthetic: (aestheticScore / totalScore) * baseValence
    };
  }

  // Calculate keyword alignment score
  private calculateKeywordAlignment(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        score += 1;
      }
    }

    // Normalize by content length and keyword count
    return score / Math.max(1, keywords.length);
  }

  // Get comprehensive thought analytics
  getThoughtAnalytics(): {
    totalThoughts: number;
    typeDistribution: Record<string, number>;
    averageUncertainty: number;
    averageValence: number;
    consensusDistribution: Record<string, number>;
    stakingDistribution: Record<string, number>;
    dialecticCycles: number;
    biasPrevalence: Record<string, number>;
    argumentationStrength: number;
  } {
    if (this.thoughtLog.length === 0) {
      return {
        totalThoughts: 0,
        typeDistribution: {},
        averageUncertainty: 0,
        averageValence: 0,
        consensusDistribution: {},
        stakingDistribution: {},
        dialecticCycles: 0,
        biasPrevalence: {},
        argumentationStrength: 0
      };
    }

    const typeDistribution: Record<string, number> = {};
    let totalUncertainty = 0;
    let totalValence = 0;
    const consensusDistribution: Record<string, number> = {};
    const stakingDistribution: Record<string, number> = {};
    const biasPrevalence: Record<string, number> = {};

    for (const thought of this.thoughtLog) {
      // Type distribution
      const type = thought.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;

      // Uncertainty and valence
      totalUncertainty += thought.uncertainty || 0.5;
      totalValence += thought.valence || 0;

      // Consensus distribution
      const thoughtId = thought.id || `${thought.content}_${thought.timestamp}`;
      const consensus = this.communityConsensus.get(thoughtId) || 0.5;
      const consensusBucket = this.getDistributionBucket(consensus);
      consensusDistribution[consensusBucket] = (consensusDistribution[consensusBucket] || 0) + 1;

      // Staking distribution
      const stake = this.beliefStaking.get(thoughtId) || 0.5;
      const stakeBucket = this.getDistributionBucket(stake);
      stakingDistribution[stakeBucket] = (stakingDistribution[stakeBucket] || 0) + 1;

      // Bias prevalence
      const biases = this.detectCognitiveBiases(thought);
      biases.forEach(bias => {
        biasPrevalence[bias] = (biasPrevalence[bias] || 0) + 1;
      });
    }

    // Calculate argumentation strength
    const argumentStrengths = Array.from(this.argumentationFramework.values()).map(arg => arg.validity);
    const argumentationStrength = argumentStrengths.length > 0 ?
      argumentStrengths.reduce((a, b) => a + b, 0) / argumentStrengths.length : 0.5;

    return {
      totalThoughts: this.thoughtLog.length,
      typeDistribution,
      averageUncertainty: totalUncertainty / this.thoughtLog.length,
      averageValence: totalValence / this.thoughtLog.length,
      consensusDistribution,
      stakingDistribution,
      dialecticCycles: this.dialecticHistory.length,
      biasPrevalence,
      argumentationStrength
    };
  }
}

// SemanticLedgerAgent for managing the belief storage and retrieval with vector search
class SemanticLedgerAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  private ledgerPath: string;
  private thoughts: Thought[] = [];
  private vectorIndex: Map<string, number[]> = new Map(); // Simple vector index for semantic search
  private embeddingModel: any = null; // Placeholder for embedding model
  private knowledgeGraph: Map<string, Set<string>> = new Map(); // Entity-relationship graph
  private temporalIndex: Map<string, Thought[]> = new Map(); // Time-based indexing
  private domainClusters: Map<string, Thought[]> = new Map(); // Domain-based clustering
  private queryHistory: Array<{query: string, results: number, timestamp: string}> = [];
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    ledgerPath?: string;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.ledgerPath = config.ledgerPath || 'semantic_ledger';
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    const logger = context.logger;
    logger.info(`SemanticLedgerAgent ${this.name} processing input`);
    
    // Determine the operation to perform
    const operation = input.operation || 'query';
    
    // Create the ledger directory if it doesn't exist
    const ledgerDir = path.join(context.config.OUTPUT_DIR || '', this.ledgerPath);
    fs.ensureDirSync(ledgerDir);
    
    switch (operation) {
      case 'store':
        return this.storeThoughts(input.thoughts, ledgerDir, logger);
      case 'query':
        return this.queryThoughts(input.query, ledgerDir, logger);
      case 'update':
        return this.updateThought(input.thoughtId, input.updates, ledgerDir, logger);
      default:
        return { error: `Unknown operation: ${operation}` };
    }
  }
  
  private async storeThoughts(thoughts: Thought[], ledgerDir: string, logger: ILogger): Promise<any> {
    if (!Array.isArray(thoughts) || thoughts.length === 0) {
      return { error: 'No valid thoughts to store' };
    }
    
    // In a real implementation, we would store these in a vector DB
    // For this demo, we'll just write to a JSON file
    const ledgerFile = path.join(ledgerDir, `thoughts.json`);
    
    // Read existing thoughts if available
    let existingThoughts: Thought[] = [];
    if (fs.existsSync(ledgerFile)) {
      try {
        existingThoughts = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      } catch (e) {
        existingThoughts = [];
      }
    }
    
    // Add IDs to new thoughts if not present
    const thoughtsWithIds = thoughts.map(t => ({
      ...t,
      id: t.id || crypto.createHash('md5').update(`${t.content}${t.timestamp}${t.author}`).digest('hex')
    }));
    
    // Combine with existing thoughts
    const allThoughts = [...existingThoughts, ...thoughtsWithIds];
    
    // Write back to disk
    fs.writeFileSync(ledgerFile, JSON.stringify(allThoughts, null, 2));
    
    // Update our in-memory cache
    // Apply to 10-dynamic-o...
    this.thoughts = allThoughts;
    
    // Apply to 10-dynamic-o...
    return {
      status: 'success',
      stored_count: thoughts.length,
      total_thoughts: allThoughts.length,
      operation: 'store'
    };
  }
  
  private async queryThoughts(query: string, ledgerDir: string, logger: ILogger): Promise<any> {
    if (!query) {
      return { error: 'No query provided' };
    }
    
    // In a real implementation, we would do semantic search
    // For this demo, we'll just do basic text matching
    const ledgerFile = path.join(ledgerDir, `thoughts.json`);
    
    // Read thoughts if available
    let thoughts: Thought[] = [];
    if (fs.existsSync(ledgerFile)) {
      try {
        thoughts = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
        // Cache the thoughts for future use
        this.thoughts = thoughts;
      } catch (e) {
        thoughts = [];
      }
    } else if (this.thoughts.length > 0) {
      // Use cached thoughts if file doesn't exist
      thoughts = this.thoughts;
    }
    
    // Simple search function
    const searchTerms = query.toLowerCase().split(' ');
    const matchingThoughts = thoughts.filter(thought => {
      const content = thought.content.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    });
    
    // Apply to 10-dynamic-o...
    return {
      status: 'success',
      query: query,
      results_count: matchingThoughts.length,
      results: matchingThoughts,
      operation: 'query'
    };
  }
  
  private async updateThought(thoughtId: string, updates: Partial<Thought>, ledgerDir: string, logger: ILogger): Promise<any> {
    if (!thoughtId) {
      return { error: 'No thought ID provided' };
    }
    
    const ledgerFile = path.join(ledgerDir, `thoughts.json`);
    
    // Read thoughts if available
    let thoughts: Thought[] = [];
    if (fs.existsSync(ledgerFile)) {
      try {
        thoughts = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      } catch (e) {
        thoughts = [];
      }
    } else if (this.thoughts.length > 0) {
      // Use cached thoughts if file doesn't exist
      thoughts = this.thoughts;
    }
    
    // Find the thought to update
    const thoughtIndex = thoughts.findIndex(t => t.id === thoughtId); // id is now optional but check should work
    if (thoughtIndex === -1) {
      return { error: `Thought with ID ${thoughtId} not found` };
    }
    
    // Update the thought
    thoughts[thoughtIndex] = {
      ...thoughts[thoughtIndex],
      ...updates
    };
    
    // Write back to disk
    fs.writeFileSync(ledgerFile, JSON.stringify(thoughts, null, 2));
    
    // Update our in-memory cache
    // Apply to 10-dynamic-o...
    this.thoughts = thoughts;
    
    // Apply to 10-dynamic-o... // Added this line as it wasn't explicitly requested but seems implied by the pattern for updateThought
    return {
      status: 'success',
      updated_thought: thoughts[thoughtIndex],
      operation: 'update'
    };
  }

  // Generate embedding for a thought (simplified implementation)
  private generateEmbedding(text: string): number[] {
    // Simple TF-IDF style embedding based on word frequencies
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};

    // Count word frequencies
    for (const word of words) {
      if (word.length > 2) { // Skip very short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    // Create a simple 100-dimensional embedding
    const embedding: number[] = new Array(100).fill(0);

    // Use a simple hash function to map words to embedding dimensions
    for (const [word, freq] of Object.entries(wordFreq)) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }

      const dimension = Math.abs(hash) % 100;
      embedding[dimension] += freq;
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Perform semantic search on stored thoughts
  private async semanticSearch(query: string, limit: number = 10): Promise<Thought[]> {
    const queryEmbedding = this.generateEmbedding(query);

    // Calculate similarity scores for all stored thoughts
    const similarities: Array<{ thought: Thought; similarity: number }> = [];

    for (const thought of this.thoughts) {
      const thoughtEmbedding = this.vectorIndex.get(thought.id || '');
      if (thoughtEmbedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, thoughtEmbedding);
        similarities.push({ thought, similarity });
      }
    }

    // Sort by similarity and return top results
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, limit).map(item => item.thought);
  }

  // Advanced query processing with semantic search
  private async processAdvancedQuery(query: string, ledgerDir: string, logger: ILogger): Promise<any> {
    // Extract search terms and intent
    const searchTerms = this.extractSearchTerms(query);
    const intent = this.analyzeQueryIntent(query);

    logger.info(`Processing advanced query: ${query}`);
    logger.info(`Search terms: ${searchTerms.join(', ')}`);
    logger.info(`Detected intent: ${intent}`);

    // Perform both keyword and semantic search
    const keywordResults = this.keywordSearch(query);
    const semanticResults = await this.semanticSearch(query, 20);

    // Combine and rank results
    const combinedResults = this.combineSearchResults(keywordResults, semanticResults, intent);

    return {
      status: 'success',
      query: query,
      search_terms: searchTerms,
      intent: intent,
      keyword_results_count: keywordResults.length,
      semantic_results_count: semanticResults.length,
      combined_results_count: combinedResults.length,
      results: combinedResults,
      operation: 'advanced_query'
    };
  }

  // Extract search terms from query
  private extractSearchTerms(query: string): string[] {
    // Simple extraction - in a real implementation, this would use NLP
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5); // Limit to 5 terms
  }

  // Analyze query intent
  private analyzeQueryIntent(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('prediction') || lowerQuery.includes('future')) {
      return 'predictive';
    }
    if (lowerQuery.includes('why') || lowerQuery.includes('cause') || lowerQuery.includes('reason')) {
      return 'explanatory';
    }
    if (lowerQuery.includes('how') || lowerQuery.includes('method') || lowerQuery.includes('approach')) {
      return 'procedural';
    }
    if (lowerQuery.includes('what') || lowerQuery.includes('definition') || lowerQuery.includes('meaning')) {
      return 'definitional';
    }
    if (lowerQuery.includes('ethical') || lowerQuery.includes('moral') || lowerQuery.includes('should')) {
      return 'normative';
    }

    return 'general';
  }

  // Keyword search implementation
  private keywordSearch(query: string): Thought[] {
    const searchTerms = query.toLowerCase().split(' ');
    return this.thoughts.filter(thought => {
      const content = thought.content.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    });
  }

  // Combine search results intelligently
  private combineSearchResults(keywordResults: Thought[], semanticResults: Thought[], intent: string): Thought[] {
    const combined = new Map<string, Thought>();

    // Add keyword results with higher weight
    for (const thought of keywordResults) {
      const id = thought.id || `${thought.content}_${thought.timestamp}`;
      combined.set(id, thought);
    }

    // Add semantic results that aren't already included
    for (const thought of semanticResults) {
      const id = thought.id || `${thought.content}_${thought.timestamp}`;
      if (!combined.has(id)) {
        combined.set(id, thought);
      }
    }

    // Convert back to array and limit results
    return Array.from(combined.values()).slice(0, 15);
  }

  // Store thought with embedding
  private async storeThoughtWithEmbedding(thought: Thought, ledgerDir: string, logger: ILogger): Promise<void> {
    // Generate embedding for the thought
    const embedding = this.generateEmbedding(thought.content);

    // Store the embedding in the index
    const thoughtId = thought.id || crypto.createHash('md5').update(`${thought.content}${thought.timestamp}${thought.author}`).digest('hex');
    this.vectorIndex.set(thoughtId, embedding);

    // Add ID to thought if not present
    const thoughtWithId = { ...thought, id: thoughtId };

    // Store in the ledger file
    const ledgerFile = path.join(ledgerDir, `thoughts.json`);

    let existingThoughts: Thought[] = [];
    if (fs.existsSync(ledgerFile)) {
      try {
        existingThoughts = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      } catch (e) {
        existingThoughts = [];
      }
    }

    const allThoughts = [...existingThoughts, thoughtWithId];
    fs.writeFileSync(ledgerFile, JSON.stringify(allThoughts, null, 2));

    // Update in-memory cache
    this.thoughts = allThoughts;

    logger.info(`Stored thought with embedding: ${thoughtId}`);
  }

  // Knowledge graph construction and entity extraction
  private buildKnowledgeGraph(thought: Thought): void {
    // Simple entity extraction (in a real implementation, this would use NLP)
    const entities = this.extractEntities(thought.content);

    for (const entity of entities) {
      if (!this.knowledgeGraph.has(entity)) {
        this.knowledgeGraph.set(entity, new Set());
      }

      // Connect to related entities (simplified)
      entities.forEach(relatedEntity => {
        if (entity !== relatedEntity) {
          this.knowledgeGraph.get(entity)?.add(relatedEntity);
        }
      });
    }
  }

  // Entity extraction (simplified implementation)
  private extractEntities(content: string): string[] {
    // Simple extraction based on capitalization and common patterns
    const words = content.split(/\s+/);
    const entities: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check for proper nouns (capitalized words)
      if (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 2) {
        entities.push(word);
      }

      // Check for domain-specific terms
      if (word.toLowerCase().includes('climate') || word.toLowerCase().includes('ai') || word.toLowerCase().includes('policy')) {
        entities.push(word);
      }
    }

    return [...new Set(entities)]; // Remove duplicates
  }

  // Temporal indexing for time-based queries
  private updateTemporalIndex(thought: Thought): void {
    const date = new Date(thought.timestamp);
    const timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!this.temporalIndex.has(timeKey)) {
      this.temporalIndex.set(timeKey, []);
    }

    this.temporalIndex.get(timeKey)?.push(thought);
  }

  // Domain clustering for topic-based organization
  private updateDomainClusters(thought: Thought): void {
    const domains = this.classifyThoughtDomain(thought);

    for (const domain of domains) {
      if (!this.domainClusters.has(domain)) {
        this.domainClusters.set(domain, []);
      }

      this.domainClusters.get(domain)?.push(thought);
    }
  }

  // Domain classification (simplified)
  private classifyThoughtDomain(thought: Thought): string[] {
    const content = thought.content.toLowerCase();
    const domains: string[] = [];

    if (content.includes('climate') || content.includes('environment') || content.includes('weather')) {
      domains.push('climate_science');
    }

    if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
      domains.push('artificial_intelligence');
    }

    if (content.includes('policy') || content.includes('governance') || content.includes('regulation')) {
      domains.push('policy_governance');
    }

    if (content.includes('ethics') || content.includes('moral') || content.includes('values')) {
      domains.push('ethics_philosophy');
    }

    if (content.includes('technology') || content.includes('innovation') || content.includes('digital')) {
      domains.push('technology_innovation');
    }

    return domains.length > 0 ? domains : ['general'];
  }

  // Advanced semantic search with multiple strategies
  private async advancedSemanticSearch(query: string, options: {
    limit?: number;
    threshold?: number;
    includeRelated?: boolean;
    timeRange?: { start: string; end: string };
    domains?: string[];
  } = {}): Promise<{
    results: Thought[];
    strategy: string;
    relatedEntities: string[];
    queryMetadata: any;
  }> {
    const { limit = 10, threshold = 0.3, includeRelated = false, timeRange, domains } = options;

    // Strategy 1: Vector similarity search
    const vectorResults = await this.vectorSimilaritySearch(query, limit);

    // Strategy 2: Keyword-based search
    const keywordResults = this.keywordSearch(query);

    // Strategy 3: Entity-based search
    const entityResults = this.entitySearch(query);

    // Combine results with scoring
    const combinedResults = this.combineSearchStrategies(vectorResults, keywordResults, entityResults);

    // Apply filters
    let filteredResults = combinedResults;

    if (timeRange) {
      filteredResults = filteredResults.filter(thought =>
        thought.timestamp >= timeRange.start && thought.timestamp <= timeRange.end
      );
    }

    if (domains && domains.length > 0) {
      filteredResults = filteredResults.filter(thought => {
        const thoughtDomains = this.classifyThoughtDomain(thought);
        return domains.some(domain => thoughtDomains.includes(domain));
      });
    }

    // Extract related entities if requested
    const relatedEntities: string[] = [];
    if (includeRelated) {
      const queryEntities = this.extractEntities(query);
      queryEntities.forEach(entity => {
        const connections = this.knowledgeGraph.get(entity);
        if (connections) {
          relatedEntities.push(...Array.from(connections));
        }
      });
    }

    return {
      results: filteredResults.slice(0, limit),
      strategy: 'hybrid_vector_keyword_entity',
      relatedEntities: [...new Set(relatedEntities)],
      queryMetadata: {
        vectorMatches: vectorResults.length,
        keywordMatches: keywordResults.length,
        entityMatches: entityResults.length,
        filtersApplied: { timeRange: !!timeRange, domains: domains?.length || 0 }
      }
    };
  }

  // Vector similarity search implementation
  private async vectorSimilaritySearch(query: string, limit: number): Promise<Thought[]> {
    const queryEmbedding = this.generateEmbedding(query);

    const similarities: Array<{ thought: Thought; similarity: number }> = [];

    for (const thought of this.thoughts) {
      const thoughtEmbedding = this.vectorIndex.get(thought.id || '');
      if (thoughtEmbedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, thoughtEmbedding);
        if (similarity > 0.3) { // Threshold for relevance
          similarities.push({ thought, similarity });
        }
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.thought);
  }

  // Keyword search implementation
  private keywordSearch(query: string): Thought[] {
    const searchTerms = query.toLowerCase().split(' ');
    return this.thoughts.filter(thought => {
      const content = thought.content.toLowerCase();
      return searchTerms.some(term => content.includes(term));
    });
  }

  // Entity-based search
  private entitySearch(query: string): Thought[] {
    const queryEntities = this.extractEntities(query);
    const results: Thought[] = [];

    for (const entity of queryEntities) {
      // Find thoughts that mention this entity
      const entityThoughts = this.thoughts.filter(thought =>
        thought.content.toLowerCase().includes(entity.toLowerCase())
      );
      results.push(...entityThoughts);
    }

    return [...new Set(results)]; // Remove duplicates
  }

  // Combine search strategies
  private combineSearchStrategies(vectorResults: Thought[], keywordResults: Thought[], entityResults: Thought[]): Thought[] {
    const combined = new Map<string, Thought>();
    const scores = new Map<string, number>();

    // Add vector results with high weight
    vectorResults.forEach((thought, index) => {
      const id = thought.id || `${thought.content}_${thought.timestamp}`;
      combined.set(id, thought);
      scores.set(id, (scores.get(id) || 0) + (1 - index * 0.1)); // Decay by position
    });

    // Add keyword results with medium weight
    keywordResults.forEach((thought, index) => {
      const id = thought.id || `${thought.content}_${thought.timestamp}`;
      if (combined.has(id)) {
        scores.set(id, (scores.get(id) || 0) + 0.5 - index * 0.05);
      } else {
        combined.set(id, thought);
        scores.set(id, 0.5 - index * 0.05);
      }
    });

    // Add entity results with low weight
    entityResults.forEach((thought, index) => {
      const id = thought.id || `${thought.content}_${thought.timestamp}`;
      if (combined.has(id)) {
        scores.set(id, (scores.get(id) || 0) + 0.3 - index * 0.03);
      } else {
        combined.set(id, thought);
        scores.set(id, 0.3 - index * 0.03);
      }
    });

    // Sort by combined scores
    return Array.from(combined.values())
      .sort((a, b) => {
        const scoreA = scores.get(a.id || `${a.content}_${a.timestamp}`) || 0;
        const scoreB = scores.get(b.id || `${b.content}_${b.timestamp}`) || 0;
        return scoreB - scoreA;
      });
  }

  // Query analytics and performance tracking
  private recordQuery(query: string, results: number): void {
    this.queryHistory.push({
      query,
      results,
      timestamp: new Date().toISOString()
    });

    // Keep only recent queries (last 1000)
    if (this.queryHistory.length > 1000) {
      this.queryHistory = this.queryHistory.slice(-500);
    }
  }

  // Get query analytics
  getQueryAnalytics(): {
    totalQueries: number;
    averageResultsPerQuery: number;
    popularQueryPatterns: Array<{pattern: string, frequency: number}>;
    querySuccessRate: number;
  } {
    if (this.queryHistory.length === 0) {
      return {
        totalQueries: 0,
        averageResultsPerQuery: 0,
        popularQueryPatterns: [],
        querySuccessRate: 0
      };
    }

    const totalQueries = this.queryHistory.length;
    const totalResults = this.queryHistory.reduce((sum, q) => sum + q.results, 0);
    const averageResultsPerQuery = totalResults / totalQueries;

    // Analyze query patterns
    const queryPatterns = new Map<string, number>();
    this.queryHistory.forEach(q => {
      const pattern = this.categorizeQuery(q.query);
      queryPatterns.set(pattern, (queryPatterns.get(pattern) || 0) + 1);
    });

    const popularQueryPatterns = Array.from(queryPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, frequency]) => ({ pattern, frequency }));

    const querySuccessRate = this.queryHistory.filter(q => q.results > 0).length / totalQueries;

    return {
      totalQueries,
      averageResultsPerQuery,
      popularQueryPatterns,
      querySuccessRate
    };
  }

  // Categorize query patterns
  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('prediction') || lowerQuery.includes('future') || lowerQuery.includes('forecast')) {
      return 'predictive';
    }
    if (lowerQuery.includes('why') || lowerQuery.includes('cause') || lowerQuery.includes('reason')) {
      return 'explanatory';
    }
    if (lowerQuery.includes('how') || lowerQuery.includes('method') || lowerQuery.includes('approach')) {
      return 'procedural';
    }
    if (lowerQuery.includes('what') || lowerQuery.includes('definition') || lowerQuery.includes('meaning')) {
      return 'definitional';
    }
    if (lowerQuery.includes('ethical') || lowerQuery.includes('moral') || lowerQuery.includes('should')) {
      return 'normative';
    }

    return 'general';
  }

  // Enhanced store method with advanced indexing
  private async storeThoughtWithAdvancedIndexing(thought: Thought, ledgerDir: string, logger: ILogger): Promise<void> {
    // Generate embedding for the thought
    const embedding = this.generateEmbedding(thought.content);

    // Store the embedding in the index
    const thoughtId = thought.id || crypto.createHash('md5').update(`${thought.content}${thought.timestamp}${thought.author}`).digest('hex');
    this.vectorIndex.set(thoughtId, embedding);

    // Add ID to thought if not present
    const thoughtWithId = { ...thought, id: thoughtId };

    // Build knowledge graph
    this.buildKnowledgeGraph(thoughtWithId);

    // Update temporal index
    this.updateTemporalIndex(thoughtWithId);

    // Update domain clusters
    this.updateDomainClusters(thoughtWithId);

    // Store in the ledger file
    const ledgerFile = path.join(ledgerDir, `thoughts.json`);

    let existingThoughts: Thought[] = [];
    if (fs.existsSync(ledgerFile)) {
      try {
        existingThoughts = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      } catch (e) {
        existingThoughts = [];
      }
    }

    const allThoughts = [...existingThoughts, thoughtWithId];
    fs.writeFileSync(ledgerFile, JSON.stringify(allThoughts, null, 2));

    // Update in-memory cache
    this.thoughts = allThoughts;

    logger.info(`Stored thought with advanced indexing: ${thoughtId}`);
}

// Trust visualization agent
class TrustVisualizationAgent implements Agent {
  id: string;
  name: string;
  unitId: string;
  unitName: string;
  description: string;
  visualizationType: 'network' | 'timeline' | 'heatmap';
  
  constructor(config: {
    id: string;
    name: string;
    unitId: string;
    unitName: string;
    description: string;
    visualizationType: 'network' | 'timeline' | 'heatmap';
  }) {
    this.id = config.id;
    this.name = config.name;
    this.unitId = config.unitId;
    this.unitName = config.unitName;
    this.description = config.description;
    this.visualizationType = config.visualizationType;
  }
  
  async process(input: any, context: WorkflowContext): Promise<any> {
    context.logger.info(`TrustVisualizationAgent ${this.name} generating ${this.visualizationType}`);
    
    const visualizationId = `trust_viz_${this.id}_${Date.now()}`;
    
    // Get the output directory from the context's config
    const runOutputDir = context.config.OUTPUT_DIR || outputDir;
    const visualizationsDir = path.join(runOutputDir, 'visualizations');
    
    // Ensure the visualizations directory exists
    fs.ensureDirSync(visualizationsDir);
    
    const outputFile = path.join(visualizationsDir, `${visualizationId}.html`);
    
    // Generate visualization based on the type
    let htmlContent = '';
    
    switch (this.visualizationType) {
      case 'network':
        htmlContent = this.generateNetworkVisualization(input, visualizationId);
        break;
      case 'timeline':
        htmlContent = this.generateTimelineVisualization(input, visualizationId);
        break;
      case 'heatmap':
        htmlContent = this.generateHeatmapVisualization(input, visualizationId);
        break;
    }
    
    // Write the visualization to the file
    try {
      fs.writeFileSync(outputFile, htmlContent);
      context.logger.info(`Created trust visualization file: ${outputFile}`);
    } catch (error) {
      context.logger.error(`Failed to write visualization file: ${error}`);
    }
    
    return {
      visualization_id: visualizationId,
      visualization_type: this.visualizationType,
      visualization_path: outputFile,
      html_content: htmlContent,
    };
  }
  
  private generateNetworkVisualization(input: any, visualizationId: string): string {
    // Extract sources and their relationships
    const sources = input.sources || [];
    const thoughts = input.thoughts || [];
    const trustValues = input.trust_distribution || {};
    
    // Prepare nodes and links for visualization
    const nodes = sources.map((source: SourceEmbedding) => ({
      id: source.id,
      label: source.name,
      value: trustValues[source.id] || 0.5,
      title: `${source.name}<br/>Reliability: ${source.reliability}<br/>Trust: ${(trustValues[source.id] || 0.5).toFixed(2)}`
    }));
    
    // Add thought nodes
    const thoughtNodes = thoughts.slice(0, 20).map((thought: Thought) => ({
      id: `thought_${thoughts.indexOf(thought)}`,
      label: thought.content.substring(0, 20) + '...',
      group: thought.type,
      value: thought.trustScore || 0.5,
      title: `${thought.type}: ${thought.content}<br/>Valence: ${thought.valence}<br/>Uncertainty: ${thought.uncertainty}`
    }));
    
    // Create links between thoughts and sources
    const links: any[] = []; // Use any[] for links temporarily to resolve complex type issue
    for (let i = 0; i < thoughts.length && i < 20; i++) {
      const thought = thoughts[i];
      // Link to the author source if it exists
      const authorSource = sources.find((s: SourceEmbedding) => s.name === thought.author);
      if (authorSource) {
        links.push({
          from: authorSource.id,
          to: `thought_${i}`,
          value: thought.trustScore || 0.5,
          title: `Trust: ${(thought.trustScore || 0.5).toFixed(2)}`
        });
      }
    }
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Cognicism Trust Network</title>
  <script src="https://cdn.jsdelivr.net/npm/vis-network@9.1.2/dist/vis-network.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    #network_${visualizationId} { height: 600px; width: 100%; }
    .header { padding: 10px 20px; background: #f2f2f2; }
    .controls { padding: 10px; background: #f9f9f9; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Cognicism Trust Network</h1>
    <p>Visualization of sources, thoughts, and trust relationships</p>
  </div>
  <div class="controls">
    <button id="zoomIn">Zoom In</button>
    <button id="zoomOut">Zoom Out</button>
    <button id="stabilize">Stabilize</button>
  </div>
  <div id="network_${visualizationId}"></div>
  <script>
    // Create nodes and edges datasets
    const nodes = new vis.DataSet(${JSON.stringify([...nodes, ...thoughtNodes])});
    const edges = new vis.DataSet(${JSON.stringify(links)});
    
    // Create the network
    const container = document.getElementById('network_${visualizationId}');
    const data = { nodes, edges };
    const options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 10,
          max: 30,
          label: { enabled: true }
        },
        font: { size: 12 }
      },
      edges: {
        width: 1,
        color: { inherit: 'from' },
        smooth: { type: 'continuous' }
      },
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -80000, springConstant: 0.001, springLength: 200 }
      },
      groups: {
        prediction: { color: { background: '#90CAF9', border: '#42A5F5' } },
        reflection: { color: { background: '#A5D6A7', border: '#66BB6A' } },
        statement: { color: { background: '#FFCC80', border: '#FFA726' } },
        question: { color: { background: '#CE93D8', border: '#AB47BC' } }
      },
      interaction: { hover: true, tooltipDelay: 300 }
    };
    const network = new vis.Network(container, data, options);
    
    // Add controls functionality
    document.getElementById('zoomIn').addEventListener('click', function() {
      network.moveTo({ scale: network.getScale() * 1.2 });
    });
    document.getElementById('zoomOut').addEventListener('click', function() {
      network.moveTo({ scale: network.getScale() * 0.8 });
    });
    document.getElementById('stabilize').addEventListener('click', function() {
      network.stabilize();
    });
    
    // Add animation for trust changes
    setInterval(() => {
      const nodeIds = nodes.getIds();
      if (nodeIds.length > 0) {
        const randomNode = nodeIds[Math.floor(Math.random() * nodeIds.length)];
        const node = nodes.get(randomNode);
        if (node.value !== undefined) {
          // Slightly adjust trust values for animation effect
          const newValue = Math.max(0.1, Math.min(1.0, node.value + (Math.random() * 0.1 - 0.05)));
          nodes.update({ id: randomNode, value: newValue });
        }
      }
    }, 2000);
  </script>
</body>
</html>`;
  }
  
  private generateTimelineVisualization(input: any, visualizationId: string): string {
    // Extract thoughts for the timeline
    const thoughts = input.all_thoughts || input.thoughts || [];
    
    // Prepare items for the timeline visualization
    const timelineItems = thoughts.map((thought: Thought, index: number) => {
      const date = new Date(thought.timestamp);
      const currentValence = thought.valence ?? 0; // Default to 0 if undefined
      const valenceColor = currentValence > 0.3 ? '#4CAF50' : 
                         currentValence < -0.3 ? '#F44336' : '#9E9E9E';
      const typeIcon = 
        thought.type === 'prediction' ? '🔮' :
        thought.type === 'reflection' ? '🔍' :
        thought.type === 'statement' ? '📝' :
        thought.type === 'question' ? '❓' : '📌';
      
      return {
        id: index,
        content: `${typeIcon} ${thought.content}`,
        start: date,
        title: `Type: ${thought.type}<br/>Author: ${thought.author}<br/>Valence: ${thought.valence}<br/>Uncertainty: ${thought.uncertainty}`,
        style: `color: ${valenceColor}; border-color: ${valenceColor};`
      };
    });
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Cognicism Thought Timeline</title>
  <script src="https://cdn.jsdelivr.net/npm/vis-timeline@7.7.0/dist/vis-timeline-graph2d.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/vis-timeline@7.7.0/dist/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    #timeline_${visualizationId} { height: 600px; width: 100%; }
    .header { padding: 10px 20px; background: #f2f2f2; }
    .controls { padding: 10px; background: #f9f9f9; border-bottom: 1px solid #ddd; }
    .legend { padding: 10px; display: flex; gap: 15px; background: #f9f9f9; }
    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-color { width: 12px; height: 12px; border-radius: 50%; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Cognicism Thought Timeline</h1>
    <p>Chronological visualization of thoughts in the FourThought protocol</p>
  </div>
  <div class="legend">
    <div class="legend-item"><div class="legend-color" style="background: #4CAF50;"></div> Positive Valence</div>
    <div class="legend-item"><div class="legend-color" style="background: #9E9E9E;"></div> Neutral Valence</div>
    <div class="legend-item"><div class="legend-color" style="background: #F44336;"></div> Negative Valence</div>
    <div class="legend-item">🔮 Prediction</div>
    <div class="legend-item">🔍 Reflection</div>
    <div class="legend-item">📝 Statement</div>
    <div class="legend-item">❓ Question</div>
  </div>
  <div class="controls">
    <button id="zoomIn">Zoom In</button>
    <button id="zoomOut">Zoom Out</button>
    <button id="moveLeft">← Move Left</button>
    <button id="moveRight">Move Right →</button>
  </div>
  <div id="timeline_${visualizationId}"></div>
  <script>
    // Create timeline dataset
    const items = new vis.DataSet(${JSON.stringify(timelineItems)});
    
    // Create the timeline
    const container = document.getElementById('timeline_${visualizationId}');
    const options = {
      height: '500px',
      min: new Date(Date.now() - 86400000), // 24 hours ago
      max: new Date(Date.now() + 3600000),  // 1 hour in the future
      zoomMin: 60000, // 1 minute
      zoomMax: 31536000000, // 1 year
      showCurrentTime: true,
      showTooltips: true,
      stack: true
    };
    const timeline = new vis.Timeline(container, items, options);
    
    // Add animation for new thoughts
    let thoughtCount = ${thoughts.length};
    setInterval(() => {
      // Occasionally add a new animated thought for visual effect
      if (Math.random() > 0.7) {
        const types = ['prediction', 'reflection', 'statement', 'question'];
        const type = types[Math.floor(Math.random() * types.length)];
        const valence = parseFloat((Math.random() * 2 - 1).toFixed(2)); // Ensure valence is a number
        const valenceColor = valence > 0.3 ? '#4CAF50' : 
                            valence < -0.3 ? '#F44336' : '#9E9E9E';
        const typeIcon = 
          type === 'prediction' ? '🔮' :
          type === 'reflection' ? '🔍' :
          type === 'statement' ? '📝' :
          type === 'question' ? '❓' : '📌';
        
        const newThought = {
          id: thoughtCount++,
          content: typeIcon + ' [Animated] New ' + type, // Corrected template literal usage
          start: new Date(),
          title: 'Type: ' + type + '<br/>Valence: ' + valence + '<br/>Uncertainty: ' + (Math.random()).toFixed(2), // Corrected template literal usage
          style: 'color: ' + valenceColor + '; border-color: ' + valenceColor + '; font-weight: bold;', // Corrected template literal usage
          className: 'animated-thought'
        };
        
        items.add(newThought);
        timeline.fit();
      }
    }, 5000);
    
    // Add controls functionality
    document.getElementById('zoomIn').addEventListener('click', function() {
      timeline.zoomIn(0.5);
    });
    document.getElementById('zoomOut').addEventListener('click', function() {
      timeline.zoomOut(0.5);
    });
    document.getElementById('moveLeft').addEventListener('click', function() {
      const window = timeline.getWindow();
      const interval = window.end - window.start;
      timeline.setWindow(window.start - interval * 0.3, window.end - interval * 0.3);
    });
    document.getElementById('moveRight').addEventListener('click', function() {
      const window = timeline.getWindow();
      const interval = window.end - window.start;
      timeline.setWindow(window.start + interval * 0.3, window.end + interval * 0.3);
    });
  </script>
</body>
</html>`;
  }
  
  private generateHeatmapVisualization(input: any, visualizationId: string): string {
    // Extract trust values for the heatmap
    const trustDistribution = input.trust_distribution || {};
    const sources = input.sources || [];
    const thoughts = input.thoughts || [];
    
    // Prepare data for the heatmap
    const sourceNames = sources.map((s: SourceEmbedding) => s.name);
    const trustValues = sources.map((s: SourceEmbedding) => ({
      source: s.name,
      trust: trustDistribution[s.id] || 0.5
    }));
    
    // Prepare data for thought patterns heatmap
    const thoughtTypeCount = {
      prediction: { high: 0, medium: 0, low: 0 },
      reflection: { high: 0, medium: 0, low: 0 },
      statement: { high: 0, medium: 0, low: 0 },
      question: { high: 0, medium: 0, low: 0 }
    };
    
    // Count thoughts by type and uncertainty
    thoughts.forEach((t: Thought) => {
      if (!t.type) return;
      
      const currentUncertainty = t.uncertainty ?? 0.5; // Default to 0.5 if undefined
      const uncertaintyLevel = 
        currentUncertainty < 0.3 ? 'high' :
        currentUncertainty > 0.7 ? 'low' : 'medium';
      
      thoughtTypeCount[t.type][uncertaintyLevel]++;
    });
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Cognicism Trust Heatmap</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@1.2.0/dist/chartjs-chart-matrix.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
    .chart-container { flex: 1; min-width: 300px; height: 400px; }
    .header { padding: 10px 20px; background: #f2f2f2; }
    .legend { padding: 10px; margin-bottom: 20px; background: #f9f9f9; }
    .animation-controls { padding: 10px; background: #f9f9f9; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Cognicism Trust and Uncertainty Heatmaps</h1>
    <p>Visualization of trust distribution and thought patterns</p>
  </div>
  
  <div class="container">
    <div class="chart-container">
      <h2>Source Trust Distribution</h2>
      <canvas id="trustChart_${visualizationId}"></canvas>
    </div>
    <div class="chart-container">
      <h2>Thought Patterns by Type and Uncertainty</h2>
      <canvas id="thoughtChart_${visualizationId}"></canvas>
    </div>
  </div>
  
  <div class="animation-controls">
    <button id="animateButton">Animate Trust Changes</button>
    <button id="resetButton">Reset Animation</button>
  </div>
  
  <script>
    // Create Source Trust Chart
    const trustCtx = document.getElementById('trustChart_${visualizationId}').getContext('2d');
    const trustData = ${JSON.stringify(trustValues)};
    
    const trustChart = new Chart(trustCtx, {
      type: 'bar',
      data: {
        labels: trustData.map(d => d.source),
        datasets: [{
          label: 'Trust Score',
          data: trustData.map(d => d.trust),
          backgroundColor: trustData.map(d => {
            const r = Math.round(255 * (1 - d.trust));
            const g = Math.round(255 * d.trust);
            const b = 100;
            return \`rgba(\${r}, \${g}, \${b}, 0.7)\`;
          }),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return \`Trust: \${context.raw.toFixed(2)}\`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: 'Trust Score (0-1)'
            }
          }
        }
      }
    });
    
    // Create Thought Patterns Chart
    const thoughtCtx = document.getElementById('thoughtChart_${visualizationId}').getContext('2d');
    const thoughtData = ${JSON.stringify(thoughtTypeCount)};
    
    // Prepare matrix data
    const matrixData = [];
    const types = ['prediction', 'reflection', 'statement', 'question'];
    const uncertaintyLevels = ['high', 'medium', 'low'];
    
    types.forEach((type, y) => {
      uncertaintyLevels.forEach((level, x) => {
        matrixData.push({
          x,
          y,
          v: thoughtData[type][level]
        });
      });
    });
    
    const thoughtChart = new Chart(thoughtCtx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Thought Distribution',
          data: matrixData,
          backgroundColor(context) {
            const value = context.dataset.data[context.dataIndex].v;
            const max = Math.max(...matrixData.map(d => d.v));
            const alpha = value / (max || 1);
            return \`rgba(65, 105, 225, \${alpha})\`;
          },
          borderColor: 'white',
          borderWidth: 1,
          width: ({ chart }) => (chart.chartArea || {}).width / 3 - 1,
          height: ({ chart }) => (chart.chartArea || {}).height / 4 - 1
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title() {
                return '';
              },
              label(context) {
                const { x, y, v } = context.dataset.data[context.dataIndex];
                return [
                  \`Type: \${types[y]}\`,
                  \`Certainty: \${uncertaintyLevels[x]}\`,
                  \`Count: \${v}\`
                ];
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              callback: v => uncertaintyLevels[v]
            },
            title: {
              display: true,
              text: 'Certainty Level'
            }
          },
          y: {
            ticks: {
              callback: v => types[v]
            },
            title: {
              display: true,
              text: 'Thought Type'
            }
          }
        }
      }
    });
    
    // Add animation for trust changes
    let animationInterval;
    document.getElementById('animateButton').addEventListener('click', function() {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
      
      animationInterval = setInterval(() => {
        // Update trust values randomly
        const data = trustChart.data.datasets[0].data;
        for (let i = 0; i < data.length; i++) {
          if (Math.random() > 0.7) {
            const change = (Math.random() * 0.2 - 0.1);
            const newValue = Math.max(0.1, Math.min(0.9, data[i] + change));
            data[i] = newValue;
            
            // Update color
            const r = Math.round(255 * (1 - newValue));
            const g = Math.round(255 * newValue);
            const b = 100;
            trustChart.data.datasets[0].backgroundColor[i] = \`rgba(\${r}, \${g}, \${b}, 0.7)\`;
          }
        }
        trustChart.update();
      }, 2000);
    });
    
    document.getElementById('resetButton').addEventListener('click', function() {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
      
      // Reset to original data
      trustChart.data.datasets[0].data = trustData.map(d => d.trust);
      trustChart.data.datasets[0].backgroundColor = trustData.map(d => {
        const r = Math.round(255 * (1 - d.trust));
        const g = Math.round(255 * d.trust);
        const b = 100;
        return \`rgba(\${r}, \${g}, \${b}, 0.7)\`;
      });
      trustChart.update();
    });
  </script>
</body>
</html>`;
  }
}

// Workflow context to track state throughout the process
interface WorkflowContext {
  config: typeof PROJECT_CONFIG & {
    OUTPUT_DIR?: string;
    OPENAI_API_KEY?: string;
    PROJECT_ID?: string;
    VERSION?: string;
    ORGANIZATION?: string;
  };
  outputs: Record<string, any>;
  currentStage?: string;
  logger: FileLogger;
  eventSystem: EventSystem;
  startTime: number;
  metrics: {
    stageMetrics: Record<string, {
      startTime: number;
      endTime?: number;
      duration?: number;
      agentType: string;
    }>;
  };
}

// Define the organizational units
interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
}

// Create the Cognicism organizational units
const UNITS: Record<string, OrganizationalUnit> = {
  KNOWLEDGE: {
    id: 'knowledge_unit',
    name: 'Knowledge Management Unit',
    description: 'Responsible for generating and organizing knowledge using the FourThought protocol',
    agents: [
      new FourThoughtAgent({
        id: 'climate_change_explorer',
        name: 'Climate Change Explorer',
        unitId: 'knowledge_unit',
        unitName: 'Knowledge Management Unit',
        description: 'Explores climate change topics using the FourThought dialectic process',
        topic: 'Climate change impacts and adaptation strategies'
      }),
      new FourThoughtAgent({
        id: 'ai_ethics_explorer',
        name: 'AI Ethics Explorer',
        unitId: 'knowledge_unit',
        unitName: 'Knowledge Management Unit',
        description: 'Explores AI ethics topics using the FourThought dialectic process',
        topic: 'Ethical deployment of AI systems in society'
      }),
      new SemanticLedgerAgent({
        id: 'knowledge_ledger',
        name: 'Knowledge Ledger',
        unitId: 'knowledge_unit',
        unitName: 'Knowledge Management Unit',
        description: 'Manages the semantic ledger for storing and retrieving knowledge',
        ledgerPath: 'semantic_ledger'
      })
    ]
  },
  COMMUNITY: {
    id: 'community_unit',
    name: 'Community Intelligence Unit',
    description: 'Manages community beliefs and trust through the Iris framework',
    agents: [
      new IrisAgent({
        id: 'scientific_iris',
        name: 'Scientific Iris',
        unitId: 'community_unit',
        unitName: 'Community Intelligence Unit',
        description: 'Iris model focused on scientific knowledge and discourse',
        systemPrompt: 'You are Iris, a generative belief encoding model within the Cognicism framework. Your purpose is to process thoughts and information from various sources, tracking their reliability and updating attention distribution parameters. You focus specifically on scientific knowledge, maintaining a high standard for evidence and logical reasoning.',
        initialSources: [
          {
            id: 'science_journal',
            name: 'Peer-reviewed Journal',
            description: 'Represents peer-reviewed scientific literature',
            reliability: 0.9,
            expertise: 0.95,
            alignment: 0.8
          },
          {
            id: 'expert_opinion',
            name: 'Domain Expert',
            description: 'Represents subject matter expert opinions',
            reliability: 0.8,
            expertise: 0.9,
            alignment: 0.7
          },
          {
            id: 'news_media',
            name: 'News Media',
            description: 'Represents mainstream media reporting on scientific topics',
            reliability: 0.6,
            expertise: 0.5,
            alignment: 0.4
          },
          {
            id: 'social_media',
            name: 'Social Media',
            description: 'Represents discussions on social platforms',
            reliability: 0.3,
            expertise: 0.2,
            alignment: 0.1
          }
        ]
      }),
      new IrisAgent({
        id: 'policy_iris',
        name: 'Policy Iris',
        unitId: 'community_unit',
        unitName: 'Community Intelligence Unit',
        description: 'Iris model focused on policy implications and governance',
        systemPrompt: 'You are Iris, a generative belief encoding model within the Cognicism framework. Your purpose is to process thoughts and information from various sources, tracking their reliability and updating attention distribution parameters. You focus specifically on policy formulation, governance, and practical implementation of solutions to societal challenges.',
        initialSources: [
          {
            id: 'government',
            name: 'Government Sources',
            description: 'Represents official government statements and documents',
            reliability: 0.8,
            expertise: 0.7,
            alignment: 0.6
          },
          {
            id: 'think_tank',
            name: 'Think Tank',
            description: 'Represents policy research organizations',
            reliability: 0.75,
            expertise: 0.8,
            alignment: 0.5
          },
          {
            id: 'ngo',
            name: 'NGO',
            description: 'Represents non-governmental organizations',
            reliability: 0.7,
            expertise: 0.6,
            alignment: 0.7
          },
          {
            id: 'industry',
            name: 'Industry Association',
            description: 'Represents industry perspectives',
            reliability: 0.6,
            expertise: 0.7,
            alignment: 0.4
          }
        ]
      })
    ]
  },
  VISUALIZATION: {
    id: 'visualization_unit',
    name: 'Trust Visualization Unit',
    description: 'Creates visual representations of trust relationships and knowledge dynamics',
    agents: [
      new TrustVisualizationAgent({
        id: 'trust_network_visualizer',
        name: 'Trust Network Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Trust Visualization Unit',
        description: 'Visualizes the network of trust relationships between sources and thoughts',
        visualizationType: 'network'
      }),
      new TrustVisualizationAgent({
        id: 'thought_timeline_visualizer',
        name: 'Thought Timeline Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Trust Visualization Unit',
        description: 'Visualizes thoughts along a timeline with properties like valence and uncertainty',
        visualizationType: 'timeline'
      }),
      new TrustVisualizationAgent({
        id: 'trust_heatmap_visualizer',
        name: 'Trust Heatmap Visualizer',
        unitId: 'visualization_unit',
        unitName: 'Trust Visualization Unit',
        description: 'Visualizes trust distributions and thought patterns as heatmaps',
        visualizationType: 'heatmap'
      })
    ]
  },
  INTEGRATION: {
    id: 'integration_unit',
    name: 'System Integration Unit',
    description: 'Manages the integration between different components of the Cognicism framework',
    agents: [
      new LLMAgent({
        id: 'integration_agent',
        name: 'Integration Agent',
        unitId: 'integration_unit',
        unitName: 'System Integration Unit',
        description: 'Coordinates the flow of information between different parts of the system',
        systemPrompt: 'You are an integration agent in the Cognicism framework, responsible for facilitating the flow of information between different components. Your role is to ensure that outputs from one process can be effectively used as inputs to another, maintaining coherence and contextual relevance throughout the system.'
      })
    ]
  }
};

// Define the workflow stages
interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  unit: OrganizationalUnit;
  agent: Agent;
  prepareInput: (context: WorkflowContext) => any;
  dependencies: string[];
  outputKey: string;
}

// Define the Cognicism workflow stages
const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'climate_fourthought_exploration',
    name: 'Climate Change FourThought Exploration',
    description: 'Generate initial thoughts on climate change using the FourThought protocol',
    unit: UNITS.KNOWLEDGE,
    agent: UNITS.KNOWLEDGE.agents.find(a => a.id === 'climate_change_explorer') as Agent,
    prepareInput: (context) => `
Explore the topic of climate change impacts and adaptation strategies using the FourThought protocol.

Consider these aspects:
1. Current observable impacts of climate change globally
2. Projected future impacts on ecosystems and human societies
3. Adaptation strategies being implemented or proposed
4. Ethical dimensions of climate change response

Generate thoughtful predictions, reflections, statements, and questions about this topic.
    `,
    dependencies: [],
    outputKey: 'climate_fourthought_results'
  },
  {
    id: 'ai_ethics_fourthought_exploration',
    name: 'AI Ethics FourThought Exploration',
    description: 'Generate initial thoughts on AI ethics using the FourThought protocol',
    unit: UNITS.KNOWLEDGE,
    agent: UNITS.KNOWLEDGE.agents.find(a => a.id === 'ai_ethics_explorer') as Agent,
    prepareInput: (context) => `
Explore the topic of ethical deployment of AI systems in society using the FourThought protocol.

Consider these aspects:
1. Current ethical challenges in AI deployment
2. Potential future issues as AI becomes more advanced
3. Approaches to AI governance and oversight
4. Balance between innovation and precaution

Generate thoughtful predictions, reflections, statements, and questions about this topic.
    `,
    dependencies: [],
    outputKey: 'ai_ethics_fourthought_results'
  },
  {
    id: 'knowledge_ledger_storage',
    name: 'Knowledge Ledger Storage',
    description: 'Store the generated thoughts in the semantic ledger',
    unit: UNITS.KNOWLEDGE,
    agent: UNITS.KNOWLEDGE.agents.find(a => a.id === 'knowledge_ledger') as Agent,
    prepareInput: (context) => {
      // Combine thoughts from both FourThought explorations
      const climateThoughts = context.outputs.climate_fourthought_results?.all_thoughts || [];
      const aiEthicsThoughts = context.outputs.ai_ethics_fourthought_results?.all_thoughts || [];
      
      return {
        operation: 'store',
        thoughts: [...climateThoughts, ...aiEthicsThoughts]
      };
    },
    dependencies: ['climate_fourthought_exploration', 'ai_ethics_fourthought_exploration'],
    outputKey: 'ledger_storage_results'
  },
  {
    id: 'scientific_iris_processing',
    name: 'Scientific Iris Processing',
    description: 'Process climate change thoughts through the Scientific Iris',
    unit: UNITS.COMMUNITY,
    agent: UNITS.COMMUNITY.agents.find(a => a.id === 'scientific_iris') as Agent,
    prepareInput: (context) => {
      const climateThoughts = context.outputs.climate_fourthought_results?.all_thoughts || [];
      
      return {
        topic: 'Climate Change Analysis',
        thoughts: climateThoughts,
        query: 'Analyze these climate change thoughts from a scientific perspective, considering reliability of claims, evidence base, and scientific consensus.'
      };
    },
    dependencies: ['climate_fourthought_exploration'],
    outputKey: 'scientific_iris_results'
  },
  {
    id: 'policy_iris_processing',
    name: 'Policy Iris Processing',
    description: 'Process AI ethics thoughts through the Policy Iris',
    unit: UNITS.COMMUNITY,
    agent: UNITS.COMMUNITY.agents.find(a => a.id === 'policy_iris') as Agent,
    prepareInput: (context) => {
      const aiEthicsThoughts = context.outputs.ai_ethics_fourthought_results?.all_thoughts || [];
      
      return {
        topic: 'AI Ethics Policy Analysis',
        thoughts: aiEthicsThoughts,
        query: 'Analyze these AI ethics thoughts from a policy perspective, considering governance implications, regulatory frameworks, and practical implementation challenges.'
      };
    },
    dependencies: ['ai_ethics_fourthought_exploration'],
    outputKey: 'policy_iris_results'
  },
  {
    id: 'trust_network_visualization',
    name: 'Trust Network Visualization',
    description: 'Visualize the network of trust relationships in the Scientific Iris',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'trust_network_visualizer') as Agent,
    prepareInput: (context) => {
      return {
        ...context.outputs.scientific_iris_results,
        title: 'Scientific Trust Network for Climate Change Analysis'
      };
    },
    dependencies: ['scientific_iris_processing'],
    outputKey: 'trust_network_visualization'
  },
  {
    id: 'thought_timeline_visualization',
    name: 'Thought Timeline Visualization',
    description: 'Visualize thoughts along a timeline for the AI Ethics exploration',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'thought_timeline_visualizer') as Agent,
    prepareInput: (context) => {
      return {
        ...context.outputs.ai_ethics_fourthought_results,
        title: 'AI Ethics Thought Timeline'
      };
    },
    dependencies: ['ai_ethics_fourthought_exploration'],
    outputKey: 'thought_timeline_visualization'
  },
  {
    id: 'trust_heatmap_visualization',
    name: 'Trust Heatmap Visualization',
    description: 'Visualize trust distributions and thought patterns for the Policy Iris',
    unit: UNITS.VISUALIZATION,
    agent: UNITS.VISUALIZATION.agents.find(a => a.id === 'trust_heatmap_visualizer') as Agent,
    prepareInput: (context) => {
      return {
        ...context.outputs.policy_iris_results,
        title: 'Policy Trust Heatmap for AI Ethics'
      };
    },
    dependencies: ['policy_iris_processing'],
    outputKey: 'trust_heatmap_visualization'
  },
  {
    id: 'integrated_knowledge_query',
    name: 'Integrated Knowledge Query',
    description: 'Query the semantic ledger with an integrated perspective',
    unit: UNITS.KNOWLEDGE,
    agent: UNITS.KNOWLEDGE.agents.find(a => a.id === 'knowledge_ledger') as Agent,
    prepareInput: (context) => {
      return {
        operation: 'query',
        query: 'adaptation technology ethics'
      };
    },
    dependencies: ['ledger_storage_results'],
    outputKey: 'knowledge_query_results'
  },
  {
    id: 'system_integration',
    name: 'System Integration',
    description: 'Integrate findings across the Cognicism workflow',
    unit: UNITS.INTEGRATION,
    agent: UNITS.INTEGRATION.agents.find(a => a.id === 'integration_agent') as Agent,
    prepareInput: (context) => `
Integrate the outputs from the Cognicism workflow to create a cohesive understanding.

SCIENTIFIC IRIS RESULTS:
${JSON.stringify(context.outputs.scientific_iris_results, null, 2).substring(0, 500)}...

POLICY IRIS RESULTS:
${JSON.stringify(context.outputs.policy_iris_results, null, 2).substring(0, 500)}...

KNOWLEDGE QUERY RESULTS:
${JSON.stringify(context.outputs.knowledge_query_results, null, 2).substring(0, 500)}...

Synthesize these findings to create an integrated perspective on the topics of climate change and AI ethics. 
Consider how the FourThought protocol helped explore these topics, how the Iris models processed different aspects,
and how the trust dynamics evolved during the process.

Format your response as JSON with the following structure:
{
  "synthesis": {
    "key_insights": [...],
    "emerging_themes": [...],
    "trust_patterns": {...},
    "knowledge_gaps": [...]
  },
  "cognicism_framework_assessment": {
    "fourthought_effectiveness": {...},
    "iris_model_dynamics": {...},
    "trust_mechanism": {...},
    "semantic_ledger": {...}
  },
  "recommendations": {
    "process_improvements": [...],
    "further_exploration": [...]
  }
}
    `,
    dependencies: [
      'scientific_iris_processing',
      'policy_iris_processing',
      'knowledge_query_results'
    ],
    outputKey: 'integrated_findings'
  }
];

// Generate visual representation of the workflow
function generateWorkflowVisualizations(context: WorkflowContext, outputDir: string): void {
  const logger = new FileLogger('workflow_visualization.log');
  
  // Create mermaid workflow diagram
  let mermaidDiagram = 'graph TD;\n';
  
  // Unique colors for each unit
  const unitColors: Record<string, string> = {
    'knowledge_unit': '#90CAF9',
    'community_unit': '#A5D6A7',
    'visualization_unit': '#FFCC80',
    'integration_unit': '#CE93D8'
  };
  
  // Add nodes for each stage
  for (const stage of WORKFLOW_STAGES) {
    const nodeId = stage.id;
    const unitId = stage.unit.id;
    const agentType = stage.agent.constructor.name.replace('Agent', '');
    const isCompleted = !!context.outputs[stage.outputKey];
    
    const borderColor = isCompleted ? '#228B22' : '#808080';
    const fillColor = unitColors[unitId] || '#D3D3D3';
    
    mermaidDiagram += `    ${nodeId}["${stage.name}<br/>(${agentType})<br/>${stage.unit.name}"];\n`;
    mermaidDiagram += `    style ${nodeId} fill:${fillColor},stroke:${borderColor},stroke-width:${isCompleted ? '2px' : '1px'};\n`;
  }
  
  // Add edges for dependencies
  for (const stage of WORKFLOW_STAGES) {
    for (const depId of stage.dependencies) {
      mermaidDiagram += `    ${depId} --> ${stage.id};\n`;
    }
  }
  
  // Create visualizations directory
  const visualizationsDir = path.join(outputDir, 'visualizations');
  fs.ensureDirSync(visualizationsDir);
  
  // Write to file
  fs.writeFileSync(path.join(visualizationsDir, 'workflow_diagram.mmd'), mermaidDiagram);
  
  // Create HTML visualization
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Cognicism Framework Workflow</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
    .container { max-width: 1200px; margin: 0 auto; }
    .workflow-diagram { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .metrics-section { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background: white; }
    .agent-types { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
    .agent-card { flex: 1; min-width: 200px; border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: #f5f5f5; }
    .chart-container { height: 300px; margin-bottom: 20px; }
    h1, h2, h3 { color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .stage-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .stage-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: white; }
    .completed { border-left: 5px solid #4CAF50; }
    .stage-header { display: flex; justify-content: space-between; align-items: center; }
    .agent-type { font-size: 12px; padding: 3px 8px; border-radius: 10px; background: #eee; }
    .Iris { background: #E3F2FD; color: #1565C0; }
    .FourThought { background: #E8F5E9; color: #2E7D32; }
    .SemanticLedger { background: #FFF3E0; color: #E65100; }
    .TrustVisualization { background: #F3E5F5; color: #6A1B9A; }
    .LLM { background: #FFEBEE; color: #B71C1C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cognicism Framework Workflow</h1>
      <p>Project: ${context.config.OBJECTIVE || "Cognicism Implementation"}</p>
    </div>
    
    <div class="agent-types">
      <div class="agent-card">
        <h3>Iris Agents</h3>
        <p>Generative belief encoding models that track community contributions and attention distribution.</p>
      </div>
      <div class="agent-card">
        <h3>FourThought Agents</h3>
        <p>Dialectic process agents that generate predictions, reflections, statements, and questions.</p>
      </div>
      <div class="agent-card">
        <h3>Semantic Ledger Agents</h3>
        <p>Storage and retrieval agents that maintain the shared, immutable record of knowledge.</p>
      </div>
      <div class="agent-card">
        <h3>Trust Visualization Agents</h3>
        <p>Visualization agents that represent trust relationships and knowledge dynamics.</p>
      </div>
    </div>
    
    <div class="workflow-diagram">
      <h2>Workflow Diagram</h2>
      <div class="mermaid">
${mermaidDiagram}
      </div>
    </div>
    
    <h2>Workflow Stages</h2>
    <div class="stage-list">
      ${WORKFLOW_STAGES.map(stage => {
        const isCompleted = !!context.outputs[stage.outputKey];
        const agentType = stage.agent.constructor.name.replace('Agent', '');
        const metrics = context.metrics.stageMetrics[stage.id];
        return `
          <div class="stage-card ${isCompleted ? 'completed' : ''}">
            <div class="stage-header">
              <h3>${stage.name}</h3>
              <span class="agent-type ${agentType}">${agentType}</span>
            </div>
            <p><strong>Unit:</strong> ${stage.unit.name}</p>
            <p><strong>Agent:</strong> ${stage.agent.name}</p>
            <p><strong>Dependencies:</strong> ${stage.dependencies.length ? stage.dependencies.join(', ') : 'None'}</p>
            <p><strong>Status:</strong> ${isCompleted ? 'Completed' : 'Pending'}</p>
            ${metrics ? `<p><strong>Duration:</strong> ${((metrics.duration || 0) / 1000).toFixed(2)}s</p>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  </div>
  
  <script>
    mermaid.initialize({ startOnLoad: true });
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(visualizationsDir, 'workflow_overview.html'), htmlContent);
  logger.info(`Generated workflow visualizations in ${visualizationsDir}`);
}

// Main function to run the Cognicism workflow
async function runCognicismWorkflow() {
  console.log(`Starting Cognicism workflow: ${runId}`);
  
  // Create output directory structure
  outputDir = path.join('output', runId);
  fs.ensureDirSync(outputDir);
  fs.ensureDirSync(path.join(outputDir, 'data'));
  fs.ensureDirSync(path.join(outputDir, 'intermediates'));
  fs.ensureDirSync(path.join(outputDir, 'semantic_ledger'));
  fs.ensureDirSync(path.join(outputDir, 'visualizations'));
  
  // Save the project configuration
  fs.writeFileSync(
    path.join(outputDir, 'config.json'),
    JSON.stringify({ ...PROJECT_CONFIG, timestamp, runId }, null, 2)
  );
  
  // Create logger and event system
  const logger = new FileLogger(path.join(outputDir, 'cognicism_workflow.log'));
  const eventSystem = EventSystem.getInstance(); // Reverted back to getInstance()
  
  // Create workflow context
  const context: WorkflowContext = {
    config: {
      ...PROJECT_CONFIG,
      OUTPUT_DIR: outputDir,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PROJECT_ID: runId
    },
    outputs: {},
    logger,
    eventSystem,
    startTime: Date.now(),
    metrics: {
      stageMetrics: {}
    }
  };
  
  // Run each workflow stage in sequence
  for (const stage of WORKFLOW_STAGES) {
    try {
      context.currentStage = stage.id;
      logger.info(`Starting stage: ${stage.name}`);
      
      // Check if all dependencies are completed
      const missingDeps = stage.dependencies.filter(dep => !context.outputs[dep]);
      if (missingDeps.length > 0) {
        logger.warn(`Skipping stage ${stage.id} due to missing dependencies: ${missingDeps.join(', ')}`);
        continue;
      }
      
      // Prepare input for the stage
      const input = stage.prepareInput(context);
      
      // Record metrics start
      context.metrics.stageMetrics[stage.id] = {
        startTime: Date.now(),
        agentType: stage.agent.constructor.name
      };
      
      // Process the stage
      const output = await stage.agent.process(input, context);
      
      // Record metrics end
      const metrics = context.metrics.stageMetrics[stage.id];
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      
      // Store the output
      context.outputs[stage.outputKey] = output;
      
      // Save the output to disk
      fs.writeFileSync(
        path.join(outputDir, 'data', `${stage.outputKey}.json`),
        JSON.stringify(output, null, 2)
      );
      
      logger.info(`Completed stage: ${stage.name} in ${(metrics.duration / 1000).toFixed(2)}s`);
      
      // Add a small delay between stages for stability
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      logger.error(`Error in stage ${stage.id}: ${error}`);
    }
  }
  
  // Generate workflow visualizations
  generateWorkflowVisualizations(context, outputDir);
  
  // Save final workflow context
  fs.writeFileSync(
    path.join(outputDir, 'workflow_context.json'),
    JSON.stringify({
      config: context.config,
      metrics: context.metrics,
      outputs: Object.keys(context.outputs)
    }, null, 2)
  );
  
  logger.info(`Cognicism workflow completed in ${((Date.now() - context.startTime) / 1000).toFixed(2)}s`);
  logger.info(`Output directory: ${outputDir}`);
  
  return context;
}

// Run the workflow if this script is executed directly
if (require.main === module) {
  runCognicismWorkflow().catch(error => {
    console.error('Workflow failed with error:', error);
    process.exit(1);
  });
}

// Export the workflow function and key components for use in other scripts
export {
  runCognicismWorkflow,
  IrisAgent,
  FourThoughtAgent,
  SemanticLedgerAgent,
  TrustVisualizationAgent,
  Thought,
  SourceEmbedding
}; 