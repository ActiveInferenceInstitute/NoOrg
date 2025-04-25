import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';

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

export class EventSystem {
  private static instance: EventSystem;
  private eventEmitter: EventEmitter;
  private eventStore: Map<string, EventDefinition[]>;
  private subscriptions: Map<string, { filter: EventFilter; handler: (event: EventDefinition) => void }>;
  private persistenceOptions: EventPersistenceOptions;
  private correlationMap: Map<string, Set<string>>;

  private constructor(persistenceOptions: EventPersistenceOptions = { enabled: false }) {
    this.eventEmitter = new EventEmitter();
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

  public static getInstance(persistenceOptions?: EventPersistenceOptions): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem(persistenceOptions);
    }
    return EventSystem.instance;
  }

  public emit(type: string, payload: any, options?: {
    correlationId?: string;
    sourceId?: string;
    metadata?: Record<string, any>;
  }): EventDefinition {
    const eventId = this.generateEventId();
    const event: EventDefinition = {
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

  public on(type: string, handler: (event: EventDefinition) => void): void {
    this.eventEmitter.on(type, handler);
  }

  public off(type: string, handler: (event: EventDefinition) => void): void {
    this.eventEmitter.off(type, handler);
  }

  private storeEvent(event: EventDefinition): void {
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

  public getEventHistory(type: string): EventDefinition[] {
    return this.eventStore.get(type) || [];
  }

  public getAllEvents(): EventDefinition[] {
    const allEvents: EventDefinition[] = [];
    this.eventStore.forEach(events => {
      allEvents.push(...events);
    });
    return allEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  public findEvents(filter: EventFilter): EventDefinition[] {
    return this.getAllEvents().filter(event => this.matchesFilter(event, filter));
  }

  public subscribe(options: EventSubscriptionOptions, handler: (event: EventDefinition) => void): () => void {
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
    const processFutureEvent = (event: EventDefinition) => {
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

  public getCorrelatedEvents(correlationId: string): EventDefinition[] {
    const eventIds = this.correlationMap.get(correlationId);
    if (!eventIds) return [];
    
    return this.getAllEvents().filter(event => eventIds.has(event.id));
  }

  public clearEventHistory(): void {
    this.eventStore.clear();
    this.correlationMap.clear();
    
    // Clear persisted events if persistence is enabled
    if (this.persistenceOptions.enabled && this.persistenceOptions.storageDirectory) {
      fs.emptyDirSync(this.persistenceOptions.storageDirectory);
    }
  }

  public replayEvents(filter?: EventFilter, handler?: (event: EventDefinition) => void): void {
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
      } else {
        this.eventEmitter.emit(event.type, event);
        this.eventEmitter.emit('*', event);
      }
    }
  }

  private matchesFilter(event: EventDefinition, filter: EventFilter): boolean {
    // Check type filter
    if (filter.type) {
      if (filter.type instanceof RegExp) {
        if (!filter.type.test(event.type)) return false;
      } else if (event.type !== filter.type) {
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

  private processSubscriptionsForEvent(event: EventDefinition): void {
    for (const [, subscription] of this.subscriptions) {
      if (this.matchesFilter(event, subscription.filter)) {
        subscription.handler(event);
      }
    }
  }

  private persistEventToDisk(event: EventDefinition): void {
    if (!this.persistenceOptions.enabled || !this.persistenceOptions.storageDirectory) {
      return;
    }
    
    const eventTypeDir = path.join(this.persistenceOptions.storageDirectory, event.type);
    fs.ensureDirSync(eventTypeDir);
    
    const eventFilePath = path.join(eventTypeDir, `${event.id}.json`);
    fs.writeJsonSync(eventFilePath, event, { spaces: 2 });
  }

  private loadPersistedEvents(): void {
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
              const event = fs.readJsonSync(eventPath) as EventDefinition;
              
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
    } catch (error) {
      console.error('Error loading persisted events:', error);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
} 