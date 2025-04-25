/**
 * Example 2: Relationship Management System
 * 
 * This example demonstrates:
 * - Creating organizational units with different types
 * - Establishing relationships between units (hierarchical, peer, etc.)
 * - Setting up and checking permissions
 * - Querying relationships and units
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Import core modules
import { RelationshipManager, RelationshipType, PermissionLevel } from '../src/core/units/relationships/RelationshipManager';
import { EventSystem } from '../src/core/events/EventSystem';
import { StorageSystem } from '../src/core/storage/StorageSystem';

// Create a timestamp-based run folder for outputs
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputDir = path.join('output', `relationship-management-example-${timestamp}`);
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
    fs.writeFileSync(this.logFilePath, `=== Relationship Management Example Log - ${new Date().toISOString()} ===\n\n`);
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

/**
 * Generate human-readable artifacts from the relationship data
 */
async function generateHumanReadableArtifacts(
  outputDir: string, 
  units: any[], 
  relationships: any[], 
  summary: any,
  logger: Console
): Promise<void> {
  // Create a Markdown summary
  const unitsList = units.map(u => `- **${u.name}** (ID: \`${u.id}\`, Type: ${u.type})`).join('\n');
  
  const relTypeCount = Object.entries(summary.relationships_by_type)
    .map(([type, count]) => `- **${type}**: ${count} relationships`)
    .join('\n');
  
  const summaryMd = `# Relationship Management System Example

## Summary
- **Total Units**: ${summary.total_units}
- **Total Relationships**: ${summary.total_relationships}

## Organizational Units
${unitsList}

## Relationship Types
${relTypeCount}

## Key Demonstrated Features
1. Creating organizational units with different types
2. Establishing hierarchical, peer, and support relationships
3. Managing permissions between units
4. Dynamic modification of relationships

## Organizational Structure

### Hierarchical Structure
\`\`\`
Executive Committee
├── Research Division
│   ├── AI Team
│   └── Data Science Team
└── Development Division
    └── Platform Team
\`\`\`

### Support Relationships
Security Office provides services to:
- Research Division
- Development Division

Infrastructure Team provides services to:
- AI Team
- Platform Team

### Project Relationships
Project Alpha involves:
- AI Team
- Platform Team
- Security Office
- Data Science Team

## Permission Model
The example demonstrates a granular permission model with:
- Resource-specific permissions
- Multiple permission levels (READ, WRITE, ADMIN)
- Time-based access controls
- Conditional access rules

## Next Steps
- Implement role-based access control
- Add permission inheritance along hierarchical lines
- Create relationship visualization tools
`;

  fs.writeFileSync(path.join(outputDir, 'relationship-summary.md'), summaryMd);
  
  // Create a simple HTML visualization for relationship graph
  const nodes = units.map(unit => ({
    id: unit.id,
    label: unit.name,
    group: unit.type
  }));
  
  const edges = relationships.map(rel => ({
    from: rel.sourceUnitId,
    to: rel.targetUnitId,
    label: rel.type,
    arrows: 'to',
    dashes: rel.type === 'peer'
  }));
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Organizational Relationship Visualization</title>
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #network-container { width: 100%; height: 100vh; }
    .legend { position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border: 1px solid #ddd; }
    .legend-item { margin: 5px 0; }
    .legend-color { display: inline-block; width: 15px; height: 15px; margin-right: 5px; }
  </style>
</head>
<body>
  <div id="network-container"></div>
  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-item"><div class="legend-color" style="background-color: #97C2FC;"></div> Leadership</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FFFF00;"></div> Business Unit</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #7BE141;"></div> Team</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FFA807;"></div> Support</div>
    <div class="legend-item"><div class="legend-color" style="background-color: #6E6EFD;"></div> Project</div>
  </div>
  <script type="text/javascript">
    const container = document.getElementById('network-container');
    
    const data = {
      nodes: ${JSON.stringify(nodes)},
      edges: ${JSON.stringify(edges)}
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
        leadership: {
          color: { background: '#97C2FC', border: '#2B7CE9' }
        },
        business_unit: {
          color: { background: '#FFFF00', border: '#FFA500' }
        },
        team: {
          color: { background: '#7BE141', border: '#4C9A2A' }
        },
        support: {
          color: { background: '#FFA807', border: '#FF6500' }
        },
        project: {
          color: { background: '#6E6EFD', border: '#4949B6' }
        }
      },
      physics: {
        hierarchicalRepulsion: {
          nodeDistance: 150
        },
        solver: 'hierarchicalRepulsion'
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 150
        }
      }
    };
    
    new vis.Network(container, data, options);
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'relationship-visualization.html'), htmlContent);
  
  // Create a permissions overview table in Markdown
  const permissionsMd = `# Relationship Permissions Overview

## Permission Levels
- **READ**: Basic read access to a resource
- **WRITE**: Ability to modify a resource
- **ADMIN**: Full control over a resource including permission management

## Configured Permissions

| Source Unit | Target Unit | Relationship Type | Resource | Permission Level | Expiration |
|-------------|------------|-------------------|----------|------------------|------------|
${relationships
  .filter(rel => rel.permissions && rel.permissions.length > 0)
  .map(rel => {
    const sourceUnit = units.find(u => u.id === rel.sourceUnitId);
    const targetUnit = units.find(u => u.id === rel.targetUnitId);
    
    return rel.permissions.map((perm: any) => 
      `| ${sourceUnit?.name || rel.sourceUnitId} | ${targetUnit?.name || rel.targetUnitId} | ${rel.type} | ${perm.resource} | ${perm.level} | ${perm.conditions?.expiration || 'N/A'} |`
    ).join('\n');
  })
  .join('\n')}

## Permission Inheritance

The permission model demonstrated here supports:
- Direct resource permissions
- Relationship-based access control
- Conditional permissions based on time and context

`;

  fs.writeFileSync(path.join(outputDir, 'permissions-overview.md'), permissionsMd);
  
  logger.info('Generated human-readable artifacts (markdown and HTML visualizations)');
}

/**
 * Run the relationship management example
 */
async function runExample() {
  const logger = new FileLogger('relationship-management.log');
  logger.info('Starting Relationship Management Example');
  
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
  
  // Define some organizational units for our example
  const units = [
    { id: 'executive', name: 'Executive Committee', type: 'leadership' },
    { id: 'research', name: 'Research Division', type: 'business_unit' },
    { id: 'development', name: 'Development Division', type: 'business_unit' },
    { id: 'ai_team', name: 'AI Team', type: 'team' },
    { id: 'platform_team', name: 'Platform Team', type: 'team' },
    { id: 'security', name: 'Security Office', type: 'support' },
    { id: 'infrastructure', name: 'Infrastructure Team', type: 'support' },
    { id: 'project_alpha', name: 'Project Alpha', type: 'project' }
  ];
  
  // Initialize the relationship manager
  logger.info('Initializing relationship manager with units');
  const relationshipManager = RelationshipManager.getInstance(logger);
  relationshipManager.initializeWithUnits(units);
  
  // Create a visualization of the initial unit structure
  logger.info('Initial organizational units created');
  fs.writeJsonSync(
    path.join(outputDir, 'initial-units.json'),
    units,
    { spaces: 2 }
  );
  
  // 1. Creating hierarchical relationships
  logger.info('Creating hierarchical relationships');
  await relationshipManager.createRelationship({
    sourceUnitId: 'executive',
    targetUnitId: 'research',
    type: RelationshipType.HIERARCHY,
    metadata: { established: new Date().toISOString() }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'executive',
    targetUnitId: 'development',
    type: RelationshipType.HIERARCHY,
    metadata: { established: new Date().toISOString() }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'research',
    targetUnitId: 'ai_team',
    type: RelationshipType.HIERARCHY,
    metadata: { established: new Date().toISOString() }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'development',
    targetUnitId: 'platform_team',
    type: RelationshipType.HIERARCHY,
    metadata: { established: new Date().toISOString() }
  });
  
  // 2. Creating peer relationships
  logger.info('Creating peer relationships');
  await relationshipManager.createRelationship({
    sourceUnitId: 'ai_team',
    targetUnitId: 'platform_team',
    type: RelationshipType.PEER,
    metadata: { collaboration_level: 'high' }
  });
  
  // 3. Creating support relationships
  logger.info('Creating support relationships');
  await relationshipManager.createRelationship({
    sourceUnitId: 'security',
    targetUnitId: 'research',
    type: RelationshipType.SERVICE_PROVIDER,
    metadata: { domain: 'security_compliance' }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'security',
    targetUnitId: 'development',
    type: RelationshipType.SERVICE_PROVIDER,
    metadata: { domain: 'security_compliance' }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'infrastructure',
    targetUnitId: 'ai_team',
    type: RelationshipType.SERVICE_PROVIDER,
    metadata: { domain: 'compute_resources' }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'infrastructure',
    targetUnitId: 'platform_team',
    type: RelationshipType.SERVICE_PROVIDER,
    metadata: { domain: 'deployment' }
  });
  
  // 4. Creating project relationships
  logger.info('Creating project relationships');
  await relationshipManager.createRelationship({
    sourceUnitId: 'project_alpha',
    targetUnitId: 'ai_team',
    type: RelationshipType.CUSTOM,
    description: 'Project relationship',
    metadata: { role: 'core_development', allocation: 0.6 }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'project_alpha',
    targetUnitId: 'platform_team',
    type: RelationshipType.CUSTOM,
    description: 'Project relationship',
    metadata: { role: 'integration', allocation: 0.4 }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'project_alpha',
    targetUnitId: 'security',
    type: RelationshipType.CUSTOM,
    description: 'Project relationship',
    metadata: { role: 'advisor', allocation: 0.2 }
  });
  
  // Adding a new unit dynamically
  logger.info('Adding a new unit dynamically');
  const newUnit = { id: 'data_science', name: 'Data Science Team', type: 'team' };
  relationshipManager.addUnit(newUnit);
  
  // Create relationships for the new unit
  await relationshipManager.createRelationship({
    sourceUnitId: 'research',
    targetUnitId: 'data_science',
    type: RelationshipType.HIERARCHY,
    metadata: { established: new Date().toISOString() }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'data_science',
    targetUnitId: 'ai_team',
    type: RelationshipType.PEER,
    metadata: { collaboration_level: 'very_high' }
  });
  
  await relationshipManager.createRelationship({
    sourceUnitId: 'project_alpha',
    targetUnitId: 'data_science',
    type: RelationshipType.CUSTOM,
    description: 'Project relationship',
    metadata: { role: 'data_modeling', allocation: 0.5 }
  });
  
  // 5. Setting up resource permissions
  logger.info('Setting up resource permissions');
  
  // Set permissions for various relationships
  const aiTeamResourcePerms = [
    {
      resource: 'research_data',
      level: PermissionLevel.WRITE,
      conditions: {
        description: 'Access to research datasets',
        expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  const platformTeamResourcePerms = [
    {
      resource: 'research_data',
      level: PermissionLevel.READ,
      conditions: {
        description: 'Read-only access to research datasets',
        expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  const dataScienceResourcePerms = [
    {
      resource: 'research_data',
      level: PermissionLevel.ADMIN,
      conditions: {
        description: 'Administrator access to research datasets',
        expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  const executiveResourcePerms = [
    {
      resource: 'project_alpha_data',
      level: PermissionLevel.READ,
      conditions: {
        description: 'Read access to Project Alpha metrics and KPIs',
        expiration: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  const securityResourcePerms = [
    {
      resource: 'all_resources',
      level: PermissionLevel.ADMIN,
      conditions: {
        description: 'Security audit access',
        expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  // Get relationships to set permissions on
  const aiTeamRels = relationshipManager.findRelationshipsBySource('ai_team');
  if (aiTeamRels.length > 0) {
    relationshipManager.setPermissions(aiTeamRels[0].id, aiTeamResourcePerms);
  }
  
  const platformTeamRels = relationshipManager.findRelationshipsBySource('platform_team');
  if (platformTeamRels.length > 0) {
    relationshipManager.setPermissions(platformTeamRels[0].id, platformTeamResourcePerms);
  }
  
  const dataScienceRels = relationshipManager.findRelationshipsBySource('data_science');
  if (dataScienceRels.length > 0) {
    relationshipManager.setPermissions(dataScienceRels[0].id, dataScienceResourcePerms);
  }
  
  const executiveRels = relationshipManager.findRelationshipsBySource('executive');
  if (executiveRels.length > 0) {
    relationshipManager.setPermissions(executiveRels[0].id, executiveResourcePerms);
  }
  
  const securityRels = relationshipManager.findRelationshipsBySource('security');
  if (securityRels.length > 0) {
    relationshipManager.setPermissions(securityRels[0].id, securityResourcePerms);
  }
  
  // 6. Query relationships to demonstrate API capabilities
  logger.info('Querying relationships to demonstrate API capabilities');
  
  // Get hierarchical structure
  const execBoardChildren = relationshipManager.findHierarchyUnits('executive', 'down');
  logger.info('Executive hierarchical structure:');
  logger.info(JSON.stringify(execBoardChildren, null, 2));
  
  // Save to visualization file
  fs.writeJsonSync(
    path.join(outputDir, 'executive-structure.json'),
    execBoardChildren,
    { spaces: 2 }
  );
  
  // Get peer relationships for AI team
  const aiTeamPeers = relationshipManager.queryRelationships({
    sourceUnitId: 'ai_team',
    type: RelationshipType.PEER
  });
  logger.info('AI Team peer relationships:');
  logger.info(JSON.stringify(aiTeamPeers, null, 2));
  
  // Get units involved in Project Alpha
  const projectAlphaRels = relationshipManager.queryRelationships({
    sourceUnitId: 'project_alpha'
  });
  const projectAlphaUnits = projectAlphaRels.map(rel => 
    relationshipManager.getAllUnits().find(unit => unit.id === rel.targetUnitId)
  ).filter(Boolean);
  
  logger.info('Units involved in Project Alpha:');
  logger.info(JSON.stringify(projectAlphaUnits, null, 2));
  
  // Check permissions for resources
  const canAiTeamAccessResearchData = relationshipManager.hasPermission(
    'ai_team',
    'research',
    'research_data',
    PermissionLevel.WRITE
  );
  logger.info(`AI Team can write to research data: ${canAiTeamAccessResearchData}`);
  
  // Check if platform team can access research data
  const canPlatformAccessResearchData = relationshipManager.hasPermission(
    'platform_team',
    'research',
    'research_data',
    PermissionLevel.READ
  );
  logger.info(`Platform team can access research data: ${canPlatformAccessResearchData}`);
  
  // 7. Modify relationships to demonstrate dynamic updates
  logger.info('Modifying relationships to demonstrate dynamic updates');
  
  // Find and remove a relationship
  const securityResearchRels = relationshipManager.queryRelationships({
    sourceUnitId: 'security',
    targetUnitId: 'research'
  });
  
  if (securityResearchRels.length > 0) {
    relationshipManager.deleteRelationship(securityResearchRels[0].id);
    logger.info('Deleted security-research support relationship');
  }
  
  // Creating a new specialized relationship type
  await relationshipManager.createRelationship({
    sourceUnitId: 'security',
    targetUnitId: 'research',
    type: RelationshipType.ADVISOR,
    metadata: { domain: 'security_governance', priority: 'high' }
  });
  logger.info('Created new security-research advisory relationship');
  
  // Update a relationship's permissions
  const platformResearchRels = relationshipManager.queryRelationships({
    sourceUnitId: 'platform_team',
    targetUnitId: 'research'
  });
  
  if (platformResearchRels.length > 0) {
    relationshipManager.setPermissions(platformResearchRels[0].id, [
      {
        resource: 'research_data',
        level: PermissionLevel.WRITE,
        conditions: {
          description: 'Temporary write access for integration testing',
          expiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          approved_by: 'Research Director',
          ticket: 'INT-2023-456'
        }
      }
    ]);
    logger.info('Updated platform team permission for research data to WRITE');
  }
  
  // 8. Generate final relationship graph
  logger.info('Generating final relationship graph');
  
  // Get all units
  const allUnits = relationshipManager.getAllUnits();
  
  // Get all relationships
  const allRelationships = relationshipManager.getAllRelationships();
  
  // Create a visualization of the final state
  const finalState = {
    units: allUnits,
    relationships: allRelationships
  };
  
  fs.writeJsonSync(
    path.join(outputDir, 'final-state.json'),
    finalState,
    { spaces: 2 }
  );
  
  // Create a simplified graph visualization
  const graph = {
    nodes: allUnits.map(unit => ({
      id: unit.id,
      name: unit.name,
      type: unit.type
    })),
    edges: allRelationships.map(rel => ({
      source: rel.sourceUnitId,
      target: rel.targetUnitId,
      type: rel.type,
      metadata: rel.metadata
    }))
  };
  
  fs.writeJsonSync(
    path.join(outputDir, 'relationship-graph.json'),
    graph,
    { spaces: 2 }
  );
  
  // 9. Summarize results
  const summary = {
    total_units: allUnits.length,
    total_relationships: allRelationships.length,
    relationships_by_type: allRelationships.reduce((acc, rel) => {
      acc[rel.type as string] = (acc[rel.type as string] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  logger.info('Example summary:');
  logger.info(JSON.stringify(summary, null, 2));
  
  fs.writeJsonSync(
    path.join(outputDir, 'summary.json'),
    summary,
    { spaces: 2 }
  );
  
  // Generate human-readable artifacts
  await generateHumanReadableArtifacts(outputDir, allUnits, allRelationships, summary, logger);
  
  logger.info(`Example completed. Output saved to: ${outputDir}`);
  return outputDir;
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