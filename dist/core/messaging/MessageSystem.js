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
exports.MessageSystem = void 0;
const EventSystem_1 = require("../events/EventSystem");
const crypto = __importStar(require("crypto"));
class MessageSystem {
    constructor() {
        this.eventSystem = EventSystem_1.EventSystem.getInstance();
        this.topicHandlers = new Map();
        this.messageHistory = new Map();
        // Listen for message events from the event system
        this.eventSystem.on('message', (event) => {
            this.handleMessage(event.payload);
        });
    }
    static getInstance() {
        if (!MessageSystem.instance) {
            MessageSystem.instance = new MessageSystem();
        }
        return MessageSystem.instance;
    }
    async publish(topic, payload, metadata) {
        const message = {
            id: crypto.randomUUID(),
            topic,
            payload,
            timestamp: Date.now(),
            metadata
        };
        // Store message in history
        if (!this.messageHistory.has(topic)) {
            this.messageHistory.set(topic, []);
        }
        this.messageHistory.get(topic)?.push(message);
        // Emit message event
        this.eventSystem.emit('message', message);
        // Process handlers
        const handlers = this.topicHandlers.get(topic) || new Set();
        const promises = Array.from(handlers).map(handler => handler(message));
        await Promise.all(promises);
    }
    subscribe(topic, handler) {
        if (!this.topicHandlers.has(topic)) {
            this.topicHandlers.set(topic, new Set());
        }
        this.topicHandlers.get(topic)?.add(handler);
        // Return unsubscribe function
        return () => {
            this.topicHandlers.get(topic)?.delete(handler);
        };
    }
    getMessageHistory(topic) {
        return this.messageHistory.get(topic) || [];
    }
    async handleMessage(message) {
        const handlers = this.topicHandlers.get(message.topic) || new Set();
        const promises = Array.from(handlers).map(handler => handler(message));
        await Promise.all(promises);
    }
}
exports.MessageSystem = MessageSystem;
//# sourceMappingURL=MessageSystem.js.map