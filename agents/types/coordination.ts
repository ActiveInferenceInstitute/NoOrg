import { TimeRange, TrendDirection, ValidationResult, ImpactScope } from './shared';
import {
  EfficiencyPattern,
  EfficiencyScore,
  BottleneckItem,
  BottleneckImpact,
  OptimizationAction,
  TrendData,
  TrendMetrics,
  UsageMetrics,
  UtilizationMetrics,
  BehaviorMetrics,
  ResourceUsage,
  ResourceAvailability,
  ResourceEfficiency,
  ResourceImpact,
  ResourceRequirement,
  ScalingImpact,
  ActionParameters,
  ActionImpact,
  Parameter,
  StepValidation,
  RequirementConstraints,
  ParameterConstraints,
  Condition,
  SummaryMetrics,
  DetailedMetrics,
  DetailedAnalysis,
  MetricSummary,
  MetricDetails,
  AnalysisPattern,
  AnalysisTrend,
  AnalysisInsight,
  MetricAnalysis,
  ImpactSummary,
  ContextMetadata,
  DataMetadata,
  ClassificationMetadata,
  RelationshipMetadata,
  OptionMetadata,
  ReportSection,
  SectionMetrics,
  SectionAnalysis,
  StrategyMetadata,
  EvaluationScore,
  EvaluationMetadata,
  PatternMetadata,
  PredictionMetadata,
  ImpactAssessment,
  RecommendedAction,
  RecommendationMetadata
} from './coordination-metrics';

/**
 * Core types for the Agent Coordination Toolkit
 */

// Strategy Types
export interface OptimizationStrategy {
  id: string;
  type: string;
  target: string;
  actions: OptimizationAction[];
  impact: ActionImpact;
  metadata: StrategyMetadata;
}

export interface StrategyEvaluation {
  strategyId: string;
  scores: EvaluationScore[];
  feasibility: number;
  roi: number;
  metadata: EvaluationMetadata;
}

// Pattern Types
export interface TrendPattern {
  id: string;
  type: string;
  data: TrendData;
  confidence: number;
  metadata: PatternMetadata;
}

export interface TrendAnalysis {
  patternId: string;
  metrics: TrendMetrics;
  significance: number;
  predictions: TrendPrediction[];
}

export interface TrendPrediction {
  metric: string;
  values: number[];
  confidence: number;
  timeframe: TimeRange;
}

export interface PredictionItem {
  id: string;
  type: string;
  values: number[];
  confidence: number;
  metadata: PredictionMetadata;
}

export interface RecommendationItem {
  id: string;
  type: string;
  priority: number;
  impact: ImpactAssessment;
  actions: RecommendedAction[];
  metadata: RecommendationMetadata;
}

// Analysis Types
export interface EfficiencyAnalysis {
  patterns: EfficiencyPattern[];
  scores: EfficiencyScore[];
  recommendations: Recommendation[];
  timestamp: number;
}

export interface Bottlenecks {
  items: BottleneckItem[];
  impact: BottleneckImpact[];
  priority: number[];
  timestamp: number;
}

export interface Optimizations {
  strategies: OptimizationStrategy[];
  evaluations: StrategyEvaluation[];
  recommendations: Recommendation[];
  timestamp: number;
}

export interface Trends {
  patterns: TrendPattern[];
  analysis: TrendAnalysis[];
  predictions: TrendPrediction[];
  confidence: number[];
}

export interface Predictions {
  items: PredictionItem[];
  confidence: number[];
  timeframe: TimeRange;
  metadata: PredictionMetadata;
}

export interface Recommendations {
  items: RecommendationItem[];
  priority: number[];
  impact: ImpactAssessment[];
  metadata: RecommendationMetadata;
}

// Resource Analysis Types
export interface UsageAnalysis {
  patterns: UsagePattern[];
  efficiency: EfficiencyMetrics;
  recommendations: Recommendation[];
  timestamp: number;
}

export interface WastePoints {
  items: WasteItem[];
  impact: WasteImpact[];
  recommendations: Recommendation[];
  timestamp: number;
}

export interface UtilizationAnalysis {
  patterns: UtilizationPattern[];
  efficiency: EfficiencyMetrics;
  recommendations: Recommendation[];
  timestamp: number;
}

export interface CapacityPredictions {
  predictions: CapacityPrediction[];
  confidence: number[];
  timeframe: TimeRange;
  metadata: PredictionMetadata;
}

export interface ScalingRecommendations {
  options: ScalingOption[];
  evaluations: OptionEvaluation[];
  recommendations: Recommendation[];
  metadata: RecommendationMetadata;
}

// Pattern Analysis Types
export interface PatternAnalysis {
  patterns: Pattern[];
  significance: number[];
  relationships: PatternRelationship[];
  metadata: PatternMetadata;
}

export interface OptimalPatterns {
  patterns: Pattern[];
  efficiency: number[];
  applicability: number[];
  metadata: PatternMetadata;
}

export interface BehaviorAnalysis {
  patterns: BehaviorPattern[];
  effectiveness: number[];
  recommendations: Recommendation[];
  metadata: BehaviorMetadata;
}

export interface Patterns {
  items: Pattern[];
  classifications: PatternClassification[];
  relationships: PatternRelationship[];
  metadata: PatternMetadata;
}

// Component Interfaces
export interface MetricsAnalyzer {
  collectSystemMetrics(): Promise<SystemMetrics>;
  collectHistoricalData(): Promise<HistoricalData>;
  analyzeMetrics(metrics: SystemMetrics): Promise<MetricsAnalysis>;
  generateReport(analysis: MetricsAnalysis): Promise<MetricsReport>;
}

export interface TrendAnalyzer {
  analyzeTrends(data: HistoricalData): Promise<Trends>;
  generatePredictions(trends: Trends): Promise<Predictions>;
  validateTrends(trends: Trends): Promise<ValidationResult>;
  generateReport(trends: Trends, predictions: Predictions): Promise<TrendReport>;
}

export interface OptimizationEngine {
  generateStrategies(data: any): Promise<OptimizationStrategy[]>;
  evaluateStrategies(strategies: OptimizationStrategy[]): Promise<StrategyEvaluation[]>;
  selectOptimalStrategies(evaluations: StrategyEvaluation[]): Promise<Optimizations>;
  generateReport(optimizations: Optimizations): Promise<OptimizationReport>;
}

// Support Types
export interface SystemMetrics {
  performance: PerformanceMetrics;
  resources: ResourceMetrics;
  operations: OperationMetrics;
  timestamp: number;
}

export interface HistoricalData {
  metrics: SystemMetrics[];
  timeframe: TimeRange;
  metadata: HistoricalMetadata;
}

export interface Pattern {
  id: string;
  type: string;
  data: any;
  metadata: PatternMetadata;
}

export interface Recommendation {
  id: string;
  type: string;
  priority: number;
  impact: ImpactAssessment;
  description: string;
  metadata: RecommendationMetadata;
}

// Utility Types
export interface MetricsReport {
  summary: ReportSummary;
  details: ReportDetails;
  recommendations: Recommendation[];
  metadata: ReportMetadata;
}

export interface TrendReport {
  trends: TrendSummary[];
  predictions: PredictionSummary[];
  recommendations: Recommendation[];
  metadata: ReportMetadata;
}

export interface OptimizationReport {
  strategies: StrategySummary[];
  evaluations: EvaluationSummary[];
  recommendations: Recommendation[];
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  timestamp: number;
  version: string;
  source: string;
  type: string;
}

// Analyzer Interfaces
export interface SystemAnalyzer {
  analyzeSystemEfficiency(): Promise<EfficiencyAnalysis>;
  identifyBottlenecks(): Promise<Bottlenecks>;
  generateOptimizations(): Promise<Optimizations>;
  analyzePerformanceTrends(): Promise<Trends>;
  predictFuturePerformance(): Promise<Predictions>;
  generateRecommendations(): Promise<Recommendations>;
}

export interface ResourceAnalyzer {
  analyzeResourceUsage(): Promise<UsageAnalysis>;
  identifyWaste(): Promise<WastePoints>;
  analyzeCapacityUtilization(): Promise<UtilizationAnalysis>;
  predictCapacityNeeds(): Promise<CapacityPredictions>;
  generateScalingRecommendations(): Promise<ScalingRecommendations>;
}

export interface PatternAnalyzer {
  analyzeOperationPatterns(): Promise<PatternAnalysis>;
  identifyOptimalPatterns(): Promise<OptimalPatterns>;
  generatePatternRecommendations(): Promise<Recommendations>;
  analyzeAgentBehaviors(): Promise<BehaviorAnalysis>;
  identifyBehaviorPatterns(): Promise<Patterns>;
  generateBehaviorRecommendations(): Promise<Recommendations>;
} 