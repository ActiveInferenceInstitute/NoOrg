"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSystem = void 0;
const events_1 = require("events");
class EventSystem {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
        this.eventStore = new Map();
    }
    static getInstance() {
        if (!EventSystem.instance) {
            EventSystem.instance = new EventSystem();
        }
        return EventSystem.instance;
    }
    emit(type, payload) {
        const event = {
            type,
            payload,
            timestamp: Date.now(),
        };
        this.storeEvent(event);
        this.eventEmitter.emit(type, event);
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
        this.eventStore.get(event.type)?.push(event);
    }
    getEventHistory(type) {
        return this.eventStore.get(type) || [];
    }
}
exports.EventSystem = EventSystem;
//# sourceMappingURL=EventSystem.js.map