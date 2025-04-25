import { StateMetadata, StateChangeCallback, StateUpdateOptions } from './types';
export declare class SharedStateManager {
    private static instance;
    private state;
    private metadata;
    private subscribers;
    private logger;
    private callbacks;
    private constructor();
    static getInstance(): SharedStateManager;
    getState(path: string): Promise<unknown>;
    setState(path: string, value: unknown, options: StateUpdateOptions): Promise<void>;
    subscribe(path: string, callback: StateChangeCallback): () => void;
    private notifySubscribers;
    getMetadata(path: string): StateMetadata | undefined;
    clearState(): Promise<void>;
    loadState(): Promise<void>;
    addCallback(path: string, callback: (path: string, value: unknown, metadata?: StateMetadata) => void): void;
    removeCallback(path: string, callback: (path: string, value: unknown, metadata?: StateMetadata) => void): void;
}
