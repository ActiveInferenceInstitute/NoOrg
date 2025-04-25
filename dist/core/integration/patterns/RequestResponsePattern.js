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
exports.RequestResponsePattern = void 0;
const EventSystem_1 = require("../../events/EventSystem");
const crypto = __importStar(require("crypto"));
class RequestResponsePattern {
    constructor() {
        this.DEFAULT_TIMEOUT = 30000; // 30 seconds
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.handlers = new Map();
        // Listen for request events
        this.eventSystem.on('request', async (event) => {
            const request = event.payload;
            await this.handleRequest(request);
        });
    }
    static getInstance() {
        if (!RequestResponsePattern.instance) {
            RequestResponsePattern.instance = new RequestResponsePattern();
        }
        return RequestResponsePattern.instance;
    }
    registerHandler(type, handler) {
        this.handlers.set(type, handler);
    }
    async request(type, payload, timeout = this.DEFAULT_TIMEOUT) {
        const request = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now(),
            timeout
        };
        return new Promise((resolve, reject) => {
            // Set timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Request ${request.id} timed out after ${timeout}ms`));
            }, timeout);
            // Listen for response
            const responseHandler = (event) => {
                const response = event.payload;
                if (response.requestId === request.id) {
                    clearTimeout(timeoutId);
                    this.eventSystem.off(`response:${request.id}`, responseHandler);
                    if (response.error) {
                        reject(response.error);
                    }
                    else {
                        resolve(response.payload);
                    }
                }
            };
            this.eventSystem.on(`response:${request.id}`, responseHandler);
            this.eventSystem.emit('request', request);
        });
    }
    async handleRequest(request) {
        const handler = this.handlers.get(request.type);
        if (!handler) {
            this.sendResponse(request.id, undefined, new Error(`No handler registered for request type: ${request.type}`));
            return;
        }
        try {
            const result = await handler(request);
            this.sendResponse(request.id, result);
        }
        catch (error) {
            this.sendResponse(request.id, undefined, error);
        }
    }
    sendResponse(requestId, payload, error) {
        const response = {
            requestId,
            payload,
            error,
            timestamp: Date.now()
        };
        this.eventSystem.emit(`response:${requestId}`, response);
    }
}
exports.RequestResponsePattern = RequestResponsePattern;
//# sourceMappingURL=RequestResponsePattern.js.map