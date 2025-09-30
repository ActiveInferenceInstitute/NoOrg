"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidationError = void 0;
exports.loadConfig = loadConfig;
exports.getConfig = getConfig;
exports.config = config;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Validation error
 */
class ConfigValidationError extends Error {
    constructor(errors) {
        super(`Configuration validation failed:\n${errors.join('\n')}`);
        this.errors = errors;
        this.name = 'ConfigValidationError';
    }
}
exports.ConfigValidationError = ConfigValidationError;
/**
 * Load and parse environment variables
 */
function loadEnv() {
    // Try to load .env file
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }
    return process.env;
}
/**
 * Parse boolean from string
 */
function parseBoolean(value, defaultValue) {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}
/**
 * Parse number from string
 */
function parseNumber(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}
/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];
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
function loadConfig() {
    const env = loadEnv();
    const config = {
        openai: {
            apiKey: env.OPENAI_API_KEY || '',
            defaultModel: env.DEFAULT_MODEL || 'gpt-4o',
            maxTokens: parseNumber(env.MAX_TOKENS, 8000),
            temperature: parseNumber(env.TEMPERATURE, 0.7)
        },
        coordinator: {
            name: env.COORDINATOR_NAME || 'Default Coordinator',
            strategy: env.COORDINATION_STRATEGY || 'hybrid',
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
            logLevel: env.LOG_LEVEL || 'info',
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
            nodeEnv: env.NODE_ENV || 'production',
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
function getConfig() {
    try {
        return loadConfig();
    }
    catch (error) {
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
let configInstance = null;
function config() {
    if (!configInstance) {
        configInstance = loadConfig();
    }
    return configInstance;
}
//# sourceMappingURL=validator.js.map