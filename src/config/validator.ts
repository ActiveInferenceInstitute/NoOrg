import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Configuration structure
 */
export interface Config {
  openai: {
    apiKey: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
  };
  coordinator: {
    name: string;
    strategy: 'centralized' | 'decentralized' | 'hybrid';
    maxConcurrentTasks: number;
    enableAutoRetry: boolean;
    maxRetryAttempts: number;
    taskPriorityQueue: boolean;
    useAgentSpecialization: boolean;
    monitorAgentPerformance: boolean;
  };
  stateManagement: {
    filePath: string;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
  };
  monitoring: {
    enableMetrics: boolean;
    metricsPort: number;
    dashboardPort: number;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    logFile: string;
  };
  healthMonitoring: {
    checkInterval: number;
    checkTimeout: number;
    minSuccessRate: number;
    maxErrorRate: number;
    maxResponseTime: number;
  };
  database?: {
    url?: string;
    redisUrl?: string;
  };
  security: {
    jwtSecret?: string;
    apiKey?: string;
    enableAuthentication: boolean;
  };
  performance: {
    workerThreads: number;
    maxMemoryMB: number;
    enableCaching: boolean;
    cacheTTL: number;
  };
  environment: {
    nodeEnv: 'development' | 'production' | 'test';
    debug: boolean;
    enableProfiling: boolean;
  };
}

/**
 * Validation error
 */
export class ConfigValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Configuration validation failed:\n${errors.join('\n')}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Load and parse environment variables
 */
function loadEnv(): Record<string, string> {
  // Try to load .env file
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  return process.env as Record<string, string>;
}

/**
 * Parse boolean from string
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse number from string
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate configuration
 */
function validateConfig(config: Config): string[] {
  const errors: string[] = [];

  // OpenAI validation
  if (!config.openai.apiKey || config.openai.apiKey === 'sk-proj-your-key-here') {
    errors.push('OPENAI_API_KEY is required and must be set');
  }
  if (config.openai.maxTokens <= 0) {
    errors.push('MAX_TOKENS must be greater than 0');
  }
  if (config.openai.temperature < 0 || config.openai.temperature > 2) {
    errors.push('TEMPERATURE must be between 0 and 2');
  }

  // Coordinator validation
  const validStrategies = ['centralized', 'decentralized', 'hybrid'];
  if (!validStrategies.includes(config.coordinator.strategy)) {
    errors.push(`COORDINATION_STRATEGY must be one of: ${validStrategies.join(', ')}`);
  }
  if (config.coordinator.maxConcurrentTasks <= 0) {
    errors.push('MAX_CONCURRENT_TASKS must be greater than 0');
  }
  if (config.coordinator.maxRetryAttempts < 0) {
    errors.push('MAX_RETRY_ATTEMPTS must be non-negative');
  }

  // State management validation
  if (!config.stateManagement.filePath) {
    errors.push('STATE_FILE_PATH is required');
  }
  if (config.stateManagement.autoSaveInterval <= 0) {
    errors.push('AUTO_SAVE_INTERVAL must be greater than 0');
  }

  // Monitoring validation
  if (config.monitoring.metricsPort <= 0 || config.monitoring.metricsPort > 65535) {
    errors.push('METRICS_PORT must be between 1 and 65535');
  }
  if (config.monitoring.dashboardPort <= 0 || config.monitoring.dashboardPort > 65535) {
    errors.push('DASHBOARD_PORT must be between 1 and 65535');
  }
  const validLogLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLogLevels.includes(config.monitoring.logLevel)) {
    errors.push(`LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
  }

  // Health monitoring validation
  if (config.healthMonitoring.checkInterval <= 0) {
    errors.push('HEALTH_CHECK_INTERVAL must be greater than 0');
  }
  if (config.healthMonitoring.checkTimeout <= 0) {
    errors.push('HEALTH_CHECK_TIMEOUT must be greater than 0');
  }
  if (config.healthMonitoring.minSuccessRate < 0 || config.healthMonitoring.minSuccessRate > 100) {
    errors.push('MIN_SUCCESS_RATE must be between 0 and 100');
  }
  if (config.healthMonitoring.maxErrorRate < 0 || config.healthMonitoring.maxErrorRate > 100) {
    errors.push('MAX_ERROR_RATE must be between 0 and 100');
  }
  if (config.healthMonitoring.maxResponseTime <= 0) {
    errors.push('MAX_RESPONSE_TIME must be greater than 0');
  }

  // Security validation
  if (config.security.enableAuthentication) {
    if (!config.security.jwtSecret) {
      errors.push('JWT_SECRET is required when authentication is enabled');
    }
    if (!config.security.apiKey) {
      errors.push('API_KEY is required when authentication is enabled');
    }
  }

  // Performance validation
  if (config.performance.workerThreads <= 0) {
    errors.push('WORKER_THREADS must be greater than 0');
  }
  if (config.performance.maxMemoryMB <= 0) {
    errors.push('MAX_MEMORY_MB must be greater than 0');
  }
  if (config.performance.cacheTTL <= 0) {
    errors.push('CACHE_TTL must be greater than 0');
  }

  // Environment validation
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(config.environment.nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${validNodeEnvs.join(', ')}`);
  }

  return errors;
}

/**
 * Load and validate configuration
 */
export function loadConfig(): Config {
  const env = loadEnv();

  const config: Config = {
    openai: {
      apiKey: env.OPENAI_API_KEY || '',
      defaultModel: env.DEFAULT_MODEL || 'gpt-4o',
      maxTokens: parseNumber(env.MAX_TOKENS, 8000),
      temperature: parseNumber(env.TEMPERATURE, 0.7)
    },
    coordinator: {
      name: env.COORDINATOR_NAME || 'Default Coordinator',
      strategy: (env.COORDINATION_STRATEGY as any) || 'hybrid',
      maxConcurrentTasks: parseNumber(env.MAX_CONCURRENT_TASKS, 10),
      enableAutoRetry: parseBoolean(env.ENABLE_AUTO_RETRY, true),
      maxRetryAttempts: parseNumber(env.MAX_RETRY_ATTEMPTS, 3),
      taskPriorityQueue: parseBoolean(env.TASK_PRIORITY_QUEUE, true),
      useAgentSpecialization: parseBoolean(env.USE_AGENT_SPECIALIZATION, true),
      monitorAgentPerformance: parseBoolean(env.MONITOR_AGENT_PERFORMANCE, true)
    },
    stateManagement: {
      filePath: env.STATE_FILE_PATH || './data/coordinator-state.json',
      autoSaveEnabled: parseBoolean(env.AUTO_SAVE_ENABLED, true),
      autoSaveInterval: parseNumber(env.AUTO_SAVE_INTERVAL, 60000)
    },
    monitoring: {
      enableMetrics: parseBoolean(env.ENABLE_METRICS, true),
      metricsPort: parseNumber(env.METRICS_PORT, 9090),
      dashboardPort: parseNumber(env.DASHBOARD_PORT, 3000),
      logLevel: (env.LOG_LEVEL as any) || 'info',
      logFile: env.LOG_FILE || './logs/noorg.log'
    },
    healthMonitoring: {
      checkInterval: parseNumber(env.HEALTH_CHECK_INTERVAL, 30000),
      checkTimeout: parseNumber(env.HEALTH_CHECK_TIMEOUT, 5000),
      minSuccessRate: parseNumber(env.MIN_SUCCESS_RATE, 90),
      maxErrorRate: parseNumber(env.MAX_ERROR_RATE, 10),
      maxResponseTime: parseNumber(env.MAX_RESPONSE_TIME, 5000)
    },
    database: {
      url: env.DATABASE_URL,
      redisUrl: env.REDIS_URL
    },
    security: {
      jwtSecret: env.JWT_SECRET,
      apiKey: env.API_KEY,
      enableAuthentication: parseBoolean(env.ENABLE_AUTHENTICATION, false)
    },
    performance: {
      workerThreads: parseNumber(env.WORKER_THREADS, 4),
      maxMemoryMB: parseNumber(env.MAX_MEMORY_MB, 2048),
      enableCaching: parseBoolean(env.ENABLE_CACHING, true),
      cacheTTL: parseNumber(env.CACHE_TTL, 3600)
    },
    environment: {
      nodeEnv: (env.NODE_ENV as any) || 'production',
      debug: parseBoolean(env.DEBUG, false),
      enableProfiling: parseBoolean(env.ENABLE_PROFILING, false)
    }
  };

  // Validate configuration
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new ConfigValidationError(errors);
  }

  return config;
}

/**
 * Get configuration with validation
 */
export function getConfig(): Config {
  try {
    return loadConfig();
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Export configuration as singleton
 */
let configInstance: Config | null = null;

export function config(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
