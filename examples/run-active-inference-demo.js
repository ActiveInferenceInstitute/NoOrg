/**
 * Run Active Inference POMDP Demo
 * 
 * This script runs the Active Inference POMDP example (Example 9),
 * which demonstrates a story-based temperature prediction workflow
 * using Active Inference with POMDP.
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

/**
 * Run the Active Inference POMDP example
 */
async function runActiveInferencePOMDPDemo() {
  console.log('Starting Active Inference POMDP Demo...');
  
  return new Promise((resolve, reject) => {
    // Use ts-node to run the TypeScript example
    const process = spawn('npx', ['ts-node', path.join(__dirname, '9-active-inference-pomdp-example.ts')], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log('Demo completed successfully.');
        resolve();
      } else {
        console.error(`Demo failed with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error('Failed to start demo process:', err);
      reject(err);
    });
  });
}

// Run directly or export
if (require.main === module) {
  runActiveInferencePOMDPDemo()
    .catch(err => {
      console.error('Demo error:', err);
      process.exit(1);
    });
} else {
  module.exports = { runActiveInferencePOMDPDemo };
} 