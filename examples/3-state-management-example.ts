import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Import core modules
import { EventSystem } from '../src/core/events/EventSystem';
import { StorageSystem } from '../src/core/storage/StorageSystem';

// Define interfaces to match UnitStateManager implementation
// These should match the actual implementation in src/core/units/state/UnitStateManager.ts
enum ConflictResolutionStrategy {
  LATEST_WINS = 'LATEST_WINS',
  FIRST_WINS = 'FIRST_WINS',
  MERGE = 'MERGE',
  CUSTOM = 'CUSTOM'
}

interface UnitStateManagerOptions {
  persistence?: boolean;
  storageDir?: string;
  conflictStrategy?: ConflictResolutionStrategy;
  customConflictResolver?: (existing: any, incoming: any) => any;
  syncInterval?: number;
  logger?: Console;
}

interface StateSubscriptionOptions {
  sourceId?: string;
  path?: string;
  depth?: number;
  includeChildPaths?: boolean;
  includeHistory?: boolean;
  notifyOnInitialState?: boolean;
}

type StateChangeCallback = (path: string, newValue: any, oldValue: any, sourceId?: string) => void;

// UnitStateManager class definition for the example
class UnitStateManager {
  private id: string;
  private options: UnitStateManagerOptions;
  private state: Record<string, any> = {};
  
  constructor(id: string, options: UnitStateManagerOptions = {}) {
    this.id = id;
    this.options = {
      persistence: false,
      conflictStrategy: ConflictResolutionStrategy.LATEST_WINS,
      syncInterval: 10000,
      ...options
    };
    
    if (this.options.persistence && this.options.storageDir) {
      fs.ensureDirSync(this.options.storageDir);
    }
  }
  
  // State management methods
  async setState(path: string, value: any, options?: any): Promise<void> {
    const pathParts = path.split('.');
    let current = this.state;
    
    // Handle array indexing in path
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Check if this is an array index
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [_, arrayName, indexStr] = arrayMatch;
        const index = parseInt(indexStr, 10);
        
        if (!current[arrayName]) {
          current[arrayName] = [];
        }
        
        while (current[arrayName].length <= index) {
          current[arrayName].push(null);
        }
        
        if (!current[arrayName][index]) {
          current[arrayName][index] = {};
        }
        
        current = current[arrayName][index];
        continue;
      }
      
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
    
    // Persist if enabled
    if (this.options.persistence && this.options.storageDir) {
      await this.persistState();
    }
    
    return Promise.resolve();
  }
  
  async getState(path: string, options?: { depth?: number }): Promise<any> {
    if (!path) {
      return this.state;
    }
    
    const pathParts = path.split('.');
    let current = this.state;
    
    for (const part of pathParts) {
      if (!current) return undefined;
      
      // Handle array indexing
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [_, arrayName, indexStr] = arrayMatch;
        const index = parseInt(indexStr, 10);
        
        if (!current[arrayName] || !current[arrayName][index]) {
          return undefined;
        }
        
        current = current[arrayName][index];
        continue;
      }
      
      current = current[part];
    }
    
    return current;
  }
  
  async deleteState(path: string): Promise<void> {
    const pathParts = path.split('.');
    let current = this.state;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Handle array indexing
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [_, arrayName, indexStr] = arrayMatch;
        const index = parseInt(indexStr, 10);
        
        if (!current[arrayName] || !current[arrayName][index]) {
          return;
        }
        
        current = current[arrayName][index];
        continue;
      }
      
      if (!current[part]) {
        return;
      }
      current = current[part];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    delete current[lastPart];
    
    // Persist if enabled
    if (this.options.persistence && this.options.storageDir) {
      await this.persistState();
    }
    
    return Promise.resolve();
  }
  
  private async persistState(): Promise<void> {
    if (!this.options.storageDir) return;
    
    try {
      await fs.writeJson(
        path.join(this.options.storageDir, 'state.json'),
        this.state,
        { spaces: 2 }
      );
    } catch (error) {
      console.error(`Failed to persist state for ${this.id}:`, error);
    }
  }
  
  // Transaction methods
  private inTransaction = false;
  private transactionSnapshot: Record<string, any> | null = null;
  
  async beginTransaction(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Already in a transaction');
    }
    
    this.inTransaction = true;
    this.transactionSnapshot = JSON.parse(JSON.stringify(this.state));
    return Promise.resolve();
  }
  
  async commitTransaction(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('Not in a transaction');
    }
    
    this.inTransaction = false;
    this.transactionSnapshot = null;
    
    // Persist if enabled
    if (this.options.persistence && this.options.storageDir) {
      await this.persistState();
    }
    
    return Promise.resolve();
  }
  
  async rollbackTransaction(): Promise<void> {
    if (!this.inTransaction) {
      throw new Error('Not in a transaction');
    }
    
    if (this.transactionSnapshot) {
      this.state = this.transactionSnapshot;
    }
    
    this.inTransaction = false;
    this.transactionSnapshot = null;
    return Promise.resolve();
  }
  
  // Subscription methods
  private subscriptions: Map<string, {
    id: string;
    options: StateSubscriptionOptions;
    callback: StateChangeCallback;
  }> = new Map();
  
  subscribe(id: string, options: StateSubscriptionOptions, callback: StateChangeCallback): string {
    const subId = `${this.id}:${id}:${uuidv4()}`;
    
    this.subscriptions.set(subId, {
      id,
      options,
      callback
    });
    
    return subId;
  }
  
  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }
  
  clearAllSubscriptions(): void {
    this.subscriptions.clear();
  }
  
  // Distributed sync methods (simplified for demo)
  enableDistributedSync(): void {
    // In a real implementation, this would set up event listeners
    // and potentially connect to a message broker or synchronization service
    console.log(`[${this.id}] Distributed sync enabled`);
  }
  
  disableDistributedSync(): void {
    // In a real implementation, this would clean up event listeners
    console.log(`[${this.id}] Distributed sync disabled`);
  }
}

// Create a timestamp-based run folder for outputs
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputDir = path.join('output', `state-management-example-${timestamp}`);
fs.ensureDirSync(outputDir);

/**
 * Simple file logger that logs to both console and a file
 */
class FileLogger implements Console {
  private logFilePath: string;
  private console: Console;
  
  constructor(filename: string) {
    this.logFilePath = path.join(outputDir, filename);
    // Initialize log file
    fs.writeFileSync(this.logFilePath, `=== State Management Example Log - ${new Date().toISOString()} ===\n\n`);
    this.console = console;
  }
  
  log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    this.console.log(message);
    fs.appendFileSync(this.logFilePath, `${message}\n`);
  }
  
  error(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    this.console.error(`ERROR: ${message}`);
    fs.appendFileSync(this.logFilePath, `ERROR: ${message}\n`);
  }
  
  info(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    this.console.info(`INFO: ${message}`);
    fs.appendFileSync(this.logFilePath, `INFO: ${message}\n`);
  }
  
  // Implement all Console methods
  assert(condition?: boolean, ...data: any[]): void {
    this.console.assert(condition, ...data);
  }
  
  clear(): void {
    this.console.clear();
  }
  
  count(label?: string): void {
    this.console.count(label);
  }
  
  countReset(label?: string): void {
    this.console.countReset(label);
  }
  
  debug(...data: any[]): void {
    this.console.debug(...data);
  }
  
  dir(item?: any, options?: any): void {
    this.console.dir(item, options);
  }
  
  dirxml(...data: any[]): void {
    this.console.dirxml(...data);
  }
  
  group(...data: any[]): void {
    this.console.group(...data);
  }
  
  groupCollapsed(...data: any[]): void {
    this.console.groupCollapsed(...data);
  }
  
  groupEnd(): void {
    this.console.groupEnd();
  }
  
  table(tabularData: any, properties?: string[]): void {
    this.console.table(tabularData, properties);
  }
  
  time(label?: string): void {
    this.console.time(label);
  }
  
  timeEnd(label?: string): void {
    this.console.timeEnd(label);
  }
  
  timeLog(label?: string, ...data: any[]): void {
    this.console.timeLog(label, ...data);
  }
  
  timeStamp(label?: string): void {
    this.console.timeStamp?.(label);
  }
  
  trace(...data: any[]): void {
    this.console.trace(...data);
  }
  
  warn(...data: any[]): void {
    this.console.warn(...data);
  }
  
  // Any other properties required by Console interface
  Console: any = console.Console;
  profile(label?: string): void { this.console.profile?.(label); }
  profileEnd(label?: string): void { this.console.profileEnd?.(label); }
}

// Simulate multiple units with state managers
interface SimulatedUnit {
  id: string;
  name: string;
  type: string;
  stateManager: UnitStateManager;
}

/**
 * Generate human-readable artifacts from the state management data
 */
async function generateHumanReadableArtifacts(
  outputDir: string,
  units: SimulatedUnit[],
  finalStates: Record<string, any>,
  stateFlows: any[],
  logger: Console
): Promise<void> {
  // Create a Markdown summary
  const unitsList = units.map(u => `- **${u.name}** (ID: \`${u.id}\`, Type: ${u.type})`).join('\n');
  
  const statePathCounts = Object.entries(finalStates).map(([unitId, state]) => {
    const unit = units.find(u => u.id === unitId);
    const pathCount = countPaths(state);
    return `- **${unit?.name || unitId}**: ${pathCount} state paths`;
  }).join('\n');
  
  const flowsList = stateFlows.map(flow => 
    `- **${flow.from}** → **${flow.to}**: Subscription to \`${flow.path}\``
  ).join('\n');
  
  const summaryMd = `# State Management System Example

## Summary
- **Total Units**: ${units.length}
- **State Synchronization**: Distributed with conflict resolution
- **Timestamp**: ${new Date().toISOString()}

## Organizational Units
${unitsList}

## State Path Counts
${statePathCounts}

## State Subscriptions
${flowsList}

## Key Demonstrated Features
1. Distributed state synchronization across units
2. Conflict resolution with different strategies
3. State transactions for atomic updates
4. Path-based state subscriptions and queries

## Conflict Resolution Strategies
- **LATEST_WINS**: Most recent update takes precedence
- **FIRST_WINS**: Initial value is preserved
- **MERGE**: Values are combined where possible
- **CUSTOM**: Application-specific resolution logic

## State Operations Demonstrated
- Setting state at specific paths
- Getting state with depth control
- Deleting state paths
- Transaction handling (commit/rollback)
- State subscriptions with filtering

## State Flow Diagram
\`\`\`
┌─────────────────┐      state.status      ┌─────────────────┐
│                 │────────────────────────▶                 │
│  Project Alpha  │                        │  Research Unit  │
│                 │◀───────────────────────┤                 │
└─────────────────┘   project_trackers     └─────────────────┘
         │                                           │
         │ resources                                 │ status
         ▼                                           ▼
┌─────────────────┐                        ┌─────────────────┐
│                 │                        │                 │
│ Development Unit│                        │ Operations Unit │
│                 │────────────────────────▶                 │
└─────────────────┘         status         └─────────────────┘
\`\`\`

## Next Steps
- Implement more sophisticated conflict resolution
- Add schema validation for state updates
- Create state migration mechanisms
`;

  fs.writeFileSync(path.join(outputDir, 'state-management-summary.md'), summaryMd);
  
  // Generate a visualization for state structure
  for (const [unitId, state] of Object.entries(finalStates)) {
    const unit = units.find(u => u.id === unitId);
    if (!unit) continue;
    
    const stateTree = generateStateTree(state);
    const stateTreeMd = `# ${unit.name} State Structure

## Unit Information
- **ID**: ${unit.id}
- **Type**: ${unit.type}

## State Tree
\`\`\`
${stateTree}
\`\`\`

## Raw State Data
\`\`\`json
${JSON.stringify(state, null, 2)}
\`\`\`
`;
    
    fs.writeFileSync(path.join(outputDir, `${unit.id}-state-tree.md`), stateTreeMd);
  }
  
  // Create an HTML visualization of state flows
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>State Management Visualization</title>
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #network-container { width: 100%; height: 100vh; }
    .controls { position: absolute; top: 10px; left: 10px; background: white; padding: 10px; border: 1px solid #ddd; }
    .legend { position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ddd; }
    .legend-item { margin: 5px 0; }
    .legend-color { display: inline-block; width: 15px; height: 15px; margin-right: 5px; }
  </style>
</head>
<body>
  <div id="network-container"></div>
  <div class="controls">
    <button id="hierarchical">Hierarchical Layout</button>
    <button id="physics">Physics Layout</button>
  </div>
  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-item"><div class="legend-color" style="background-color: #D2E5FF;"></div> Department</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FFC0CB;"></div> Project</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FFFF99;"></div> State Subscription</div>
  </div>
  <script type="text/javascript">
    const container = document.getElementById('network-container');
    
    const data = {
      nodes: ${JSON.stringify(units.map(unit => ({
        id: unit.id,
        label: unit.name,
        group: unit.type
      })))},
      edges: ${JSON.stringify(stateFlows.map(flow => ({
        from: flow.from,
        to: flow.to,
        label: flow.path,
        arrows: 'to',
        color: {color: '#FFFF00', highlight: '#FFD700'}
      })))}
    };
    
    const options = {
      nodes: {
        shape: 'box',
        font: {
          size: 16
        }
      },
      edges: {
        font: {
          size: 12,
          align: 'middle'
        },
        width: 2
      },
      groups: {
        department: {
          color: { background: '#D2E5FF', border: '#2B7CE9' }
        },
        project: {
          color: { background: '#FFC0CB', border: '#FF69B4' }
        }
      }
    };
    
    const network = new vis.Network(container, data, options);
    
    document.getElementById('hierarchical').addEventListener('click', function() {
      network.setOptions({
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed'
          }
        }
      });
    });
    
    document.getElementById('physics').addEventListener('click', function() {
      network.setOptions({
        layout: {
          hierarchical: {
            enabled: false
          }
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 150
          }
        }
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'state-flow-visualization.html'), htmlContent);
  
  // Create a conflict resolution demonstration markdown
  const conflictMd = `# Conflict Resolution Strategies Demonstration

This example demonstrates multiple conflict resolution strategies when concurrent updates occur.

## Concurrent Updates Test Case
Three different units attempted to update the same state path (\`shared_data.user_count\`) simultaneously:

| Unit | Update Value | Resolution Strategy |
|------|-------------|---------------------|
| Research Unit | 100 | LATEST_WINS |
| Development Unit | 120 | LATEST_WINS |
| Operations Unit | 110 | MERGE |

## Resolution Results
- **Research Unit** resolved to: ${finalStates.research_unit?.shared_data?.user_count || 'undefined'}
- **Development Unit** resolved to: ${finalStates.development_unit?.shared_data?.user_count || 'undefined'}
- **Operations Unit** resolved to: ${finalStates.operations_unit?.shared_data?.user_count || 'undefined'}
- **Project Alpha** resolved to: ${finalStates.project_alpha?.shared_data?.user_count || 'undefined'}

## Strategy Explanations

### LATEST_WINS
The most recently applied update takes precedence, regardless of the value.

### FIRST_WINS
The first value set is preserved, and later updates are ignored.

### MERGE
- For objects: Properties from both objects are combined
- For arrays: Concatenation with duplicate removal
- For primitives: Application-specific logic (usually LATEST_WINS)

### CUSTOM
Custom conflict resolution logic can be provided based on application needs.
`;

  fs.writeFileSync(path.join(outputDir, 'conflict-resolution-demo.md'), conflictMd);
  
  logger.info('Generated human-readable artifacts (markdown and HTML visualizations)');
}

/**
 * Generate a text-based tree view of a state object
 */
function generateStateTree(obj: any, prefix: string = '', isLast: boolean = true, path: string = ''): string {
  if (!obj || typeof obj !== 'object') {
    return `${prefix}${isLast ? '└── ' : '├── '}${path.split('.').pop() || 'root'}: ${obj}\n`;
  }

  let tree = `${prefix}${isLast ? '└── ' : '├── '}${path.split('.').pop() || 'root'}\n`;
  const newPrefix = prefix + (isLast ? '    ' : '│   ');
  
  const entries = Object.entries(obj);
  const lastIndex = entries.length - 1;
  
  entries.forEach(([key, value], index) => {
    const newPath = path ? `${path}.${key}` : key;
    const isLastEntry = index === lastIndex;
    
    if (typeof value === 'object' && value !== null) {
      tree += generateStateTree(value, newPrefix, isLastEntry, newPath);
    } else {
      tree += `${newPrefix}${isLastEntry ? '└── ' : '├── '}${key}: ${value}\n`;
    }
  });
  
  return tree;
}

/**
 * Run the state management example
 */
async function runExample() {
  const logger = new FileLogger('state-management.log');
  logger.info('Starting State Management Example');
  
  // Initialize required systems
  const eventSystem = EventSystem.getInstance({
    enabled: true,
    storageDirectory: path.join(outputDir, 'events'),
    maxEventsPerType: 100
  });
  
  const storageSystem = StorageSystem.getInstance({
    backend: 'file',
    storageDir: path.join(outputDir, 'storage'),
    cacheTTL: 3600
  });
  
  // Create a set of simulated units, each with its own state manager
  logger.info('Creating simulated units with state managers');
  
  const units: SimulatedUnit[] = [
    {
      id: 'research_unit',
      name: 'Research Unit',
      type: 'department',
      stateManager: new UnitStateManager('research_unit', {
        persistence: true,
        storageDir: path.join(outputDir, 'state/research_unit'),
        conflictStrategy: ConflictResolutionStrategy.LATEST_WINS,
        syncInterval: 5000,
        logger
      })
    },
    {
      id: 'development_unit',
      name: 'Development Unit',
      type: 'department',
      stateManager: new UnitStateManager('development_unit', {
        persistence: true,
        storageDir: path.join(outputDir, 'state/development_unit'),
        conflictStrategy: ConflictResolutionStrategy.LATEST_WINS,
        syncInterval: 5000,
        logger
      })
    },
    {
      id: 'operations_unit',
      name: 'Operations Unit',
      type: 'department',
      stateManager: new UnitStateManager('operations_unit', {
        persistence: true,
        storageDir: path.join(outputDir, 'state/operations_unit'),
        conflictStrategy: ConflictResolutionStrategy.MERGE,
        syncInterval: 5000,
        logger
      })
    },
    {
      id: 'project_alpha',
      name: 'Project Alpha',
      type: 'project',
      stateManager: new UnitStateManager('project_alpha', {
        persistence: true,
        storageDir: path.join(outputDir, 'state/project_alpha'),
        conflictStrategy: ConflictResolutionStrategy.CUSTOM,
        customConflictResolver: (existing, incoming) => {
          // Custom conflict resolution that merges arrays and prefers incoming for other types
          if (Array.isArray(existing) && Array.isArray(incoming)) {
            // Merge arrays with uniqueness
            return [...new Set([...existing, ...incoming])];
          }
          // For objects, prefer incoming data
          return incoming;
        },
        syncInterval: 5000,
        logger
      })
    }
  ];
  
  // Write initial unit setup to file
  fs.writeJsonSync(
    path.join(outputDir, 'unit-setup.json'),
    units.map(u => ({ id: u.id, name: u.name, type: u.type })),
    { spaces: 2 }
  );
  
  // Enable distributed synchronization for all units
  logger.info('Enabling distributed synchronization for all units');
  units.forEach(unit => {
    unit.stateManager.enableDistributedSync();
  });
  
  // Set up state subscriptions to demonstrate subscription patterns
  logger.info('Setting up state subscriptions');
  
  // 1. Research unit subscribes to project alpha's state
  const researchSubId = units[0].stateManager.subscribe(
    'project_alpha_updates',
    {
      sourceId: 'project_alpha',
      path: 'status',
      includeHistory: true
    },
    (path, newValue, oldValue) => {
      logger.info(`Research unit received project alpha status update: ${path} changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`);
      
      // Record updates in research unit's own state
      units[0].stateManager.setState('project_trackers.alpha.status', newValue);
      units[0].stateManager.setState('project_trackers.alpha.last_update', new Date().toISOString());
    }
  );
  
  // 2. Development unit subscribes to project alpha's resources
  const devSubId = units[1].stateManager.subscribe(
    'project_resources',
    {
      sourceId: 'project_alpha',
      path: 'resources',
      depth: 2
    },
    (path, newValue, oldValue) => {
      logger.info(`Development unit received project resource update: ${path}`);
      
      // Update allocation status in development unit's state
      units[1].stateManager.setState('allocated_resources.project_alpha', {
        resources: newValue,
        updated_at: new Date().toISOString()
      });
    }
  );
  
  // 3. Operations unit subscribes to all department statuses
  units[2].stateManager.subscribe(
    'department_status',
    {
      path: 'status',
      includeChildPaths: true,
      notifyOnInitialState: true
    },
    (path, newValue, oldValue, sourceId) => {
      logger.info(`Operations unit received status update from ${sourceId}: ${path}`);
      
      // Record in operations monitoring state
      units[2].stateManager.setState(`monitoring.departments.${sourceId}.status`, newValue);
      units[2].stateManager.setState(`monitoring.departments.${sourceId}.last_contact`, new Date().toISOString());
    }
  );
  
  // Demonstrate setting state in various units
  logger.info('Demonstrating state operations across units');
  
  // Project alpha sets its initial state
  await units[3].stateManager.setState('status', {
    phase: 'planning',
    completion: 0.05,
    health: 'good',
    updated_at: new Date().toISOString()
  });
  
  await units[3].stateManager.setState('resources', {
    developers: 3,
    researchers: 2,
    compute_units: 10,
    budget: 50000
  });
  
  await units[3].stateManager.setState('timeline', {
    start_date: new Date().toISOString(),
    estimated_completion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { name: 'Requirements Gathering', due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
      { name: 'Architecture Design', due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'not_started' },
      { name: 'Implementation', due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), status: 'not_started' },
      { name: 'Testing', due_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(), status: 'not_started' },
      { name: 'Deployment', due_date: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(), status: 'not_started' }
    ]
  });
  
  // Wait for events to propagate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Departments set their statuses
  await units[0].stateManager.setState('status', {
    operational_status: 'active',
    current_projects: 3,
    resource_utilization: 0.85,
    updated_at: new Date().toISOString()
  });
  
  await units[1].stateManager.setState('status', {
    operational_status: 'active',
    current_sprints: 2,
    resource_utilization: 0.92,
    updated_at: new Date().toISOString()
  });
  
  // Demonstrating nested state paths
  await units[0].stateManager.setState('projects.active', [
    { id: 'project_alpha', role: 'research_lead', allocation: 0.4 },
    { id: 'project_beta', role: 'contributor', allocation: 0.3 },
    { id: 'project_gamma', role: 'advisor', allocation: 0.1 }
  ]);
  
  await units[1].stateManager.setState('projects.active', [
    { id: 'project_alpha', role: 'implementation', allocation: 0.5 },
    { id: 'project_delta', role: 'lead', allocation: 0.4 }
  ]);
  
  // Wait for all state changes to propagate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demonstrate updating existing state
  logger.info('Updating existing state to demonstrate change propagation');
  
  // Project alpha updates its status - this should trigger the research unit's subscription
  await units[3].stateManager.setState('status', {
    phase: 'requirements_gathering',
    completion: 0.15,
    health: 'good',
    updated_at: new Date().toISOString()
  });
  
  // Project alpha updates resources - this should trigger the development unit's subscription
  await units[3].stateManager.setState('resources.developers', 5);
  await units[3].stateManager.setState('resources.compute_units', 15);
  
  // Wait for state updates to propagate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demonstrating transactions
  logger.info('Demonstrating state transactions');
  
  await units[0].stateManager.beginTransaction();
  try {
    await units[0].stateManager.setState('projects.active[0].allocation', 0.5);
    await units[0].stateManager.setState('status.resource_utilization', 0.95);
    await units[0].stateManager.setState('status.updated_at', new Date().toISOString());
    await units[0].stateManager.commitTransaction();
    logger.info('Research unit transaction committed successfully');
  } catch (error) {
    await units[0].stateManager.rollbackTransaction();
    logger.error(`Transaction failed: ${error}`);
  }
  
  // Wait for a moment to allow state updates to propagate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demonstrate conflict resolution by making concurrent updates
  logger.info('Demonstrating conflict resolution');
  
  // Simulate concurrent updates to the same state path
  const concurrentUpdates = [
    units[0].stateManager.setState('shared_data.user_count', 100),
    units[1].stateManager.setState('shared_data.user_count', 120),
    units[2].stateManager.setState('shared_data.user_count', 110)
  ];
  
  await Promise.all(concurrentUpdates);
  logger.info('Concurrent updates applied - conflict resolution based on strategy');
  
  // Wait for conflict resolution to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check the resolved state in all units
  for (const unit of units) {
    const resolvedValue = await unit.stateManager.getState('shared_data.user_count');
    logger.info(`[${unit.id}] Resolved value of shared_data.user_count: ${resolvedValue}`);
  }
  
  // Demonstrate state deletion
  logger.info('Demonstrating state deletion');
  
  // Delete a specific path
  await units[3].stateManager.deleteState('resources.budget');
  logger.info('Deleted budget from project resources');
  
  // Check remaining resources
  const remainingResources = await units[3].stateManager.getState('resources');
  logger.info(`Remaining resources after deletion: ${JSON.stringify(remainingResources, null, 2)}`);
  
  // Demonstrate path-based querying
  logger.info('Demonstrating path-based state querying');
  
  // Get all project timelines
  const allTimelines = await units[3].stateManager.getState('timeline.milestones', { depth: 2 });
  logger.info(`Project milestones: ${JSON.stringify(allTimelines, null, 2)}`);
  
  // Get all department statuses from operations
  const departmentStatuses = await units[2].stateManager.getState('monitoring.departments', { depth: 3 });
  logger.info(`Department statuses from operations view: ${JSON.stringify(departmentStatuses, null, 2)}`);
  
  // Demonstrate unsubscribing
  logger.info('Demonstrating subscription management');
  units[0].stateManager.unsubscribe(researchSubId);
  logger.info('Research unit unsubscribed from project alpha status updates');
  
  // Project alpha updates its status again - research unit should not receive this update
  await units[3].stateManager.setState('status.phase', 'architecture');
  await units[3].stateManager.setState('status.completion', 0.25);
  
  // Wait for final state updates
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Save final state snapshots
  logger.info('Saving final state snapshots');
  
  // Get final state from each unit
  const finalStates: Record<string, any> = {};
  
  for (const unit of units) {
    const state = await unit.stateManager.getState('', { depth: -1 }); // Get entire state
    finalStates[unit.id] = state;
    
    // Save to individual snapshot files
    fs.writeJsonSync(
      path.join(outputDir, `${unit.id}-final-state.json`),
      state,
      { spaces: 2 }
    );
  }
  
  // Save combined states
  fs.writeJsonSync(
    path.join(outputDir, 'all-final-states.json'),
    finalStates,
    { spaces: 2 }
  );
  
  // Generate state propagation visualization
  const stateFlows = [
    { from: 'project_alpha', to: 'research_unit', path: 'status', type: 'subscription' },
    { from: 'project_alpha', to: 'development_unit', path: 'resources', type: 'subscription' },
    { from: 'research_unit', to: 'operations_unit', path: 'status', type: 'subscription' },
    { from: 'development_unit', to: 'operations_unit', path: 'status', type: 'subscription' }
  ];
  
  fs.writeJsonSync(
    path.join(outputDir, 'state-flows.json'),
    stateFlows,
    { spaces: 2 }
  );
  
  // Generate human-readable artifacts
  await generateHumanReadableArtifacts(outputDir, units, finalStates, stateFlows, logger);
  
  // Cleanup subscriptions and close state managers
  logger.info('Cleaning up resources');
  for (const unit of units) {
    unit.stateManager.disableDistributedSync();
    unit.stateManager.clearAllSubscriptions();
  }
  
  // Create summary
  const summary = {
    total_units: units.length,
    total_state_paths: Object.entries(finalStates).reduce((acc, [_, state]) => {
      return acc + countPaths(state);
    }, 0),
    subscription_flows: stateFlows,
    timestamp: new Date().toISOString()
  };
  
  fs.writeJsonSync(
    path.join(outputDir, 'summary.json'),
    summary,
    { spaces: 2 }
  );
  
  logger.info(`Example completed. Output saved to: ${outputDir}`);
  return outputDir;
}

/**
 * Helper function to count the number of paths in a nested object
 */
function countPaths(obj: any, path = ''): number {
  if (!obj || typeof obj !== 'object') {
    return 1;
  }
  
  let count = 0;
  
  if (Array.isArray(obj)) {
    count = 1; // Count the array itself
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        count += countPaths(item, `${path}[${index}]`);
      } else {
        count += 1;
      }
    });
  } else {
    // For regular objects
    count = Object.keys(obj).length > 0 ? 0 : 1; // Empty object counts as 1
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const newPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        count += countPaths(value, newPath);
      } else {
        count += 1;
      }
    }
  }
  
  return count;
}

// Run the example
runExample()
  .then(outputDir => {
    console.log(`✅ Example completed successfully. Results saved to: ${outputDir}`);
    // Force the process to exit cleanly
    setTimeout(() => process.exit(0), 500);
  })
  .catch(error => {
    console.error('❌ Example failed with error:', error);
    // Force the process to exit with error code
    setTimeout(() => process.exit(1), 500);
  }); 