---
title: Agent Integration Framework
created: 2025-02-19
updated: 2025-02-19
tags: [meta, autonomous, integration, framework, API, service-mesh]
---

# Agent Integration Framework

## Overview
This document defines the comprehensive framework for autonomous agent integration capabilities, establishing patterns and contracts for connecting agents with external systems, services, and each other. It covers API contracts, data exchange formats, error handling strategies, event-driven integration, service mesh patterns, and testing approaches for integration points.

## Integration Architecture

### Core Components
1. Integration Engine
   - Connection management
   - Protocol negotiation
   - Data transformation
   - State synchronization

2. API Gateway
   - Request routing
   - Rate limiting
   - Authentication proxy
   - Response aggregation

3. Event Bus
   - Event publishing
   - Event subscription
   - Event routing
   - Dead letter handling

4. Data Exchange Layer
   - Format negotiation
   - Schema validation
   - Transformation pipeline
   - Serialization management

## API Contract System

### Contract Definition
1. Contract Types
   - Synchronous request-response contracts
   - Asynchronous message contracts
   - Streaming data contracts
   - Event notification contracts

2. Contract Elements
   - Endpoint specification
   - Request schema
   - Response schema
   - Error schema
   - Authentication requirements
   - Rate limit specifications

### Contract Specification Format
```typescript
interface APIContract {
  id: string;
  version: string;
  name: string;
  description: string;
  baseUrl: string;
  authentication: AuthenticationSpec;
  endpoints: EndpointSpec[];
  schemas: SchemaRegistry;
  errorCodes: ErrorCodeRegistry;
}

interface EndpointSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestSchema?: string;
  responseSchema: string;
  errorSchemas: string[];
  rateLimit?: RateLimitSpec;
  timeout: number;
  retryPolicy?: RetryPolicy;
  headers?: Record<string, HeaderSpec>;
}

interface AuthenticationSpec {
  type: 'bearer' | 'api_key' | 'oauth2' | 'mtls';
  tokenEndpoint?: string;
  scopes?: string[];
  keyLocation?: 'header' | 'query' | 'cookie';
  keyName?: string;
}

interface RateLimitSpec {
  requestsPerSecond: number;
  burstSize: number;
  retryAfterHeader: string;
}

interface RetryPolicy {
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

interface HeaderSpec {
  required: boolean;
  description: string;
  defaultValue?: string;
}
```text

### Contract Registry
```typescript
class ContractRegistry {
  private contracts: Map<string, APIContract> = new Map();
  private versionIndex: Map<string, Map<string, APIContract>> = new Map();

  register(contract: APIContract): void {
    const key = `${contract.name}:${contract.version}`;
    this.contracts.set(key, contract);

    // Index by name for version lookup
    if (!this.versionIndex.has(contract.name)) {
      this.versionIndex.set(contract.name, new Map());
    }
    this.versionIndex.get(contract.name)!.set(contract.version, contract);
  }

  resolve(name: string, version?: string): APIContract | undefined {
    if (version) {
      return this.contracts.get(`${name}:${version}`);
    }

    // Return latest version
    const versions = this.versionIndex.get(name);
    if (!versions || versions.size === 0) return undefined;

    const sorted = Array.from(versions.keys()).sort();
    return versions.get(sorted[sorted.length - 1]);
  }

  validateRequest(
    contractName: string,
    endpointPath: string,
    request: Record<string, unknown>
  ): ValidationResult {
    const contract = this.resolve(contractName);
    if (!contract) {
      return { valid: false, errors: [`Contract not found: ${contractName}`] };
    }

    const endpoint = contract.endpoints.find(e => e.path === endpointPath);
    if (!endpoint) {
      return { valid: false, errors: [`Endpoint not found: ${endpointPath}`] };
    }

    if (!endpoint.requestSchema) {
      return { valid: true, errors: [] };
    }

    const schema = contract.schemas.get(endpoint.requestSchema);
    if (!schema) {
      return { valid: false, errors: [`Schema not found: ${endpoint.requestSchema}`] };
    }

    return this.validateAgainstSchema(request, schema);
  }

  private validateAgainstSchema(
    data: Record<string, unknown>,
    schema: SchemaDefinition
  ): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    for (const field of schema.required || []) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate field types
    for (const [field, spec] of Object.entries(schema.properties || {})) {
      if (field in data) {
        const value = data[field];
        if (typeof value !== spec.type && value !== null) {
          errors.push(`Field ${field}: expected ${spec.type}, got ${typeof value}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface SchemaDefinition {
  type: string;
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
}

type SchemaRegistry = Map<string, SchemaDefinition>;
type ErrorCodeRegistry = Map<number, { message: string; description: string }>;
```text

## Data Exchange Formats

### Format Negotiation
1. Supported Formats
   - JSON (default)
   - Protocol Buffers (high-performance)
   - MessagePack (compact binary)
   - CBOR (constrained environments)

2. Negotiation Strategy
   - Accept header parsing
   - Content-Type validation
   - Fallback to JSON
   - Format capability advertisement

### Data Transformation Pipeline
```typescript
interface DataTransformer {
  name: string;
  inputFormat: string;
  outputFormat: string;
  transform(data: unknown): unknown;
}

interface TransformationPipeline {
  id: string;
  steps: DataTransformer[];
  errorHandler: (error: Error, step: DataTransformer) => unknown;
}

class DataExchangeManager {
  private transformers: Map<string, DataTransformer> = new Map();
  private pipelines: Map<string, TransformationPipeline> = new Map();
  private formatNegotiator: FormatNegotiator;

  constructor() {
    this.formatNegotiator = new FormatNegotiator();
    this.registerDefaultTransformers();
  }

  async exchange(
    source: DataSource,
    target: DataTarget,
    data: unknown
  ): Promise<unknown> {
    // Negotiate format
    const format = this.formatNegotiator.negotiate(
      source.supportedFormats,
      target.supportedFormats
    );

    // Find or build transformation pipeline
    const pipeline = this.findPipeline(source.format, format)
      || this.buildPipeline(source.format, format);

    // Execute transformation
    let result = data;
    for (const step of pipeline.steps) {
      try {
        result = step.transform(result);
      } catch (error) {
        result = pipeline.errorHandler(error as Error, step);
      }
    }

    return result;
  }

  registerTransformer(transformer: DataTransformer): void {
    const key = `${transformer.inputFormat}:${transformer.outputFormat}`;
    this.transformers.set(key, transformer);
  }

  private findPipeline(
    inputFormat: string,
    outputFormat: string
  ): TransformationPipeline | undefined {
    return this.pipelines.get(`${inputFormat}:${outputFormat}`);
  }

  private buildPipeline(
    inputFormat: string,
    outputFormat: string
  ): TransformationPipeline {
    // Build a multi-step pipeline if direct transformation unavailable
    const directKey = `${inputFormat}:${outputFormat}`;
    const direct = this.transformers.get(directKey);

    if (direct) {
      const pipeline: TransformationPipeline = {
        id: directKey,
        steps: [direct],
        errorHandler: (error, step) => {
          throw new Error(
            `Transformation failed at ${step.name}: ${error.message}`
          );
        },
      };
      this.pipelines.set(directKey, pipeline);
      return pipeline;
    }

    // Try routing through JSON as intermediate format
    const toJson = this.transformers.get(`${inputFormat}:json`);
    const fromJson = this.transformers.get(`json:${outputFormat}`);

    if (toJson && fromJson) {
      const pipeline: TransformationPipeline = {
        id: `${inputFormat}:json:${outputFormat}`,
        steps: [toJson, fromJson],
        errorHandler: (error, step) => {
          throw new Error(
            `Transformation failed at ${step.name}: ${error.message}`
          );
        },
      };
      this.pipelines.set(directKey, pipeline);
      return pipeline;
    }

    throw new Error(
      `No transformation path from ${inputFormat} to ${outputFormat}`
    );
  }

  private registerDefaultTransformers(): void {
    this.registerTransformer({
      name: 'json-to-json',
      inputFormat: 'json',
      outputFormat: 'json',
      transform: (data) => data,
    });
  }
}

class FormatNegotiator {
  private preferenceOrder = ['json', 'msgpack', 'protobuf', 'cbor'];

  negotiate(
    sourceFormats: string[],
    targetFormats: string[]
  ): string {
    // Find common formats
    const common = sourceFormats.filter(f => targetFormats.includes(f));

    if (common.length === 0) {
      return 'json'; // Fallback
    }

    // Return highest preference common format
    for (const preferred of this.preferenceOrder) {
      if (common.includes(preferred)) {
        return preferred;
      }
    }

    return common[0];
  }
}

interface DataSource {
  format: string;
  supportedFormats: string[];
}

interface DataTarget {
  format: string;
  supportedFormats: string[];
}
```text

### Schema Validation
- Request Schema Validation
  - Required field checks
  - Type validation
  - Value range constraints
  - Custom validation rules

- Response Schema Validation
  - Structure verification
  - Type conformance
  - Completeness checks
  - Backward compatibility

## Error Handling

### Error Categories
1. Transient Errors
   - Network timeouts
   - Service unavailable (503)
   - Rate limit exceeded (429)
   - Connection reset

2. Permanent Errors
   - Authentication failure (401)
   - Authorization denied (403)
   - Resource not found (404)
   - Schema validation failure (422)

3. System Errors
   - Internal server error (500)
   - Out of memory
   - Disk full
   - Configuration error

### Error Handling Strategy
```typescript
interface IntegrationError {
  code: string;
  category: 'transient' | 'permanent' | 'system';
  message: string;
  source: string;
  timestamp: number;
  retryable: boolean;
  context: Record<string, unknown>;
  originalError?: Error;
}

interface ErrorPolicy {
  category: IntegrationError['category'];
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fibonacci';
  initialDelayMs: number;
  maxDelayMs: number;
  fallbackAction?: string;
  alertThreshold: number;
}

class IntegrationErrorHandler {
  private policies: Map<string, ErrorPolicy> = new Map();
  private errorLog: IntegrationError[] = [];
  private alertCallbacks: ((error: IntegrationError) => void)[] = [];
  private errorCounts: Map<string, number> = new Map();

  constructor() {
    this.registerDefaultPolicies();
  }

  async handle(error: IntegrationError): Promise<ErrorResolution> {
    // Log the error
    this.errorLog.push(error);

    // Track error counts for alerting
    const countKey = `${error.source}:${error.code}`;
    const count = (this.errorCounts.get(countKey) || 0) + 1;
    this.errorCounts.set(countKey, count);

    // Find applicable policy
    const policy = this.policies.get(error.code)
      || this.policies.get(error.category)
      || this.getDefaultPolicy();

    // Check alert threshold
    if (count >= policy.alertThreshold) {
      this.triggerAlert(error);
    }

    // Determine resolution
    if (!error.retryable) {
      return {
        action: 'fail',
        message: `Non-retryable error: ${error.message}`,
        error,
      };
    }

    if (count > policy.maxRetries) {
      if (policy.fallbackAction) {
        return {
          action: 'fallback',
          message: `Max retries exceeded, using fallback: ${policy.fallbackAction}`,
          fallbackAction: policy.fallbackAction,
          error,
        };
      }
      return {
        action: 'fail',
        message: `Max retries exceeded: ${error.message}`,
        error,
      };
    }

    // Calculate retry delay
    const delay = this.calculateDelay(
      policy.backoffStrategy,
      policy.initialDelayMs,
      policy.maxDelayMs,
      count
    );

    return {
      action: 'retry',
      message: `Retrying after ${delay}ms (attempt ${count})`,
      retryDelayMs: delay,
      error,
    };
  }

  registerPolicy(code: string, policy: ErrorPolicy): void {
    this.policies.set(code, policy);
  }

  onAlert(callback: (error: IntegrationError) => void): void {
    this.alertCallbacks.push(callback);
  }

  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  clearErrorCounts(): void {
    this.errorCounts.clear();
  }

  private calculateDelay(
    strategy: string,
    initialMs: number,
    maxMs: number,
    attempt: number
  ): number {
    let delay: number;

    switch (strategy) {
      case 'linear':
        delay = initialMs * attempt;
        break;
      case 'exponential':
        delay = initialMs * Math.pow(2, attempt - 1);
        break;
      case 'fibonacci':
        delay = initialMs * this.fibonacci(attempt);
        break;
      default:
        delay = initialMs;
    }

    // Add jitter (10-20% random variation)
    const jitter = delay * (0.1 + Math.random() * 0.1);
    delay += jitter;

    return Math.min(delay, maxMs);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return 1;
    let a = 1, b = 1;
    for (let i = 2; i < n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  private triggerAlert(error: IntegrationError): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(error);
      } catch {
        // Alert callback errors should not propagate
      }
    }
  }

  private registerDefaultPolicies(): void {
    this.policies.set('transient', {
      category: 'transient',
      maxRetries: 5,
      backoffStrategy: 'exponential',
      initialDelayMs: 100,
      maxDelayMs: 30000,
      alertThreshold: 10,
    });

    this.policies.set('permanent', {
      category: 'permanent',
      maxRetries: 0,
      backoffStrategy: 'linear',
      initialDelayMs: 0,
      maxDelayMs: 0,
      alertThreshold: 3,
    });

    this.policies.set('system', {
      category: 'system',
      maxRetries: 3,
      backoffStrategy: 'exponential',
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      fallbackAction: 'degrade_gracefully',
      alertThreshold: 1,
    });
  }

  private getDefaultPolicy(): ErrorPolicy {
    return {
      category: 'transient',
      maxRetries: 3,
      backoffStrategy: 'exponential',
      initialDelayMs: 500,
      maxDelayMs: 15000,
      alertThreshold: 5,
    };
  }
}

interface ErrorResolution {
  action: 'retry' | 'fail' | 'fallback';
  message: string;
  retryDelayMs?: number;
  fallbackAction?: string;
  error: IntegrationError;
}
```text

### Error Recovery
- Recovery Strategies
  - Automatic retry with backoff
  - Circuit breaker pattern
  - Fallback to cached data
  - Graceful degradation
  - Manual intervention escalation

- Recovery Operations
  - State rollback
  - Partial result handling
  - Compensation transactions
  - Checkpoint restoration

## Event-Driven Integration

### Event System Architecture
1. Event Types
   - Domain events (business state changes)
   - Integration events (system-to-system notifications)
   - Command events (action requests)
   - Query events (data requests)

2. Event Properties
   - Unique event ID
   - Event type and version
   - Source identifier
   - Timestamp
   - Payload
   - Correlation ID
   - Causation chain

### Event Bus Implementation
```typescript
interface IntegrationEvent {
  id: string;
  type: string;
  version: string;
  source: string;
  timestamp: number;
  correlationId?: string;
  causationId?: string;
  payload: Record<string, unknown>;
  metadata: Record<string, string>;
}

type EventHandler = (event: IntegrationEvent) => Promise<void>;

interface Subscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  filter?: (event: IntegrationEvent) => boolean;
  priority: number;
  maxRetries: number;
}

class IntegrationEventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private deadLetterQueue: IntegrationEvent[] = [];
  private eventLog: IntegrationEvent[] = [];
  private maxLogSize: number;

  constructor(maxLogSize: number = 10000) {
    this.maxLogSize = maxLogSize;
  }

  subscribe(subscription: Subscription): string {
    if (!this.subscriptions.has(subscription.eventType)) {
      this.subscriptions.set(subscription.eventType, []);
    }

    const subs = this.subscriptions.get(subscription.eventType)!;
    subs.push(subscription);

    // Sort by priority (highest first)
    subs.sort((a, b) => b.priority - a.priority);

    return subscription.id;
  }

  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  async publish(event: IntegrationEvent): Promise<PublishResult> {
    // Log the event
    this.logEvent(event);

    const subscribers = this.subscriptions.get(event.type) || [];
    const results: SubscriberResult[] = [];

    for (const sub of subscribers) {
      // Apply filter
      if (sub.filter && !sub.filter(event)) {
        continue;
      }

      const result = await this.deliverToSubscriber(event, sub);
      results.push(result);
    }

    const failures = results.filter(r => !r.success);
    if (failures.length > 0 && failures.length === results.length) {
      // All subscribers failed -- move to dead letter queue
      this.deadLetterQueue.push(event);
    }

    return {
      eventId: event.id,
      subscribersNotified: results.length,
      successCount: results.filter(r => r.success).length,
      failureCount: failures.length,
      results,
    };
  }

  async publishBatch(events: IntegrationEvent[]): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const event of events) {
      const result = await this.publish(event);
      results.push(result);
    }

    return results;
  }

  getDeadLetterQueue(): IntegrationEvent[] {
    return [...this.deadLetterQueue];
  }

  async retryDeadLetters(): Promise<number> {
    let retried = 0;
    const remaining: IntegrationEvent[] = [];

    for (const event of this.deadLetterQueue) {
      const result = await this.publish(event);
      if (result.successCount > 0) {
        retried++;
      } else {
        remaining.push(event);
      }
    }

    this.deadLetterQueue = remaining;
    return retried;
  }

  private async deliverToSubscriber(
    event: IntegrationEvent,
    subscription: Subscription
  ): Promise<SubscriberResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= subscription.maxRetries; attempt++) {
      try {
        await subscription.handler(event);
        return {
          subscriptionId: subscription.id,
          success: true,
          attempts: attempt + 1,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < subscription.maxRetries) {
          await this.delay(100 * Math.pow(2, attempt));
        }
      }
    }

    return {
      subscriptionId: subscription.id,
      success: false,
      attempts: subscription.maxRetries + 1,
      error: lastError?.message,
    };
  }

  private logEvent(event: IntegrationEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface PublishResult {
  eventId: string;
  subscribersNotified: number;
  successCount: number;
  failureCount: number;
  results: SubscriberResult[];
}

interface SubscriberResult {
  subscriptionId: string;
  success: boolean;
  attempts: number;
  error?: string;
}
```text

### Event Sourcing
- Event Store
  - Append-only event log
  - Event replay capability
  - Snapshot management
  - Compaction strategies

- Event Processing
  - Sequential processing
  - Parallel fan-out
  - Event aggregation
  - Event filtering

## Service Mesh Integration

### Service Mesh Architecture
1. Service Discovery
   - Service registration
   - Health checking
   - Load balancing
   - Failover routing

2. Traffic Management
   - Request routing
   - Traffic splitting
   - Circuit breaking
   - Rate limiting

3. Observability
   - Distributed tracing
   - Metrics collection
   - Log aggregation
   - Alerting

### Service Mesh Implementation
```typescript
interface ServiceRegistration {
  id: string;
  name: string;
  version: string;
  endpoint: string;
  healthEndpoint: string;
  metadata: Record<string, string>;
  weight: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastHealthCheck: number;
}

interface RoutingRule {
  id: string;
  sourceService: string;
  targetService: string;
  condition?: (request: ServiceRequest) => boolean;
  weight: number;
  headers?: Record<string, string>;
  timeout: number;
  retries: number;
}

interface ServiceRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  traceId: string;
  spanId: string;
}

class ServiceMesh {
  private services: Map<string, ServiceRegistration[]> = new Map();
  private routingRules: RoutingRule[] = [];
  private circuitBreakers: Map<string, MeshCircuitBreaker> = new Map();
  private healthCheckInterval: number;
  private healthCheckTimer?: ReturnType<typeof setInterval>;

  constructor(config: { healthCheckIntervalMs?: number } = {}) {
    this.healthCheckInterval = config.healthCheckIntervalMs || 30000;
  }

  registerService(registration: ServiceRegistration): void {
    if (!this.services.has(registration.name)) {
      this.services.set(registration.name, []);
    }

    this.services.get(registration.name)!.push(registration);

    // Initialize circuit breaker
    this.circuitBreakers.set(registration.id, new MeshCircuitBreaker({
      failureThreshold: 5,
      resetTimeMs: 30000,
      halfOpenRequests: 3,
    }));
  }

  deregisterService(serviceId: string): void {
    for (const [name, instances] of this.services) {
      const index = instances.findIndex(s => s.id === serviceId);
      if (index !== -1) {
        instances.splice(index, 1);
        this.circuitBreakers.delete(serviceId);
        return;
      }
    }
  }

  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.push(rule);
  }

  async route(
    serviceName: string,
    request: ServiceRequest
  ): Promise<ServiceResponse> {
    // Find healthy instances
    const instances = this.getHealthyInstances(serviceName);

    if (instances.length === 0) {
      throw new Error(`No healthy instances for service: ${serviceName}`);
    }

    // Apply routing rules
    const applicableRules = this.routingRules.filter(
      rule => rule.targetService === serviceName
        && (!rule.condition || rule.condition(request))
    );

    // Select instance using weighted routing
    const instance = this.selectInstance(instances, applicableRules);

    // Check circuit breaker
    const breaker = this.circuitBreakers.get(instance.id)!;

    return breaker.execute(async () => {
      return this.sendRequest(instance, request);
    });
  }

  startHealthChecks(): void {
    this.healthCheckTimer = setInterval(
      () => this.runHealthChecks(),
      this.healthCheckInterval
    );
  }

  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }

  getServiceTopology(): ServiceTopology {
    const topology: ServiceTopology = {
      services: [],
      connections: [],
    };

    for (const [name, instances] of this.services) {
      topology.services.push({
        name,
        instanceCount: instances.length,
        healthyCount: instances.filter(i => i.status === 'healthy').length,
      });
    }

    for (const rule of this.routingRules) {
      topology.connections.push({
        source: rule.sourceService,
        target: rule.targetService,
        weight: rule.weight,
      });
    }

    return topology;
  }

  private getHealthyInstances(serviceName: string): ServiceRegistration[] {
    const instances = this.services.get(serviceName) || [];
    return instances.filter(i => i.status === 'healthy');
  }

  private selectInstance(
    instances: ServiceRegistration[],
    rules: RoutingRule[]
  ): ServiceRegistration {
    if (rules.length > 0) {
      // Use rule-based weighted selection
      const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0);
      let random = Math.random() * totalWeight;

      for (const rule of rules) {
        random -= rule.weight;
        if (random <= 0) {
          // Find matching instance
          const matching = instances.find(
            i => i.name === rule.targetService
          );
          if (matching) return matching;
        }
      }
    }

    // Weighted random selection from instances
    const totalWeight = instances.reduce((sum, i) => sum + i.weight, 0);
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) return instance;
    }

    return instances[0];
  }

  private async sendRequest(
    instance: ServiceRegistration,
    request: ServiceRequest
  ): Promise<ServiceResponse> {
    const response = await fetch(`${instance.endpoint}${request.path}`, {
      method: request.method,
      headers: {
        ...request.headers,
        'X-Trace-Id': request.traceId,
        'X-Span-Id': request.spanId,
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.json(),
      instanceId: instance.id,
      traceId: request.traceId,
    };
  }

  private async runHealthChecks(): Promise<void> {
    for (const instances of this.services.values()) {
      for (const instance of instances) {
        try {
          const response = await fetch(instance.healthEndpoint, {
            signal: AbortSignal.timeout(5000),
          });

          instance.status = response.ok ? 'healthy' : 'degraded';
          instance.lastHealthCheck = Date.now();
        } catch {
          instance.status = 'unhealthy';
          instance.lastHealthCheck = Date.now();
        }
      }
    }
  }
}

class MeshCircuitBreaker {
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureThreshold: number;
  private resetTimeMs: number;
  private halfOpenRequests: number;

  constructor(config: {
    failureThreshold: number;
    resetTimeMs: number;
    halfOpenRequests: number;
  }) {
    this.failureThreshold = config.failureThreshold;
    this.resetTimeMs = config.resetTimeMs;
    this.halfOpenRequests = config.halfOpenRequests;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeMs) {
        this.state = 'half-open';
        this.successes = 0;
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
    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.halfOpenRequests) {
        this.state = 'closed';
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}

interface ServiceResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  instanceId: string;
  traceId: string;
}

interface ServiceTopology {
  services: {
    name: string;
    instanceCount: number;
    healthyCount: number;
  }[];
  connections: {
    source: string;
    target: string;
    weight: number;
  }[];
}
```text

## Testing Integration Points

### Integration Test Strategy
1. Contract Tests
   - Verify API contracts between services
   - Validate request/response schemas
   - Test error code handling
   - Verify authentication flows

2. Integration Tests
   - End-to-end data flow verification
   - Multi-service interaction testing
   - Event propagation testing
   - Error recovery testing

3. Performance Tests
   - Throughput measurement
   - Latency profiling
   - Resource consumption tracking
   - Scalability verification

### Contract Test Implementation
```typescript
describe('API Contract Tests', () => {
  const registry = new ContractRegistry();

  beforeAll(() => {
    registry.register({
      id: 'agent-api-v1',
      version: '1.0.0',
      name: 'agent-api',
      description: 'Agent communication API',
      baseUrl: 'http://localhost:8080',
      authentication: {
        type: 'bearer',
        scopes: ['agent:read', 'agent:write'],
      },
      endpoints: [
        {
          path: '/agents',
          method: 'POST',
          description: 'Create a new agent',
          requestSchema: 'CreateAgentRequest',
          responseSchema: 'AgentResponse',
          errorSchemas: ['ValidationError', 'AuthError'],
          timeout: 5000,
        },
      ],
      schemas: new Map([
        ['CreateAgentRequest', {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            capabilities: { type: 'object' },
          },
          required: ['name', 'type'],
        }],
      ]),
      errorCodes: new Map([
        [400, { message: 'Bad Request', description: 'Invalid request body' }],
        [401, { message: 'Unauthorized', description: 'Missing or invalid token' }],
      ]),
    });
  });

  it('should validate a correct request', () => {
    const result = registry.validateRequest(
      'agent-api',
      '/agents',
      { name: 'test-agent', type: 'worker' }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject a request missing required fields', () => {
    const result = registry.validateRequest(
      'agent-api',
      '/agents',
      { name: 'test-agent' }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: type');
  });
});
```text

### Event Integration Tests
```typescript
describe('Event Bus Integration Tests', () => {
  let eventBus: IntegrationEventBus;

  beforeEach(() => {
    eventBus = new IntegrationEventBus();
  });

  it('should deliver events to all matching subscribers', async () => {
    const received: IntegrationEvent[] = [];

    eventBus.subscribe({
      id: 'sub-1',
      eventType: 'agent.created',
      handler: async (event) => { received.push(event); },
      priority: 1,
      maxRetries: 0,
    });

    eventBus.subscribe({
      id: 'sub-2',
      eventType: 'agent.created',
      handler: async (event) => { received.push(event); },
      priority: 2,
      maxRetries: 0,
    });

    const result = await eventBus.publish({
      id: 'evt-1',
      type: 'agent.created',
      version: '1.0',
      source: 'test',
      timestamp: Date.now(),
      payload: { agentId: 'agent-1' },
      metadata: {},
    });

    expect(result.subscribersNotified).toBe(2);
    expect(result.successCount).toBe(2);
    expect(received).toHaveLength(2);
  });

  it('should move failed events to dead letter queue', async () => {
    eventBus.subscribe({
      id: 'sub-failing',
      eventType: 'agent.error',
      handler: async () => { throw new Error('Handler failure'); },
      priority: 1,
      maxRetries: 1,
    });

    await eventBus.publish({
      id: 'evt-fail',
      type: 'agent.error',
      version: '1.0',
      source: 'test',
      timestamp: Date.now(),
      payload: {},
      metadata: {},
    });

    const deadLetters = eventBus.getDeadLetterQueue();
    expect(deadLetters).toHaveLength(1);
    expect(deadLetters[0].id).toBe('evt-fail');
  });

  it('should filter events based on subscription filter', async () => {
    const received: IntegrationEvent[] = [];

    eventBus.subscribe({
      id: 'sub-filtered',
      eventType: 'agent.updated',
      handler: async (event) => { received.push(event); },
      filter: (event) => event.payload['priority'] === 'high',
      priority: 1,
      maxRetries: 0,
    });

    await eventBus.publish({
      id: 'evt-low',
      type: 'agent.updated',
      version: '1.0',
      source: 'test',
      timestamp: Date.now(),
      payload: { priority: 'low' },
      metadata: {},
    });

    await eventBus.publish({
      id: 'evt-high',
      type: 'agent.updated',
      version: '1.0',
      source: 'test',
      timestamp: Date.now(),
      payload: { priority: 'high' },
      metadata: {},
    });

    expect(received).toHaveLength(1);
    expect(received[0].id).toBe('evt-high');
  });
});
```text

### Service Mesh Tests
```typescript
describe('Service Mesh Tests', () => {
  let mesh: ServiceMesh;

  beforeEach(() => {
    mesh = new ServiceMesh({ healthCheckIntervalMs: 60000 });
  });

  it('should route to healthy instances', async () => {
    mesh.registerService({
      id: 'worker-1',
      name: 'worker',
      version: '1.0.0',
      endpoint: 'http://localhost:3001',
      healthEndpoint: 'http://localhost:3001/health',
      metadata: {},
      weight: 1,
      status: 'healthy',
      lastHealthCheck: Date.now(),
    });

    mesh.registerService({
      id: 'worker-2',
      name: 'worker',
      version: '1.0.0',
      endpoint: 'http://localhost:3002',
      healthEndpoint: 'http://localhost:3002/health',
      metadata: {},
      weight: 1,
      status: 'unhealthy',
      lastHealthCheck: Date.now(),
    });

    // Route should only go to healthy instance
    const topology = mesh.getServiceTopology();
    const workerService = topology.services.find(s => s.name === 'worker');
    expect(workerService?.instanceCount).toBe(2);
    expect(workerService?.healthyCount).toBe(1);
  });

  it('should generate service topology', () => {
    mesh.registerService({
      id: 'gateway-1',
      name: 'gateway',
      version: '1.0.0',
      endpoint: 'http://localhost:8080',
      healthEndpoint: 'http://localhost:8080/health',
      metadata: {},
      weight: 1,
      status: 'healthy',
      lastHealthCheck: Date.now(),
    });

    mesh.addRoutingRule({
      id: 'rule-1',
      sourceService: 'gateway',
      targetService: 'worker',
      weight: 1,
      timeout: 5000,
      retries: 3,
    });

    const topology = mesh.getServiceTopology();
    expect(topology.connections).toHaveLength(1);
    expect(topology.connections[0].source).toBe('gateway');
    expect(topology.connections[0].target).toBe('worker');
  });
});
```text

## Performance Management

### Performance Areas
1. Integration Throughput
   - Request processing rate
   - Event delivery rate
   - Data transformation speed
   - Connection pool efficiency

2. Integration Latency
   - End-to-end request latency
   - Service discovery time
   - Circuit breaker overhead
   - Serialization/deserialization time

3. Resource Utilization
   - Connection pool usage
   - Memory consumption
   - CPU utilization
   - Network bandwidth

### Performance Operations
- Performance Monitoring
  - Metric collection at integration points
  - Latency distribution tracking
  - Error rate monitoring
  - Throughput measurement

- Performance Optimization
  - Connection pooling
  - Request batching
  - Response caching
  - Payload compression

## Security Integration

### Security Areas
1. Authentication
   - Token-based authentication
   - Mutual TLS
   - API key management
   - OAuth2 flows

2. Authorization
   - Role-based access control
   - Scope-based permissions
   - Resource-level authorization
   - Policy enforcement

3. Data Protection
   - Encryption in transit
   - Payload encryption
   - PII handling
   - Audit logging

### Security Operations
- Security Controls
  - Certificate management
  - Key rotation
  - Token lifecycle management
  - Access policy enforcement

- Security Monitoring
  - Authentication failure tracking
  - Authorization violation alerting
  - Anomalous pattern detection
  - Compliance reporting

## State Management

### State Types
1. Connection State
   - Active connections
   - Connection health
   - Pool utilization
   - Pending requests

2. Integration State
   - In-flight requests
   - Event processing position
   - Circuit breaker states
   - Rate limit counters

3. Service State
   - Service health status
   - Version information
   - Configuration state
   - Dependency status

### State Operations
- State Tracking
  - Real-time state monitoring
  - State change notifications
  - State history tracking
  - State recovery procedures

- State Analysis
  - State transition patterns
  - Anomaly detection
  - Performance correlation
  - Capacity planning

## Framework Integration

### Integration Points
1. Core Frameworks
   - [[autonomous_agent_framework]]
   - [[agent_orchestration_framework]]
   - [[agent_communication_framework]]
   - [[agent_workflow_framework]]

2. Support Frameworks
   - [[agent_monitoring_framework]]
   - [[agent_resource_framework]]
   - [[agent_analysis_framework]]
   - [[agent_security_framework]]

3. Tool Frameworks
   - [[agent_deployment_framework]]
   - [[agent_testing_framework]]
   - [[agent_documentation_framework]]
   - [[quality_assurance]]

### Integration Methods
- Direct Integration
  - Framework coupling
  - State sharing
  - Resource sharing
  - Operation coordination

- Indirect Integration
  - Event propagation
  - Message passing
  - State synchronization
  - Resource coordination

---
**Related Documents**
- [[autonomous_agent_framework]]
- [[agent_orchestration_framework]]
- [[agent_communication_framework]]
- [[agent_workflow_framework]]
- [[agent_monitoring_framework]]
- [[quality_assurance]]
- [[security_framework]]
- [[integration_framework]]
