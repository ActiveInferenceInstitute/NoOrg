/**
 * Organizational Units Demo
 * 
 * This script demonstrates the creation of organizational units, their relationships,
 * and specialized agents with full LLM integration, executing a multi-agent simulation
 * based on the discovered organizational structure and saving outputs to a run-specific folder.
 * 
 * The implementation is in src/examples/organizationalUnitsDemo.js
 */

const dotenv = require('dotenv');
const { demonstrateOrganizationalUnits } = require('../src/examples/organizationalUnitsDemo');

// Load environment variables
dotenv.config();

/**
 * Run the organizational units demo with enhanced multi-agent capabilities
 */
async function main() {
  try {
    console.log("Starting Enhanced Organizational Units Demo...");
    
    // Configure the simulation 
    const options = {
      // Optionally override the default OpenAI API key from .env
      apiKey: process.env.OPENAI_API_KEY,
      
      // Simulation parameters
      simulationTopic: "Implementing a new cybersecurity framework for organizational AI systems",
      startWithUnits: ["Administration", "Operations"], // Units to start collaboration with
      initialTaskDescription: "Create an implementation plan for a new AI cybersecurity framework with focus on risk assessment, resource allocation, and department-specific requirements.",
      
      // Units to involve in the simulation
      targetUnits: ["Security", "Finance", "InformationTechnology", "Compliance", "RiskManagement"],
      
      // Workflow configuration
      workflow: {
        planningPhase: {
          lead: "Administration",
          collaborator: "Operations",
          outputType: "implementation_plan"
        },
        executionPhase: {
          coordinationUnit: "Operations",
          securityAssessment: "Security",
          budgetAllocation: "Finance",
          technicalImplementation: "InformationTechnology",
          complianceVerification: "Compliance",
          riskMonitoring: "RiskManagement"
        }
      },
      
      // Optional model configuration
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo" // Use the OPENAI_MODEL from .env if set
    };
    
    // Run the enhanced demo
    const result = await demonstrateOrganizationalUnits(options);
    
    console.log(`\nDemo completed successfully. Results saved to: ${result.outputDir}`);
    
    // Print overview if we have discovered units
    if (result.discoveredStructure && result.discoveredStructure.units) {
      console.log(`\nDiscovered Organization Overview:`);
      console.log(`- Total Units: ${result.discoveredStructure.units.length}`);
      console.log(`- Total Relationships: ${result.discoveredStructure.relationships ? result.discoveredStructure.relationships.length : 0}`);
      
      // Only print agent stats if they exist
      if (result.discoveredStructure.agents) {
        console.log(`- Total Agents: ${result.discoveredStructure.agents.length}`);
      }
    } else {
      console.log(`\nNo organizational structure discovered. Check the logs for more details.`);
    }
    
    // Print simulation statistics if available
    if (result.results && result.results.summary) { 
      const summary = result.results.summary;
      console.log(`\nSimulation Results:`);
      console.log(`- Status: ${summary.status || 'Unknown'}`);
      console.log(`- Duration: ${summary.durationMs ? (summary.durationMs / 1000).toFixed(2) + 's' : 'Unknown'}`);
      console.log(`- LLM Calls: ${summary.llmCalls || 0}`);
      console.log(`- Total Tasks: ${result.results.tasks?.length || 0}`); 
      
      // Print workflow summary if available
      if (result.results.workflow) { 
        console.log(`\nWorkflow Summary:`);
        console.log(`- Planning Phase: ${result.results.workflow.planningPhase?.status || 'N/A'}`);
        console.log(`- Execution Phase: ${result.results.workflow.executionPhase?.status || 'N/A'}`);
        console.log(`- Cross-unit Collaborations: ${result.results.workflow.collaborations?.length || 0}`);
      }
    }
    
    // Print any errors encountered
    if (result.error) {
      console.log(`\nEncountered an error during execution: ${result.error}`);
    }
    
  } catch (error) {
    console.error('Error running demonstration:', error);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  main();
} else {
  // Export for use in other modules
  module.exports = { demonstrateOrganizationalUnits };
} 