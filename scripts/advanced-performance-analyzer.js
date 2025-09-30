#!/usr/bin/env node

/**
 * Advanced Performance Analyzer
 *
 * Comprehensive performance analysis and optimization tool for the NoOrg Multi-Agent Framework.
 * Provides detailed performance metrics, bottleneck identification, and optimization recommendations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');

class AdvancedPerformanceAnalyzer {
  constructor() {
    this.metrics = {};
    this.issues = [];
    this.optimizations = [];
    this.analysisResults = {};
  }

  async analyzeAll() {
    console.log('🔍 Starting Advanced Performance Analysis...\n');

    await this.analyzeCodeComplexity();
    await this.analyzeMemoryUsage();
    await this.analyzeNetworkOperations();
    await this.analyzeAsyncOperations();
    await this.analyzeBundleAnalysis();
    await this.analyzeDatabaseOperations();
    await this.analyzeCachingStrategies();
    await this.analyzeConcurrencyPatterns();

    this.generateAdvancedRecommendations();
    this.printAdvancedReport();
  }

  async analyzeCodeComplexity() {
    console.log('📊 Analyzing code complexity...');

    const files = this.getAllTsFiles();
    let totalComplexity = 0;
    let highComplexityFiles = 0;
    let cyclomaticComplexity = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const complexity = this.calculateCyclomaticComplexity(content);

        totalComplexity += complexity;
        cyclomaticComplexity += complexity;

        if (complexity > 10) {
          highComplexityFiles++;
          this.issues.push({
            type: 'high-complexity',
            severity: 'medium',
            file: path.relative(SRC_DIR, file),
            complexity,
            issue: `High cyclomatic complexity: ${complexity}`,
            suggestion: 'Refactor to reduce complexity (aim for < 10)'
          });
        }
      } catch (error) {
        // Skip files that can't be analyzed
      }
    });

    this.metrics.codeComplexity = {
      totalFiles: files.length,
      averageComplexity: totalComplexity / files.length,
      highComplexityFiles,
      totalComplexity
    };

    console.log(`  📈 Analyzed ${files.length} files, average complexity: ${(totalComplexity / files.length).toFixed(2)}`);
  }

  calculateCyclomaticComplexity(content) {
    // Count decision points
    const decisionPoints = [
      ...content.match(/if\s*\(/g) || [],
      ...content.match(/else\s+if\s*\(/g) || [],
      ...content.match(/while\s*\(/g) || [],
      ...content.match(/for\s*\(/g) || [],
      ...content.match(/switch\s*\(/g) || [],
      ...content.match(/catch\s*\(/g) || [],
      ...content.match(/\?\s*:/g) || [], // Ternary operators
      ...content.match(/&&/g) || [],
      ...content.match(/\|\|/g) || []
    ];

    // Base complexity is 1, add 1 for each decision point
    return Math.max(1, 1 + decisionPoints.length);
  }

  async analyzeMemoryUsage() {
    console.log('💾 Analyzing memory usage patterns...');

    const files = this.getAllTsFiles();
    let memoryIssues = 0;
    let largeObjects = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for large object creation
        const largeObjectPatterns = [
          /new\s+\w+\([^}]{500,}/g, // Large object literals
          /Array\s*\(\s*\d{4,}\s*\)/g, // Large arrays
          /Object\.keys\s*\([^}]{200,}\)/g // Large object operations
        ];

        largeObjectPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            largeObjects += matches.length;
            memoryIssues += matches.length;
          }
        });

        // Check for potential memory leaks
        const leakPatterns = [
          /setInterval\s*\(/g,
          /setTimeout\s*\(/g,
          /addEventListener\s*\(/g
        ];

        leakPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches && matches.length > 5) {
            memoryIssues++;
            this.issues.push({
              type: 'memory-leak-risk',
              severity: 'medium',
              file: path.relative(SRC_DIR, file),
              issue: `Multiple ${pattern.source} calls without cleanup`,
              suggestion: 'Ensure proper cleanup of timers and listeners'
            });
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.memoryUsage = {
      memoryIssues,
      largeObjects,
      filesAnalyzed: files.length
    };

    console.log(`  💾 Found ${memoryIssues} memory issues, ${largeObjects} large objects`);
  }

  async analyzeNetworkOperations() {
    console.log('🌐 Analyzing network operations...');

    const files = this.getAllTsFiles();
    let networkCalls = 0;
    let sequentialCalls = 0;
    let unhandledPromises = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count network operations
        const networkPatterns = [
          /fetch\s*\(/g,
          /axios\./g,
          /request\s*\(/g,
          /http\./g,
          /https\./g
        ];

        networkPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            networkCalls += matches.length;
          }
        });

        // Check for sequential network calls
        const sequentialPatterns = [
          /await.*\n\s*await.*fetch/g,
          /await.*\n\s*await.*axios/g,
          /await.*\n\s*await.*request/g
        ];

        sequentialPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            sequentialCalls += matches.length;
          }
        });

        // Check for unhandled promises
        const promisePatterns = [
          /fetch\s*\([^)]*\)\s*(?![.(]|await|return)/g,
          /axios\.[^(]*\([^)]*\)\s*(?![.(]|await|return)/g
        ];

        promisePatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            unhandledPromises += matches.length;
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.networkOperations = {
      networkCalls,
      sequentialCalls,
      unhandledPromises
    };

    if (sequentialCalls > 0) {
      this.issues.push({
        type: 'network-optimization',
        severity: 'high',
        issue: `${sequentialCalls} sequential network calls detected`,
        suggestion: 'Use Promise.all() for parallel network requests'
      });
    }

    if (unhandledPromises > 0) {
      this.issues.push({
        type: 'unhandled-promises',
        severity: 'high',
        issue: `${unhandledPromises} potentially unhandled network promises`,
        suggestion: 'Handle all promises with .catch() or async/await'
      });
    }

    console.log(`  🌐 Found ${networkCalls} network calls, ${sequentialCalls} sequential calls`);
  }

  async analyzeAsyncOperations() {
    console.log('⚡ Analyzing async operations...');

    const files = this.getAllTsFiles();
    let asyncFunctions = 0;
    let awaitInLoop = 0;
    let promiseChains = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count async functions
        const asyncPatterns = [
          /async\s+function/g,
          /async\s+\w+\s*\(/g,
          /async\s*\w+\s*\(/g
        ];

        asyncPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            asyncFunctions += matches.length;
          }
        });

        // Check for await in loops
        const loopPatterns = [
          /for\s*\([^}]*await[^}]*\)/g,
          /while\s*\([^}]*await[^}]*\)/g,
          /forEach\s*\([^}]*await[^}]*\)/g
        ];

        loopPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            awaitInLoop += matches.length;
          }
        });

        // Check for promise chains
        const chainPatterns = [
          /\.then\s*\([^}]*\.then/g,
          /\.catch\s*\([^}]*\.then/g
        ];

        chainPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            promiseChains += matches.length;
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.asyncOperations = {
      asyncFunctions,
      awaitInLoop,
      promiseChains
    };

    if (awaitInLoop > 0) {
      this.issues.push({
        type: 'async-performance',
        severity: 'medium',
        issue: `${awaitInLoop} await in loop patterns detected`,
        suggestion: 'Use Promise.all() for parallel async operations'
      });
    }

    if (promiseChains > 5) {
      this.optimizations.push({
        type: 'async-modernization',
        message: `${promiseChains} promise chains detected`,
        suggestion: 'Consider using async/await instead of promise chains'
      });
    }

    console.log(`  ⚡ Found ${asyncFunctions} async functions, ${awaitInLoop} await in loops`);
  }

  async analyzeBundleAnalysis() {
    console.log('📦 Analyzing bundle size and composition...');

    try {
      const stats = fs.statSync(path.join(DIST_DIR, 'index.js'));
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      this.metrics.bundleAnalysis = {
        size: `${sizeInMB}MB`,
        sizeBytes: stats.size
      };

      if (stats.size > 10 * 1024 * 1024) { // 10MB
        this.issues.push({
          type: 'large-bundle',
          severity: 'high',
          issue: `Bundle size is ${sizeInMB}MB`,
          suggestion: 'Implement code splitting and tree shaking'
        });
      } else if (stats.size > 5 * 1024 * 1024) { // 5MB
        this.optimizations.push({
          type: 'bundle-optimization',
          message: `Bundle size is ${sizeInMB}MB`,
          suggestion: 'Consider dynamic imports and lazy loading'
        });
      }
    } catch (error) {
      this.issues.push({
        type: 'bundle-analysis',
        severity: 'low',
        issue: 'Could not analyze bundle size - build may not exist',
        suggestion: 'Run `npm run build` first'
      });
    }

    console.log(`  📦 Bundle size: ${this.metrics.bundleAnalysis?.size || 'Unknown'}`);
  }

  async analyzeDatabaseOperations() {
    console.log('🗄️ Analyzing database operations...');

    const files = this.getAllTsFiles();
    let dbOperations = 0;
    let unhandledConnections = 0;
    let inefficientQueries = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Count database operations
        const dbPatterns = [
          /db\.|database\.|pool\.|connection\./g,
          /query\s*\(/g,
          /execute\s*\(/g,
          /find\s*\(/g,
          /insert\s*\(/g,
          /update\s*\(/g,
          /delete\s*\(/g
        ];

        dbPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            dbOperations += matches.length;
          }
        });

        // Check for unhandled connections
        const connectionPatterns = [
          /connect\s*\([^}]*\)/g,
          /createConnection\s*\([^}]*\)/g,
          /getConnection\s*\([^}]*\)/g
        ];

        connectionPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            // Check if connections are properly closed
            const closeMatches = content.match(/close\s*\(|disconnect\s*\(|end\s*\(/g);
            if (!closeMatches || closeMatches.length < matches.length) {
              unhandledConnections += matches.length - (closeMatches?.length || 0);
            }
          }
        });

        // Check for inefficient query patterns
        const inefficientPatterns = [
          /SELECT.*\*.*FROM/g, // SELECT *
          /LIKE.*%.*%/g, // LIKE with wildcards at both ends
          /ORDER BY.*RAND/g // ORDER BY RAND()
        ];

        inefficientPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            inefficientQueries += matches.length;
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.databaseOperations = {
      dbOperations,
      unhandledConnections,
      inefficientQueries
    };

    if (unhandledConnections > 0) {
      this.issues.push({
        type: 'db-connection-leak',
        severity: 'high',
        issue: `${unhandledConnections} potentially unhandled database connections`,
        suggestion: 'Ensure all database connections are properly closed'
      });
    }

    if (inefficientQueries > 0) {
      this.optimizations.push({
        type: 'query-optimization',
        message: `${inefficientQueries} potentially inefficient queries detected`,
        suggestion: 'Optimize queries and consider query builders'
      });
    }

    console.log(`  🗄️ Found ${dbOperations} DB operations, ${unhandledConnections} unhandled connections`);
  }

  async analyzeCachingStrategies() {
    console.log('💾 Analyzing caching strategies...');

    const files = this.getAllTsFiles();
    let cacheUsage = 0;
    let cacheMisses = 0;
    let cacheInvalidation = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for caching patterns
        const cachePatterns = [
          /cache|Cache/g,
          /memoize|Memoize/g,
          /LRU|lru/g,
          /TTL|ttl/g
        ];

        cachePatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            cacheUsage += matches.length;
          }
        });

        // Check for potential cache misses
        const missPatterns = [
          /fetch.*cache/g,
          /get.*cache/g,
          /cache.*miss/g
        ];

        missPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            cacheMisses += matches.length;
          }
        });

        // Check for cache invalidation
        const invalidationPatterns = [
          /invalidate|Invalid/g,
          /clear|Clear/g,
          /evict|Evict/g
        ];

        invalidationPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            cacheInvalidation += matches.length;
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.cachingStrategies = {
      cacheUsage,
      cacheMisses,
      cacheInvalidation
    };

    if (cacheMisses > cacheUsage) {
      this.optimizations.push({
        type: 'cache-strategy',
        message: 'More cache misses than cache usage detected',
        suggestion: 'Review caching strategy and increase cache hit rate'
      });
    }

    if (cacheInvalidation === 0 && cacheUsage > 0) {
      this.optimizations.push({
        type: 'cache-invalidation',
        message: 'Cache usage detected but no invalidation patterns',
        suggestion: 'Implement proper cache invalidation strategies'
      });
    }

    console.log(`  💾 Found ${cacheUsage} cache operations, ${cacheMisses} potential misses`);
  }

  async analyzeConcurrencyPatterns() {
    console.log('🔄 Analyzing concurrency patterns...');

    const files = this.getAllTsFiles();
    let concurrentOperations = 0;
    let raceConditions = 0;
    let deadlocks = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for concurrent operations
        const concurrencyPatterns = [
          /Promise\.all/g,
          /Promise\.race/g,
          /Promise\.allSettled/g,
          /worker|Worker/g,
          /thread|Thread/g
        ];

        concurrencyPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            concurrentOperations += matches.length;
          }
        });

        // Check for potential race conditions
        const racePatterns = [
          /shared.*state/g,
          /global.*variable/g,
          /concurrent.*access/g
        ];

        racePatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            raceConditions += matches.length;
          }
        });

        // Check for potential deadlock patterns
        const deadlockPatterns = [
          /lock|Lock/g,
          /mutex|Mutex/g,
          /semaphore|Semaphore/g
        ];

        deadlockPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            deadlocks += matches.length;
          }
        });
      } catch (error) {
        // Skip problematic files
      }
    });

    this.metrics.concurrencyPatterns = {
      concurrentOperations,
      raceConditions,
      deadlocks
    };

    if (raceConditions > 0) {
      this.issues.push({
        type: 'race-condition-risk',
        severity: 'high',
        issue: `${raceConditions} potential race condition patterns`,
        suggestion: 'Use proper synchronization mechanisms'
      });
    }

    if (deadlocks > 0) {
      this.issues.push({
        type: 'deadlock-risk',
        severity: 'high',
        issue: `${deadlocks} potential deadlock patterns`,
        suggestion: 'Review locking mechanisms and resource ordering'
      });
    }

    console.log(`  🔄 Found ${concurrentOperations} concurrent operations, ${raceConditions} race condition risks`);
  }

  generateAdvancedRecommendations() {
    const recommendations = [];

    // Overall performance score
    const performanceScore = this.calculatePerformanceScore();

    if (performanceScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        message: `Overall performance score: ${performanceScore}/100`,
        action: 'Implement comprehensive performance optimizations'
      });
    }

    // Memory optimization
    if (this.metrics.memoryUsage?.memoryIssues > 10) {
      recommendations.push({
        priority: 'high',
        category: 'memory',
        message: 'Multiple memory issues detected',
        action: 'Implement memory optimization strategies'
      });
    }

    // Network optimization
    if (this.metrics.networkOperations?.sequentialCalls > 5) {
      recommendations.push({
        priority: 'high',
        category: 'network',
        message: 'Sequential network calls detected',
        action: 'Implement parallel network operations'
      });
    }

    // Async optimization
    if (this.metrics.asyncOperations?.awaitInLoop > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'async',
        message: 'Await in loop patterns detected',
        action: 'Use Promise.all() for parallel operations'
      });
    }

    // Bundle optimization
    if (this.metrics.bundleAnalysis?.sizeBytes > 5 * 1024 * 1024) {
      recommendations.push({
        priority: 'medium',
        category: 'bundle',
        message: 'Large bundle size detected',
        action: 'Implement code splitting and tree shaking'
      });
    }

    this.optimizations.push(...recommendations);
  }

  calculatePerformanceScore() {
    let score = 100;

    // Penalize for issues
    score -= this.issues.filter(i => i.severity === 'high').length * 10;
    score -= this.issues.filter(i => i.severity === 'medium').length * 5;

    // Penalize for poor metrics
    if (this.metrics.codeComplexity?.averageComplexity > 10) {
      score -= 10;
    }

    if (this.metrics.memoryUsage?.memoryIssues > 5) {
      score -= 10;
    }

    if (this.metrics.networkOperations?.sequentialCalls > 3) {
      score -= 15;
    }

    if (this.metrics.asyncOperations?.awaitInLoop > 2) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  printAdvancedReport() {
    console.log('\n🚀 Advanced Performance Analysis Report');
    console.log('=====================================\n');

    const performanceScore = this.calculatePerformanceScore();

    console.log(`📊 Overall Performance Score: ${performanceScore}/100`);
    console.log(`🔍 Issues Found: ${this.issues.length}`);
    console.log(`💡 Optimization Opportunities: ${this.optimizations.length}\n`);

    // Detailed metrics
    console.log('📈 Detailed Metrics:');
    Object.entries(this.metrics).forEach(([category, data]) => {
      console.log(`  ${category}:`);
      Object.entries(data).forEach(([metric, value]) => {
        console.log(`    ${metric}: ${value}`);
      });
    });

    console.log('\n🚨 Critical Issues:');
    const criticalIssues = this.issues.filter(i => i.severity === 'high');
    if (criticalIssues.length === 0) {
      console.log('  ✅ No critical issues detected');
    } else {
      criticalIssues.forEach((issue, index) => {
        console.log(`  🔴 ${index + 1}. ${issue.issue}`);
        console.log(`     📁 ${issue.file || 'Multiple files'}`);
        console.log(`     💡 ${issue.suggestion}`);
      });
    }

    console.log('\n💡 Optimization Recommendations:');
    if (this.optimizations.length === 0) {
      console.log('  ✅ No optimization recommendations');
    } else {
      this.optimizations.forEach((opt, index) => {
        const priority = opt.priority === 'high' ? '🔴' : '🟡';
        console.log(`  ${priority} ${index + 1}. ${opt.message}`);
        console.log(`     💡 ${opt.action}`);
      });
    }

    console.log('\n🎯 Performance Improvement Plan:');
    console.log('  1. Address all critical issues immediately');
    console.log('  2. Implement high-priority optimizations');
    console.log('  3. Monitor performance metrics continuously');
    console.log('  4. Set up automated performance testing');
    console.log('  5. Regular performance reviews and optimization');

    console.log('\n📋 Next Steps:');
    console.log('  • Run performance tests: npm run test:performance');
    console.log('  • Monitor memory usage: npm run performance:profile');
    console.log('  • Review bundle size: npm run analyze:bundle');
    console.log('  • Set up monitoring: npm run monitoring:setup');

    console.log('\n✅ Advanced performance analysis completed');
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
  const analyzer = new AdvancedPerformanceAnalyzer();
  analyzer.analyzeAll().catch(error => {
    console.error('❌ Advanced performance analysis failed:', error);
    process.exit(1);
  });
}

module.exports = AdvancedPerformanceAnalyzer;
