/**
 * Organizational Units Demo
 * 
 * This script demonstrates the use of organizational units for
 * creating multiagent compositions that mirror real organizational structures.
 */

import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from '../core/multiagent/AgentRegistry';
import { MultiAgentCoordinator } from '../core/multiagent/MultiAgentCoordinator';
import { TaskManager } from '../core/multiagent/TaskManager';
import { SharedStateManager } from '../core/multiagent/SharedStateManager';
import { DefaultOrganizationalStructureManager } from '../core/units/OrganizationalStructureManager';
import { DefaultOrganizationalCompositionManager } from '../core/units/OrganizationalCompositionManager';
import { UnitDeploymentManager } from '../core/units/UnitDeploymentManager';
import { OrganizationalUnit, UnitRelationship } from '../core/units/UnitInterface';

// Load environment variables
dotenv.config();

/**
 * Main demo function
 */
async function runOrganizationalDemo() {
  console.log('Starting Organizational Units Demo...');
  
  // Initialize the core components
  const agentRegistry = new AgentRegistry();
  const taskManager = new TaskManager();
  const sharedStateManager = SharedStateManager.getInstance();
  
  // Create the coordinator with the required components
  const coordinator = new MultiAgentCoordinator('OrganizationalDemo', {
    agentRegistry,
    taskManager,
    sharedStateManager
  });
  
  // Initialize the organizational managers
  const structureManager = new DefaultOrganizationalStructureManager();
  const compositionManager = new DefaultOrganizationalCompositionManager(structureManager);
  const deploymentManager = new UnitDeploymentManager(
    structureManager,
    compositionManager,
    agentRegistry,
    coordinator,
    taskManager
  );
  
  console.log('Creating organizational structure...');
  
  // Create a hierarchical organization
  const company = await createSampleOrganization(structureManager);
  
  // Display the created structure
  await displayOrganizationalStructure(structureManager, company.root.id);
  
  // Create a composition using the structure
  console.log('\nCreating a composition for a specific project...');
  const compositionId = await createProjectComposition(
    structureManager,
    compositionManager,
    company
  );
  
  // Get the composition
  const composition = await compositionManager.getComposition(compositionId);
  console.log(`Created composition: ${composition.name}`);
  console.log(`Units included: ${composition.units.length}`);
  
  // Deploy the composition
  console.log('\nDeploying the composition...');
  const deploymentId = await deploymentManager.deployComposition({
    compositionId,
    name: 'Project Alpha Deployment',
    description: 'Deployment of Project Alpha team',
    includeDefaultAgents: true,
    defaultAgentTypes: ['worker', 'coordinator']
  });
  
  // Get deployment status
  const deployment = await deploymentManager.getDeploymentStatus(deploymentId);
  console.log(`Deployment status: ${deployment.status}`);
  console.log(`Created agents: ${deployment.createdAgents.length}`);
  console.log(`Created tasks: ${deployment.createdTasks.length}`);
  
  // Display agent details
  console.log('\nCreated agents:');
  for (const agentId of deployment.createdAgents) {
    const agent = await agentRegistry.getAgent(agentId);
    if (agent) {
      const capabilitiesString = Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : 'No capabilities listed';
      console.log(`- ${agent.name} (${agent.type}): ${capabilitiesString}`);
    } else {
      console.log(`- Agent with ID ${agentId} not found.`);
    }
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Terminate the deployment
  console.log('\nTerminating deployment...');
  await deploymentManager.terminateDeployment(deploymentId);
  
  const finalDeployment = await deploymentManager.getDeploymentStatus(deploymentId);
  console.log(`Deployment status: ${finalDeployment.status}`);
  
  console.log('\nDemo completed!');
}

/**
 * Create a sample organizational structure
 */
async function createSampleOrganization(structureManager: DefaultOrganizationalStructureManager) {
  // Create root organization
  const companyId = await structureManager.createUnit({
    name: 'TechCorp Inc.',
    description: 'A technology company specializing in AI and automation',
    capabilities: [
      'strategic_planning',
      'resource_allocation'
    ]
  });
  
  // Create departments
  const engineeringId = await structureManager.createUnit({
    name: 'Engineering Department',
    description: 'Responsible for product development and technical solutions',
    capabilities: [
      'software_development',
      'system_architecture'
    ],
    parent: companyId
  });
  
  const productId = await structureManager.createUnit({
    name: 'Product Department',
    description: 'Responsible for product management and direction',
    capabilities: [
      'product_management',
      'user_experience'
    ],
    parent: companyId
  });
  
  const marketingId = await structureManager.createUnit({
    name: 'Marketing Department',
    description: 'Responsible for product marketing and communication',
    capabilities: [
      'market_analysis',
      'content_creation'
    ],
    parent: companyId
  });
  
  // Create teams within departments
  const frontendTeamId = await structureManager.createUnit({
    name: 'Frontend Team',
    description: 'Responsible for user interfaces and experience',
    capabilities: [
      'frontend_development',
      'ui_design'
    ],
    parent: engineeringId
  });
  
  const backendTeamId = await structureManager.createUnit({
    name: 'Backend Team',
    description: 'Responsible for server-side logic and databases',
    capabilities: [
      'backend_development',
      'database_management'
    ],
    parent: engineeringId
  });
  
  const aiTeamId = await structureManager.createUnit({
    name: 'AI Team',
    description: 'Responsible for AI and ML components',
    capabilities: [
      'machine_learning',
      'data_science'
    ],
    parent: engineeringId
  });
  
  const productManagementTeamId = await structureManager.createUnit({
    name: 'Product Management Team',
    description: 'Responsible for product roadmap and features',
    capabilities: [
      'product_roadmapping',
      'feature_prioritization'
    ],
    parent: productId
  });
  
  // Create relationships
  await structureManager.createUnitRelationship(
    frontendTeamId,
    productManagementTeamId,
    'collaboration',
    'Frontend team collaborates with product management on UI/UX decisions'
  );
  
  await structureManager.createUnitRelationship(
    backendTeamId,
    frontendTeamId,
    'service',
    'Backend team provides API services to the frontend team'
  );
  
  await structureManager.createUnitRelationship(
    aiTeamId,
    backendTeamId,
    'service',
    'AI team provides ML services to the backend team'
  );
  
  await structureManager.createUnitRelationship(
    marketingId,
    productId,
    'collaboration',
    'Marketing collaborates with product on messaging and positioning'
  );
  
  // Return the structure
  return {
    root: await structureManager.getUnit(companyId),
    departments: {
      engineering: await structureManager.getUnit(engineeringId),
      product: await structureManager.getUnit(productId),
      marketing: await structureManager.getUnit(marketingId)
    },
    teams: {
      frontend: await structureManager.getUnit(frontendTeamId),
      backend: await structureManager.getUnit(backendTeamId),
      ai: await structureManager.getUnit(aiTeamId),
      productManagement: await structureManager.getUnit(productManagementTeamId)
    }
  };
}

/**
 * Display the organizational structure
 */
async function displayOrganizationalStructure(
  structureManager: DefaultOrganizationalStructureManager,
  rootId: string,
  level = 0
) {
  const unit = await structureManager.getUnit(rootId);
  const indent = '  '.repeat(level);
  
  console.log(`${indent}- ${unit.name}: ${unit.description}`);
  if (unit.capabilities && unit.capabilities.length > 0) {
    // Check if capabilities is an array of strings
    const capabilitiesString = Array.isArray(unit.capabilities) ? unit.capabilities.join(', ') : 'Invalid capability format';
    console.log(`${indent}  Capabilities: ${capabilitiesString}`);
  }
  
  const relationships = await structureManager.getUnitRelationships(rootId);
  if (relationships.length > 0) {
    console.log(`${indent}└─ Relationships: ${relationships.length}`);
    for (const relationship of relationships) {
      const otherUnit = relationship.sourceUnitId === rootId
        ? await structureManager.getUnit(relationship.targetUnitId)
        : await structureManager.getUnit(relationship.sourceUnitId);
      
      console.log(`${indent}   └─ ${relationship.type} with ${otherUnit.name}`);
    }
  }
  
  const children = await structureManager.getChildUnits(rootId);
  for (const child of children) {
    await displayOrganizationalStructure(structureManager, child.id, level + 1);
  }
}

/**
 * Create a project composition
 */
async function createProjectComposition(
  structureManager: DefaultOrganizationalStructureManager,
  compositionManager: DefaultOrganizationalCompositionManager,
  company: any
) {
  // Create a composition for a specific project
  const compositionId = await compositionManager.createComposition(
    'Project Alpha',
    'A project to develop a new AI-powered product',
    [company.teams.ai.id, company.teams.frontend.id, company.teams.backend.id, company.teams.productManagement.id]
  );
  
  return compositionId;
}

// Run the demo
if (require.main === module) {
  runOrganizationalDemo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { runOrganizationalDemo }; 