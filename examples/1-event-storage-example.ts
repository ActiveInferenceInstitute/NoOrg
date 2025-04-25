/**
 * Example 1: Event System and Storage System Integration
 * 
 * This example demonstrates:
 * - Event filtering and subscription patterns
 * - Event persistence and replay
 * - Storage transactions and querying
 * - Integration between events and storage
 */

import { EventSystem, EventFilter, EventSubscriptionOptions } from '../src/core/events/EventSystem';
import { StorageSystem, QueryOptions } from '../src/core/storage/StorageSystem';
import * as fs from 'fs-extra';
import * as path from 'path';

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `event-storage-${timestamp}`;
const outputDir = path.join('output', runId);
fs.ensureDirSync(outputDir);

// Setup logger to write to both console and file
class FileLogger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = filename;
    fs.writeFileSync(this.logFile, '--- Log Started ---\n');
  }

  log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.log(message);
    fs.appendFileSync(this.logFile, `[LOG] ${message}\n`);
  }

  error(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.error(message);
    fs.appendFileSync(this.logFile, `[ERROR] ${message}\n`);
  }

  info(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    console.info(message);
    fs.appendFileSync(this.logFile, `[INFO] ${message}\n`);
  }
}

// Initialize logger
const logFile = path.join(outputDir, 'event-storage-example.log');
const logger = new FileLogger(logFile);

async function generateHumanReadableArtifacts(outputDir: string, eventStats: any, allEvents: any[]): Promise<void> {
  // Create a Markdown summary
  const summaryMd = `# Event System and Storage System Integration Example
  
## Summary
- **Total Events**: ${eventStats.totalEvents}
- **Event Types**: ${eventStats.eventTypes.join(', ')}
- **Correlation IDs**: ${eventStats.correlationIds.join(', ')}
- **Run Timestamp**: ${new Date().toISOString()}

## Key Demonstrated Features
1. Event filtering and subscription patterns
2. Event persistence and replay
3. Storage transactions (including rollback)
4. Integration between events and storage systems

## Event Timeline
${allEvents.map(e => `- **${new Date(e.timestamp).toISOString()}**: ${e.type} (ID: ${e.id})`).join('\n')}

## Storage & Event Flow Diagram
\`\`\`
┌────────────────┐         ┌────────────────┐
│                │         │                │
│   EventSystem  │◄────────┤    Emitter     │
│                │         │                │
└───────┬────────┘         └────────────────┘
        │
        │ Events
        ▼
┌────────────────┐         ┌────────────────┐
│                │         │                │
│   Subscribers  │─────────►  StorageSystem │
│                │ Store   │                │
└────────────────┘ Event   └────────────────┘
                   Data
\`\`\`

## Next Steps
- Create more complex event correlation patterns
- Implement custom storage adapters
- Explore event-driven architectures

`;

  fs.writeFileSync(path.join(outputDir, 'summary.md'), summaryMd);
  
  // Create a simple HTML visualization
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Event System Visualization</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .event { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .event-user { background-color: #e6f7ff; }
    .event-system { background-color: #f9f9f9; }
    .timeline { position: relative; max-width: 800px; margin: 0 auto; }
    .timeline::after { content: ''; position: absolute; width: 3px; background-color: #ddd; top: 0; bottom: 0; left: 20px; margin-left: -2px; }
    .container { padding: 10px 40px; position: relative; background-color: inherit; width: 80%; }
    .container::after { content: ''; position: absolute; width: 15px; height: 15px; left: 13px; background-color: white; border: 3px solid #4682B4; top: 15px; border-radius: 50%; z-index: 1; }
    .header { display: flex; justify-content: space-between; }
    .event-id { color: #888; font-size: 0.8em; }
    .event-payload { font-family: monospace; background-color: #f7f7f7; padding: 8px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Event System Visualization</h1>
  <div class="timeline">
    ${allEvents.map(event => `
    <div class="container">
      <div class="event ${event.type.startsWith('user') ? 'event-user' : 'event-system'}">
        <div class="header">
          <strong>${event.type}</strong>
          <span class="event-id">${event.id}</span>
        </div>
        <div>Timestamp: ${new Date(event.timestamp).toISOString()}</div>
        <div>Correlation ID: ${event.correlationId || 'None'}</div>
        <div>Payload:</div>
        <pre class="event-payload">${JSON.stringify(event.payload, null, 2)}</pre>
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'event-visualization.html'), htmlContent);
  
  logger.info('Generated human-readable artifacts (summary.md and event-visualization.html)');
}

async function runExample() {
  try {
    logger.info('Starting Event System and Storage System Example...');

    // Initialize Event System with persistence
    const eventStorageDir = path.join(outputDir, 'events');
    fs.ensureDirSync(eventStorageDir);
    
    const eventSystem = EventSystem.getInstance({
      enabled: true,
      storageDirectory: eventStorageDir,
      maxEventsPerType: 100
    });
    
    logger.info('Event System initialized with persistence at:', eventStorageDir);

    // Initialize Storage System
    const storageDir = path.join(outputDir, 'storage');
    fs.ensureDirSync(storageDir);
    
    const storageSystem = StorageSystem.getInstance({
      backend: 'file',
      storageDir,
      cacheTTL: 3600000 // 1 hour
    });
    
    logger.info('Storage System initialized with file backend at:', storageDir);

    // Setup event subscription for user-related events
    logger.info('Setting up event subscriptions...');
    
    const userFilter: EventFilter = {
      type: /^user:/,
      metadataFilter: {
        domain: 'auth'
      }
    };
    
    const userSubscriptionOptions: EventSubscriptionOptions = {
      filter: userFilter,
      onlyFuture: false
    };
    
    const unsubscribe = eventSystem.subscribe(userSubscriptionOptions, (event) => {
      logger.info(`Received user event: ${event.type}`, {
        id: event.id,
        payload: event.payload,
        timestamp: new Date(event.timestamp).toISOString()
      });
      
      // Store event data in Storage System
      storageSystem.set(`user_event_${event.id}`, {
        type: event.type,
        userId: event.payload.userId,
        timestamp: event.timestamp
      }, {
        domain: 'auth',
        eventId: event.id
      });
    });
    
    // Emit various events
    logger.info('Emitting events...');
    
    // User events (should be captured by subscription)
    eventSystem.emit('user:login', { 
      userId: 'user123', 
      ipAddress: '192.168.1.1' 
    }, {
      correlationId: 'session-abc123',
      metadata: { domain: 'auth', importance: 'high' }
    });
    
    eventSystem.emit('user:logout', { 
      userId: 'user123' 
    }, {
      correlationId: 'session-abc123',
      metadata: { domain: 'auth', importance: 'medium' }
    });
    
    // System event (should not be captured by subscription)
    eventSystem.emit('system:startup', { 
      version: '1.0.0',
      environment: 'development'
    }, {
      metadata: { domain: 'system', importance: 'high' }
    });
    
    // Demonstrate storage transactions
    logger.info('Demonstrating storage transactions...');
    
    try {
      // Begin transaction
      await storageSystem.beginTransaction();
      logger.info('Transaction started');
      
      // Multiple operations in a transaction
      await storageSystem.set('user:profile:123', {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      await storageSystem.set('user:preferences:123', {
        theme: 'dark',
        notifications: true
      });
      
      // Conditional operation that would fail
      const shouldFail = true; // Always fail for demo purposes
      if (shouldFail) {
        throw new Error('Random transaction failure');
      }
      
      // Commit transaction if no errors
      await storageSystem.commitTransaction();
      logger.info('Transaction committed successfully');
    } catch (error) {
      logger.error('Transaction failed:', error);
      await storageSystem.rollbackTransaction();
      logger.info('Transaction rolled back');
    }
    
    // Query storage data
    logger.info('Querying storage data...');
    
    const queryOptions: QueryOptions = {
      prefix: 'user:',
      metadata: {
        domain: 'auth'
      },
      sortBy: 'timestamp',
      sortDirection: 'desc'
    };
    
    const keys = await storageSystem.keys(queryOptions);
    logger.info(`Found ${keys.length} matching keys:`, keys);
    
    const queryResults = await storageSystem.query(queryOptions);
    logger.info(`Query results:`, queryResults);
    
    // Demonstrate event replay
    logger.info('Demonstrating event replay...');
    
    let replayCount = 0;
    eventSystem.replayEvents(userFilter, (event) => {
      replayCount++;
      logger.info(`Replay event ${replayCount}:`, {
        id: event.id,
        type: event.type,
        timestamp: new Date(event.timestamp).toISOString()
      });
    });
    
    logger.info(`Replayed ${replayCount} events`);
    
    // Find correlated events
    logger.info('Finding correlated events...');
    
    const correlatedEvents = eventSystem.getCorrelatedEvents('session-abc123');
    logger.info(`Found ${correlatedEvents.length} correlated events for session-abc123`);
    
    // Clean up subscription
    unsubscribe();
    
    // Save final event and storage stats
    const allEvents = eventSystem.getAllEvents();
    const eventStats = {
      totalEvents: allEvents.length,
      eventTypes: [...new Set(allEvents.map(e => e.type))],
      correlationIds: [...new Set(allEvents.filter(e => e.correlationId).map(e => e.correlationId))]
    };
    
    fs.writeJsonSync(path.join(outputDir, 'event-stats.json'), eventStats, { spaces: 2 });
    logger.info('Example completed successfully.');
    logger.info(`Results saved to: ${outputDir}`);
    
    // Generate human-readable artifacts
    await generateHumanReadableArtifacts(outputDir, eventStats, allEvents);
    
    // Explicitly return to ensure Promise resolves
    return outputDir;
  } catch (error) {
    logger.error('Example failed with error:', error);
    throw error;
  }
}

// Run the example and handle any errors
runExample()
  .then(outputDir => {
    console.log(`✅ Example completed successfully. Results saved to: ${outputDir}`);
    // Force the process to exit cleanly without timeout
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Example failed with error:', error);
    // Force the process to exit with error code
    process.exit(1);
  }); 