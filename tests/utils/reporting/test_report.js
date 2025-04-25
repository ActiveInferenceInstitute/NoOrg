// Advanced test report generator for multiagent system
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = './src';
const TEST_DIR = './tests';
const REPORT_FILE = './test_report.md';

// Component relationships to analyze
const COMPONENT_RELATIONSHIPS = [
  { from: 'TaskManager', to: 'types' },
  { from: 'AgentRegistry', to: 'types' },
  { from: 'MultiAgentCoordinator', to: 'AgentRegistry' },
  { from: 'MultiAgentCoordinator', to: 'TaskManager' },
  { from: 'MultiAgentCoordinator', to: 'SharedStateManager' },
  { from: 'MultiAgentCoordinator', to: 'PromptManager' },
  { from: 'MultiAgentCoordinator', to: 'OpenAIClient' },
  { from: 'ResearchAgent', to: 'OpenAIClient' },
  { from: 'ResearchAgent', to: 'SharedStateManager' },
  { from: 'CreativeWritingAgent', to: 'OpenAIClient' },
  { from: 'CreativeWritingAgent', to: 'SharedStateManager' }
];

/**
 * Generate component statistics
 * @param {string} dir Directory to scan
 * @param {RegExp} pattern File pattern to match
 * @returns {Object} Component statistics
 */
function getComponentStats(dir, pattern) {
  const components = {};
  
  function scanDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else if (stats.isFile() && pattern.test(file)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const componentName = path.basename(file, path.extname(file));
        const lineCount = content.split('\n').length;
        const classMatch = content.match(/class\s+(\w+)/g);
        const classes = classMatch ? classMatch.map(c => c.replace('class ', '')) : [];
        const methodMatch = content.match(/\s+(async\s+)?(\w+)\s*\([^)]*\)\s*:\s*\w+/g);
        const methods = methodMatch ? methodMatch.map(m => m.trim().replace(/async\s+/, '').split('(')[0]) : [];
        
        components[componentName] = {
          path: filePath.replace('./', ''),
          lineCount,
          classes,
          methodCount: methods.length,
          methods
        };
      }
    });
  }
  
  scanDirectory(dir);
  return components;
}

/**
 * Get test coverage data
 * @param {Object} components Source components
 * @param {Object} testComponents Test components
 * @returns {Object} Test coverage data
 */
function getTestCoverage(components, testComponents) {
  const coverage = {};
  
  Object.keys(components).forEach(component => {
    const testComponent = `test_${component.toLowerCase()}`;
    coverage[component] = {
      hasTests: Object.keys(testComponents).some(tc => tc.toLowerCase() === testComponent),
      testedMethods: []
    };
    
    if (coverage[component].hasTests) {
      const testContent = fs.readFileSync(testComponents[testComponent].path, 'utf8');
      
      components[component].methods.forEach(method => {
        if (testContent.includes(method)) {
          coverage[component].testedMethods.push(method);
        }
      });
      
      coverage[component].testCoverage = components[component].methods.length > 0 
        ? (coverage[component].testedMethods.length / components[component].methods.length) * 100
        : 0;
    } else {
      coverage[component].testCoverage = 0;
    }
  });
  
  return coverage;
}

/**
 * Generate relationship data
 * @param {Object} components Source components
 * @returns {Array} Component relationships
 */
function getRelationships(components) {
  const relationships = [];
  
  COMPONENT_RELATIONSHIPS.forEach(relation => {
    if (components[relation.from] && components[relation.to]) {
      const content = fs.readFileSync(components[relation.from].path, 'utf8');
      const hasRelationship = content.includes(`from './${relation.to}'`) || 
                             content.includes(`from '${relation.to}'`) ||
                             content.includes(`from '../core/multiagent/${relation.to}'`) ||
                             content.includes(`from '../../core/multiagent/${relation.to}'`);
      
      relationships.push({
        from: relation.from,
        to: relation.to,
        exists: hasRelationship
      });
    }
  });
  
  return relationships;
}

/**
 * Generate test report
 */
function generateTestReport() {
  console.log('Generating test report...');
  
  // Get component statistics
  const sourceComponents = getComponentStats(SOURCE_DIR, /\.ts$/);
  const testComponents = getComponentStats(TEST_DIR, /test_.*\.ts$/);
  
  // Get test coverage data
  const coverage = getTestCoverage(sourceComponents, testComponents);
  
  // Get relationship data
  const relationships = getRelationships(sourceComponents);
  
  // Generate report
  let report = `# MultiAgent System Test Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Source components
  report += `## Source Components\n\n`;
  report += `| Component | Lines | Classes | Methods | Path |\n`;
  report += `|-----------|-------|---------|---------|------|\n`;
  
  Object.keys(sourceComponents).sort().forEach(component => {
    const stats = sourceComponents[component];
    report += `| ${component} | ${stats.lineCount} | ${stats.classes.join(', ')} | ${stats.methodCount} | ${stats.path} |\n`;
  });
  
  // Test components
  report += `\n## Test Components\n\n`;
  report += `| Component | Lines | Test Targets | Path |\n`;
  report += `|-----------|-------|-------------|------|\n`;
  
  Object.keys(testComponents).sort().forEach(component => {
    const stats = testComponents[component];
    const targets = component.replace('test_', '');
    report += `| ${component} | ${stats.lineCount} | ${targets} | ${stats.path} |\n`;
  });
  
  // Test coverage
  report += `\n## Test Coverage\n\n`;
  report += `| Component | Has Tests | Methods Tested | Coverage % |\n`;
  report += `|-----------|-----------|---------------|------------|\n`;
  
  Object.keys(coverage).sort().forEach(component => {
    const stats = coverage[component];
    report += `| ${component} | ${stats.hasTests ? 'Yes' : 'No'} | ${stats.testedMethods.length}/${sourceComponents[component].methods.length} | ${stats.testCoverage.toFixed(2)}% |\n`;
  });
  
  // Relationships
  report += `\n## Component Relationships\n\n`;
  report += `| From | To | Relationship |\n`;
  report += `|------|----|--------------|\n`;
  
  relationships.forEach(relation => {
    report += `| ${relation.from} | ${relation.to} | ${relation.exists ? '✅' : '❌'} |\n`;
  });
  
  // Overall summary
  const totalComponents = Object.keys(sourceComponents).length;
  const componentsTested = Object.values(coverage).filter(c => c.hasTests).length;
  const overallCoverage = Object.values(coverage).reduce((sum, c) => sum + c.testCoverage, 0) / totalComponents;
  
  report += `\n## Summary\n\n`;
  report += `- **Total Components**: ${totalComponents}\n`;
  report += `- **Components With Tests**: ${componentsTested} (${((componentsTested / totalComponents) * 100).toFixed(2)}%)\n`;
  report += `- **Overall Method Coverage**: ${overallCoverage.toFixed(2)}%\n`;
  report += `- **Total Source Lines**: ${Object.values(sourceComponents).reduce((sum, c) => sum + c.lineCount, 0)}\n`;
  report += `- **Total Test Lines**: ${Object.values(testComponents).reduce((sum, c) => sum + c.lineCount, 0)}\n`;
  
  // Write report to file
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Test report generated at ${REPORT_FILE}`);
}

// Run the report generator
generateTestReport(); 