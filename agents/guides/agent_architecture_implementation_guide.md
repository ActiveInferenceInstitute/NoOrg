---
title: Agent Architecture Implementation Guide
created: 2025-02-19
updated: 2025-02-19
tags: [guide, architecture, implementation, BDI, cognitive, layered]
---

# Agent Architecture Implementation Guide

## Overview
This guide provides comprehensive instructions for implementing autonomous agent architectures, covering Belief-Desire-Intention (BDI) models, layered agent design, cognitive agent implementations, and integration patterns. It establishes best practices for building robust, scalable agent systems from the ground up.

## Getting Started

### Prerequisites
1. Development Environment
   - TypeScript/JavaScript setup with Bun runtime
   - Build tools configured (bundler, linter, formatter)
   - Testing framework ready (integration-first approach)
   - Development tools installed (debugger, profiler)

2. Framework Integration
   - Agent core libraries imported
   - Architecture pattern libraries included
   - State management systems configured
   - Communication infrastructure ready

3. Project Structure
   - Architecture module organization
   - Layer separation and boundaries
   - Test organization (contract, integration, e2e)
   - Documentation alongside implementation

## BDI Architecture Implementation

### Core Concepts
The Belief-Desire-Intention architecture models rational agents through three mental attitudes: beliefs represent the agent's information about the world, desires represent objectives, and intentions represent committed plans of action.

### Belief System
```typescript
import { EventEmitter } from 'events';

interface Belief {
  id: string;
  content: Record<string, unknown>;
  confidence: number;
  source: string;
  timestamp: number;
  ttl?: number;
}

interface BeliefQuery {
  pattern?: Record<string, unknown>;
  minConfidence?: number;
  source?: string;
  maxAge?: number;
}

class BeliefBase extends EventEmitter {
  private beliefs: Map<string, Belief> = new Map();
  private indices: Map<string, Set<string>> = new Map();

  add(belief: Belief): void {
    const existing = this.beliefs.get(belief.id);

    // Merge with existing beliefs using confidence weighting
    if (existing) {
      const merged = this.mergeBeliefs(existing, belief);
      this.beliefs.set(belief.id, merged);
      this.emit('belief:updated', merged);
    } else {
      this.beliefs.set(belief.id, belief);
      this.indexBelief(belief);
      this.emit('belief:added', belief);
    }

    // Trigger belief revision
    this.revise();
  }

  query(query: BeliefQuery): Belief[] {
    let results = Array.from(this.beliefs.values());

    // Filter by confidence threshold
    if (query.minConfidence !== undefined) {
      results = results.filter(b => b.confidence >= query.minConfidence!);
    }

    // Filter by source
    if (query.source) {
      results = results.filter(b => b.source === query.source);
    }

    // Filter by age
    if (query.maxAge !== undefined) {
      const cutoff = Date.now() - query.maxAge;
      results = results.filter(b => b.timestamp >= cutoff);
    }

    // Filter by pattern match
    if (query.pattern) {
      results = results.filter(b => this.matchesPattern(b.content, query.pattern!));
    }

    return results;
  }

  private revise(): void {
    const now = Date.now();

    // Remove expired beliefs
    for (const [id, belief] of this.beliefs) {
      if (belief.ttl && now - belief.timestamp > belief.ttl) {
        this.beliefs.delete(id);
        this.emit('belief:expired', belief);
      }
    }

    // Resolve contradictions
    this.resolveContradictions();
  }

  private mergeBeliefs(existing: Belief, incoming: Belief): Belief {
    const totalConfidence = existing.confidence + incoming.confidence;
    return {
      ...existing,
      content: { ...existing.content, ...incoming.content },
      confidence: Math.min(1.0, totalConfidence * 0.7),
      timestamp: Math.max(existing.timestamp, incoming.timestamp),
    };
  }

  private resolveContradictions(): void {
    // Group beliefs by their content domain
    const domains = new Map<string, Belief[]>();

    for (const belief of this.beliefs.values()) {
      const domain = this.extractDomain(belief);
      if (!domains.has(domain)) {
        domains.set(domain, []);
      }
      domains.get(domain)!.push(belief);
    }

    // Within each domain, resolve conflicts by confidence
    for (const [, beliefs] of domains) {
      if (beliefs.length > 1) {
        beliefs.sort((a, b) => b.confidence - a.confidence);
        // Keep highest confidence, reduce others
        for (let i = 1; i < beliefs.length; i++) {
          beliefs[i].confidence *= 0.5;
          if (beliefs[i].confidence < 0.1) {
            this.beliefs.delete(beliefs[i].id);
            this.emit('belief:removed', beliefs[i]);
          }
        }
      }
    }
  }

  private extractDomain(belief: Belief): string {
    return Object.keys(belief.content).sort().join(':');
  }

  private indexBelief(belief: Belief): void {
    for (const key of Object.keys(belief.content)) {
      if (!this.indices.has(key)) {
        this.indices.set(key, new Set());
      }
      this.indices.get(key)!.add(belief.id);
    }
  }

  private matchesPattern(
    content: Record<string, unknown>,
    pattern: Record<string, unknown>
  ): boolean {
    for (const [key, value] of Object.entries(pattern)) {
      if (content[key] !== value) return false;
    }
    return true;
  }
}
```text

### Desire System
```typescript
interface Desire {
  id: string;
  goal: string;
  priority: number;
  preconditions: Condition[];
  postconditions: Condition[];
  deadline?: number;
  utility: number;
}

interface Condition {
  type: 'belief' | 'state' | 'resource';
  predicate: string;
  parameters: Record<string, unknown>;
}

class DesireManager {
  private desires: Map<string, Desire> = new Map();
  private activeDesires: Set<string> = new Set();

  addDesire(desire: Desire): void {
    this.desires.set(desire.id, desire);
  }

  removeDesire(desireId: string): void {
    this.desires.delete(desireId);
    this.activeDesires.delete(desireId);
  }

  async evaluateDesires(beliefs: BeliefBase): Promise<Desire[]> {
    const achievable: Desire[] = [];

    for (const desire of this.desires.values()) {
      // Check if preconditions are satisfiable given current beliefs
      const satisfiable = await this.checkPreconditions(
        desire.preconditions,
        beliefs
      );

      if (satisfiable) {
        achievable.push(desire);
      }
    }

    // Sort by priority and utility
    achievable.sort((a, b) => {
      const scoreA = a.priority * 0.6 + a.utility * 0.4;
      const scoreB = b.priority * 0.6 + b.utility * 0.4;
      return scoreB - scoreA;
    });

    return achievable;
  }

  selectDesires(
    achievable: Desire[],
    maxConcurrent: number = 3
  ): Desire[] {
    // Filter out conflicting desires
    const compatible = this.filterConflicts(achievable);

    // Select top desires respecting concurrency limit
    const selected = compatible.slice(0, maxConcurrent);
    this.activeDesires = new Set(selected.map(d => d.id));

    return selected;
  }

  private async checkPreconditions(
    conditions: Condition[],
    beliefs: BeliefBase
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (condition.type === 'belief') {
        const matching = beliefs.query({
          pattern: condition.parameters as Record<string, unknown>,
          minConfidence: 0.5
        });
        if (matching.length === 0) return false;
      }
    }
    return true;
  }

  private filterConflicts(desires: Desire[]): Desire[] {
    const selected: Desire[] = [];
    const usedResources = new Set<string>();

    for (const desire of desires) {
      const resources = this.extractResources(desire);
      const hasConflict = resources.some(r => usedResources.has(r));

      if (!hasConflict) {
        selected.push(desire);
        resources.forEach(r => usedResources.add(r));
      }
    }

    return selected;
  }

  private extractResources(desire: Desire): string[] {
    return desire.preconditions
      .filter(c => c.type === 'resource')
      .map(c => c.predicate);
  }
}
```text

### Intention System
```typescript
interface Intention {
  id: string;
  desireId: string;
  plan: Plan;
  status: 'pending' | 'active' | 'suspended' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
}

interface Plan {
  id: string;
  steps: PlanStep[];
  currentStep: number;
  context: Record<string, unknown>;
}

interface PlanStep {
  id: string;
  action: string;
  parameters: Record<string, unknown>;
  guards: Condition[];
  effects: Condition[];
  timeout?: number;
}

class IntentionManager {
  private intentions: Map<string, Intention> = new Map();
  private planLibrary: Map<string, Plan[]> = new Map();

  async formIntention(
    desire: Desire,
    beliefs: BeliefBase
  ): Promise<Intention> {
    // Select best plan from library
    const plan = await this.selectPlan(desire, beliefs);

    const intention: Intention = {
      id: `intention_${Date.now()}_${desire.id}`,
      desireId: desire.id,
      plan,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    };

    this.intentions.set(intention.id, intention);
    return intention;
  }

  async executeIntention(
    intention: Intention,
    beliefs: BeliefBase
  ): Promise<void> {
    intention.status = 'active';
    intention.startedAt = Date.now();

    const plan = intention.plan;

    while (plan.currentStep < plan.steps.length) {
      const step = plan.steps[plan.currentStep];

      // Check step guards against current beliefs
      const guardsHold = await this.checkGuards(step.guards, beliefs);

      if (!guardsHold) {
        // Attempt plan repair
        const repaired = await this.repairPlan(intention, beliefs);
        if (!repaired) {
          intention.status = 'failed';
          return;
        }
        continue;
      }

      try {
        // Execute the step action
        await this.executeStep(step, plan.context);

        // Apply effects to belief base
        await this.applyEffects(step.effects, beliefs);

        plan.currentStep++;
      } catch (error) {
        if (intention.retryCount < intention.maxRetries) {
          intention.retryCount++;
          continue;
        }
        intention.status = 'failed';
        return;
      }
    }

    intention.status = 'completed';
    intention.completedAt = Date.now();
  }

  suspendIntention(intentionId: string): void {
    const intention = this.intentions.get(intentionId);
    if (intention && intention.status === 'active') {
      intention.status = 'suspended';
    }
  }

  resumeIntention(intentionId: string): void {
    const intention = this.intentions.get(intentionId);
    if (intention && intention.status === 'suspended') {
      intention.status = 'active';
    }
  }

  private async selectPlan(
    desire: Desire,
    beliefs: BeliefBase
  ): Promise<Plan> {
    const candidates = this.planLibrary.get(desire.goal) || [];

    // Score each plan based on applicability
    const scored = candidates.map(plan => ({
      plan,
      score: this.scorePlan(plan, beliefs),
    }));

    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // Generate a default plan
      return this.generateDefaultPlan(desire);
    }

    return scored[0].plan;
  }

  private scorePlan(plan: Plan, beliefs: BeliefBase): number {
    // Score based on step count (prefer shorter plans)
    const lengthScore = 1.0 / (1.0 + plan.steps.length * 0.1);

    // Score based on guard satisfiability
    let guardScore = 0;
    for (const step of plan.steps) {
      const matchingBeliefs = beliefs.query({ minConfidence: 0.5 });
      guardScore += matchingBeliefs.length > 0 ? 1 : 0;
    }
    guardScore /= Math.max(1, plan.steps.length);

    return lengthScore * 0.4 + guardScore * 0.6;
  }

  private async repairPlan(
    intention: Intention,
    beliefs: BeliefBase
  ): Promise<boolean> {
    const plan = intention.plan;
    const currentStep = plan.steps[plan.currentStep];

    // Try to find alternative steps
    const alternatives = this.findAlternativeSteps(
      currentStep,
      beliefs
    );

    if (alternatives.length > 0) {
      plan.steps[plan.currentStep] = alternatives[0];
      return true;
    }

    return false;
  }

  private findAlternativeSteps(
    step: PlanStep,
    beliefs: BeliefBase
  ): PlanStep[] {
    // Search for steps with the same effects but different guards
    const alternatives: PlanStep[] = [];

    for (const plans of this.planLibrary.values()) {
      for (const plan of plans) {
        for (const candidate of plan.steps) {
          if (
            candidate.action !== step.action &&
            this.effectsMatch(candidate.effects, step.effects)
          ) {
            alternatives.push(candidate);
          }
        }
      }
    }

    return alternatives;
  }

  private effectsMatch(a: Condition[], b: Condition[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((condA, i) =>
      condA.type === b[i].type && condA.predicate === b[i].predicate
    );
  }

  private generateDefaultPlan(desire: Desire): Plan {
    return {
      id: `plan_default_${desire.id}`,
      steps: [{
        id: `step_default_${desire.id}`,
        action: desire.goal,
        parameters: {},
        guards: desire.preconditions,
        effects: desire.postconditions,
      }],
      currentStep: 0,
      context: {},
    };
  }

  private async executeStep(
    step: PlanStep,
    context: Record<string, unknown>
  ): Promise<void> {
    // Step execution is delegated to the action registry
    const timeout = step.timeout || 30000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      // Execute the action with context
      await this.dispatchAction(step.action, step.parameters, context);
    } finally {
      clearTimeout(timer);
    }
  }

  private async dispatchAction(
    action: string,
    parameters: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<void> {
    // Action dispatch -- implemented by concrete agent classes
    console.log(`Executing action: ${action}`, parameters);
  }

  private async checkGuards(
    guards: Condition[],
    beliefs: BeliefBase
  ): Promise<boolean> {
    for (const guard of guards) {
      if (guard.type === 'belief') {
        const matching = beliefs.query({
          pattern: guard.parameters as Record<string, unknown>,
          minConfidence: 0.5,
        });
        if (matching.length === 0) return false;
      }
    }
    return true;
  }

  private async applyEffects(
    effects: Condition[],
    beliefs: BeliefBase
  ): Promise<void> {
    for (const effect of effects) {
      if (effect.type === 'belief') {
        beliefs.add({
          id: `effect_${Date.now()}_${effect.predicate}`,
          content: effect.parameters as Record<string, unknown>,
          confidence: 0.9,
          source: 'intention_effect',
          timestamp: Date.now(),
        });
      }
    }
  }
}
```text

### BDI Agent Coordinator
```typescript
class BDIAgent {
  private beliefs: BeliefBase;
  private desires: DesireManager;
  private intentions: IntentionManager;
  private running: boolean = false;
  private cycleInterval: number;

  constructor(config: { cycleInterval?: number } = {}) {
    this.beliefs = new BeliefBase();
    this.desires = new DesireManager();
    this.intentions = new IntentionManager();
    this.cycleInterval = config.cycleInterval || 100;
  }

  async start(): Promise<void> {
    this.running = true;

    while (this.running) {
      await this.deliberationCycle();
      await this.sleep(this.cycleInterval);
    }
  }

  stop(): void {
    this.running = false;
  }

  private async deliberationCycle(): Promise<void> {
    // 1. Perceive -- update beliefs from environment
    await this.perceive();

    // 2. Deliberate -- evaluate and select desires
    const achievable = await this.desires.evaluateDesires(this.beliefs);
    const selected = this.desires.selectDesires(achievable);

    // 3. Plan -- form intentions for selected desires
    for (const desire of selected) {
      const intention = await this.intentions.formIntention(
        desire,
        this.beliefs
      );

      // 4. Act -- execute intentions
      await this.intentions.executeIntention(intention, this.beliefs);
    }
  }

  private async perceive(): Promise<void> {
    // Override in concrete implementations to read from sensors,
    // APIs, message queues, or other environment interfaces
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```text

## Layered Agent Architecture

### Architecture Overview
The layered architecture separates agent concerns into distinct tiers, each responsible for a specific level of abstraction. Information flows between layers through well-defined interfaces, enabling independent evolution and testing of each layer.

### Layer Definitions

#### Reactive Layer
```typescript
interface Stimulus {
  type: string;
  source: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface Response {
  action: string;
  parameters: Record<string, unknown>;
  priority: number;
}

type ReactionRule = {
  condition: (stimulus: Stimulus) => boolean;
  response: (stimulus: Stimulus) => Response;
  priority: number;
};

class ReactiveLayer {
  private rules: ReactionRule[] = [];
  private responseBuffer: Response[] = [];

  addRule(rule: ReactionRule): void {
    this.rules.push(rule);
    // Keep rules sorted by priority (highest first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  process(stimulus: Stimulus): Response | null {
    for (const rule of this.rules) {
      if (rule.condition(stimulus)) {
        const response = rule.response(stimulus);
        this.responseBuffer.push(response);
        return response;
      }
    }
    return null;
  }

  getBufferedResponses(): Response[] {
    const responses = [...this.responseBuffer];
    this.responseBuffer = [];
    return responses;
  }
}
```text

#### Deliberative Layer
```typescript
interface Goal {
  id: string;
  description: string;
  priority: number;
  status: 'pending' | 'pursuing' | 'achieved' | 'abandoned';
  subgoals: Goal[];
}

interface WorldModel {
  entities: Map<string, Record<string, unknown>>;
  relationships: Map<string, [string, string]>;
  update(perception: Record<string, unknown>): void;
  query(predicate: string): Record<string, unknown>[];
}

class DeliberativeLayer {
  private goals: Map<string, Goal> = new Map();
  private worldModel: WorldModel;
  private planner: Planner;

  constructor(worldModel: WorldModel, planner: Planner) {
    this.worldModel = worldModel;
    this.planner = planner;
  }

  async reason(
    perceptions: Record<string, unknown>[],
    reactiveResponses: Response[]
  ): Promise<Plan[]> {
    // Update world model with new perceptions
    for (const perception of perceptions) {
      this.worldModel.update(perception);
    }

    // Evaluate current goals
    const activeGoals = await this.evaluateGoals();

    // Generate plans for active goals
    const plans: Plan[] = [];
    for (const goal of activeGoals) {
      const plan = await this.planner.generatePlan(
        goal,
        this.worldModel,
        reactiveResponses
      );
      if (plan) {
        plans.push(plan);
      }
    }

    return plans;
  }

  addGoal(goal: Goal): void {
    this.goals.set(goal.id, goal);
  }

  private async evaluateGoals(): Promise<Goal[]> {
    const active: Goal[] = [];

    for (const goal of this.goals.values()) {
      if (goal.status === 'pending' || goal.status === 'pursuing') {
        // Check if goal is still achievable
        const achievable = await this.isAchievable(goal);
        if (achievable) {
          goal.status = 'pursuing';
          active.push(goal);
        } else {
          goal.status = 'abandoned';
        }
      }
    }

    // Sort by priority
    active.sort((a, b) => b.priority - a.priority);
    return active;
  }

  private async isAchievable(goal: Goal): Promise<boolean> {
    // Check world model for goal achievability
    const state = this.worldModel.query(goal.description);
    return state.length > 0 || goal.subgoals.length > 0;
  }
}
```text

#### Meta-Management Layer
```typescript
interface PerformanceMetrics {
  responseTime: number;
  successRate: number;
  resourceUsage: number;
  goalCompletionRate: number;
}

class MetaManagementLayer {
  private metricsHistory: PerformanceMetrics[] = [];
  private strategies: Map<string, LayerStrategy> = new Map();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  monitor(metrics: PerformanceMetrics): void {
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  analyze(): MetaAnalysis {
    const recent = this.metricsHistory.slice(-100);

    return {
      averageResponseTime: this.average(recent.map(m => m.responseTime)),
      averageSuccessRate: this.average(recent.map(m => m.successRate)),
      trend: this.calculateTrend(recent),
      anomalies: this.detectAnomalies(recent),
      recommendations: this.generateRecommendations(recent),
    };
  }

  adjustStrategy(analysis: MetaAnalysis): void {
    // Adjust layer priorities based on performance
    if (analysis.averageResponseTime > 1000) {
      this.strategies.set('reactive', {
        priority: 'high',
        resourceShare: 0.6,
      });
    }

    if (analysis.averageSuccessRate < 0.7) {
      this.strategies.set('deliberative', {
        priority: 'high',
        resourceShare: 0.5,
      });
    }
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateTrend(metrics: PerformanceMetrics[]): string {
    if (metrics.length < 2) return 'insufficient_data';

    const firstHalf = metrics.slice(0, metrics.length / 2);
    const secondHalf = metrics.slice(metrics.length / 2);

    const firstAvg = this.average(firstHalf.map(m => m.successRate));
    const secondAvg = this.average(secondHalf.map(m => m.successRate));

    if (secondAvg > firstAvg * 1.1) return 'improving';
    if (secondAvg < firstAvg * 0.9) return 'declining';
    return 'stable';
  }

  private detectAnomalies(metrics: PerformanceMetrics[]): string[] {
    const anomalies: string[] = [];
    const avgResponse = this.average(metrics.map(m => m.responseTime));

    for (const metric of metrics) {
      if (metric.responseTime > avgResponse * 3) {
        anomalies.push('response_time_spike');
      }
      if (metric.successRate < 0.3) {
        anomalies.push('low_success_rate');
      }
    }

    return [...new Set(anomalies)];
  }

  private generateRecommendations(
    metrics: PerformanceMetrics[]
  ): string[] {
    const recommendations: string[] = [];
    const analysis = {
      avgResponse: this.average(metrics.map(m => m.responseTime)),
      avgSuccess: this.average(metrics.map(m => m.successRate)),
      avgResource: this.average(metrics.map(m => m.resourceUsage)),
    };

    if (analysis.avgResponse > 500) {
      recommendations.push('Consider caching frequent deliberation results');
    }
    if (analysis.avgSuccess < 0.8) {
      recommendations.push('Review and update reactive rules');
    }
    if (analysis.avgResource > 0.9) {
      recommendations.push('Scale resources or reduce concurrent goals');
    }

    return recommendations;
  }
}

interface LayerStrategy {
  priority: string;
  resourceShare: number;
}

interface MetaAnalysis {
  averageResponseTime: number;
  averageSuccessRate: number;
  trend: string;
  anomalies: string[];
  recommendations: string[];
}
```text

### Layered Agent Coordinator
```typescript
class LayeredAgent {
  private reactiveLayer: ReactiveLayer;
  private deliberativeLayer: DeliberativeLayer;
  private metaLayer: MetaManagementLayer;
  private running: boolean = false;

  constructor(worldModel: WorldModel, planner: Planner) {
    this.reactiveLayer = new ReactiveLayer();
    this.deliberativeLayer = new DeliberativeLayer(worldModel, planner);
    this.metaLayer = new MetaManagementLayer();
  }

  async processInput(stimulus: Stimulus): Promise<Response[]> {
    const startTime = Date.now();
    const responses: Response[] = [];

    // Layer 1: Reactive processing (fast path)
    const reactiveResponse = this.reactiveLayer.process(stimulus);
    if (reactiveResponse) {
      responses.push(reactiveResponse);
    }

    // Layer 2: Deliberative reasoning (slow path)
    const plans = await this.deliberativeLayer.reason(
      [stimulus.data],
      responses
    );
    for (const plan of plans) {
      for (const step of plan.steps) {
        responses.push({
          action: step.action,
          parameters: step.parameters,
          priority: 5,
        });
      }
    }

    // Layer 3: Meta-management (monitoring and adjustment)
    this.metaLayer.monitor({
      responseTime: Date.now() - startTime,
      successRate: responses.length > 0 ? 1.0 : 0.0,
      resourceUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
      goalCompletionRate: 0.0,
    });

    const analysis = this.metaLayer.analyze();
    this.metaLayer.adjustStrategy(analysis);

    return responses;
  }
}
```text

## Cognitive Agent Implementation

### Cognitive Architecture Overview
Cognitive agents integrate perception, memory, reasoning, and learning into a unified architecture inspired by cognitive science models. They maintain working memory, long-term memory, and procedural knowledge.

### Working Memory System
```typescript
interface MemoryItem {
  id: string;
  content: Record<string, unknown>;
  activation: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  associations: string[];
}

class WorkingMemory {
  private items: Map<string, MemoryItem> = new Map();
  private capacity: number;
  private decayRate: number;

  constructor(capacity: number = 7, decayRate: number = 0.1) {
    this.capacity = capacity;
    this.decayRate = decayRate;
  }

  store(content: Record<string, unknown>, associations: string[] = []): string {
    const id = `wm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Enforce capacity limit -- evict least activated item
    if (this.items.size >= this.capacity) {
      this.evictLeastActive();
    }

    const item: MemoryItem = {
      id,
      content,
      activation: 1.0,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      associations,
    };

    this.items.set(id, item);
    return id;
  }

  retrieve(id: string): MemoryItem | undefined {
    const item = this.items.get(id);
    if (item) {
      item.activation = Math.min(1.0, item.activation + 0.2);
      item.lastAccessed = Date.now();
      item.accessCount++;
    }
    return item;
  }

  search(
    predicate: (item: MemoryItem) => boolean
  ): MemoryItem[] {
    this.decayActivations();
    return Array.from(this.items.values())
      .filter(predicate)
      .sort((a, b) => b.activation - a.activation);
  }

  private evictLeastActive(): void {
    this.decayActivations();

    let leastActive: MemoryItem | null = null;
    for (const item of this.items.values()) {
      if (!leastActive || item.activation < leastActive.activation) {
        leastActive = item;
      }
    }

    if (leastActive) {
      this.items.delete(leastActive.id);
    }
  }

  private decayActivations(): void {
    const now = Date.now();
    for (const item of this.items.values()) {
      const elapsed = (now - item.lastAccessed) / 1000;
      item.activation *= Math.exp(-this.decayRate * elapsed);
    }
  }
}
```text

### Long-Term Memory System
```typescript
interface LTMEntry {
  id: string;
  content: Record<string, unknown>;
  category: 'episodic' | 'semantic' | 'procedural';
  strength: number;
  encodedAt: number;
  lastRetrieved: number;
  retrievalCount: number;
  connections: Map<string, number>;
}

class LongTermMemory {
  private entries: Map<string, LTMEntry> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();

  encode(
    content: Record<string, unknown>,
    category: LTMEntry['category'],
    relatedIds: string[] = []
  ): string {
    const id = `ltm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const connections = new Map<string, number>();
    for (const relatedId of relatedIds) {
      connections.set(relatedId, 1.0);
      // Strengthen bidirectional connections
      const related = this.entries.get(relatedId);
      if (related) {
        related.connections.set(id, 1.0);
      }
    }

    const entry: LTMEntry = {
      id,
      content,
      category,
      strength: 1.0,
      encodedAt: Date.now(),
      lastRetrieved: Date.now(),
      retrievalCount: 0,
      connections,
    };

    this.entries.set(id, entry);

    // Update category index
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(id);

    return id;
  }

  retrieve(id: string): LTMEntry | undefined {
    const entry = this.entries.get(id);
    if (entry) {
      // Strengthen on retrieval (spaced repetition effect)
      entry.strength = Math.min(1.0, entry.strength + 0.1);
      entry.lastRetrieved = Date.now();
      entry.retrievalCount++;
    }
    return entry;
  }

  spreadingActivation(
    startId: string,
    depth: number = 3,
    threshold: number = 0.3
  ): LTMEntry[] {
    const activated: Map<string, number> = new Map();
    const visited: Set<string> = new Set();
    const queue: [string, number][] = [[startId, 1.0]];

    while (queue.length > 0) {
      const [currentId, activation] = queue.shift()!;

      if (visited.has(currentId) || activation < threshold) continue;
      visited.add(currentId);
      activated.set(currentId, activation);

      const entry = this.entries.get(currentId);
      if (!entry || visited.size >= depth * 10) continue;

      for (const [connectedId, weight] of entry.connections) {
        const propagated = activation * weight * 0.7;
        if (propagated >= threshold) {
          queue.push([connectedId, propagated]);
        }
      }
    }

    return Array.from(activated.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.entries.get(id)!)
      .filter(Boolean);
  }

  queryByCategory(
    category: LTMEntry['category'],
    limit: number = 10
  ): LTMEntry[] {
    const ids = this.categoryIndex.get(category);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.entries.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  consolidate(): void {
    const now = Date.now();

    for (const entry of this.entries.values()) {
      // Apply forgetting curve
      const elapsed = (now - entry.lastRetrieved) / (1000 * 3600);
      const retentionFactor = Math.pow(
        1.0 + entry.retrievalCount,
        0.3
      );
      entry.strength *= Math.exp(-elapsed / (24 * retentionFactor));

      // Remove entries below threshold
      if (entry.strength < 0.01) {
        this.entries.delete(entry.id);
        for (const category of this.categoryIndex.values()) {
          category.delete(entry.id);
        }
      }
    }
  }
}
```text

### Cognitive Agent Coordinator
```typescript
class CognitiveAgent {
  private workingMemory: WorkingMemory;
  private longTermMemory: LongTermMemory;
  private perceptionBuffer: Record<string, unknown>[] = [];

  constructor(config: {
    wmCapacity?: number;
    wmDecayRate?: number;
  } = {}) {
    this.workingMemory = new WorkingMemory(
      config.wmCapacity || 7,
      config.wmDecayRate || 0.1
    );
    this.longTermMemory = new LongTermMemory();
  }

  async perceive(input: Record<string, unknown>): Promise<void> {
    // Store perception in working memory
    const wmId = this.workingMemory.store(input);

    // Check for matching long-term memories
    const associations = this.longTermMemory.queryByCategory(
      'episodic',
      5
    );

    // Link current perception to retrieved memories
    for (const assoc of associations) {
      this.workingMemory.store(assoc.content, [wmId]);
    }

    this.perceptionBuffer.push(input);
  }

  async reason(): Promise<Record<string, unknown>> {
    // Gather all active working memory items
    const activeItems = this.workingMemory.search(() => true);

    // Retrieve procedural knowledge
    const procedures = this.longTermMemory.queryByCategory(
      'procedural',
      10
    );

    // Apply reasoning based on active items and procedures
    const conclusions: Record<string, unknown> = {};

    for (const procedure of procedures) {
      const applicable = this.checkApplicability(
        procedure,
        activeItems
      );
      if (applicable) {
        const result = await this.applyProcedure(
          procedure,
          activeItems
        );
        Object.assign(conclusions, result);
      }
    }

    return conclusions;
  }

  async learn(
    experience: Record<string, unknown>,
    category: LTMEntry['category'] = 'episodic'
  ): Promise<void> {
    // Encode experience into long-term memory
    const relatedItems = this.workingMemory.search(
      item => item.activation > 0.5
    );

    const relatedIds = relatedItems
      .map(item => {
        // Find corresponding LTM entries
        const ltmEntries = this.longTermMemory.queryByCategory(
          category,
          1
        );
        return ltmEntries[0]?.id;
      })
      .filter(Boolean) as string[];

    this.longTermMemory.encode(experience, category, relatedIds);
  }

  consolidateMemory(): void {
    this.longTermMemory.consolidate();
  }

  private checkApplicability(
    procedure: LTMEntry,
    activeItems: MemoryItem[]
  ): boolean {
    const conditions = procedure.content['conditions'] as
      Record<string, unknown>[] | undefined;
    if (!conditions) return false;

    return conditions.every(condition =>
      activeItems.some(item =>
        this.matchCondition(item.content, condition)
      )
    );
  }

  private async applyProcedure(
    procedure: LTMEntry,
    activeItems: MemoryItem[]
  ): Promise<Record<string, unknown>> {
    const actions = procedure.content['actions'] as
      Record<string, unknown>[] | undefined;
    if (!actions) return {};

    const results: Record<string, unknown> = {};
    for (const action of actions) {
      const actionType = action['type'] as string;
      results[actionType] = action['parameters'];
    }

    return results;
  }

  private matchCondition(
    content: Record<string, unknown>,
    condition: Record<string, unknown>
  ): boolean {
    for (const [key, value] of Object.entries(condition)) {
      if (content[key] !== value) return false;
    }
    return true;
  }
}
```text

## Integration Patterns

### Agent-to-Agent Communication
```typescript
interface AgentMessage {
  id: string;
  from: string;
  to: string;
  performative: 'inform' | 'request' | 'propose' | 'accept' | 'reject' | 'query';
  content: Record<string, unknown>;
  replyTo?: string;
  timestamp: number;
}

class AgentMessageBus {
  private handlers: Map<string, ((msg: AgentMessage) => Promise<void>)[]> = new Map();
  private messageLog: AgentMessage[] = [];

  register(
    agentId: string,
    handler: (msg: AgentMessage) => Promise<void>
  ): void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, []);
    }
    this.handlers.get(agentId)!.push(handler);
  }

  async send(message: AgentMessage): Promise<void> {
    this.messageLog.push(message);

    const handlers = this.handlers.get(message.to);
    if (handlers) {
      for (const handler of handlers) {
        await handler(message);
      }
    }
  }

  async broadcast(
    fromId: string,
    content: Record<string, unknown>,
    performative: AgentMessage['performative'] = 'inform'
  ): Promise<void> {
    for (const agentId of this.handlers.keys()) {
      if (agentId !== fromId) {
        await this.send({
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          from: fromId,
          to: agentId,
          performative,
          content,
          timestamp: Date.now(),
        });
      }
    }
  }
}
```text

### Agent-to-Service Integration
```typescript
interface ServiceEndpoint {
  url: string;
  protocol: 'http' | 'grpc' | 'ws';
  authentication?: {
    type: 'bearer' | 'api_key' | 'oauth2';
    credentials: string;
  };
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
}

class ServiceIntegration {
  private endpoints: Map<string, ServiceEndpoint> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  registerEndpoint(name: string, endpoint: ServiceEndpoint): void {
    this.endpoints.set(name, endpoint);
    this.circuitBreakers.set(name, new CircuitBreaker({
      failureThreshold: 5,
      resetTimeMs: 30000,
    }));
  }

  async call(
    serviceName: string,
    method: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const endpoint = this.endpoints.get(serviceName);
    if (!endpoint) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    const breaker = this.circuitBreakers.get(serviceName)!;

    return breaker.execute(async () => {
      return this.executeWithRetry(endpoint, method, payload);
    });
  }

  private async executeWithRetry(
    endpoint: ServiceEndpoint,
    method: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const { maxRetries, backoffMs, backoffMultiplier } = endpoint.retryPolicy;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(endpoint, method, payload);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = backoffMs * Math.pow(backoffMultiplier, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private async execute(
    endpoint: ServiceEndpoint,
    method: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Implementation delegates to protocol-specific handlers
    switch (endpoint.protocol) {
      case 'http':
        return this.executeHttp(endpoint, method, payload);
      case 'grpc':
        return this.executeGrpc(endpoint, method, payload);
      case 'ws':
        return this.executeWs(endpoint, method, payload);
      default:
        throw new Error(`Unsupported protocol: ${endpoint.protocol}`);
    }
  }

  private async executeHttp(
    endpoint: ServiceEndpoint,
    method: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (endpoint.authentication) {
      headers['Authorization'] = `${endpoint.authentication.type} ${endpoint.authentication.credentials}`;
    }

    const response = await fetch(`${endpoint.url}/${method}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(endpoint.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async executeGrpc(
    _endpoint: ServiceEndpoint,
    _method: string,
    _payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // gRPC implementation placeholder
    throw new Error('gRPC not yet implemented');
  }

  private async executeWs(
    _endpoint: ServiceEndpoint,
    _method: string,
    _payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // WebSocket implementation placeholder
    throw new Error('WebSocket not yet implemented');
  }
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureThreshold: number;
  private resetTimeMs: number;

  constructor(config: { failureThreshold: number; resetTimeMs: number }) {
    this.failureThreshold = config.failureThreshold;
    this.resetTimeMs = config.resetTimeMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}
```text

## Testing Approaches

### Architecture Testing Strategy
Agent architectures require testing at multiple levels: individual component tests, layer interaction tests, and full-agent integration tests.

### BDI Component Tests
```typescript
// Test belief revision
describe('BeliefBase', () => {
  it('should merge beliefs with confidence weighting', () => {
    const base = new BeliefBase();

    base.add({
      id: 'weather',
      content: { condition: 'sunny' },
      confidence: 0.8,
      source: 'sensor_1',
      timestamp: Date.now(),
    });

    base.add({
      id: 'weather',
      content: { condition: 'sunny', temperature: 25 },
      confidence: 0.6,
      source: 'sensor_2',
      timestamp: Date.now(),
    });

    const results = base.query({ minConfidence: 0.5 });
    expect(results).toHaveLength(1);
    expect(results[0].content).toEqual({
      condition: 'sunny',
      temperature: 25,
    });
  });

  it('should expire beliefs beyond TTL', () => {
    const base = new BeliefBase();

    base.add({
      id: 'temp_belief',
      content: { value: 'temporary' },
      confidence: 1.0,
      source: 'test',
      timestamp: Date.now() - 60000,
      ttl: 30000,
    });

    const results = base.query({});
    expect(results).toHaveLength(0);
  });
});
```text

### Layered Architecture Tests
```typescript
describe('LayeredAgent', () => {
  it('should prioritize reactive responses', async () => {
    const agent = new LayeredAgent(mockWorldModel, mockPlanner);

    agent.reactiveLayer.addRule({
      condition: (s) => s.type === 'emergency',
      response: (s) => ({
        action: 'emergency_stop',
        parameters: s.data,
        priority: 10,
      }),
      priority: 100,
    });

    const responses = await agent.processInput({
      type: 'emergency',
      source: 'sensor',
      data: { level: 'critical' },
      timestamp: Date.now(),
    });

    expect(responses[0].action).toBe('emergency_stop');
    expect(responses[0].priority).toBe(10);
  });

  it('should monitor and adjust strategy via meta-layer', async () => {
    const agent = new LayeredAgent(mockWorldModel, mockPlanner);

    // Simulate slow responses
    for (let i = 0; i < 20; i++) {
      await agent.processInput({
        type: 'complex_query',
        source: 'user',
        data: { complexity: 'high' },
        timestamp: Date.now(),
      });
    }

    const analysis = agent.metaLayer.analyze();
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });
});
```text

### Integration Tests
```typescript
describe('Agent Integration', () => {
  it('should handle full BDI deliberation cycle', async () => {
    const agent = new BDIAgent({ cycleInterval: 10 });

    // Add a desire
    agent.desires.addDesire({
      id: 'gather_info',
      goal: 'gather_information',
      priority: 5,
      preconditions: [],
      postconditions: [{
        type: 'belief',
        predicate: 'has_information',
        parameters: { gathered: true },
      }],
      utility: 0.8,
    });

    // Run one cycle
    await agent.deliberationCycle();

    // Verify intention was formed and executed
    const beliefs = agent.beliefs.query({
      pattern: { gathered: true },
    });
    expect(beliefs.length).toBeGreaterThan(0);
  });

  it('should coordinate agents via message bus', async () => {
    const bus = new AgentMessageBus();
    const received: AgentMessage[] = [];

    bus.register('agent_b', async (msg) => {
      received.push(msg);
    });

    await bus.send({
      id: 'msg_1',
      from: 'agent_a',
      to: 'agent_b',
      performative: 'request',
      content: { action: 'analyze', target: 'data_set_1' },
      timestamp: Date.now(),
    });

    expect(received).toHaveLength(1);
    expect(received[0].performative).toBe('request');
    expect(received[0].content.action).toBe('analyze');
  });
});
```text

## Performance Optimization

### Architecture-Level Optimizations
1. Belief Indexing
   - Maintain indices on frequently queried belief properties
   - Use hash-based lookups instead of linear scans
   - Batch belief updates during perception phases

2. Plan Caching
   - Cache successful plans for reuse in similar contexts
   - Implement plan templates with parameterized steps
   - Use plan fingerprinting for fast cache lookups

3. Memory Management
   - Implement working memory capacity limits with intelligent eviction
   - Use activation-based decay for long-term memory consolidation
   - Batch memory consolidation during idle periods

4. Layer Communication
   - Use shared memory between layers when possible
   - Implement asynchronous layer communication for non-critical paths
   - Buffer and batch inter-layer messages

## Related Resources

### Framework Integration
- [[agent_pattern_framework]]
- [[agent_mcp_framework]]
- [[agent_tool_framework]]
- [[agent_communication_framework]]

### Documentation
- [[architecture_specification]]
- [[implementation_guidelines]]
- [[best_practices]]

### Guides
- [[agent_pattern_implementation_guide]]
- [[pattern_best_practices]]
- [[optimization_guidelines]]

## Additional Resources

### Example Implementations
- Complete BDI agent implementations
- Layered architecture examples
- Cognitive agent demonstrations
- Multi-agent coordination scenarios

### Best Practices
- Architecture selection criteria
- Layer boundary design
- Memory system tuning
- Performance profiling

### Troubleshooting Guide
- Common architecture pitfalls
- Debugging deliberation cycles
- Memory leak detection
- Performance bottleneck identification

---
**Related Documents**
- [[agent_pattern_framework]]
- [[agent_mcp_framework]]
- [[agent_tool_framework]]
- [[agent_communication_framework]]
- [[quality_assurance]]
- [[security_framework]]
- [[integration_framework]]
