/**
 * Run Examples Helper Script
 * 
 * This script runs all example files sequentially with proper error handling
 * and generates a unified report of results.
 */

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Example files to run
const examples = [
  './1-event-storage-example.ts',
  './2-relationship-management-example.ts',
  './3-state-management-example.ts',
  './4-workflow-engine-example.ts',
  './5-integrated-operations-example.ts',
  './6-openai-agent-example.ts',
  './7-multi-unit-llm-flow-example.ts',
  './8-hybrid-agent-workflow-example.ts',
  './9-active-inference-pomdp-example.ts'
];

// Create output directory
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const reportDir = path.join('../output', `run-report-${timestamp}`);
fs.ensureDirSync(reportDir);

// Create report file
const reportPath = path.join(reportDir, 'examples-report.md');
fs.writeFileSync(reportPath, `# Examples Run Report\n\n**Run Date:** ${new Date().toLocaleString()}\n\n`);

/**
 * Console colors helper
 */
const colors = {
  blue: text => `\x1b[34m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`
};

/**
 * Run a single example with detailed logging
 */
async function runExample(examplePath) {
  return new Promise((resolve) => {
    console.log(colors.blue(`\n=== Spawning: node --require ts-node/register ${examplePath} ===\n`));
    
    const startTime = Date.now();
    // Use node --require ts-node/register
    const childProcess = spawn('node', ['--require', 'ts-node/register', examplePath], { stdio: 'inherit' }); 
    
    let exitCode = null;
    let resolved = false;

    // Set a timeout to kill the process if it doesn't exit within 30 seconds
    const timeoutMs = 30000; // 30 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.error(colors.red(`\n[Runner] ERROR: Example ${examplePath} timed out after ${timeoutMs/1000} seconds. Forcibly terminating...\n`));
        
        // Try to kill gracefully first
        try {
          childProcess.kill('SIGTERM');
          
          // Set another shorter timeout for force kill if SIGTERM doesn't work
          setTimeout(() => {
            if (!resolved) {
              console.error(colors.red(`\n[Runner] ERROR: Process didn't respond to SIGTERM. Using SIGKILL...\n`));
              childProcess.kill('SIGKILL');
            }
          }, 3000); // Give it 3 more seconds to respond to SIGTERM
        } catch (killError) {
          console.error(colors.red(`[Runner] Error killing process: ${killError.message}`));
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        // Log and resolve with timeout status
        console.log(colors.red(`\n=== TIMEOUT: ${examplePath} (${duration}s) ===\n`));
        
        fs.appendFileSync(
          reportPath,
          `## ${path.basename(examplePath)}\n\n` +
          `- **Status:** TIMEOUT\n` +
          `- **Duration:** ${duration} seconds (force terminated)\n` +
          `- **Notes:** Process did not exit within ${timeoutMs/1000} seconds and was forcibly terminated.\n\n`
        );
        
        doResolve('TIMEOUT', -1, duration);
      }
    }, timeoutMs);

    const doResolve = (status, code, duration) => {
      if (resolved) return; // Prevent double resolution
      resolved = true;
      
      // Clear the timeout on resolution
      clearTimeout(timeout);
      
      console.log(colors.yellow(`[Runner] Resolved promise for ${examplePath}`));
      resolve({ path: examplePath, status, code, duration });
    }

    console.log(colors.yellow(`[Runner] Attaching listeners for ${examplePath}`));

    // Listener for spawn errors
    childProcess.on('error', (err) => {
      console.error(colors.red(`[Runner] Error spawning ${examplePath}: ${err.message}`));
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      fs.appendFileSync(
        reportPath,
        `## ${path.basename(examplePath)}\n\n` +
        `- **Status:** ERROR_SPAWNING\n` +
        `- **Error:** ${err.message}\n\n`
      );
      doResolve('ERROR_SPAWNING', -1, duration)
    });

    // Listener for disconnection (relevant if IPC is involved)
    childProcess.on('disconnect', () => {
      console.log(colors.yellow(`[Runner] Received 'disconnect' for ${examplePath}`));
    });

    // Listener for process exit
    childProcess.on('exit', (code, signal) => {
      exitCode = code;
      console.log(colors.yellow(`[Runner] Received 'exit' for ${examplePath} (Code: ${code}, Signal: ${signal})`));
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      const status = code === 0 ? 'SUCCESS' : 'FAILED';
      const statusColor = code === 0 ? colors.green : colors.red;
      
      console.log(statusColor(`\n=== ${status}: ${examplePath} (${duration}s) ===\n`));
      
      // Append to report
      fs.appendFileSync(
        reportPath,
        `## ${path.basename(examplePath)}\n\n` +
        `- **Status:** ${status}\n` +
        `- **Duration:** ${duration} seconds\n` +
        `- **Exit Code:** ${code}\n` +
        (signal ? `- **Signal:** ${signal}\n` : '') +
        `\n`
      );
      
      // Resolve based on exit event
      doResolve(status, code, duration);
    });

    // Listener for stream closure (might not fire with stdio:inherit, but good to have)
    childProcess.on('close', (code, signal) => {
      console.log(colors.yellow(`[Runner] Received 'close' for ${examplePath} (Code: ${code}, Signal: ${signal})`));
      // We resolve on 'exit', but log this just in case
      if (!resolved) {
         console.log(colors.yellow(`[Runner] 'close' received before 'exit' resolved for ${examplePath}`));
         // Optionally, could resolve here if 'exit' hasn't fired for some reason
      }
    });

  });
}

/**
 * Run all examples sequentially
 */
async function runAllExamples() {
  console.log(colors.yellow(`Starting examples run at ${new Date().toLocaleString()}`));
  console.log(colors.yellow(`Report will be generated at: ${reportPath}`));
  
  const results = [];
  
  for (const example of examples) {
    console.log(colors.yellow(`[Runner] Starting loop for ${example}`));
    try {
      const result = await runExample(example);
      results.push(result);
      console.log(colors.yellow(`[Runner] Finished await for ${example}, Status: ${result.status}`));
    } catch (error) {
      console.error(colors.red(`[Runner] Error in loop for ${example}:`), error);
      results.push({ path: example, status: 'ERROR_RUNNER', error: error.message });
      
      // Append error to report
      fs.appendFileSync(
        reportPath,
        `## ${path.basename(example)}\n\n` +
        `- **Status:** ERROR_RUNNER\n` +
        `- **Error:** ${error.message}\n\n`
      );
    }
  }
  
  // Generate summary
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status !== 'SUCCESS').length; // Count anything not SUCCESS as failed
  
  console.log(colors.yellow(`\n=== Run Complete ===`));
  console.log(colors.green(`✓ Successful: ${successful}`));
  console.log(colors.red(`✗ Failed: ${failed}`));
  console.log(colors.blue(`📊 Report: ${reportPath}`));
  
  // Add summary to report
  fs.appendFileSync(
    reportPath,
    `## Summary\n\n` +
    `- **Total Examples:** ${results.length}\n` +
    `- **Successful:** ${successful}\n` +
    `- **Failed:** ${failed}\n`
  );
  
  // Link output dirs (keep this part)
  fs.appendFileSync(reportPath, `\n## Output Directories\n\n`);
  
  const outputDirs = fs.readdirSync('../output')
    .filter(dir => dir.startsWith('run-') || 
                    dir.startsWith('event-') || 
                    dir.startsWith('relationship-') ||
                    dir.startsWith('state-') ||
                    dir.startsWith('workflow-') ||
                    dir.startsWith('integrated-'))
    .filter(dir => {
      try {
        const stats = fs.statSync(path.join('../output', dir));
        const dirDate = new Date(stats.mtime);
        const today = new Date();
        // Looser check: filter dirs modified within the last few hours 
        // to catch dirs created during potentially long runs
        return (today.getTime() - dirDate.getTime()) < (6 * 60 * 60 * 1000); // 6 hours
      } catch (statError) {
        console.warn(colors.yellow(`[Runner] Warning: Could not stat directory ${dir}: ${statError.message}`));
        return false; // Exclude directories we can't stat
      }
    })
    .sort((a, b) => {
      try {
        const statsA = fs.statSync(path.join('../output', a));
        const statsB = fs.statSync(path.join('../output', b));
        return statsB.mtime.getTime() - statsA.mtime.getTime();
      } catch (statError) {
        return 0; // Maintain order if stat fails during sort
      }
    });
    
  for (const dir of outputDirs) {
    fs.appendFileSync(reportPath, `- [${dir}](../output/${dir})\n`);
  }
}

// Run the examples
runAllExamples().catch(error => {
  console.error(colors.red('Fatal error in runAllExamples:'), error);
  process.exit(1);
}); 