interface Message {
    id: string;
    topic: string;
    payload: any;
    timestamp: number;
    metadata?: Record<string, any>;
}
interface MessageHandler {
    (message: Message): Promise<void> | void;
}
export declare class MessageSystem {
    private static instance;
    private eventSystem;
    private topicHandlers;
    private messageHistory;
    private constructor();
    static getInstance(): MessageSystem;
    publish(topic: string, payload: any, metadata?: Record<string, any>): Promise<void>;
    subscribe(topic: string, handler: MessageHandler): () => void;
    getMessageHistory(topic: string): Message[];
    private handleMessage;
}
export {};
//# sourceMappingURL=MessageSystem.d.ts.map