export interface EventDefinition {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    correlationId?: string;
    sourceId?: string;
    metadata?: Record<string, any>;
}
export interface EventFilter {
    type?: string | RegExp;
    correlationId?: string;
    sourceId?: string;
    timestampFrom?: number;
    timestampTo?: number;
    metadataFilter?: Record<string, any>;
}
export interface EventSubscriptionOptions {
    filter?: EventFilter;
    onlyFuture?: boolean;
    persist?: boolean;
    subscriptionId?: string;
}
export interface EventPersistenceOptions {
    enabled: boolean;
    storageDirectory?: string;
    maxEventsPerType?: number;
}
export declare class EventSystem {
    private static instance;
    private eventEmitter;
    private eventStore;
    private subscriptions;
    private persistenceOptions;
    private correlationMap;
    private constructor();
    static getInstance(persistenceOptions?: EventPersistenceOptions): EventSystem;
    emit(type: string, payload: any, options?: {
        correlationId?: string;
        sourceId?: string;
        metadata?: Record<string, any>;
    }): EventDefinition;
    on(type: string, handler: (event: EventDefinition) => void): void;
    off(type: string, handler: (event: EventDefinition) => void): void;
    private storeEvent;
    getEventHistory(type: string): EventDefinition[];
    getAllEvents(): EventDefinition[];
    findEvents(filter: EventFilter): EventDefinition[];
    subscribe(options: EventSubscriptionOptions, handler: (event: EventDefinition) => void): () => void;
    getCorrelatedEvents(correlationId: string): EventDefinition[];
    clearEventHistory(): void;
    replayEvents(filter?: EventFilter, handler?: (event: EventDefinition) => void): void;
    private matchesFilter;
    private processSubscriptionsForEvent;
    private persistEventToDisk;
    private loadPersistedEvents;
    private generateEventId;
    private generateSubscriptionId;
}
//# sourceMappingURL=EventSystem.d.ts.map