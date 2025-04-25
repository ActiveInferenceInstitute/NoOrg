import { TimeRange, TrendDirection, ImpactScope } from './shared';

/**
 * Metric and context types for the Agent Coordination Toolkit
 */

// Context Types
export interface PatternContext {
  environment: string;
  component: string;
  timeframe: TimeRange;
  metadata: ContextMetadata;
}

export interface BottleneckContext {
  location: string;
  scope: string;
  impact: string;
  metadata: ContextMetadata;
}

export interface UsageContext {
  resource: string;
  consumer: string;
  purpose: string;
  metadata: ContextMetadata;
}

export interface UtilizationContext {
  resource: string;
  capacity: number;
  threshold: number;
  metadata: ContextMetadata;
}

export interface BehaviorContext {
  agent: string;
  activity: string;
  state: string;
  metadata: ContextMetadata;
}

// Metric Types
export interface EfficiencyMetrics {
  cpu: number;
  memory: number;
  io: number;
  network: number;
  cost: number;
}

export interface BottleneckMetrics {
  severity: number;
  duration: number;
  impact: number;
  frequency: number;
}

export interface TrendData {
  values: number[];
  timestamps: number[];
  labels: string[];
  metadata: DataMetadata;
}

export interface TrendMetrics {
  direction: TrendDirection;
  strength: number;
  stability: number;
  confidence: number;
}

export interface UsageMetrics {
  amount: number;
  rate: number;
  efficiency: number;
  cost: number;
}

export interface WasteMetrics {
  amount: number;
  impact: number;
  frequency: number;
  duration: number;
}

export interface UtilizationMetrics {
  current: number;
  average: number;
  peak: number;
  trend: TrendDirection;
}

export interface BehaviorMetrics {
  frequency: number;
  duration: number;
  impact: number;
  effectiveness: number;
}

// Action Types
export interface OptimizationAction {
  type: string;
  target: string;
  parameters: ActionParameters;
  impact: ActionImpact;
}

export interface RecommendedAction {
  type: string;
  priority: number;
  description: string;
  steps: ActionStep[];
}

export interface ActionStep {
  order: number;
  type: string;
  description: string;
  validation: StepValidation;
}

// Resource Types
export interface ResourceUsage {
  current: number;
  average: number;
  peak: number;
  trend: TrendDirection;
}

export interface ResourceAvailability {
  total: number;
  used: number;
  reserved: number;
  available: number;
}

export interface ResourceEfficiency {
  utilization: number;
  wastage: number;
  cost: number;
  optimization: number;
}

export interface ResourceImpact {
  performance: number;
  availability: number;
  cost: number;
  risk: number;
}

export interface ResourceRequirement {
  type: string;
  amount: number;
  priority: number;
  constraints: RequirementConstraints;
}

export interface ScalingImpact {
  performance: number;
  cost: number;
  reliability: number;
  complexity: number;
}

// Support Types
export interface ActionParameters {
  required: Parameter[];
  optional: Parameter[];
  defaults: { [key: string]: any };
}

export interface ActionImpact {
  performance: number;
  resources: number;
  cost: number;
  risk: number;
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  constraints: ParameterConstraints;
}

export interface StepValidation {
  preconditions: Condition[];
  postconditions: Condition[];
  invariants: Condition[];
}

export interface RequirementConstraints {
  minimum: number;
  maximum: number;
  step: number;
  preferences: string[];
}

export interface ParameterConstraints {
  type: string;
  range?: [number, number];
  enum?: string[];
  pattern?: string;
}

export interface Condition {
  type: string;
  expression: string;
  severity: number;
}

export interface SummaryMetrics {
  performance: MetricSummary;
  resources: MetricSummary;
  operations: MetricSummary;
}

export interface DetailedMetrics {
  performance: MetricDetails;
  resources: MetricDetails;
  operations: MetricDetails;
}

export interface DetailedAnalysis {
  patterns: AnalysisPattern[];
  trends: AnalysisTrend[];
  insights: AnalysisInsight[];
}

export interface MetricSummary {
  current: number;
  change: number;
  trend: TrendDirection;
}

export interface MetricDetails {
  current: number;
  historical: number[];
  predictions: number[];
  analysis: MetricAnalysis;
}

export interface AnalysisPattern {
  type: string;
  significance: number;
  description: string;
  evidence: any[];
}

export interface AnalysisTrend {
  metric: string;
  direction: TrendDirection;
  strength: number;
  prediction: string;
}

export interface AnalysisInsight {
  type: string;
  importance: number;
  description: string;
  recommendations: string[];
}

export interface MetricAnalysis {
  patterns: string[];
  anomalies: string[];
  predictions: string[];
}

export interface ImpactSummary {
  performance: number;
  resources: number;
  cost: number;
}

// Metadata Types
export interface ContextMetadata {
  timestamp: number;
  source: string;
  reliability: number;
  context: any;
}

export interface DataMetadata {
  source: string;
  quality: number;
  completeness: number;
  context: any;
}

export interface ClassificationMetadata {
  timestamp: number;
  classifier: string;
  version: string;
  context: any;
}

export interface RelationshipMetadata {
  detected: number;
  confidence: number;
  evidence: any[];
  context: any;
}

export interface OptionMetadata {
  created: number;
  feasibility: number;
  priority: number;
  context: any;
}

// Report Types
export interface ReportSection {
  title: string;
  content: string;
  metrics: SectionMetrics;
  recommendations: string[];
}

export interface SectionMetrics {
  summary: MetricSummary;
  details: MetricDetails;
  analysis: SectionAnalysis;
}

export interface SectionAnalysis {
  findings: string[];
  patterns: string[];
  recommendations: string[];
}

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

export interface EvaluationScore {
  metric: string;
  value: number;
  weight: number;
  confidence: number;
}

export interface ImpactAssessment {
  performance: number;
  resources: number;
  cost: number;
  risk: number;
}

export interface RecommendedAction {
  type: string;
  priority: number;
  description: string;
  steps: ActionStep[];
}

// Metadata Types
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

export interface PatternMetadata {
  created: number;
  updated: number;
  source: string;
  confidence: number;
}

export interface PredictionMetadata {
  generated: number;
  model: string;
  version: string;
  context: any;
}

export interface BottleneckMetadata {
  detected: number;
  severity: number;
  source: string;
  context: any;
}

// Pattern Types
export interface UsagePattern {
  id: string;
  type: string;
  metrics: UsageMetrics;
  context: UsageContext;
  metadata: PatternMetadata;
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

export interface RecommendationMetadata {
  created: number;
  source: string;
  confidence: number;
  context: any;
}

export interface WasteMetadata {
  detected: number;
  impact: number;
  source: string;
  context: any;
} 