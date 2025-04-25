/**
 * Swarm configuration interface
 */
export interface SwarmConfig {
  logLevel: string;
  defaultStrategy: CoordinationStrategy;
  metrics: {
    enabled: boolean;
    interval: number;
  };
  communication: {
    protocol: string;
    timeout: number;
    retries: number;
  };
  resources: {
    monitoring: {
      enabled: boolean;
      interval: number;
    };
    optimization: {
      enabled: boolean;
      threshold: number;
    };
  };
}

/**
 * Swarm agent interface
 */
export interface SwarmAgent {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'offline';
  capabilities: AgentCapability[];
  resources: {
    total: ResourceAllocation;
    available: ResourceAllocation;
    reserved: ResourceAllocation;
  };
  coordinationMode?: 'autonomous' | 'collaborative' | 'hierarchical';
  communicationPatterns?: string[];
  decisionMaking?: {
    strategy: string;
    parameters: any;
  };
  metrics?: {
    performance: number;
    reliability: number;
    utilization: number;
  };
  executeTask: (task: SwarmTask) => Promise<any>;
}

/**
 * Agent capability interface
 */
export interface AgentCapability {
  type: string;
  level: number;
  parameters?: any;
}

/**
 * Resource allocation interface
 */
export interface ResourceAllocation {
  cpu: number;
  memory: number;
  storage: number;
  network?: {
    bandwidth: number;
    latency: number;
  };
}

/**
 * Swarm policy interface
 */
export interface SwarmPolicy {
  id: string;
  type: string;
  name: string;
  description?: string;
  rules: Array<{
    id: string;
    condition: {
      type: string;
      parameters: any;
    };
    action: {
      type: string;
      parameters: any;
    };
    priority?: number;
  }>;
  metrics?: {
    effectiveness: number;
    compliance: number;
  };
}

/**
 * Swarm template interface
 */
export interface SwarmTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  requirements: {
    minAgents: number;
    maxAgents?: number;
    capabilities: AgentCapability[];
    resources: ResourceAllocation;
  };
  coordinationStrategy?: CoordinationStrategy;
  policies?: string[];
  scaling?: {
    enabled: boolean;
    min: number;
    max: number;
    metrics: string[];
  };
}

/**
 * Coordination strategy interface
 */
export interface CoordinationStrategy {
  mode: 'autonomous' | 'collaborative' | 'hierarchical';
  communicationPatterns: string[];
  decisionMaking: {
    strategy: string;
    parameters: any;
  };
  loadBalancing?: {
    enabled: boolean;
    algorithm: string;
    parameters: any;
  };
  faultTolerance?: {
    enabled: boolean;
    strategy: string;
    parameters: any;
  };
}

/**
 * Swarm task interface
 */
export interface SwarmTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  requiredCapabilities: AgentCapability[];
  resourceRequirements: ResourceAllocation;
  dependencies?: string[];
  timeout?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffFactor: number;
  };
  divisible: boolean;
  size: number;
  minChunkSize?: number;
  parentId?: string;
  start?: number;
  end?: number;
  context?: any;
}

/**
 * Swarm result interface
 */
export interface SwarmResult {
  success: boolean;
  results?: Array<{
    agentId: string;
    result: any;
    metrics?: {
      duration: number;
      resourceUtilization: {
        cpu: number;
        memory: number;
        storage: number;
      };
    };
  }>;
  errors?: Array<{
    agentId: string;
    error: Error;
  }>;
}

/**
 * Coordination metrics interface
 */
export interface CoordinationMetrics {
  timestamp: string;
  swarmSize: number;
  activeAgents: number;
  taskMetrics: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    averageDuration: number;
  };
  resourceMetrics: {
    utilization: ResourceAllocation;
    availability: ResourceAllocation;
  };
  performanceMetrics: {
    throughput: number;
    latency: number;
    efficiency: number;
  };
  healthMetrics: {
    uptime: number;
    reliability: number;
    faultRate: number;
  };
}

export interface TaskResult {
  agentId: string;
  result: any;
  metrics?: {
    duration: number;
    resourceUtilization: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
} 