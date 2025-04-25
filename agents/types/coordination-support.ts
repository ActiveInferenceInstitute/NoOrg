/**
 * Supporting types for the Agent Coordination Toolkit
 */

// Analysis Support Types
export interface EfficiencyPattern {
  id: string;
  type: string;
  metrics: EfficiencyMetrics;
  context: PatternContext;
  metadata: PatternMetadata;
}

export interface EfficiencyScore {
  metric: string;
  value: number;
  threshold: number;
  trend: TrendDirection;
}

export interface BottleneckItem {
  id: string;
  type: string;
  metrics: BottleneckMetrics;
  context: BottleneckContext;
  metadata: BottleneckMetadata;
}

export interface BottleneckImpact {
  metric: string;
  severity: number;
  scope: ImpactScope;
  duration: number;
}

export interface OptimizationStrategy {
  id: string;
  type: string;
  target: string;
  actions: OptimizationAction[];
  impact: ImpactAssessment;
  metadata: StrategyMetadata;
}

export interface StrategyEvaluation {
  strategyId: string;
  scores: EvaluationScore[];
  feasibility: number;
  roi: number;
  metadata: EvaluationMetadata;
}

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
  confidence: number[];
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

// Resource Support Types
export interface UsagePattern {
  id: string;
  type: string;
  metrics: UsageMetrics;
  context: UsageContext;
  metadata: PatternMetadata;
}

export interface WasteItem {
  id: string;
  type: string;
  metrics: WasteMetrics;
  impact: ResourceImpact;
  metadata: WasteMetadata;
}

export interface WasteImpact {
  resource: string;
  amount: number;
  cost: number;
  duration: number;
}

export interface UtilizationPattern {
  id: string;
  type: string;
  metrics: UtilizationMetrics;
  context: UtilizationContext;
  metadata: PatternMetadata;
}

export interface CapacityPrediction {
  resource: string;
  demand: number[];
  capacity: number[];
  timeframe: TimeRange;
}

export interface ScalingOption {
  id: string;
  type: string;
  resources: ResourceRequirement[];
  impact: ScalingImpact;
  metadata: OptionMetadata;
}

export interface OptionEvaluation {
  optionId: string;
  scores: EvaluationScore[];
  feasibility: number;
  roi: number;
  metadata: EvaluationMetadata;
}

// Pattern Support Types
export interface BehaviorPattern {
  id: string;
  type: string;
  metrics: BehaviorMetrics;
  context: BehaviorContext;
  metadata: PatternMetadata;
}

export interface PatternClassification {
  patternId: string;
  category: string;
  confidence: number;
  metadata: ClassificationMetadata;
}

export interface PatternRelationship {
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
  metadata: RelationshipMetadata;
}

// Metric Types
export interface EfficiencyMetrics {
  cpu: number;
  memory: number;
  io: number;
  network: number;
  cost: number;
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  utilization: number;
}

export interface ResourceMetrics {
  usage: ResourceUsage;
  availability: ResourceAvailability;
  efficiency: ResourceEfficiency;
}

export interface OperationMetrics {
  success: number;
  failure: number;
  duration: number;
  cost: number;
}

// Support Interfaces
export interface ImpactAssessment {
  performance: number;
  resources: number;
  cost: number;
  risk: number;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: number;
  context: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  context: any;
}

export interface ReportSummary {
  title: string;
  description: string;
  highlights: string[];
  metrics: SummaryMetrics;
}

export interface ReportDetails {
  sections: ReportSection[];
  metrics: DetailedMetrics;
  analysis: DetailedAnalysis;
}

export interface TrendSummary {
  pattern: string;
  significance: number;
  prediction: string;
  confidence: number;
}

export interface PredictionSummary {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
}

export interface StrategySummary {
  id: string;
  type: string;
  impact: ImpactSummary;
  feasibility: number;
}

export interface EvaluationSummary {
  strategyId: string;
  scores: number[];
  recommendation: string;
}

// Metadata Types
export interface PatternMetadata {
  created: number;
  updated: number;
  source: string;
  confidence: number;
}

export interface BottleneckMetadata {
  detected: number;
  severity: number;
  source: string;
  context: any;
}

export interface StrategyMetadata {
  created: number;
  author: string;
  version: string;
  context: any;
}

export interface EvaluationMetadata {
  timestamp: number;
  evaluator: string;
  version: string;
  context: any;
}

export interface PredictionMetadata {
  generated: number;
  model: string;
  version: string;
  context: any;
}

export interface RecommendationMetadata {
  created: number;
  source: string;
  confidence: number;
  context: any;
}

export interface HistoricalMetadata {
  source: string;
  resolution: string;
  quality: number;
  context: any;
}

export interface ValidationMetadata {
  timestamp: number;
  validator: string;
  version: string;
  context: any;
}

// Enums
export enum TrendDirection {
  Increasing = 'increasing',
  Decreasing = 'decreasing',
  Stable = 'stable',
  Fluctuating = 'fluctuating'
}

export enum ImpactScope {
  Local = 'local',
  Component = 'component',
  System = 'system',
  Global = 'global'
} 