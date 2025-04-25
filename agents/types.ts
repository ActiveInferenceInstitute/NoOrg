export interface Capability {
  name: string;
  level: number;
}

export interface ResourceAllocation {
  cpu: number;    // Number of CPU cores
  memory: number; // Memory in MB
  storage: number; // Storage in MB
}

export interface Resources {
  total: ResourceAllocation;
  available: ResourceAllocation;
  reserved: ResourceAllocation;
}

export interface HealthStatus {
  lastHeartbeat: number;
  isHealthy: boolean;
  errors: string[];
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'busy' | 'offline';
  capabilities: Capability[];
  resources: Resources;
  currentLoad: ResourceAllocation;
  taskHistory: string[]; // Array of task IDs
  healthStatus: HealthStatus;
  executeTask: (task: Task) => Promise<TaskResult>;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: Error;
}

export interface Task {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  requiredCapabilities: Capability[];
  resourceRequirements: ResourceAllocation;
  divisible: boolean;
  size: number;
  createdAt: number;
  deadline: number;
}

export interface SwarmResult {
  success: boolean;
  errors?: Array<{
    agentId: string;
    message: string;
  }>;
  results?: {
    taskId: string;
    agentId: string;
    metrics: {
      duration: number;
      resourceUtilization: ResourceAllocation;
      success: boolean;
    };
  }[];
} 