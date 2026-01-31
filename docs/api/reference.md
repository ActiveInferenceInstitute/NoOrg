# NoOrg Multi-Agent Framework API Reference

## Overview

This document provides a comprehensive reference for the NoOrg Multi-Agent Framework API, including all core components, interfaces, methods, and configuration options.

## Table of Contents

1. [Core Components](#core-components)
2. [Agent System](#agent-system)
3. [Task Management](#task-management)
4. [State Management](#state-management)
5. [Integration Patterns](#integration-patterns)
6. [Event System](#event-system)
7. [Configuration](#configuration)
8. [Error Handling](#error-handling)

## Core Components

### MultiAgentCoordinator

The central orchestrator that manages agent coordination, task distribution, and workflow execution.

#### Constructor

```typescript
constructor(name: string, options?: CoordinatorOptions)
```text

**Parameters:**
- `name` (string): Coordinator name/identifier
- `options` (CoordinatorOptions, optional): Configuration options

#### Core Methods

##### initialize()

Initialize the coordinator and all subsystems.

```typescript
async initialize(): Promise<boolean>
```text

**Returns:** `Promise<boolean>` - Success status

**Example:**
```typescript
const coordinator = new MultiAgentCoordinator('Production Coordinator');
await coordinator.initialize();
```text

##### start()

Start the coordinator and begin processing tasks.

```typescript
async start(): Promise<void>
```text

**Example:**
```typescript
await coordinator.start();
```text

##### stop()

Stop the coordinator and cleanup resources.

```typescript
async stop(): Promise<void>
```text

**Example:**
```typescript
await coordinator.stop();
```text

##### registerAgent()

Register a new agent with the coordinator.

```typescript
async registerAgent(agent: Agent): Promise<string>
```text

**Parameters:**
- `agent` (Agent): Agent to register

**Returns:** `Promise<string>` - Agent ID

**Example:**
```typescript
const agentId = await coordinator.registerAgent(myAgent);
```text

##### createTask()

Create a new task for execution.

```typescript
async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string>
```text

**Parameters:**
- `task` (Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Task configuration

**Returns:** `Promise<string>` - Task ID

**Example:**
```typescript
const taskId = await coordinator.createTask({
  name: 'Process Data',
  description: 'Analyze customer data',
  priority: 'high',
  type: 'data-analysis'
});
```text

##### getTask()

Retrieve task information by ID.

```typescript
async getTask(taskId: string): Promise<Task | null>
```text

**Parameters:**
- `taskId` (string): Task identifier

**Returns:** `Promise<Task | null>` - Task information or null if not found

**Example:**
```typescript
const task = await coordinator.getTask(taskId);
if (task) {
  console.log('Task status:', task.status);
}
```text

### AgentRegistry

Manages agent registration, discovery, and capability tracking.

#### Core Methods

##### findAgentsByCapability()

Find agents with specific capabilities.

```typescript
async findAgentsByCapability(capability: string): Promise<Agent[]>
```text

**Parameters:**
- `capability` (string): Capability to search for

**Returns:** `Promise<Agent[]>` - Array of matching agents

**Example:**
```typescript
const analysisAgents = await registry.findAgentsByCapability('data-analysis');
```text

##### findAgentsByType()

Find agents of a specific type.

```typescript
async findAgentsByType(type: string): Promise<Agent[]>
```text

**Parameters:**
- `type` (string): Agent type to search for

**Returns:** `Promise<Agent[]>` - Array of matching agents

**Example:**
```typescript
const writingAgents = await registry.findAgentsByType('creative-writer');
```text

##### getAgentCapabilities()

Get capabilities for a specific agent.

```typescript
async getAgentCapabilities(agentId: string): Promise<string[]>
```text

**Parameters:**
- `agentId` (string): Agent identifier

**Returns:** `Promise<string[]>` - Array of agent capabilities

**Example:**
```typescript
const capabilities = await registry.getAgentCapabilities(agentId);
```text

### TaskManager

Manages task lifecycle, assignment, and execution tracking.

#### Core Methods

##### updateTask()

Update task properties and status.

```typescript
async updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void>
```text

**Parameters:**
- `taskId` (string): Task identifier
- `updates` (Partial<Omit<Task, 'id' | 'createdAt'>>): Task updates

**Example:**
```typescript
await taskManager.updateTask(taskId, {
  status: 'in-progress',
  assignedTo: agentId
});
```text

##### unassignTask()

Unassign a task from its current agent.

```typescript
async unassignTask(taskId: string): Promise<void>
```text

**Parameters:**
- `taskId` (string): Task identifier

**Example:**
```typescript
await taskManager.unassignTask(taskId);
```text

##### reassignTask()

Reassign a task to a different agent.

```typescript
async reassignTask(taskId: string, newAgentId: string): Promise<void>
```text

**Parameters:**
- `taskId` (string): Task identifier
- `newAgentId` (string): New agent identifier

**Example:**
```typescript
await taskManager.reassignTask(taskId, newAgentId);
```text

##### getTaskHistory()

Retrieve the complete history of a task.

```typescript
async getTaskHistory(taskId: string): Promise<TaskHistory[]>
```text

**Parameters:**
- `taskId` (string): Task identifier

**Returns:** `Promise<TaskHistory[]>` - Task history entries

**Example:**
```typescript
const history = await taskManager.getTaskHistory(taskId);
console.log('Task lifecycle:', history);
```text

##### estimateTaskDuration()

Estimate how long a task will take to complete.

```typescript
async estimateTaskDuration(task: Task): Promise<number>
```text

**Parameters:**
- `task` (Task): Task to estimate

**Returns:** `Promise<number>` - Estimated duration in milliseconds

**Example:**
```typescript
const duration = await taskManager.estimateTaskDuration(task);
console.log('Estimated time:', duration / 1000, 'seconds');
```text

##### getTaskStatistics()

Get overall task statistics and metrics.

```typescript
async getTaskStatistics(): Promise<TaskStatistics>
```text

**Returns:** `Promise<TaskStatistics>` - Task statistics

**Example:**
```typescript
const stats = await taskManager.getTaskStatistics();
console.log('Success rate:', stats.successRate);
console.log('Average processing time:', stats.avgProcessingTime);
```text

##### cleanupOldTasks()

Remove old completed or failed tasks.

```typescript
async cleanupOldTasks(olderThan: number): Promise<number>
```text

**Parameters:**
- `olderThan` (number): Remove tasks older than this timestamp

**Returns:** `Promise<number>` - Number of tasks removed

**Example:**
```typescript
const removed = await taskManager.cleanupOldTasks(Date.now() - 86400000); // 24 hours
console.log('Cleaned up', removed, 'old tasks');
```text

### SharedStateManager

Manages shared state across agents and components.

#### Core Methods

##### setState()

Set a state value at a specific path.

```typescript
async setState(path: string, value: any): Promise<void>
```text

**Parameters:**
- `path` (string): State path (e.g., 'workflow.status')
- `value` (any): Value to set

**Example:**
```typescript
await sharedState.setState('workflow.status', 'processing');
```text

##### getState()

Retrieve a state value from a specific path.

```typescript
getState(path: string): any
```text

**Parameters:**
- `path` (string): State path

**Returns:** `any` - State value or undefined if not found

**Example:**
```typescript
const status = sharedState.getState('workflow.status');
```text

##### updateState()

Update state using a function that receives current value.

```typescript
async updateState(path: string, updater: (current: any) => any): Promise<void>
```text

**Parameters:**
- `path` (string): State path
- `updater` (function): Function that receives current value and returns new value

**Example:**
```typescript
await sharedState.updateState('counters.processed', (current) => (current || 0) + 1);
```text

##### subscribe()

Subscribe to state changes at a specific path.

```typescript
subscribe(path: string, callback: (value: any, oldValue: any) => void): string
```text

**Parameters:**
- `path` (string): State path to watch
- `callback` (function): Function called when state changes

**Returns:** `string` - Subscription ID for unsubscribing

**Example:**
```typescript
const subscriptionId = sharedState.subscribe('workflow.status', (newValue, oldValue) => {
  console.log('Workflow status changed:', oldValue, '->', newValue);
});
```text

##### unsubscribe()

Unsubscribe from state changes.

```typescript
unsubscribe(subscriptionId: string): void
```text

**Parameters:**
- `subscriptionId` (string): Subscription ID from subscribe()

**Example:**
```typescript
sharedState.unsubscribe(subscriptionId);
```text

## Agent System

### AbstractAgent

Base class for all agents in the system.

#### Constructor

```typescript
constructor(options: AbstractAgentOptions)
```text

**Parameters:**
- `options` (AbstractAgentOptions): Agent configuration

#### Core Methods

##### initialize()

Initialize the agent and register with shared state.

```typescript
async initialize(): Promise<boolean>
```text

**Returns:** `Promise<boolean>` - Success status

##### executeTask()

Execute a task (must be implemented by subclasses).

```typescript
abstract async executeTask(taskDetails: any, context?: any): Promise<any>
```text

**Parameters:**
- `taskDetails` (any): Task-specific details
- `context` (any, optional): Additional context

**Returns:** `Promise<any>` - Task result

##### updateStatus()

Update agent status and notify shared state.

```typescript
updateStatus(newStatus: Agent['status']): void
```text

**Parameters:**
- `newStatus` (Agent['status']): New agent status

##### shutdown()

Shutdown the agent and cleanup resources.

```typescript
async shutdown(): Promise<boolean>
```text

**Returns:** `Promise<boolean>` - Success status

### Agent Types

#### AnalysisAgent

Specialized for data analysis and insights.

**Capabilities:**
- `data-analysis`, `statistics`, `visualization`, `pattern-recognition`

**Key Methods:**
- `analyzeData()` - Comprehensive data analysis
- `createVisualization()` - Generate visualizations
- `generateReport()` - Create analysis reports

#### CreativeWritingAgent

Specialized for content generation and creative writing.

**Capabilities:**
- `creative-writing`, `content-generation`, `style-adaptation`

**Key Methods:**
- `generateContent()` - Generate creative content
- `refineContent()` - Improve existing content
- `generateStylizedContent()` - Create content in specific styles

#### CustomerSupportAgent

Specialized for customer service and support.

**Capabilities:**
- `customer-service`, `issue-resolution`, `troubleshooting`

**Key Methods:**
- `respondToInquiry()` - Handle customer inquiries
- `createTroubleshootingGuide()` - Generate troubleshooting guides
- `analyzeSentiment()` - Analyze customer feedback

#### DataAnalysisAgent

Specialized for numerical data processing and analysis.

**Capabilities:**
- `data-analysis`, `statistics`, `pattern-recognition`

**Key Methods:**
- `analyzeData()` - Statistical data analysis
- `createVisualization()` - Data visualization
- `generateReport()` - Statistical reports

#### DevelopmentAgent

Specialized for software development assistance.

**Capabilities:**
- `code-generation`, `code-review`, `architecture-design`

**Key Methods:**
- `generateCode()` - Generate code in various languages
- `reviewCode()` - Code quality review
- `designArchitecture()` - System architecture design

#### FinanceAgent

Specialized for financial analysis and planning.

**Capabilities:**
- `financial-analysis`, `budgeting`, `forecasting`

**Key Methods:**
- `analyzeFinancialData()` - Financial data analysis
- `createBudget()` - Budget creation and management
- `createForecast()` - Financial forecasting

#### FinalReviewAgent

Specialized for final content review and approval.

**Capabilities:**
- `content-review`, `quality-validation`, `final-approval`

**Key Methods:**
- `performFinalReview()` - Comprehensive content review
- `validateContent()` - Content validation against rules
- `generateFinalReport()` - Final review reports

#### HRAgent

Specialized for human resources tasks.

**Capabilities:**
- `job-description-creation`, `interview-question-generation`, `employee-onboarding`

**Key Methods:**
- `createJobDescription()` - Generate job descriptions
- `generateInterviewQuestions()` - Create interview questions
- `createOnboardingPlan()` - Employee onboarding plans

#### LegalAgent

Specialized for legal document generation and analysis.

**Capabilities:**
- `document-generation`, `contract-review`, `legal-research`

**Key Methods:**
- `generateLegalDocument()` - Create legal documents
- `reviewLegalDocument()` - Legal document review
- `conductLegalResearch()` - Legal research and analysis

#### MarketingAgent

Specialized for marketing strategy and content.

**Capabilities:**
- `campaign-planning`, `market-analysis`, `brand-messaging`

**Key Methods:**
- `createCampaignStrategy()` - Marketing campaign planning
- `analyzeAudience()` - Audience analysis and segmentation

#### PlanningAgent

Specialized for project planning and coordination.

**Capabilities:**
- `plan-creation`, `risk-assessment`, `milestone-definition`

**Key Methods:**
- `createPlan()` - Project and strategic planning
- `validatePlan()` - Plan validation and review

#### ResearchAgent

Specialized for information gathering and analysis.

**Capabilities:**
- `research`, `information-extraction`, `fact-checking`

**Key Methods:**
- `researchTopic()` - Comprehensive topic research
- `extractInformation()` - Information extraction from documents
- `summarizeDocument()` - Document summarization
- `factCheck()` - Statement verification

#### ReviewAgent

Specialized for content review and feedback.

**Capabilities:**
- `content-review`, `quality-assessment`, `feedback-generation`

**Key Methods:**
- `reviewContent()` - Content quality review
- `validateContent()` - Content validation

#### WritingAgent

Specialized for professional writing and content creation.

**Capabilities:**
- `content-creation`, `technical-writing`, `documentation`

**Key Methods:**
- `writeContent()` - Generate written content
- `editContent()` - Content editing and refinement

#### ActiveInferencePOMDPAgent

Advanced agent using Active Inference and POMDP for decision making.

**Capabilities:**
- `reasoning`, `planning`, `decision-making`, `active-inference`

**Key Methods:**
- `process()` - Process observations through POMDP model

## Task Management

### Task Interface

```typescript
interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  failedAt?: number;
  error?: string;
  metadata: Record<string, unknown>;
  type?: string;
  results?: any;
  processingTime?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependsOn?: string[];
}
```text

### Task States

- **pending** - Task created but not yet assigned
- **assigned** - Task assigned to an agent but not started
- **in-progress** - Task currently being executed
- **completed** - Task successfully completed
- **failed** - Task execution failed

### Task Priorities

- **low** - Background tasks, can be deferred
- **medium** - Standard priority tasks
- **high** - Important tasks requiring prompt attention
- **critical** - Mission-critical tasks requiring immediate attention

## State Management

### State Structure

State is organized hierarchically with dot-notation paths:

```text
workflow.status
workflow.stage
agents.{agentId}.status
tasks.{taskId}.results
counters.processed
```text

### State Types

- **Primitive values** - strings, numbers, booleans
- **Objects** - complex data structures
- **Arrays** - collections of values

## Integration Patterns

### Circuit Breaker Pattern

Prevents cascade failures by temporarily stopping calls to failing services.

```typescript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  monitoringPeriod: 10000
});

try {
  const result = await circuitBreaker.execute(async () => {
    return await riskyOperation();
  });
} catch (error) {
  console.error('Operation failed:', error);
}
```text

### Retry Pattern

Automatically retry failed operations with configurable backoff strategies.

```typescript
const retry = new Retry({
  maxAttempts: 3,
  backoffStrategy: 'exponential',
  initialDelay: 1000,
  maxDelay: 10000
});

const result = await retry.execute(async () => {
  return await unreliableOperation();
});
```text

### Rate Limiter Pattern

Control the rate of operations to prevent system overload.

```typescript
const rateLimiter = new RateLimiter({
  requestsPerSecond: 10,
  burstLimit: 20,
  windowSize: 1000
});

await rateLimiter.waitForSlot(); // Wait for available slot
await executeOperation();
```text

### Bulkhead Pattern

Isolate different types of operations to prevent failures from spreading.

```typescript
const bulkhead = new Bulkhead({
  maxConcurrent: 5,
  maxQueueSize: 10,
  timeout: 5000
});

const result = await bulkhead.execute(async () => {
  return await isolatedOperation();
});
```text

## Event System

### Event Types

```typescript
interface Event {
  id: string;
  type: string;
  source: string;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}
```text

### Event Publishing

```typescript
// Publish an event
await eventSystem.publish('task.completed', {
  taskId: taskId,
  agentId: agentId,
  result: taskResult
});
```text

### Event Subscription

```typescript
// Subscribe to events
const subscriptionId = eventSystem.subscribe('task.*', (event) => {
  console.log('Task event:', event.type, event.data);
});

// Unsubscribe
eventSystem.unsubscribe(subscriptionId);
```text

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
DEFAULT_MODEL=gpt-4o
MAX_TOKENS=8000
TEMPERATURE=0.7

# Coordinator Configuration
COORDINATOR_NAME=Production Coordinator
COORDINATION_STRATEGY=hybrid
MAX_CONCURRENT_TASKS=10
ENABLE_AUTO_RETRY=true

# State Management
STATE_FILE_PATH=./data/coordinator-state.json
AUTO_SAVE_ENABLED=true
AUTO_SAVE_INTERVAL=60000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info
LOG_FILE=./logs/noorg.log
```text

### Coordinator Options

```typescript
interface CoordinatorOptions {
  sharedStateManager?: SharedStateManager;
  taskManager?: TaskManager;
  agentRegistry?: AgentRegistry;
  openAIClient?: OpenAIClient;
  promptManager?: PromptManager;
  maxConcurrentTasks?: number;
  enableAutoRetry?: boolean;
  retryAttempts?: number;
  coordinationStrategy?: 'round-robin' | 'capability-based' | 'priority-based' | 'hybrid';
}
```text

## Error Handling

### Error Types

```typescript
class CoordinationError extends Error {
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'CoordinationError';
    this.code = code;
    this.details = details;
  }

  code: string;
  details?: any;
}
```text

### Common Error Codes

- `AGENT_NOT_FOUND` - Specified agent does not exist
- `TASK_NOT_FOUND` - Specified task does not exist
- `INVALID_CAPABILITY` - Agent lacks required capability
- `COORDINATION_FAILED` - General coordination failure
- `STATE_UPDATE_FAILED` - Failed to update shared state

### Error Handling Best Practices

```typescript
try {
  await coordinator.createTask(taskConfig);
} catch (error) {
  if (error instanceof CoordinationError) {
    switch (error.code) {
      case 'INVALID_CAPABILITY':
        console.error('Agent lacks required capabilities');
        break;
      case 'COORDINATION_FAILED':
        console.error('General coordination failure');
        break;
      default:
        console.error('Unknown coordination error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```text

## Best Practices

### 1. Agent Registration

```typescript
// Register agents with clear capabilities
const agent = {
  name: 'Data Processor',
  type: 'data-analysis',
  capabilities: ['data-analysis', 'statistics', 'visualization'],
  metadata: {
    maxConcurrentTasks: 3,
    specialty: 'financial-data'
  }
};

await coordinator.registerAgent(agent);
```text

### 2. Task Creation

```typescript
// Create tasks with clear requirements
const task = await coordinator.createTask({
  name: 'Analyze Sales Data',
  description: 'Comprehensive analysis of Q3 sales performance',
  priority: 'high',
  type: 'data-analysis',
  metadata: {
    requiredCapabilities: ['data-analysis', 'statistics'],
    dataSource: 'sales_database',
    analysisType: 'comprehensive'
  }
});
```text

### 3. State Management

```typescript
// Use shared state for coordination
await sharedState.setState('workflow.stage', 'data-collection');

// Subscribe to state changes
const subscriptionId = sharedState.subscribe('workflow.stage', (newStage) => {
  console.log('Workflow stage changed to:', newStage);
});
```text

### 4. Error Recovery

```typescript
// Implement retry logic for critical operations
const retry = new Retry({ maxAttempts: 3 });

const result = await retry.execute(async () => {
  return await riskyOperation();
});
```text

## Performance Optimization

### 1. Task Batching

```typescript
// Batch similar tasks for efficiency
const taskBatch = dataItems.map(item =>
  coordinator.createTask({
    name: `Process Item ${item.id}`,
    type: 'data-processing',
    metadata: { item }
  })
);

await Promise.all(taskBatch);
```text

### 2. Resource Management

```typescript
// Monitor agent workload
const agentTasks = await coordinator.getTaskManager().getTasksByAssignee(agentId);
const activeTasks = agentTasks.filter(t => t.status === 'in-progress');

if (activeTasks.length >= maxConcurrent) {
  // Wait or queue task
}
```text

### 3. Caching

```typescript
// Use caching for expensive operations
const cachedResult = await cache.get(cacheKey);
if (!cachedResult) {
  const result = await expensiveOperation();
  await cache.set(cacheKey, result, ttl);
}
```text

## Security Considerations

### 1. Input Validation

```typescript
// Validate all inputs before processing
const validatedTask = validateTaskInput(taskConfig);
if (!validatedTask.valid) {
  throw new ValidationError(validatedTask.errors);
}
```text

### 2. Access Control

```typescript
// Check agent permissions before task assignment
const hasPermission = await checkAgentPermission(agentId, 'execute-task', taskType);
if (!hasPermission) {
  throw new PermissionError('Agent lacks required permissions');
}
```text

### 3. Data Sanitization

```typescript
// Sanitize all data before storage or processing
const sanitizedData = sanitizeInput(userData);
await processSanitizedData(sanitizedData);
```text

## Monitoring and Observability

### Metrics Collection

```typescript
// Enable metrics collection
const metrics = await coordinator.getMetrics();
console.log('Tasks processed:', metrics.tasksProcessed);
console.log('Average processing time:', metrics.avgProcessingTime);
console.log('Success rate:', metrics.successRate);
```text

### Health Monitoring

```typescript
// Monitor system health
const health = await coordinator.getHealthStatus();
console.log('System health:', health.status);
console.log('Active agents:', health.activeAgents);
console.log('Pending tasks:', health.pendingTasks);
```text

### Logging

```typescript
// Configure structured logging
const logger = new Logger({
  level: 'info',
  format: 'json',
  output: 'console'
});

logger.info('Task completed', { taskId, agentId, duration });
```text

## Troubleshooting

### Common Issues

#### 1. Agent Not Responding

**Cause:** Agent may be overloaded or experiencing issues
**Solution:**
```typescript
// Check agent status and workload
const agent = await registry.getAgent(agentId);
if (agent.status === 'busy') {
  // Wait or reassign task
  await taskManager.reassignTask(taskId, alternativeAgentId);
}
```text

#### 2. Task Execution Failures

**Cause:** Task may have invalid configuration or dependencies
**Solution:**
```typescript
// Review task configuration and dependencies
const task = await coordinator.getTask(taskId);
console.log('Task config:', task.metadata);

// Check for missing dependencies
if (task.dependsOn?.length > 0) {
  const dependencies = await Promise.all(
    task.dependsOn.map(depId => coordinator.getTask(depId))
  );

  const incompleteDeps = dependencies.filter(dep => dep.status !== 'completed');
  if (incompleteDeps.length > 0) {
    console.log('Waiting for dependencies:', incompleteDeps.map(d => d.id));
  }
}
```text

#### 3. State Synchronization Issues

**Cause:** State updates may not be propagating correctly
**Solution:**
```typescript
// Verify state consistency
const state1 = sharedState.getState('workflow.status');
const state2 = await sharedStateManager.getState('workflow.status');

if (state1 !== state2) {
  console.warn('State inconsistency detected');
  // Force state refresh
  await sharedState.refresh();
}
```text

## Version History

- **v1.0.0** - Initial API release
- **v1.1.0** - Added integration patterns and enhanced error handling
- **v1.2.0** - Added comprehensive monitoring and observability
- **v1.3.0** - Enhanced agent capabilities and state management

## Support

For API issues and questions:
- Check the [troubleshooting guide](../troubleshooting/index.md)
- Review the [examples](../../examples/) for usage patterns
- File issues in the [GitHub repository](https://github.com/noorg/noorg/issues)

---

**Last Updated:** 2025-09-29
**Version:** 1.3.0
**License:** CC BY-NC-SA 4.0