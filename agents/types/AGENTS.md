# Agent Types and Interfaces Documentation

This directory contains TypeScript type definitions and interfaces for the NoOrg Multi-Agent Framework agent system.

## Overview

The types directory provides comprehensive type definitions for all agent-related functionality, ensuring type safety and consistency across the framework.

## Core Type Definitions

### Agent Interface (`types.ts`)
```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  capabilities: string[];
  status: 'initializing' | 'available' | 'busy' | 'offline' | 'error';
  metadata?: Record<string, any>;
  preferredModel?: string;
  lastActive: number;
  createdAt: number;

  initialize(): Promise<boolean>;
  executeTask(taskDetails: any, context?: any): Promise<any>;
  shutdown(): Promise<boolean>;
  getAgentInfo(): Agent;
  updateStatus(status: Agent['status']): void;
}
```text

### Agent Capabilities
```typescript
type Capability =
  | 'text-generation'
  | 'code-generation'
  | 'reasoning'
  | 'planning'
  | 'research'
  | 'data-analysis'
  | 'creativity'
  | 'problem-solving'
  | 'financial-analysis'
  | 'legal-research'
  | 'customer-service'
  | 'content-strategy'
  | 'performance-evaluation'
  | 'risk-assessment'
  | string; // Allow custom capabilities
```text

### Agent Types
```typescript
type AgentType =
  | 'creative-writer'
  | 'research'
  | 'marketing'
  | 'development'
  | 'hr'
  | 'finance'
  | 'legal'
  | 'customer-support'
  | 'data-analysis'
  | 'project-management'
  | 'strategic-planning'
  | 'operations'
  | 'sales'
  | 'quality-assurance'
  | 'education'
  | 'security'
  | 'compliance'
  | 'risk-management'
  | 'innovation'
  | string; // Allow custom agent types
```text

## Specialized Type Definitions

### Code Management Types (`code_management.ts`)
```typescript
interface CodeGenerationOptions {
  language?: string;
  framework?: string;
  style?: 'functional' | 'object-oriented' | 'procedural';
  includeComments?: boolean;
  includeTests?: boolean;
}

interface CodeReviewResult {
  issues: Array<{
    type: string;
    severity: 'critical' | 'major' | 'minor' | 'suggestion';
    description: string;
    recommendation: string;
  }>;
  summary: string;
  score: number;
  strengths: string[];
  recommendations: string[];
}
```text

### Coordination Metrics (`coordination-metrics.ts`)
```typescript
interface CoordinationMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
}
```text

### Deployment Types (`deployment.ts`)
```typescript
interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  autoScaling?: boolean;
  minInstances?: number;
  maxInstances?: number;
  healthCheckInterval?: number;
}
```text

### Quality Assurance Types (`quality.ts`)
```typescript
interface QualityMetrics {
  testCoverage: number;
  codeQuality: number;
  performanceScore: number;
  securityScore: number;
  maintainabilityIndex: number;
}
```text

## Usage in Agent Implementations

### Type Safety
```typescript
import { Agent, Capability, AgentType } from './types';

class CustomAgent implements Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: Capability[];
  status: Agent['status'];
  // ... other properties

  async executeTask(taskDetails: any, context?: any): Promise<any> {
    // Type-safe implementation
    return this.processTask(taskDetails);
  }
}
```text

### Interface Extensions
```typescript
interface ExtendedAgent extends Agent {
  customProperty: string;
  customMethod(): Promise<void>;
}

class SpecializedAgent implements ExtendedAgent {
  // Inherits all Agent properties and methods
  customProperty: string;
  async customMethod(): Promise<void> {
    // Custom implementation
  }
}
```text

## Type Validation

### Runtime Type Checking
```typescript
import { validateAgentConfig } from './types/validation';

const config = {
  id: 'agent-123',
  name: 'Test Agent',
  type: 'custom',
  capabilities: ['reasoning', 'planning']
};

const isValid = validateAgentConfig(config);
if (!isValid) {
  throw new Error('Invalid agent configuration');
}
```text

### Type Guards
```typescript
function isAnalysisAgent(agent: Agent): agent is AnalysisAgent {
  return agent.capabilities.includes('data-analysis');
}

if (isAnalysisAgent(agent)) {
  // TypeScript knows this is an AnalysisAgent
  const result = await agent.analyzeData(data);
}
```text

## Best Practices

### Type Definition Guidelines
1. **Consistency**: Use consistent naming conventions
2. **Extensibility**: Design types to be easily extended
3. **Clarity**: Make types self-documenting
4. **Validation**: Include runtime type validation where needed
5. **Documentation**: Document complex types thoroughly

### Interface Design
```typescript
// Good: Clear, specific interface
interface DataAnalysisTask {
  type: 'analyze';
  data: any[];
  options: {
    analysisType: 'exploratory' | 'descriptive' | 'inferential';
    includeVisualization?: boolean;
  };
}

// Avoid: Overly generic interface
interface Task {
  [key: string]: any; // Too generic
}
```text

## Integration with Framework

### Agent Registry Integration
```typescript
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { Agent } from './types';

const registry = AgentRegistry.getInstance();

// Register typed agents
const agent: Agent = createTypedAgent();
await registry.registerAgent(agent);
```text

### Task Manager Integration
```typescript
import { TaskManager } from '../core/multiagent/TaskManager';
import { Task } from './types';

const taskManager = new TaskManager();

// Create typed tasks
const task: Task = {
  id: 'task-123',
  type: 'analysis',
  title: 'Data Analysis Task',
  // ... other properties
};
```text

## Advanced Type Features

### Generic Types
```typescript
interface AgentFactory<T extends Agent> {
  createAgent(config: AgentConfig): T;
  getAgentCapabilities(): Capability[];
}

const factory: AgentFactory<AnalysisAgent> = new AnalysisAgentFactory();
```text

### Conditional Types
```typescript
type AgentCapabilities<T extends AgentType> = T extends 'analysis'
  ? ['data-analysis', 'statistics', 'visualization']
  : T extends 'writing'
  ? ['text-generation', 'creativity', 'editing']
  : Capability[];
```text

### Mapped Types
```typescript
type AgentStatusMap = {
  [K in AgentType]: {
    agents: Agent[];
    count: number;
    status: 'active' | 'inactive';
  };
};
```text

## Error Types

### Agent Errors
```typescript
class AgentError extends Error {
  constructor(
    message: string,
    public agentId: string,
    public taskId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

class TaskError extends Error {
  constructor(
    message: string,
    public taskId: string,
    public agentId?: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}
```text

## Testing Types

### Test Utilities
```typescript
interface TestAgentConfig {
  mockOpenAIClient?: boolean;
  mockStorage?: boolean;
  mockEventSystem?: boolean;
  enableLogging?: boolean;
}

interface TestResult {
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
}
```text

## Related Documentation

- [Agent Framework](../../README.md)
- [TypeScript Configuration](../../tsconfig.json)
- [Core Systems](../../README.md)
- [Testing Guide](../../README.md)
