import { EventSystem } from '../events/EventSystem';
import * as crypto from 'crypto';

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

export class MessageSystem {
  private static instance: MessageSystem;
  private eventSystem: EventSystem;
  private topicHandlers: Map<string, Set<MessageHandler>>;
  private messageHistory: Map<string, Message[]>;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.topicHandlers = new Map();
    this.messageHistory = new Map();
    
    // Listen for message events from the event system
    this.eventSystem.on('message', (event) => {
      this.handleMessage(event.payload as Message);
    });
  }

  public static getInstance(): MessageSystem {
    if (!MessageSystem.instance) {
      MessageSystem.instance = new MessageSystem();
    }
    return MessageSystem.instance;
  }

  public async publish(topic: string, payload: any, metadata?: Record<string, any>): Promise<void> {
    const message: Message = {
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

  public subscribe(topic: string, handler: MessageHandler): () => void {
    if (!this.topicHandlers.has(topic)) {
      this.topicHandlers.set(topic, new Set());
    }
    this.topicHandlers.get(topic)?.add(handler);

    // Return unsubscribe function
    return () => {
      this.topicHandlers.get(topic)?.delete(handler);
    };
  }

  public getMessageHistory(topic: string): Message[] {
    return this.messageHistory.get(topic) || [];
  }

  private async handleMessage(message: Message): Promise<void> {
    const handlers = this.topicHandlers.get(message.topic) || new Set();
    const promises = Array.from(handlers).map(handler => handler(message));
    await Promise.all(promises);
  }
} 