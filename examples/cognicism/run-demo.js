#!/usr/bin/env node

/**
 * Simple Cognicism Demo Runner
 *
 * This script provides a quick way to run the Cognicism framework demo
 * without the interactive interface.
 */

const { runCognicismWorkflow } = require('./cognicism-workflow');

async function runQuickDemo() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Cognicism Framework Quick Demo                     ║
║         Running Complete Workflow Demonstration                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  try {
    console.log('🚀 Starting Cognicism workflow...');
    console.log('This will run the complete framework with all agents.\n');

    const startTime = Date.now();
    const context = await runCognicismWorkflow();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Demo Results Summary                        ║
╚════════════════════════════════════════════════════════════════╝

✅ Workflow completed successfully!

📊 Summary:
  • Total execution time: ${duration}s
  • Generated outputs: ${Object.keys(context.outputs).length}
  • Output directory: ${context.config.OUTPUT_DIR}

📋 Generated Components:
  • Climate Change FourThought exploration
  • AI Ethics FourThought exploration
  • Scientific Iris processing
  • Policy Iris processing
  • Knowledge ledger storage
  • Trust network visualization
  • Thought timeline visualization
  • Trust heatmap visualization
  • Integrated knowledge synthesis

🎯 Key Features Demonstrated:
  • Multi-agent coordination
  • Advanced trust mechanisms
  • Semantic knowledge storage
  • Interactive visualizations
  • Community consensus building
  • Temporal embeddings
  • Social proof integration

🔗 Next Steps:
  • Run 'node demo-interactive.js' for interactive exploration
  • Run 'python3 cognicism_visualizations.py --data-dir ${context.config.OUTPUT_DIR}/data' for advanced visualizations
  • Check the output directory for detailed results and logs

For more information, see the documentation in the /docs directory.
    `);

    // Show a sample of the results if available
    if (context.outputs.integrated_findings) {
      const findings = context.outputs.integrated_findings;
      if (findings.synthesis?.key_insights?.length > 0) {
        console.log('\n💡 Sample Key Insights:');
        findings.synthesis.key_insights.slice(0, 3).forEach((insight, i) => {
          console.log(`  ${i + 1}. ${insight}`);
        });
      }
    }

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('• OpenAI API key is set in environment variables');
    console.error('• All dependencies are installed (npm install)');
    console.error('• Node.js version is compatible');
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runQuickDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = { runQuickDemo };
