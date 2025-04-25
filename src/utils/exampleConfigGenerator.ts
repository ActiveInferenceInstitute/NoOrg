/**
 * Example: Using ProjectConfigGenerator to replace hardcoded configs
 * 
 * This demonstrates how to use the ProjectConfigGenerator to dynamically
 * create appropriate project configurations for any domain.
 */

import { ProjectConfigGenerator } from './ProjectConfigGenerator';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Make sure we have an API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  // Create output directory
  const outputDir = path.join(__dirname, '../../output/config-generation-example-' + 
                               new Date().toISOString().replace(/:/g, '-'));
  fs.ensureDirSync(outputDir);
  console.log(`Created output directory: ${outputDir}`);
  
  // Get the configuration generator
  const configGenerator = ProjectConfigGenerator.getInstance(apiKey);
  
  // Generate configurations for different domains
  const domains = [
    'Environmental Monitoring',
    'Neuroscience and Micro-robotics',
    'Blockchain Technology',
    'Digital Healthcare',
    'Machine Learning Operations'
  ];
  
  // Process each domain
  console.log('Generating configurations for multiple domains...\n');
  
  for (const domain of domains) {
    console.log(`\n=== ${domain} ===`);
    
    // Generate configuration just from the domain
    const autoConfig = await configGenerator.generateConfig(domain);
    console.log('Auto-generated configuration:');
    console.log(JSON.stringify(autoConfig, null, 2));
    
    // Save to file
    const fileName = domain.toLowerCase().replace(/\s+/g, '-') + '.json';
    fs.writeFileSync(
      path.join(outputDir, fileName),
      JSON.stringify(autoConfig, null, 2)
    );
  }
  
  // Example of using the config with a custom objective
  console.log('\n=== Custom Objective Example ===');
  const customConfig = await configGenerator.generateConfig(
    'Smart Agriculture',
    'Develop a drone-based crop monitoring system for precision farming',
    {
      constraints: 'Must operate in rural areas with limited connectivity, be weather-resistant, and have 8+ hour battery life',
      targetUsers: 'Farmers, agricultural cooperatives, agronomists, and agricultural technology providers'
    }
  );
  
  console.log('Custom configuration:');
  console.log(JSON.stringify(customConfig, null, 2));
  
  fs.writeFileSync(
    path.join(outputDir, 'smart-agriculture-custom.json'),
    JSON.stringify(customConfig, null, 2)
  );
  
  console.log(`\nAll configurations saved to: ${outputDir}`);
  
  // Example of how this would be used in the workflow example
  console.log('\n=== Integration Example ===');
  console.log('Here\'s how you would integrate this in the workflow example:');
  
  const exampleCode = `
// In examples/8-hybrid-agent-workflow-example.ts

import { ProjectConfigGenerator } from '../src/utils/ProjectConfigGenerator';
import { DataGenerationManager } from '../src/utils/DataGenerationManager';

async function runHybridAgentWorkflow(options = {}) {
  // Create run-specific output folder
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const runId = \`hybrid-agent-workflow-\${timestamp}\`;
  const outputDir = path.join('output', runId);
  
  // Get API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  // Generate dynamic project configuration based on domain
  // Instead of hardcoded config for ant brain extraction
  const configGenerator = ProjectConfigGenerator.getInstance(apiKey);
  const PROJECT_CONFIG = await configGenerator.generateConfig(
    options.domain || process.env.PROJECT_DOMAIN || "Neuroscience and micro-robotics",
    options.objective || process.env.PROJECT_OBJECTIVE
  );
  
  // Initialize the data generator with this configuration
  const dataGenerator = new DataGenerationManager(
    apiKey,
    PROJECT_CONFIG,
    outputDir
  );
  
  // Now the workflow can use dataGenerator instead of hardcoded functions
  // Example:
  // const locations = await dataGenerator.generateLocations(10);
  // const neuralData = await dataGenerator.generateNeuralData(locations);
  
  // ... rest of workflow implementation
}
  `;
  
  console.log(exampleCode);
  
  // Also save this example
  fs.writeFileSync(
    path.join(outputDir, 'integration-example.ts'),
    exampleCode
  );
}

// Run the example
main().catch(err => {
  console.error('Error running config generator example:', err);
  process.exit(1);
}); 