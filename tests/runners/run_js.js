#!/usr/bin/env node

/**
 * Unified Test Runner for JavaScript/TypeScript Tests
 * 
 * This script provides a single entry point for running all JavaScript/TypeScript tests,
 * with support for running with real LLM integration or mocks.
 * 
 * Usage:
 *   node tests/runners/run_js.js [options] [test-files]
 * 
 * Options:
 *   --test-type TYPE     Run tests of a specific type (unit, integration, system, all)
 *   --use-real-llm       Use real LLM integration instead of mocks
 *   --timeout MS         Set test timeout in milliseconds (default: 60000)
 *   --report             Generate and save test reports
 *   --help               Show this help message
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set default options
const DEFAULT_OPTIONS = {
  testType: 'all',
  useRealLLM: false,
  timeout: 60000,
  report: false
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };
  const testFiles = [];

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    
    if (arg === '--test-type' && i + 1 < args.length) {
      options.testType = args[i + 1];
      i += 2;
    } else if (arg === '--use-real-llm') {
      options.useRealLLM = true;
      i += 1;
    } else if (arg === '--timeout' && i + 1 < args.length) {
      options.timeout = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--report') {
      options.report = true;
      i += 1;
    } else if (arg === '--help') {
      showHelp();
      process.exit(0);
    } else {
      // Assume it's a test file or pattern
      testFiles.push(arg);
      i += 1;
    }
  }

  return { options, testFiles };
}

// Show help message
function showHelp() {
  console.log(`
Unified Test Runner for JavaScript/TypeScript Tests

Usage:
  node tests/runners/run_js.js [options] [test-files]

Options:
  --test-type TYPE     Run tests of a specific type (unit, integration, system, all)
  --use-real-llm       Use real LLM integration instead of mocks
  --timeout MS         Set test timeout in milliseconds (default: 60000)
  --report             Generate and save test reports
  --help               Show this help message
  `);
}

// Get test files based on test type
function getTestFiles(testType, specifiedFiles = []) {
  const rootDir = path.resolve(__dirname, '..');
  const testFiles = [];

  if (specifiedFiles.length > 0) {
    // Use explicitly specified files
    return specifiedFiles.map(file => {
      // If it's a relative path from the project root, make it absolute
      if (!path.isAbsolute(file)) {
        if (file.startsWith('tests/')) {
          return path.resolve(process.cwd(), file);
        }
        return path.resolve(rootDir, file);
      }
      return file;
    });
  }

  // Get test files based on test type
  const typeToDir = {
    'unit': path.join(rootDir, 'unit'),
    'integration': path.join(rootDir, 'integration'),
    'system': path.join(rootDir, 'system')
  };

  if (testType === 'all') {
    // Get all test files
    for (const dir of Object.values(typeToDir)) {
      testFiles.push(...findTestFiles(dir));
    }
  } else if (typeToDir[testType]) {
    // Get test files for specific type
    testFiles.push(...findTestFiles(typeToDir[testType]));
  } else {
    console.error(`Unknown test type: ${testType}`);
    process.exit(1);
  }

  return testFiles;
}

// Recursively find test files in a directory
function findTestFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath));
    } else if (isTestFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if a file is a test file
function isTestFile(filename) {
  return (
    (filename.endsWith('.test.ts') || 
     filename.endsWith('.test.js') || 
     filename.startsWith('test_') && (filename.endsWith('.ts') || filename.endsWith('.js')))
  );
}

// Run the mocha test command
async function runMochaTests(testFiles, options) {
  // Ensure we have test files
  if (testFiles.length === 0) {
    console.error('No test files found.');
    process.exit(1);
  }

  console.log(`🔍 Found ${testFiles.length} test files`);
  
  const mochaPath = path.join(process.cwd(), 'node_modules', '.bin', 'mocha');
  
  if (!fs.existsSync(mochaPath)) {
    console.error(`❌ Mocha not found at ${mochaPath}`);
    console.error('Please run: npm install --save-dev mocha @types/mocha ts-node chai @types/chai');
    process.exit(1);
  }
  
  // Build mocha arguments
  const mochaArgs = [
    '--require', 'ts-node/register',
    '--timeout', options.timeout.toString(),
  ];
  
  // Add reporter for reports
  if (options.report) {
    const reportsDir = path.join(process.cwd(), 'tests', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    mochaArgs.push('--reporter', 'mochawesome');
    mochaArgs.push('--reporter-options', `reportDir=${reportsDir},reportFilename=test-report-${Date.now()}`);
  }
  
  // Add test files
  mochaArgs.push(...testFiles);
  
  console.log(`\n🚀 Running tests with ${options.useRealLLM ? 'real LLM integration' : 'mock LLMs'}`);
  console.log(`Command: ${mochaPath} ${mochaArgs.join(' ')}\n`);
  
  // Set environment for the test process
  const env = {
    ...process.env,
    USE_REAL_LLM: options.useRealLLM ? 'true' : 'false',
    TS_NODE_PROJECT: path.join(process.cwd(), 'tests', 'config', 'tsconfig.json')
  };
  
  // Verify OpenAI API key is available if using real LLM
  if (options.useRealLLM && !process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not found in environment');
    console.warn('Tests with real LLM integration may fail');
  }
  
  // Run the tests
  return new Promise((resolve) => {
    const proc = spawn(mochaPath, mochaArgs, {
      stdio: 'inherit',
      env
    });
    
    proc.on('close', (code) => {
      resolve(code);
    });
  });
}

// Main function
async function main() {
  const { options, testFiles } = parseArgs();
  
  console.log('==================================');
  console.log('🧪 Unified JavaScript Test Runner');
  console.log('==================================');
  console.log(`Test type: ${options.testType}`);
  console.log(`Using real LLM: ${options.useRealLLM}`);
  console.log(`Timeout: ${options.timeout}ms`);
  console.log(`Generate reports: ${options.report}`);
  
  // Get test files based on options
  const filesToTest = getTestFiles(options.testType, testFiles);
  
  try {
    const exitCode = await runMochaTests(filesToTest, options);
    if (exitCode === 0) {
      console.log('\n✅ All tests passed successfully');
    } else {
      console.log(`\n❌ Tests failed with exit code ${exitCode}`);
    }
    process.exit(exitCode);
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 