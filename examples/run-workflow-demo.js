/**
 * Run Strategic Innovation Workflow Demo
 * 
 * This script runs a strategic innovation workflow example,
 * using the modules from the src directory.
 */

const dotenv = require('dotenv');
const { demonstrateOrganizationalUnits } = require('../src/examples/organizationalUnitsDemo');

// Load environment variables
dotenv.config();

/**
 * Run the strategic innovation workflow demo
 */
async function runStrategicInnovationWorkflow() {
  console.log('Starting Strategic Innovation Workflow...');
  
  try {
    // Run the organizational units demo with specific parameters for the strategic innovation workflow
    const result = await demonstrateOrganizationalUnits({
      runId: `strategic-innovation-${new Date().toISOString().replace(/[:.]/g, '-')}`,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    });
    
    console.log('\n===== Workflow Completed Successfully =====');
    console.log(`Workflow ID: ${result.workflow.id}`);
    console.log(`Number of Units: ${result.units.length}`);
    console.log(`Number of Agents: ${result.agents.length}`);
    console.log(`Outputs saved to: ${result.outputDir}`);
    
    return result;
  } catch (error) {
    console.error('\n===== Workflow Error =====');
    console.error(`Error running workflow: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}

// Run directly or export
if (require.main === module) {
  runStrategicInnovationWorkflow()
    .then(() => console.log('Demo completed.'))
    .catch(err => console.error('Demo failed.'));
} else {
  module.exports = { runStrategicInnovationWorkflow };
} 