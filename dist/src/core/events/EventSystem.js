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
exports.EventSystem = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class EventSystem {
    constructor(persistenceOptions = { enabled: false }) {
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventStore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "subscriptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "persistenceOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "correlationMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.eventEmitter = new events_1.EventEmitter();
        this.eventEmitter.setMaxListeners(100); // Increase max listeners
        this.eventStore = new Map();
        this.subscriptions = new Map();
        this.persistenceOptions = persistenceOptions;
        this.correlationMap = new Map();
        // Initialize persistence if enabled
        if (this.persistenceOptions.enabled && this.persistenceOptions.storageDirectory) {
            fs.ensureDirSync(this.persistenceOptions.storageDirectory);
            this.loadPersistedEvents();
        }
    }
    static getInstance(persistenceOptions) {
        if (!EventSystem.instance) {
            EventSystem.instance = new EventSystem(persistenceOptions);
        }
        return EventSystem.instance;
    }
    emit(type, payload, options) {
        const eventId = this.generateEventId();
        const event = {
            id: eventId,
            type,
            payload,
            timestamp: Date.now(),
            correlationId: options?.correlationId,
            sourceId: options?.sourceId,
            metadata: options?.metadata
        };
        this.storeEvent(event);
        this.eventEmitter.emit(type, event);
        // Also emit to wildcard listeners
        this.eventEmitter.emit('*', event);
        // Update correlation map if this event has a correlation ID
        if (event.correlationId) {
            if (!this.correlationMap.has(event.correlationId)) {
                this.correlationMap.set(event.correlationId, new Set());
            }
            this.correlationMap.get(event.correlationId)?.add(event.id);
        }
        return event;
    }
    /**
     * Alias for emit() method for compatibility with existing code
     */
    publish(type, payload, options) {
        return this.emit(type, payload, options);
    }
    on(type, handler) {
        this.eventEmitter.on(type, handler);
    }
    off(type, handler) {
        this.eventEmitter.off(type, handler);
    }
    storeEvent(event) {
        if (!this.eventStore.has(event.type)) {
            this.eventStore.set(event.type, []);
        }
        const eventList = this.eventStore.get(event.type);
        if (eventList) {
            eventList.push(event);
            // Trim the list if it exceeds max events per type
            if (this.persistenceOptions.maxEventsPerType &&
                eventList.length > this.persistenceOptions.maxEventsPerType) {
                eventList.splice(0, eventList.length - this.persistenceOptions.maxEventsPerType);
            }
        }
        // Persist event if enabled
        if (this.persistenceOptions.enabled) {
            this.persistEventToDisk(event);
        }
        // Process subscriptions
        this.processSubscriptionsForEvent(event);
    }
    getEventHistory(type) {
        return this.eventStore.get(type) || [];
    }
    getAllEvents() {
        const allEvents = [];
        this.eventStore.forEach(events => {
            allEvents.push(...events);
        });
        return allEvents.sort((a, b) => a.timestamp - b.timestamp);
    }
    findEvents(filter) {
        return this.getAllEvents().filter(event => this.matchesFilter(event, filter));
    }
    subscribe(options, handler) {
        const subscriptionId = options.subscriptionId || this.generateSubscriptionId();
        const filter = options.filter || {};
        // Store subscription
        this.subscriptions.set(subscriptionId, { filter, handler });
        // Register for future events if not specifically requesting only past events
        if (!options.onlyFuture) {
            // Process existing events that match the filter
            this.findEvents(filter).forEach(event => {
                handler(event);
            });
        }
        // Register for future events
        const processFutureEvent = (event) => {
            if (this.matchesFilter(event, filter)) {
                handler(event);
            }
        };
        this.eventEmitter.on('*', processFutureEvent);
        // Return unsubscribe function
        return () => {
            this.eventEmitter.off('*', processFutureEvent);
            this.subscriptions.delete(subscriptionId);
        };
    }
    getCorrelatedEvents(correlationId) {
        const eventIds = this.correlationMap.get(correlationId);
        if (!eventIds)
            return [];
        return this.getAllEvents().filter(event => eventIds.has(event.id));
    }
    clearEventHistory() {
        this.eventStore.clear();
        this.correlationMap.clear();
        // Clear persisted events if persistence is enabled
        if (this.persistenceOptions.enabled && this.persistenceOptions.storageDirectory) {
            fs.emptyDirSync(this.persistenceOptions.storageDirectory);
        }
    }
    replayEvents(filter, handler) {
        let events = this.getAllEvents();
        // Apply filter if provided
        if (filter) {
            events = events.filter(event => this.matchesFilter(event, filter));
        }
        // Sort events by timestamp
        events.sort((a, b) => a.timestamp - b.timestamp);
        // Replay events
        for (const event of events) {
            if (handler) {
                handler(event);
            }
            else {
                this.eventEmitter.emit(event.type, event);
                this.eventEmitter.emit('*', event);
            }
        }
    }
    matchesFilter(event, filter) {
        // Check type filter
        if (filter.type) {
            if (filter.type instanceof RegExp) {
                if (!filter.type.test(event.type))
                    return false;
            }
            else if (event.type !== filter.type) {
                return false;
            }
        }
        // Check correlation ID
        if (filter.correlationId && event.correlationId !== filter.correlationId) {
            return false;
        }
        // Check source ID
        if (filter.sourceId && event.sourceId !== filter.sourceId) {
            return false;
        }
        // Check timestamp range
        if (filter.timestampFrom && event.timestamp < filter.timestampFrom) {
            return false;
        }
        if (filter.timestampTo && event.timestamp > filter.timestampTo) {
            return false;
        }
        // Check metadata filters
        if (filter.metadataFilter) {
            for (const [key, value] of Object.entries(filter.metadataFilter)) {
                if (!event.metadata || event.metadata[key] !== value) {
                    return false;
                }
            }
        }
        return true;
    }
    processSubscriptionsForEvent(event) {
        for (const [, subscription] of this.subscriptions) {
            if (this.matchesFilter(event, subscription.filter)) {
                subscription.handler(event);
            }
        }
    }
    persistEventToDisk(event) {
        if (!this.persistenceOptions.enabled || !this.persistenceOptions.storageDirectory) {
            return;
        }
        const eventTypeDir = path.join(this.persistenceOptions.storageDirectory, event.type);
        fs.ensureDirSync(eventTypeDir);
        const eventFilePath = path.join(eventTypeDir, `${event.id}.json`);
        fs.writeJsonSync(eventFilePath, event, { spaces: 2 });
    }
    loadPersistedEvents() {
        if (!this.persistenceOptions.enabled || !this.persistenceOptions.storageDirectory) {
            return;
        }
        try {
            const eventTypeDirs = fs.readdirSync(this.persistenceOptions.storageDirectory);
            for (const typeDir of eventTypeDirs) {
                const typePath = path.join(this.persistenceOptions.storageDirectory, typeDir);
                if (fs.statSync(typePath).isDirectory()) {
                    const eventFiles = fs.readdirSync(typePath);
                    for (const file of eventFiles) {
                        if (file.endsWith('.json')) {
                            const eventPath = path.join(typePath, file);
                            const event = fs.readJsonSync(eventPath);
                            // Add to event store
                            if (!this.eventStore.has(event.type)) {
                                this.eventStore.set(event.type, []);
                            }
                            this.eventStore.get(event.type)?.push(event);
                            // Update correlation map
                            if (event.correlationId) {
                                if (!this.correlationMap.has(event.correlationId)) {
                                    this.correlationMap.set(event.correlationId, new Set());
                                }
                                this.correlationMap.get(event.correlationId)?.add(event.id);
                            }
                        }
                    }
                }
            }
            // Sort all event lists by timestamp
            for (const [type, events] of this.eventStore.entries()) {
                this.eventStore.set(type, events.sort((a, b) => a.timestamp - b.timestamp));
            }
        }
        catch (error) {
            console.error('Error loading persisted events:', error);
        }
    }
    generateEventId() {
        return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    generateSubscriptionId() {
        return `sub-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
}
exports.EventSystem = EventSystem;
//# sourceMappingURL=EventSystem.js.map