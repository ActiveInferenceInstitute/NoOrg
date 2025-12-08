/**
 * Multiagent Coordination System Types
 * Core type definitions for the multiagent coordination system
 */
export interface Capability {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
}
/**
 * Agent configuration
 */
export interface AgentConfig {
    id: string;
    name: string;
    type: string;
    description?: string;
    capabilities?: Capability[];
    metadata?: Record<string, unknown>;
    preferredModel?: string;
    sharedState?: any;
    openAIClient?: any;
}
/**
 * Agent status
 */
export interface AgentStatus {
    id: string;
    name: string;
    type: string;
    status: 'available' | 'busy' | 'offline' | 'error';
    lastActive: number;
    capabilities: Capability[];
    metadata: Record<string, unknown>;
    state: 'available' | 'busy' | 'offline' | 'error';
    lastUpdated: number;
    healthStatus: {
        isHealthy: boolean;
        errors: string[];
        lastHeartbeat: number;
    };
    metrics: Record<string, unknown>;
}
/**
 * Agent information
 */
export interface BaseAgent {
    id: string;
    name: string;
    type: string;
    description: string;
    capabilities: Capability[];
    status: AgentStatus;
    metadata: Record<string, unknown>;
    preferredModel: string;
    createdAt: number;
    lastActive: number;
}
export interface Agent extends BaseAgent {
}
export interface AgentIO {
    input: Record<string, unknown>;
    output: Record<string, unknown>;
}
export interface AgentFilter {
    types?: string[];
    status?: string[];
    capabilities?: string[];
    metadata?: Record<string, any>;
}
export interface Task {
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
export interface TaskResult {
    success: boolean;
    data?: any;
    error?: string;
    metrics?: {
        startTime: number;
        endTime: number;
        duration: number;
        tokenUsage?: {
            prompt: number;
            completion: number;
            total: number;
        };
        cost?: number;
    };
}
export interface TaskFilter {
    types?: string[];
    status?: ('pending' | 'assigned' | 'in-progress' | 'completed' | 'failed' | 'cancelled')[];
    priority?: ('low' | 'medium' | 'high' | 'critical')[];
    assignedTo?: string;
    dependsOn?: string;
    createdBefore?: number;
    createdAfter?: number;
    updatedBefore?: number;
    updatedAfter?: number;
    metadata?: Record<string, any>;
}
export interface TaskFlow {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
    dependencies: {
        [taskId: string]: string[];
    };
    metadata?: Record<string, any>;
}
export interface OptimizedFlow extends TaskFlow {
    assignmentPlan: {
        [taskId: string]: string;
    };
    executionPlan: {
        order: string[];
        parallel: string[][];
    };
    estimatedCompletion: number;
}
export interface FlowChanges {
    addTasks?: Task[];
    removeTasks?: string[];
    modifyTasks?: {
        [taskId: string]: Partial<Task>;
    };
    addDependencies?: {
        [taskId: string]: string[];
    };
    removeDependencies?: {
        [taskId: string]: string[];
    };
}
export interface ResourceRequirements {
    cpu?: number;
    memory?: number;
    storage?: number;
    network?: number;
    gpu?: number;
    custom?: Record<string, number>;
}
export interface ResourceAllocation extends ResourceRequirements {
    id: string;
    assignedTo: string;
    allocatedAt: number;
    expiresAt?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface ResourceAvailability {
    total: ResourceRequirements;
    available: ResourceRequirements;
    reserved: ResourceRequirements;
}
export interface TimeFrame {
    start: number;
    end: number;
}
export interface ResourceForecast {
    timeframe: TimeFrame;
    predictions: {
        [timestamp: number]: ResourceAvailability;
    };
    confidence: number;
}
export interface OptimizationResult {
    before: Record<string, any>;
    after: Record<string, any>;
    improvements: Record<string, number>;
    recommendations: string[];
}
/**
 * State metadata
 */
export interface StateMetadata {
    action: string;
    agentId: string;
    agentName: string;
    agentType: string;
    timestamp: string;
}
/**
 * State change callback
 */
export type StateChangeCallback = (path: string, value: unknown, metadata?: StateMetadata) => void;
/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'last-write-wins' | 'merge' | 'custom';
/**
 * State persistence options
 */
export interface StatePersistenceOptions {
    enabled: boolean;
    path?: string;
    autoSave?: boolean;
    saveInterval?: number;
    compression?: boolean;
}
/**
 * State validation rules
 */
export interface StateValidationRule {
    path: string;
    type: 'required' | 'type' | 'range' | 'enum' | 'custom';
    value?: any;
    message?: string;
    validator?: (value: any) => boolean;
}
/**
 * State change event
 */
export interface StateChangeEvent {
    path: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
    source: string;
}
/**
 * State snapshot
 */
export interface StateSnapshot {
    state: Record<string, any>;
    metadata: Record<string, StateMetadata>;
    timestamp: number;
    version: number;
}
/**
 * State update options
 */
export interface StateUpdateOptions {
    modifiedBy: string;
    metadata: StateMetadata;
}
export interface Coordinates {
    x: number;
    y: number;
    z?: number;
}
export interface EnvironmentConfig {
    id?: string;
    name: string;
    dimensions: {
        width: number;
        height: number;
        depth?: number;
    };
    cellProperties?: string[];
    objectTypes?: string[];
    signalTypes?: string[];
    metadata?: Record<string, any>;
}
export interface Cell {
    coordinates: Coordinates;
    state: Record<string, any>;
    objects: string[];
    signals: string[];
    lastModified: number;
}
export interface CellQuery {
    region?: {
        min: Coordinates;
        max: Coordinates;
    };
    properties?: Record<string, any>;
    containsObjects?: boolean;
    containsSignals?: boolean;
    modifiedSince?: number;
}
export interface EnvironmentObject {
    id: string;
    type: string;
    position: Coordinates;
    properties: Record<string, any>;
    createdBy: string;
    createdAt: number;
    lastModified: number;
}
export interface EnvironmentModification {
    id: string;
    environmentId: string;
    agentId: string;
    timestamp: number;
    type: 'creation' | 'modification' | 'deletion';
    target: {
        type: 'cell' | 'object' | 'signal';
        id?: string;
        coordinates?: Coordinates;
    };
    before?: Record<string, any>;
    after?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface ModificationFilter {
    environmentId?: string;
    agentId?: string;
    types?: string[];
    targetTypes?: string[];
    timeframe?: TimeFrame;
}
export interface HeatmapData {
    resolution: {
        width: number;
        height: number;
    };
    data: number[][];
    min: number;
    max: number;
    metadata: {
        metric: string;
        timeframe: TimeFrame;
    };
}
export interface ModificationPattern {
    id: string;
    description: string;
    frequency: number;
    agents: string[];
    signature: Record<string, any>;
    confidence: number;
    examples: EnvironmentModification[];
}
export interface ActivityProfile {
    agentId: string;
    timeframe: TimeFrame;
    activityVolume: number;
    activityPattern: Record<string, number>;
    hotspots: Coordinates[];
    frequentModifications: Record<string, number>;
    collaborations: {
        agentId: string;
        strength: number;
    }[];
}
export interface Signal {
    id: string;
    type: string;
    origin: Coordinates;
    strength: number;
    data: Record<string, any>;
    emittedBy: string;
    emittedAt: number;
    expiresAt?: number;
    propagationRule?: string;
}
export interface PropagationRule {
    id: string;
    name: string;
    signalType: string;
    decayFunction: {
        type: 'linear' | 'exponential' | 'manhattan' | 'custom';
        parameters: Record<string, number>;
    };
    maxDistance: number;
    affectedProperties: string[];
    effectFunction: string;
}
export interface SignalTrackingData {
    signal: Signal;
    propagation: {
        currentStrength: number;
        affectedCells: number;
        propagationFront: Coordinates[];
    };
    effects: {
        [cellId: string]: Record<string, any>;
    };
}
export interface SignalEffect {
    cellCoordinates: Coordinates;
    property: string;
    before: any;
    after: any;
    signalStrength: number;
    timestamp: number;
}
export interface ProcessingResult {
    processedSignals: number;
    affectedCells: number;
    completedSignals: string[];
    activeSignals: string[];
}
export interface StrategyContext {
    systemState: Record<string, any>;
    agents: Agent[];
    tasks: Task[];
    resources: ResourceAvailability;
    environment?: Record<string, any>;
    timeframe: TimeFrame;
    constraints?: Record<string, any>;
}
export interface CoordinationStrategy {
    id: string;
    name: string;
    description?: string;
    parameters: Record<string, any>;
    applicability: {
        minAgents?: number;
        maxAgents?: number;
        requiredCapabilities?: string[];
        resourceThresholds?: Record<string, number>;
    };
    structure: {
        type: 'hierarchical' | 'peer' | 'hybrid' | 'market';
        topology?: Record<string, any>;
    };
    rules: CoordinationRule[];
    metrics: {
        [key: string]: {
            description: string;
            target: number;
            weight: number;
        };
    };
}
export interface CoordinationRule {
    id: string;
    name: string;
    condition: string;
    action: string;
    priority: number;
    metadata?: Record<string, any>;
}
export interface StrategyEvaluation {
    strategyId: string;
    timeframe: TimeFrame;
    performance: {
        [metric: string]: {
            value: number;
            target: number;
            deviation: number;
        };
    };
    overallScore: number;
    insights: string[];
    recommendations: {
        parameter: string;
        currentValue: any;
        recommendedValue: any;
        expectedImprovement: number;
    }[];
}
export interface Goal {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    priority: number;
    createdAt: number;
    deadline?: number;
    criteria: {
        [key: string]: {
            description: string;
            targetValue: any;
            currentValue?: any;
            importance: number;
        };
    };
    subgoals?: string[];
    dependencies?: string[];
    assignedTo?: string[];
    metadata?: Record<string, any>;
}
export interface GoalAlignmentResult {
    systemGoalId: string;
    agentGoals: {
        agentId: string;
        goalId: string;
        alignmentScore: number;
    }[];
    misalignedAgents: string[];
    alignmentSummary: {
        overallScore: number;
        areas: {
            [area: string]: number;
        };
    };
}
export interface GoalProgress {
    goalId: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    progress: number;
    criteriaProgress: {
        [key: string]: {
            currentValue: any;
            targetValue: any;
            progress: number;
        };
    };
    subgoalProgress?: {
        [goalId: string]: number;
    };
    timeRemaining?: number;
    blockers?: string[];
}
export interface CoordinationPolicy {
    id: string;
    name: string;
    description?: string;
    scope: {
        global?: boolean;
        environments?: string[];
        agents?: string[];
        tasks?: string[];
    };
    rules: {
        id: string;
        condition: string;
        action: string;
        priority: number;
    }[];
    enforcement: 'strict' | 'advisory' | 'monitoring';
    metadata?: Record<string, any>;
}
export interface EnforcementResult {
    policyId: string;
    enforced: boolean;
    violations: {
        ruleId: string;
        entity: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }[];
    actions: {
        ruleId: string;
        action: string;
        status: 'success' | 'failed';
        details?: string;
    }[];
}
export interface PolicyEvaluation {
    policyId: string;
    timeframe: TimeFrame;
    compliance: number;
    violations: {
        ruleId: string;
        count: number;
        entities: string[];
    }[];
    impact: {
        [metric: string]: number;
    };
    recommendations: string[];
}
export interface ExecutionStatus {
    flowId: string;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
    progress: number;
    taskStatus: {
        [taskId: string]: {
            status: string;
            assignedTo?: string;
            startTime?: number;
            endTime?: number;
            progress?: number;
        };
    };
    issues: {
        taskId: string;
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }[];
    metrics: {
        elapsedTime: number;
        estimatedRemainingTime: number;
        resourceUtilization: Record<string, number>;
    };
}
export interface CoordinationDirective {
    id: string;
    type: string;
    description: string;
    targets: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    issuedBy: string;
    issuedAt: number;
    expiresAt?: number;
    parameters: Record<string, any>;
    status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
    acknowledgments: {
        [agentId: string]: {
            status: 'pending' | 'accepted' | 'rejected';
            timestamp: number;
            message?: string;
        };
    };
}
export interface DirectiveStatus {
    directiveId: string;
    status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    acknowledgmentStatus: {
        total: number;
        accepted: number;
        rejected: number;
        pending: number;
    };
    executionStatus: {
        [agentId: string]: {
            status: string;
            progress?: number;
            lastUpdated: number;
            message?: string;
        };
    };
}
export interface CoalitionConfig {
    name: string;
    purpose: string;
    structure: 'hierarchical' | 'peer' | 'hybrid';
    requiredCapabilities?: Capability[];
    membershipCriteria?: Record<string, any>;
    allocationStrategy?: 'balanced' | 'specialized' | 'adaptive';
    communicationPattern?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface CoalitionPerformance {
    coalitionId: string;
    timeframe: TimeFrame;
    taskMetrics: {
        total: number;
        completed: number;
        failed: number;
        avgDuration: number;
        throughput: number;
    };
    resourceMetrics: {
        utilization: Record<string, number>;
        efficiency: number;
        balance: number;
    };
    collaborationMetrics: {
        communicationVolume: number;
        coordinationOverhead: number;
        synergyScore: number;
    };
}
export interface EffectivenessAnalysis {
    coalitionId: string;
    compositionAnalysis: {
        adequacy: number;
        redundancy: number;
        gaps: string[];
        recommendations: string[];
    };
    processAnalysis: {
        efficiency: number;
        bottlenecks: string[];
        optimization: string[];
    };
    outputAnalysis: {
        quality: number;
        consistency: number;
        improvements: string[];
    };
}
export interface CoalitionPrediction {
    taskId: string;
    predictedCoalition: {
        agents: string[];
        structure: Record<string, any>;
        roles: {
            [agentId: string]: string;
        };
    };
    expectedPerformance: {
        completionTime: number;
        resourceUsage: Record<string, number>;
        quality: number;
    };
    confidence: number;
    alternatives: {
        coalition: string[];
        performance: Record<string, number>;
        tradeoffs: Record<string, any>;
    }[];
}
export interface OpenAIOptions {
    model: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
    user?: string;
    functions?: any[];
    function_call?: 'auto' | 'none' | {
        name: string;
    };
}
export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
            function_call?: {
                name: string;
                arguments: string;
            };
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface ModelInfo {
    id: string;
    owned_by: string;
    created: number;
    capabilities: string[];
    limitations: string[];
    pricing: {
        input: number;
        output: number;
        unit: string;
    };
    contextWindow: number;
}
export interface BillingLimits {
    maxMonthlySpend: number;
    alertThreshold: number;
}
export interface UsageStatistics {
    timeframe: TimeFrame;
    totalCost: number;
    totalTokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    modelUsage: Record<string, {
        requests: number;
        tokens: {
            prompt: number;
            completion: number;
            total: number;
        };
        cost: number;
    }>;
}
export interface TokenEstimate {
    promptTokens: number;
    completionTokens: {
        min: number;
        max: number;
        expected: number;
    };
    totalTokens: {
        min: number;
        max: number;
        expected: number;
    };
    estimatedCost: {
        min: number;
        max: number;
        expected: number;
    };
}
export interface PromptTemplate {
    id: string;
    name: string;
    description?: string;
    template: string;
    variables: {
        [name: string]: {
            type: string;
            description?: string;
            required: boolean;
            default?: any;
        };
    };
    examples?: {
        variables: Record<string, any>;
        result: string;
    }[];
    metadata?: Record<string, any>;
}
export interface PromptAnalysis {
    promptId: string;
    performance: {
        responseQuality: number;
        tokenUsage: number;
        cost: number;
        latency: number;
    };
    issues: {
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        suggestion?: string;
    }[];
    recommendations: {
        area: string;
        description: string;
        expectedImprovement: Record<string, number>;
        implementation: string;
    }[];
}
export interface ResponseSchema {
    type: string;
    properties?: Record<string, ResponseSchema>;
    items?: ResponseSchema;
    required?: string[];
    enum?: any[];
    format?: string;
}
export interface Entity {
    type: string;
    value: any;
    position: {
        start: number;
        end: number;
    };
    confidence: number;
    metadata?: Record<string, any>;
}
export interface ResponseValidator {
    type: string;
    criteria: Record<string, any>;
    errorMessage?: string;
    severity: 'warning' | 'error';
}
export interface ValidationResult {
    valid: boolean;
    errors: {
        validator: string;
        message: string;
        severity: 'warning' | 'error';
        location?: string;
    }[];
    warnings: {
        validator: string;
        message: string;
        location?: string;
    }[];
}
export interface QualityCriteria {
    relevance?: number;
    accuracy?: number;
    completeness?: number;
    clarity?: number;
    coherence?: number;
    correctness?: number;
    custom?: Record<string, number>;
}
export interface QualityScore {
    overall: number;
    dimensions: Record<string, number>;
    analysis: string;
}
export interface KnowledgeItems {
    concepts: {
        name: string;
        description: string;
        confidence: number;
    }[];
    relationships: {
        source: string;
        target: string;
        type: string;
        confidence: number;
    }[];
    facts: {
        statement: string;
        confidence: number;
    }[];
}
export interface KnowledgeBase {
    items: Record<string, any>;
    relationships: {
        [id: string]: {
            source: string;
            target: string;
            type: string;
        };
    };
}
export interface Link {
    id: string;
    source: string;
    target: string;
    type: string;
    metadata?: Record<string, any>;
}
export interface KnowledgeItem {
    id: string;
    type: string;
    content: Record<string, any>;
    metadata: {
        createdBy: string;
        createdAt: number;
        updatedAt: number;
        tags: string[];
        version: number;
    };
    relationships?: {
        [relationshipType: string]: string[];
    };
}
export interface Hierarchy {
    root: string;
    structure: {
        [itemId: string]: string[];
    };
    metadata: Record<string, any>;
}
export interface SearchResult {
    itemId: string;
    type: string;
    relevance: number;
    highlight?: {
        field: string;
        snippet: string;
    }[];
}
export interface GraphFilter {
    rootItems?: string[];
    itemTypes?: string[];
    relationshipTypes?: string[];
    maxDepth?: number;
    excludedItems?: string[];
}
export interface KnowledgeGraph {
    nodes: {
        id: string;
        type: string;
        metadata: Record<string, any>;
    }[];
    edges: {
        source: string;
        target: string;
        type: string;
        metadata?: Record<string, any>;
    }[];
}
export interface Document {
    id: string;
    title: string;
    sections: {
        id: string;
        title?: string;
        content: string;
        metadata?: Record<string, any>;
    }[];
    metadata: {
        author: string;
        createdAt: number;
        updatedAt: number;
        version: number;
        tags: string[];
        status: 'draft' | 'published' | 'archived';
    };
}
export interface DocumentTemplate {
    id: string;
    name: string;
    description?: string;
    sections: {
        id: string;
        title?: string;
        templateContent: string;
        variables: string[];
        optional: boolean;
    }[];
    metadata: {
        createdBy: string;
        createdAt: number;
        updatedAt: number;
        version: number;
        tags: string[];
    };
}
export interface DocStructure {
    type: 'flat' | 'hierarchical' | 'network';
    organization: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface OrganizationResult {
    structure: DocStructure;
    documentMap: {
        [docId: string]: {
            path: string;
            links: string[];
        };
    };
    navigationStructure: Record<string, any>;
}
export interface ObsidianLink {
    type: 'wikilink' | 'aliased' | 'header' | 'block' | 'embedded';
    source: string;
    target: string;
    targetType: 'file' | 'header' | 'block';
    alias?: string;
    position: {
        start: number;
        end: number;
    };
}
export interface LinkSuggestion {
    sourceId: string;
    targetId: string;
    relevance: number;
    type: string;
    reason: string;
}
export interface ConnectivityAnalysis {
    itemId: string;
    incomingLinks: number;
    outgoingLinks: number;
    centralityScore: number;
    missingLinks: LinkSuggestion[];
    clusters: {
        id: string;
        items: string[];
        strength: number;
    }[];
}
export interface WorkflowStage {
    id: string;
    type: string;
    title: string;
    description: string;
    agent: BaseAgent;
    dependsOn?: string[];
    next?: string[];
    metadata?: Record<string, any>;
}
export interface WorkflowMetrics {
    totalStages: number;
    totalProcessingTime: number;
    outputFiles: string[];
    successRate: number;
    errorCount: number;
}
export interface AgentRegistry extends BaseAgent {
    sharedStateManager: {
        setState(path: string, value: unknown, options: StateUpdateOptions): Promise<void>;
        getState(path: string): Promise<unknown>;
        clearState(): Promise<void>;
        loadState(): Promise<void>;
    };
    taskManager: {
        assignTask(taskId: string, agentId: string): Promise<void>;
        completeTask(taskId: string, agentId: string): Promise<void>;
        failTask(taskId: string, agentId: string, error: string): Promise<void>;
    };
    openAIClient: {
        createCompletion(prompt: string, options?: Record<string, unknown>): Promise<string>;
        createChat(messages: Array<Record<string, unknown>>, options?: Record<string, unknown>): Promise<string>;
    };
    promptManager: {
        getPrompt(name: string, variables?: Record<string, unknown>): Promise<string>;
        addPrompt(name: string, template: string): Promise<void>;
        updatePrompt(name: string, template: string): Promise<void>;
        deletePrompt(name: string): Promise<void>;
    };
    executionConfig: {
        maxConcurrentTasks: number;
        enableAutoRetry: boolean;
        maxRetryAttempts: number;
        taskPriorityQueue: boolean;
        useAgentSpecialization: boolean;
        monitorAgentPerformance: boolean;
    };
    registerAgent(agent: Agent): Promise<boolean>;
    updateAgent(agentId: string, updates: Partial<Agent>): Promise<boolean>;
    listAgents(filter?: AgentFilter): Promise<Array<import('../../agents/types').Agent>>;
}
//# sourceMappingURL=types.d.ts.map