import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Logger class for consistent logging across components
 */
export class Logger {
  private logger: winston.Logger;
  private component: string;

  /**
   * Constructor initializes the logger for a specific component
   * @param component Component name
   * @param logLevel Log level (default: 'info')
   * @param logDir Directory for log files (default: 'logs')
   */
  constructor(component: string, logLevel: string = 'info', logDir: string = 'logs') {
    this.component = component;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Configure logger
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [${this.component}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              return `${timestamp} [${level.toUpperCase()}] [${this.component}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          )
        }),
        new winston.transports.File({ 
          filename: path.join(logDir, `${component.toLowerCase()}.log`) 
        })
      ]
    });
  }

  /**
   * Log an info message
   * @param message Log message
   * @param meta Additional metadata
   */
  info(message: string, meta: Record<string, any> = {}): void {
    this.logger.info(message, meta);
  }

  /**
   * Log a warning message
   * @param message Log message
   * @param meta Additional metadata
   */
  warn(message: string, meta: Record<string, any> = {}): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log an error message
   * @param message Log message
   * @param meta Additional metadata
   */
  error(message: string, meta: Record<string, any> = {}): void {
    this.logger.error(message, meta);
  }

  /**
   * Log a debug message
   * @param message Log message
   * @param meta Additional metadata
   */
  debug(message: string, meta: Record<string, any> = {}): void {
    this.logger.debug(message, meta);
  }

  /**
   * Get the winston logger instance
   * @returns Winston logger instance
   */
  getLogger(): winston.Logger {
    return this.logger;
  }
} 