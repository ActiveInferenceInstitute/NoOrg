/**
 * Example: Using DataGenerationManager to Replace Hardcoded Data Generators
 * 
 * This file demonstrates how to use the DataGenerationManager to replace
 * hardcoded domain-specific data generators in the hybrid agent workflow example.
 */

import { DataGenerationManager } from './DataGenerationManager';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Create output directory
  const outputDir = path.join(__dirname, '../../output/data-generation-example-' + 
                               new Date().toISOString().replace(/:/g, '-'));
  fs.ensureDirSync(outputDir);
  console.log(`Created output directory: ${outputDir}`);
  
  // Example 1: Air quality monitoring context
  const airQualityContext = {
    DOMAIN: "Environmental monitoring",
    OBJECTIVE: "Develop a community air quality monitoring network with real-time alerts and data visualization",
    CONSTRAINTS: "Limited budget, must use existing infrastructure where possible",
    TARGET_USERS: "Community residents, local government officials, environmental researchers"
  };
  
  console.log("\n=== Air Quality Monitoring Example ===\n");
  await runWithContext(airQualityContext, outputDir);
  
  // Example 2: Ant neuroscience context (original hardcoded example)
  const antNeuroscienceContext = {
    DOMAIN: "Neuroscience and micro-robotics",
    OBJECTIVE: "Develop an automated micro-dissection system for precise ant brain extraction and analysis",
    CONSTRAINTS: "Must maintain cellular integrity, operate at microscale, and integrate with imaging systems",
    TARGET_USERS: "Ant behavior researchers, neurobiology labs, entomology institutes, and bio-engineering teams"
  };
  
  console.log("\n=== Ant Neuroscience Example ===\n");
  await runWithContext(antNeuroscienceContext, outputDir);
  
  // Example 3: A completely different domain
  const supplyChainContext = {
    DOMAIN: "Supply chain management",
    OBJECTIVE: "Create a blockchain-based tracking system for pharmaceutical supply chains",
    CONSTRAINTS: "Must comply with regulatory requirements and be accessible to all supply chain participants",
    TARGET_USERS: "Pharmaceutical manufacturers, distributors, retailers, regulators, and patients"
  };
  
  console.log("\n=== Supply Chain Example ===\n");
  await runWithContext(supplyChainContext, outputDir);
  
  console.log(`\nAll examples completed. Results saved to: ${outputDir}`);
}

/**
 * Run data generation examples with a specific context
 */
async function runWithContext(context: Record<string, string>, outputDir: string) {
  // Create a data generator with this context
  const dataGenerator = new DataGenerationManager(
    process.env.OPENAI_API_KEY || '',
    context,
    path.join(outputDir, context.DOMAIN.replace(/\s+/g, '-').toLowerCase())
  );
  
  // 1. Generate locations (replacement for generateLocations function)
  console.log(`Generating locations for ${context.DOMAIN}...`);
  const locations = await dataGenerator.generateLocations(5, { coverage: 'medium' });
  console.log(`Generated ${locations.length} locations:`);
  console.log(locations[0]); // Show one example location
  
  // 2. Generate domain-specific readings (replacement for generateNeuralData function)
  if (locations.length > 0) {
    console.log(`\nGenerating readings for location "${locations[0].name}"...`);
    const readings = await dataGenerator.generateDomainSpecificReadings(
      locations[0].name, 
      new Date().toISOString()
    );
    console.log('Generated readings:');
    console.log(readings);
  }
  
  // 3. Generate complete neural/sensor data
  console.log(`\nGenerating complete ${context.DOMAIN} data...`);
  const completeData = await dataGenerator.generateNeuralData(
    locations.map(loc => ({ name: loc.name, lat: loc.lat, lng: loc.lng }))
  );
  console.log('Complete data structure:');
  console.log(JSON.stringify(completeData, null, 2).substring(0, 500) + '...');
  
  // 4. Generate visualization configuration
  console.log(`\nGenerating visualization config for ${context.DOMAIN} data...`);
  const visConfig = await dataGenerator.generateVisualizationConfig(
    completeData,
    'chart'
  );
  console.log('Visualization config:');
  console.log(visConfig);
  
  // Save all results to files
  const contextDir = path.join(outputDir, context.DOMAIN.replace(/\s+/g, '-').toLowerCase());
  fs.ensureDirSync(contextDir);
  
  fs.writeFileSync(
    path.join(contextDir, 'locations.json'),
    JSON.stringify(locations, null, 2)
  );
  
  fs.writeFileSync(
    path.join(contextDir, 'complete-data.json'),
    JSON.stringify(completeData, null, 2)
  );
  
  fs.writeFileSync(
    path.join(contextDir, 'visualization-config.json'),
    JSON.stringify(visConfig, null, 2)
  );
  
  console.log(`Saved results to ${contextDir}`);
}

// Run the examples
main().catch(err => {
  console.error('Error running examples:', err);
  process.exit(1);
}); 