#!/usr/bin/env node

/**
 * Performance Optimization Script
 *
 * This script analyzes the codebase for performance issues and provides
 * optimization recommendations for the NoOrg multi-agent framework.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');

class PerformanceAnalyzer {
  constructor() {
    this.issues = [];
    this.optimizations = [];
    this.metrics = {};
  }

  analyzeCodebase() {
    console.log('🔍 Analyzing codebase for performance issues...\n');

    this.checkBundleSize();
    this.analyzeImportStatements();
    this.checkAsyncOperations();
    this.analyzeMemoryUsage();
    this.checkCachingStrategies();
    this.analyzeNetworkOperations();

    this.generateRecommendations();
    this.printReport();
  }

  checkBundleSize() {
    try {
      const stats = fs.statSync(path.join(DIST_DIR, 'index.js'));
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      this.metrics.bundleSize = `${sizeInMB}MB`;

      if (stats.size > 10 * 1024 * 1024) { // 10MB
        this.issues.push({
          type: 'bundle-size',
          severity: 'high',
          message: `Bundle size is ${sizeInMB}MB, which may impact load times`,
          suggestion: 'Consider code splitting, tree shaking, or lazy loading'
        });
      } else if (stats.size > 5 * 1024 * 1024) { // 5MB
        this.issues.push({
          type: 'bundle-size',
          severity: 'medium',
          message: `Bundle size is ${sizeInMB}MB, consider optimization`,
          suggestion: 'Review import statements and remove unused dependencies'
        });
      }
    } catch (error) {
      this.issues.push({
        type: 'bundle-analysis',
        severity: 'low',
        message: 'Could not analyze bundle size - build may not exist',
        suggestion: 'Run `npm run build` first'
      });
    }
  }

  analyzeImportStatements() {
    const files = this.getAllTsFiles();
    let totalImports = 0;
    let dynamicImports = 0;
    let circularImports = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = content.match(/import\s+.*from\s+['"](.+?)['"]/g) || [];

        totalImports += imports.length;

        // Check for dynamic imports
        const dynamicImportMatches = content.match(/import\(['"`](.+?)['"`]\)/g);
        dynamicImports += dynamicImportMatches ? dynamicImportMatches.length : 0;

        // Check for potential circular imports (basic heuristic)
        imports.forEach(imp => {
          const importPath = imp.match(/from\s+['"](.+?)['"]/)?.[1];
          if (importPath && file.includes(importPath.replace('./', '').replace('../', ''))) {
            circularImports++;
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.metrics.totalImports = totalImports;
    this.metrics.dynamicImports = dynamicImports;

    if (circularImports > 0) {
      this.issues.push({
        type: 'circular-imports',
        severity: 'high',
        message: `Detected ${circularImports} potential circular import(s)`,
        suggestion: 'Review import chains and use dependency injection where needed'
      });
    }

    if (totalImports > 1000) {
      this.optimizations.push({
        type: 'import-optimization',
        message: `Found ${totalImports} imports - consider import optimization`,
        suggestion: 'Use dynamic imports for non-critical modules'
      });
    }

    if (dynamicImports === 0) {
      this.optimizations.push({
        type: 'code-splitting',
        message: 'No dynamic imports detected',
        suggestion: 'Consider code splitting for better performance'
      });
    }
  }

  checkAsyncOperations() {
    const files = this.getAllTsFiles();
    let asyncFunctions = 0;
    let awaitInLoop = 0;
    let unhandledPromises = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count async functions
        const asyncMatches = content.match(/async\s+function|async\s+\w+\s*\(|async\s*\w+\s*\(/g);
        asyncFunctions += asyncMatches ? asyncMatches.length : 0;

        // Check for await in loops (potential performance issue)
        const awaitInLoopMatches = content.match(/for\s*\(.*?\).*?await|while\s*\(.*?\).*?await/g);
        awaitInLoop += awaitInLoopMatches ? awaitInLoopMatches.length : 0;

        // Check for unhandled promises
        const promiseMatches = content.match(/\w+\([^)]*\)\s*(?![.(]|await|return)/g);
        if (promiseMatches) {
          promiseMatches.forEach(match => {
            if (match.includes('Promise') || match.includes('async')) {
              unhandledPromises++;
            }
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.metrics.asyncFunctions = asyncFunctions;
    this.metrics.awaitInLoop = awaitInLoop;

    if (awaitInLoop > 0) {
      this.issues.push({
        type: 'async-performance',
        severity: 'medium',
        message: `Found ${awaitInLoop} potential await in loop patterns`,
        suggestion: 'Consider Promise.all() for parallel operations'
      });
    }

    if (unhandledPromises > 0) {
      this.issues.push({
        type: 'unhandled-promises',
        severity: 'high',
        message: `Found ${unhandledPromises} potentially unhandled promises`,
        suggestion: 'Ensure all promises are properly handled with .catch() or async/await'
      });
    }
  }

  analyzeMemoryUsage() {
    const files = this.getAllTsFiles();
    let largeObjects = 0;
    let memoryLeaks = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for large object creation
        const largeObjectMatches = content.match(/new\s+\w+\([^}]{200,}/g);
        largeObjects += largeObjectMatches ? largeObjectMatches.length : 0;

        // Check for potential memory leaks
        const setIntervalMatches = content.match(/setInterval\s*\(/g);
        const setTimeoutMatches = content.match(/setTimeout\s*\(/g);
        const eventListenerMatches = content.match(/addEventListener\s*\(/g);

        if (setIntervalMatches && setIntervalMatches.length > 5) {
          memoryLeaks++;
        }
        if (setTimeoutMatches && setTimeoutMatches.length > 10) {
          memoryLeaks++;
        }
        if (eventListenerMatches && eventListenerMatches.length > 20) {
          memoryLeaks++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.metrics.largeObjects = largeObjects;

    if (memoryLeaks > 0) {
      this.issues.push({
        type: 'memory-leaks',
        severity: 'high',
        message: `Detected ${memoryLeaks} potential memory leak patterns`,
        suggestion: 'Ensure proper cleanup of timers and event listeners'
      });
    }

    if (largeObjects > 0) {
      this.optimizations.push({
        type: 'object-optimization',
        message: `Found ${largeObjects} large object creations`,
        suggestion: 'Consider object pooling or lazy initialization'
      });
    }
  }

  checkCachingStrategies() {
    const files = this.getAllTsFiles();
    let cacheUsage = 0;
    let cacheMisses = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for caching patterns
        const cacheMatches = content.match(/cache|Cache|memoize|Memoize/g);
        cacheUsage += cacheMatches ? cacheMatches.length : 0;

        // Check for potential cache misses
        const fetchMatches = content.match(/fetch\(|axios\.|request\(/g);
        if (fetchMatches && fetchMatches.length > 5) {
          cacheMisses++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.metrics.cacheUsage = cacheUsage;

    if (cacheMisses > 0 && cacheUsage === 0) {
      this.optimizations.push({
        type: 'caching-strategy',
        message: `Found ${cacheMisses} network requests without caching`,
        suggestion: 'Implement caching strategies for frequently accessed data'
      });
    }
  }

  analyzeNetworkOperations() {
    const files = this.getAllTsFiles();
    let networkCalls = 0;
    let sequentialNetworkCalls = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count network operations
        const networkMatches = content.match(/fetch\(|axios\.|request\(|http\.|https\./g);
        networkCalls += networkMatches ? networkMatches.length : 0;

        // Check for sequential network calls
        const sequentialPatterns = content.match(/await.*\n\s*await/g);
        sequentialNetworkCalls += sequentialPatterns ? sequentialPatterns.length : 0;
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.metrics.networkCalls = networkCalls;

    if (sequentialNetworkCalls > 0) {
      this.issues.push({
        type: 'network-optimization',
        severity: 'medium',
        message: `Found ${sequentialNetworkCalls} sequential network call patterns`,
        suggestion: 'Use Promise.all() for parallel network requests'
      });
    }

    if (networkCalls > 50) {
      this.optimizations.push({
        type: 'network-optimization',
        message: `Found ${networkCalls} network operations`,
        suggestion: 'Consider implementing request batching or connection pooling'
      });
    }
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.issues.length > 5) {
      recommendations.push({
        type: 'overall-optimization',
        priority: 'high',
        message: 'Multiple performance issues detected',
        action: 'Address high-severity issues first, then medium-severity'
      });
    }

    if (this.optimizations.length > 10) {
      recommendations.push({
        type: 'optimization-strategy',
        priority: 'medium',
        message: 'Many optimization opportunities available',
        action: 'Implement suggested optimizations incrementally'
      });
    }

    if (this.metrics.bundleSize && parseFloat(this.metrics.bundleSize) > 5) {
      recommendations.push({
        type: 'bundle-optimization',
        priority: 'high',
        message: 'Large bundle size detected',
        action: 'Implement code splitting and tree shaking'
      });
    }

    this.optimizations.push(...recommendations);
  }

  printReport() {
    console.log('\n📊 Performance Analysis Report');
    console.log('==============================\n');

    console.log('📈 Metrics:');
    Object.entries(this.metrics).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n🚨 Issues Found:');
    if (this.issues.length === 0) {
      console.log('  ✅ No critical issues detected');
    } else {
      this.issues.forEach((issue, index) => {
        const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵';
        console.log(`  ${severity} ${index + 1}. ${issue.message}`);
        console.log(`     💡 ${issue.suggestion}`);
      });
    }

    console.log('\n💡 Optimization Recommendations:');
    if (this.optimizations.length === 0) {
      console.log('  ✅ No optimization recommendations');
    } else {
      this.optimizations.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt.message}`);
        console.log(`     💡 ${opt.suggestion}`);
      });
    }

    console.log('\n🎯 Next Steps:');
    console.log('  1. Address high-severity issues first');
    console.log('  2. Implement suggested optimizations');
    console.log('  3. Monitor performance metrics');
    console.log('  4. Run performance tests regularly');

    console.log('\n✅ Performance analysis completed');
  }

  getAllTsFiles() {
    const files = [];

    function traverseDir(dir) {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverseDir(fullPath);
        } else if (stat.isFile() && item.endsWith('.ts')) {
          files.push(fullPath);
        }
      });
    }

    traverseDir(SRC_DIR);
    return files;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyzeCodebase();
}

module.exports = PerformanceAnalyzer;
