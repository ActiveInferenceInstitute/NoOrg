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
exports.Logger = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Logger class for consistent logging across components
 */
class Logger {
    /**
     * Constructor initializes the logger for a specific component
     * @param component Component name
     * @param logLevel Log level (default: 'info')
     * @param logDir Directory for log files (default: 'logs')
     */
    constructor(component, logLevel = 'info', logDir = 'logs') {
        this.component = component;
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        // Configure logger
        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ level, message, timestamp, ...meta }) => {
                return `${timestamp} [${level.toUpperCase()}] [${this.component}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.printf(({ level, message, timestamp, ...meta }) => {
                        return `${timestamp} [${level.toUpperCase()}] [${this.component}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                    }))
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
    info(message, meta = {}) {
        this.logger.info(message, meta);
    }
    /**
     * Log a warning message
     * @param message Log message
     * @param meta Additional metadata
     */
    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }
    /**
     * Log an error message
     * @param message Log message
     * @param meta Additional metadata
     */
    error(message, meta = {}) {
        this.logger.error(message, meta);
    }
    /**
     * Log a debug message
     * @param message Log message
     * @param meta Additional metadata
     */
    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }
    /**
     * Get the winston logger instance
     * @returns Winston logger instance
     */
    getLogger() {
        return this.logger;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map