import { SwarmConfig, CoordinationStrategy } from '../types/swarm';
import path from 'path';

/**
 * Test configuration for swarm coordination tests
 */
export const TEST_CONFIG: SwarmConfig = {
  logLevel: 'debug',
  defaultStrategy: {
    mode: 'collaborative',
    communicationPatterns: ['broadcast', 'p2p'],
    decisionMaking: {
      strategy: 'consensus',
      parameters: {
        threshold: 0.7,
        timeout: 5000
      }
    },
    loadBalancing: {
      enabled: true,
      algorithm: 'weighted-round-robin',
      parameters: {
        weights: {
          cpu: 0.4,
          memory: 0.3,
          storage: 0.3
        }
      }
    },
    faultTolerance: {
      enabled: true,
      strategy: 'replication',
      parameters: {
        replicationFactor: 2,
        heartbeatInterval: 1000
      }
    }
  },
  metrics: {
    enabled: true,
    interval: 1000
  },
  communication: {
    protocol: 'ws',
    timeout: 5000,
    retries: 3
  },
  resources: {
    monitoring: {
      enabled: true,
      interval: 1000
    },
    optimization: {
      enabled: true,
      threshold: 0.8
    }
  }
};

/**
 * Test output paths
 */
export const TEST_PATHS = {
  logs: path.join(__dirname, 'logs'),
  results: path.join(__dirname, 'results'),
  visualizations: path.join(__dirname, 'visualizations')
};

/**
 * Test scenarios configuration
 */
export const TEST_SCENARIOS = {
  basic: {
    agentCount: 5,
    taskCount: 10,
    duration: 60000,  // 1 minute
    taskTypes: ['compute', 'storage', 'network'],
    resourceLimits: {
      cpu: { min: 1, max: 4 },
      memory: { min: 512, max: 4096 },
      storage: { min: 32, max: 256 }
    },
    retries: 3
  },
  
  scalability: {
    agentCount: 20,
    taskCount: 50,
    swarmCount: 3,
    batchSizes: [5, 10, 20],
    duration: 300000,  // 5 minutes
    retries: 2
  },
  
  faultTolerance: {
    agentCount: 10,
    taskCount: 20,
    failureRate: 0.3,  // 30% of agents will fail
    recoveryTime: 5000,  // 5 seconds
    duration: 120000,  // 2 minutes
    retries: 3
  },
  
  performance: {
    agentCount: 15,
    taskCount: 100,
    concurrency: 5,
    duration: 180000,  // 3 minutes
    retries: 2,
    metrics: {
      interval: 1000,  // 1 second
      retention: 3600000  // 1 hour
    }
  },
  
  resourceOptimization: {
    agentCount: 8,
    taskCount: 40,
    duration: 240000, // 4 minutes
    scenarios: [
      {
        name: 'balanced',
        distribution: 'uniform',
        constraints: { cpu: 0.7, memory: 0.7, storage: 0.7 }
      },
      {
        name: 'cpu-intensive',
        distribution: 'skewed',
        constraints: { cpu: 0.9, memory: 0.5, storage: 0.3 }
      },
      {
        name: 'memory-intensive',
        distribution: 'skewed',
        constraints: { cpu: 0.5, memory: 0.9, storage: 0.3 }
      }
    ],
    optimization: {
      interval: 30000,
      strategies: ['rebalancing', 'consolidation', 'scaling'],
      objectives: ['efficiency', 'fairness', 'stability']
    }
  },
  
  communication: {
    agentCount: 12,
    taskCount: 60,
    duration: 120000, // 2 minutes
    patterns: [
      { type: 'mesh', topology: 'full' },
      { type: 'hierarchical', levels: 3 },
      { type: 'ring', redundancy: 2 }
    ],
    scenarios: [
      { name: 'normal', latency: 50, packetLoss: 0.001 },
      { name: 'degraded', latency: 200, packetLoss: 0.01 },
      { name: 'congested', latency: 500, packetLoss: 0.05 }
    ],
    messageTypes: [
      'coordination',
      'status',
      'task',
      'result',
      'control'
    ]
  }
};

/**
 * Test visualization configuration
 */
export const VISUALIZATION_CONFIG = {
  charts: {
    taskDuration: {
      type: 'scatter',
      title: 'Task Duration Distribution',
      xaxis: {
        title: 'Time (ms)',
        type: 'date'
      },
      yaxis: {
        title: 'Duration (ms)',
        rangemode: 'tozero'
      }
    },
    taskSuccess: {
      type: 'pie',
      title: 'Task Success Rate'
    },
    resourceUtilization: {
      type: 'heatmap',
      title: 'Resource Utilization',
      xaxis: {
        title: 'Resource Type'
      },
      yaxis: {
        title: 'Agent ID'
      }
    },
    taskDistribution: {
      type: 'bar',
      title: 'Task Distribution Across Agents',
      xaxis: {
        title: 'Agent ID',
        type: 'category'
      },
      yaxis: {
        title: 'Number of Tasks',
        rangemode: 'tozero'
      }
    }
  },
  animation: {
    duration: 500,
    easing: 'cubic-in-out'
  },
  layout: {
    showlegend: true,
    margin: { t: 50, l: 50, r: 50, b: 50 },
    width: 800,
    height: 600
  }
};

/**
 * Test data generation configuration
 */
export const DATA_GENERATION_CONFIG = {
  agents: {
    capabilities: {
      types: ['compute', 'storage', 'network', 'analysis'],
      levelRange: [1, 5]
    },
    resources: {
      cpu: {
        min: 4,
        max: 8
      },
      memory: {
        min: 8192,
        max: 16384
      },
      storage: {
        min: 512,
        max: 1024
      }
    }
  },
  tasks: {
    types: ['processing', 'analysis', 'storage', 'network'],
    priorities: ['low', 'medium', 'high', 'critical'],
    resourceRequirements: {
      cpu: {
        min: 1,
        max: 4
      },
      memory: {
        min: 512,
        max: 8192
      },
      storage: {
        min: 32,
        max: 512
      }
    }
  }
};

/**
 * Test validation configuration
 */
export const VALIDATION_CONFIG = {
  metrics: {
    requiredFields: {
      taskDuration: ['taskId', 'duration'],
      taskSuccess: ['taskId', 'success', 'value'],
      taskDistribution: ['agentId', 'tasks'],
      resourceUtilization: ['agentId', 'cpu', 'memory', 'storage']
    },
    valueRanges: {
      duration: { min: 0 },
      cpu: { min: 0, max: 100 },
      memory: { min: 0, max: 100 },
      storage: { min: 0, max: 100 }
    }
  },
  charts: {
    minDataPoints: 1,
    maxDataPoints: 1000,
    requiredFields: {
      scatter: ['x', 'y'],
      bar: ['x', 'y'],
      pie: ['values', 'labels'],
      heatmap: ['z', 'x', 'y']
    }
  }
}; 