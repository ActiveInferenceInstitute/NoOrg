interface EventDefinition {
    type: string;
    payload: any;
    timestamp: number;
}
export declare class EventSystem {
    private static instance;
    private eventEmitter;
    private eventStore;
    private constructor();
    static getInstance(): EventSystem;
    emit(type: string, payload: any): void;
    on(type: string, handler: (event: EventDefinition) => void): void;
    off(type: string, handler: (event: EventDefinition) => void): void;
    private storeEvent;
    getEventHistory(type: string): EventDefinition[];
}
export {};
