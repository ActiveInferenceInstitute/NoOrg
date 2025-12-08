import * as winston from 'winston';
/**
 * Logger class for consistent logging across components
 */
export declare class Logger {
    private logger;
    private component;
    /**
     * Constructor initializes the logger for a specific component
     * @param component Component name
     * @param logLevel Log level (default: 'info')
     * @param logDir Directory for log files (default: 'logs')
     */
    constructor(component: string, logLevel?: string, logDir?: string);
    /**
     * Log an info message
     * @param message Log message
     * @param meta Additional metadata
     */
    info(message: string, meta?: Record<string, any>): void;
    /**
     * Log a warning message
     * @param message Log message
     * @param meta Additional metadata
     */
    warn(message: string, meta?: Record<string, any>): void;
    /**
     * Log an error message
     * @param message Log message
     * @param meta Additional metadata
     */
    error(message: string, meta?: Record<string, any>): void;
    /**
     * Log a debug message
     * @param message Log message
     * @param meta Additional metadata
     */
    debug(message: string, meta?: Record<string, any>): void;
    /**
     * Get the winston logger instance
     * @returns Winston logger instance
     */
    getLogger(): winston.Logger;
}
//# sourceMappingURL=Logger.d.ts.map