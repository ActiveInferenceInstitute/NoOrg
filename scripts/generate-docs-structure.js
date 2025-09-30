#!/usr/bin/env node

/**
 * Documentation Structure Generator
 *
 * This script generates a comprehensive documentation structure
 * and ensures all components are properly documented.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const SRC_DIR = path.join(__dirname, '..', 'src');

// Generate documentation structure
function generateDocsStructure() {
  const structure = {
    overview: {
      title: 'NoOrg Multi-Agent Framework',
      description: 'A comprehensive framework for building resilient, scalable, and distributed multi-agent systems.',
      sections: [
        'README.md',
        'master-index.md',
        '000-home.md'
      ]
    },
    architecture: {
      title: 'Architecture Documentation',
      description: 'System architecture, design patterns, and technical specifications.',
      sections: [
        'architecture/system-architecture.md',
        'architecture/tag-hierarchy.md',
        'architecture/taxonomy-system.md'
      ]
    },
    agents: {
      title: 'Agent Framework',
      description: 'Agent implementations, coordination, and specialized capabilities.',
      sections: [
        'agents/multiagent-system.md',
        'agents/multiagent-coordination-system.md',
        'agents/multiagent-workflow-system.md',
        'agents/README.md'
      ]
    },
    core: {
      title: 'Core Systems',
      description: 'Core infrastructure components and services.',
      sections: [
        'core/index.md',
        'core/core-documentation.md',
        'core/getting-started.md'
      ]
    },
    integration: {
      title: 'Integration Patterns',
      description: 'Resilience patterns and integration mechanisms.',
      sections: [
        'core/integration/patterns/README.md'
      ]
    },
    development: {
      title: 'Development Guide',
      description: 'Development practices, standards, and guidelines.',
      sections: [
        'development/index.md',
        'development/contribution-guidelines.md',
        'development/development-standards.md',
        'development/api-standards.md'
      ]
    },
    operations: {
      title: 'Operations Guide',
      description: 'Deployment, monitoring, and operational procedures.',
      sections: [
        'operations/index.md',
        'operations/deployment-guide.md',
        'operations/monitoring-guidelines.md',
        'operations/maintenance-tasks.md'
      ]
    },
    testing: {
      title: 'Testing Strategy',
      description: 'Testing frameworks, strategies, and quality assurance.',
      sections: [
        'testing/index.md',
        'testing/testing-framework.md',
        'testing/testing-standards.md',
        'testing/performance-testing.md'
      ]
    },
    security: {
      title: 'Security Framework',
      description: 'Security policies, procedures, and implementation guidelines.',
      sections: [
        'security/index.md',
        'security/security-policies.md',
        'security/access-control.md',
        'security/incident-response.md'
      ]
    }
  };

  // Create documentation structure file
  const structurePath = path.join(DOCS_DIR, 'documentation-structure.json');
  fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));

  console.log('✅ Documentation structure generated:', structurePath);
}

// Generate component documentation index
function generateComponentIndex() {
  const components = {
    agents: [
      'AbstractAgent.ts',
      'ActiveInferencePOMDPAgent.ts',
      'AnalysisAgent.ts',
      'CreativeWritingAgent.ts',
      'CustomerSupportAgent.ts',
      'DataAnalysisAgent.ts',
      'DevelopmentAgent.ts',
      'FinalReviewAgent.ts',
      'FinanceAgent.ts',
      'HRAgent.ts',
      'LegalAgent.ts',
      'MarketingAgent.ts',
      'PlanningAgent.ts',
      'ResearchAgent.ts',
      'ReviewAgent.ts',
      'RevisionAgent.ts',
      'WritingAgent.ts'
    ],
    core: [
      'events/EventSystem.ts',
      'messaging/MessageSystem.ts',
      'monitoring/MonitoringSystem.ts',
      'storage/StorageSystem.ts',
      'multiagent/MultiAgentCoordinator.ts',
      'multiagent/AgentRegistry.ts',
      'multiagent/TaskManager.ts',
      'multiagent/SharedStateManager.ts',
      'multiagent/OpenAIClient.ts',
      'integration/patterns/index.ts'
    ],
    examples: [
      'basic_coordination.ts',
      'multi_agent_workflow.ts',
      'complex_research_workflow.ts',
      'organization-demo.ts',
      'strategic-risk-innovation-workflow.ts'
    ]
  };

  const indexPath = path.join(DOCS_DIR, 'component-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(components, null, 2));

  console.log('✅ Component index generated:', indexPath);
}

// Generate API documentation structure
function generateApiDocs() {
  const apiStructure = {
    agents: {
      title: 'Agent APIs',
      description: 'APIs for all agent implementations',
      endpoints: [
        '/agents/analysis',
        '/agents/creative-writing',
        '/agents/customer-support',
        '/agents/data-analysis',
        '/agents/development',
        '/agents/finance',
        '/agents/hr',
        '/agents/legal',
        '/agents/marketing',
        '/agents/planning',
        '/agents/research',
        '/agents/review',
        '/agents/writing'
      ]
    },
    core: {
      title: 'Core System APIs',
      description: 'APIs for core infrastructure components',
      endpoints: [
        '/core/events',
        '/core/messaging',
        '/core/monitoring',
        '/core/storage',
        '/core/multiagent/coordinator',
        '/core/multiagent/registry',
        '/core/multiagent/tasks',
        '/core/multiagent/state'
      ]
    },
    integration: {
      title: 'Integration APIs',
      description: 'APIs for integration patterns and external services',
      endpoints: [
        '/integration/patterns',
        '/integration/webhooks',
        '/integration/external-apis'
      ]
    }
  };

  const apiPath = path.join(DOCS_DIR, 'api-structure.json');
  fs.writeFileSync(apiPath, JSON.stringify(apiStructure, null, 2));

  console.log('✅ API structure generated:', apiPath);
}

// Check for missing documentation
function checkMissingDocs() {
  const missingDocs = [];

  // Check for missing agent documentation
  const agentsDir = path.join(SRC_DIR, 'agents');
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.ts') && !f.includes('types'));

  agentFiles.forEach(file => {
    const agentName = file.replace('.ts', '');
    const agentDocsDir = path.join(agentsDir, agentName);
    const agentsMdPath = path.join(agentDocsDir, 'AGENTS.md');

    if (!fs.existsSync(agentsMdPath)) {
      missingDocs.push(`Missing AGENTS.md for: ${agentName}`);
    }
  });

  // Check for missing core component documentation
  const coreDirs = ['events', 'messaging', 'monitoring', 'storage', 'multiagent'];
  coreDirs.forEach(dir => {
    const corePath = path.join(SRC_DIR, 'core', dir, 'README.md');
    if (!fs.existsSync(corePath)) {
      missingDocs.push(`Missing README.md for: core/${dir}`);
    }
  });

  if (missingDocs.length > 0) {
    console.log('⚠️  Missing documentation:');
    missingDocs.forEach(doc => console.log(`  - ${doc}`));
  } else {
    console.log('✅ All required documentation exists');
  }

  return missingDocs;
}

// Main execution
function main() {
  console.log('🚀 Generating documentation structure...');

  try {
    generateDocsStructure();
    generateComponentIndex();
    generateApiDocs();
    checkMissingDocs();

    console.log('✅ Documentation structure generation completed successfully');
  } catch (error) {
    console.error('❌ Error generating documentation structure:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateDocsStructure,
  generateComponentIndex,
  generateApiDocs,
  checkMissingDocs
};
