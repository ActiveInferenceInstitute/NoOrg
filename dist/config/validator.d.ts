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
export declare class ConfigValidationError extends Error {
    errors: string[];
    constructor(errors: string[]);
}
/**
 * Load and validate configuration
 */
export declare function loadConfig(): Config;
/**
 * Get configuration with validation
 */
export declare function getConfig(): Config;
export declare function config(): Config;
