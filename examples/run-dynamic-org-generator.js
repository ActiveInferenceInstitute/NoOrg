/**
 * Dynamic Organization Generator Example Runner
 *
 * This script runs the Dynamic Organization Generator example which:
 * 1. Takes a natural language description of an organization
 * 2. Generates a structured organizational schema
 * 3. Visualizes the organization as an interactive chart
 * 4. Executes a task through the generated organization
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Log helper function
function log(message) {
  console.log(message);
}

// Run the example directly using ts-node
async function main() {
  try {
    log('='.repeat(80));
    log('Running Dynamic Organization Generator Example');
    log('='.repeat(80));
    
    // Run the example with ts-node and skip type checking
    const result = await new Promise((resolve, reject) => {
      // Using ts-node with --transpile-only to skip type checking
      const process = spawn('npx', ['ts-node', '--transpile-only', '../examples/10-dynamic-org-generator-example.ts'], {
        stdio: 'inherit'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
      
      process.on('error', (err) => {
        reject(err);
      });
    });
    
    log('\n' + '='.repeat(80));
    log('✅ Example completed successfully!');
    log('📁 Output saved to the output directory');
    log('='.repeat(80));
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 