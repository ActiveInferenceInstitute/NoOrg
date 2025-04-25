// src/examples/run_organizational_planning.js
const path = require('path');
const fs = require('fs'); // Import fs for saving output
const { WorkflowCoordinator } = require('../core/multiagent/organizational/WorkflowCoordinator');
const UnitDiscovery = require('../core/multiagent/organizational/UnitDiscovery');
const { AgentManager } = require('../core/multiagent/organizational/AgentManager');
const { TaskManager } = require('../core/multiagent/organizational/TaskManager');
const { SharedStateManager } = require('../core/multiagent/organizational/SharedStateManager');
const { LLMClient } = require('../core/multiagent/organizational/LLMClient'); // Ensure this path is correct
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env from root

async function runPlanningWorkflow() {
    console.log("--- Starting Organizational Planning Workflow ---");

    // --- Configuration ---
    const unitsBasePath = path.resolve(__dirname, '../../units'); // Adjust if your units folder is elsewhere
    const workflowGoal = "Develop a strategic plan for launching the new 'AI Assistant Integration' product.";
    const initialPlanTitle = "AI Assistant Integration Product Launch Plan";
    const timestamp = new Date().toISOString().replace(/:/g, '-'); // Create a filesystem-safe timestamp
    const outputDir = path.resolve(__dirname, `../../output/planning_run_${timestamp}`); // Example output dir

    // Ensure output directory exists
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    } catch (err) {
      console.error(`Failed to create output directory ${outputDir}:`, err);
      // Decide if you want to stop execution if the directory can't be created
      // throw err; 
    }
    
    // --- Instantiate Core Components ---
    const logger = console; // Use console for logging, can be replaced with a more robust logger
    const llmClient = new LLMClient({ logger }); // Pass logger
    const unitDiscovery = new UnitDiscovery(unitsBasePath, { logger }); // Pass logger and corrected constructor args
    const agentManager = new AgentManager({ llmClient, logger }); // Pass LLM client and logger
    const taskManager = new TaskManager({ logger }); // Pass logger
    const sharedStateManager = new SharedStateManager({ initialPlanTitle, logger }); // Pass logger

    const workflowCoordinator = new WorkflowCoordinator({
        unitDiscovery,
        agentManager,
        taskManager,
        sharedStateManager,
        llmClient, // Pass LLM client to coordinator too (e.g., for meta-reasoning)
        logger, // Pass logger
    });

    // --- Define Workflow Steps (Example) ---
    const workflowConfig = {
        goal: workflowGoal,
        initialPlanTitle: initialPlanTitle,
        outputDir: outputDir, // Pass output dir for potential logging/saving
        steps: [
            { 
                taskId: 'task-market-analysis', 
                title: "Initial Market Analysis", // Add explicit titles for clarity
                description: "Conduct initial market analysis for the 'AI Assistant Integration' product. Identify target audience, key competitors, and market size.",
                assignedUnitName: "Marketing", 
                 model: "gpt-4o-mini", // Use a smaller/faster model for testing if needed
                 maxTokens: 1500,
                 temperature: 0.5, 
            },
            { 
                taskId: 'task-feature-def',
                title: "Product Feature Definition",
                description: "Define core features and technical requirements for the product based on market analysis.",
                assignedUnitName: "ProductManagement",
                dependencies: ['task-market-analysis'], 
                 model: "gpt-4o-mini",
                 maxTokens: 2000,
                 temperature: 0.6,
            },
            { 
                taskId: 'task-tech-feasibility',
                title: "Technical Feasibility Assessment",
                description: "Assess the technical feasibility of the defined features. Identify potential challenges and required resources.",
                assignedUnitName: "Development",
                dependencies: ['task-feature-def'],
                 model: "gpt-4o-mini",
                 temperature: 0.5,
            },
            { 
                taskId: 'task-launch-strategy',
                title: "Draft Launch Strategy",
                description: "Draft a high-level launch strategy including timeline, budget considerations, and key milestones, integrating previous findings.",
                assignedUnitName: "Strategy",
                dependencies: ['task-market-analysis', 'task-feature-def', 'task-tech-feasibility'],
                 model: "gpt-4o-mini",
                 maxTokens: 2500,
                 temperature: 0.7,
            },
        ]
    };

    try {
        logger.log("\n--- Initializing and Running Collaborative Planning ---");
        const finalPlan = await workflowCoordinator.runCollaborativePlanning(workflowConfig);

        logger.log("\n--- Workflow Completed Successfully ---");
        return { finalPlan, outputDir }; // Return plan and output dir

    } catch (error) {
        logger.error("\n--- Workflow Failed --- ");
        logger.error("Error during runPlanningWorkflow:", error); // Log the caught error
        // Decide if you want to re-throw or just return an error indicator
        // throw error; 
        return { error: error.message || 'Unknown error', outputDir }; 
    }
}

// --- Main Execution Block --- 
// Ensures the script runs the workflow when executed directly.
if (require.main === module) {
    runPlanningWorkflow()
        .then(result => {
            console.log("\n--- Main Execution Finished ---");
            if (result.finalPlan) {
                console.log("\nFinal Plan Document:");
                console.log("===================================");
                console.log(JSON.stringify(result.finalPlan, null, 2));
                console.log("===================================");
                
                // Save the final plan to the output directory
                try {
                  const planPath = path.join(result.outputDir, 'final_plan.json');
                  fs.writeFileSync(planPath, JSON.stringify(result.finalPlan, null, 2));
                  console.log(`✅ Final plan saved to: ${planPath}`);
                } catch (saveErr) {
                  console.error(`⚠️ Failed to save final plan:`, saveErr);
                }

            } else if (result.error) {
                console.error(`Workflow execution failed: ${result.error}`);
            }
        })
        .catch(err => {
            console.error("\n--- Unhandled Error in Main Execution ---");
            console.error(err);
            process.exit(1); // Exit with error code
        });
} else {
     // If required as a module, export the function
     module.exports = { runPlanningWorkflow }; 
} 