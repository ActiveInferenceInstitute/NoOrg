#!/usr/bin/env node

/**
 * Security Scanner for NoOrg Multi-Agent Framework
 *
 * This script performs comprehensive security analysis including:
 * - Dependency vulnerability scanning
 * - Code security analysis
 * - Configuration security review
 * - Authentication and authorization checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
const CONFIG_DIR = path.join(__dirname, '..');
const NODE_MODULES_DIR = path.join(__dirname, '..', 'node_modules');

class SecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.securityIssues = [];
    this.recommendations = [];
    this.scanResults = {};
  }

  async scanAll() {
    console.log('🔒 Starting comprehensive security scan...\n');

    await this.scanDependencies();
    await this.scanCodeSecurity();
    await this.scanConfiguration();
    await this.scanAuthentication();
    await this.scanDataHandling();

    this.generateSecurityReport();
    this.printReport();
  }

  async scanDependencies() {
    console.log('📦 Scanning dependencies for vulnerabilities...');

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);

      this.scanResults.dependencies = {
        totalVulnerabilities: auditData.vulnerabilities?.length || 0,
        highSeverity: auditData.metadata?.vulnerabilities?.high || 0,
        moderateSeverity: auditData.metadata?.vulnerabilities?.moderate || 0,
        lowSeverity: auditData.metadata?.vulnerabilities?.low || 0
      };

      if (auditData.vulnerabilities && auditData.vulnerabilities.length > 0) {
        auditData.vulnerabilities.forEach(vuln => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            this.vulnerabilities.push({
              type: 'dependency-vulnerability',
              severity: 'high',
              package: vuln.name,
              version: vuln.version,
              issue: vuln.title,
              fix: 'Update to latest secure version'
            });
          }
        });
      }

      console.log(`  ✅ Found ${this.scanResults.dependencies.totalVulnerabilities} vulnerabilities`);
    } catch (error) {
      console.log('  ⚠️  Could not run dependency scan:', error.message);
    }
  }

  async scanCodeSecurity() {
    console.log('🔍 Scanning source code for security issues...');

    const files = this.getAllTsFiles();
    let totalIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for hardcoded secrets
        const secrets = this.findHardcodedSecrets(content, file);
        this.securityIssues.push(...secrets);

        // Check for SQL injection vulnerabilities
        const sqlInjections = this.findSQLInjectionRisks(content, file);
        this.securityIssues.push(...sqlInjections);

        // Check for XSS vulnerabilities
        const xssRisks = this.findXSSRisks(content, file);
        this.securityIssues.push(...xssRisks);

        // Check for insecure random number generation
        const insecureRandom = this.findInsecureRandom(content, file);
        this.securityIssues.push(...insecureRandom);

        // Check for unsafe eval usage
        const unsafeEval = this.findUnsafeEval(content, file);
        this.securityIssues.push(...unsafeEval);

        // Check for insecure deserialization
        const insecureDeserialization = this.findInsecureDeserialization(content, file);
        this.securityIssues.push(...insecureDeserialization);

        totalIssues += secrets.length + sqlInjections.length + xssRisks.length +
                      insecureRandom.length + unsafeEval.length + insecureDeserialization.length;

      } catch (error) {
        console.log(`  ⚠️  Could not scan file ${file}:`, error.message);
      }
    });

    this.scanResults.codeSecurity = {
      filesScanned: files.length,
      issuesFound: totalIssues,
      highRiskIssues: this.securityIssues.filter(i => i.severity === 'high').length
    };

    console.log(`  ✅ Scanned ${files.length} files, found ${totalIssues} security issues`);
  }

  findHardcodedSecrets(content, file) {
    const issues = [];
    const secretPatterns = [
      { pattern: /api[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'API Key' },
      { pattern: /password\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Password' },
      { pattern: /secret\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Secret' },
      { pattern: /token\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Token' },
      { pattern: /private[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Private Key' },
      { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'AWS Secret Key' }
    ];

    secretPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'hardcoded-secret',
          severity: 'critical',
          file: file,
          line: this.getLineNumber(content, match.index),
          issue: `Hardcoded ${type} detected`,
          fix: 'Use environment variables or secure secret management'
        });
      }
    });

    return issues;
  }

  findSQLInjectionRisks(content, file) {
    const issues = [];

    // Check for string concatenation in queries
    const sqlPatterns = [
      /query\s*\+.*['"`]/g,
      /SELECT.*\+.*FROM/g,
      /INSERT.*\+.*VALUES/g,
      /UPDATE.*\+.*SET/g,
      /DELETE.*\+.*FROM/g
    ];

    sqlPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'sql-injection-risk',
          severity: 'high',
          file: file,
          line: this.getLineNumber(content, match.index),
          issue: 'Potential SQL injection vulnerability',
          fix: 'Use parameterized queries or prepared statements'
        });
      }
    });

    return issues;
  }

  findXSSRisks(content, file) {
    const issues = [];

    // Check for unsafe innerHTML usage
    const xssPatterns = [
      /innerHTML\s*=\s*[^<]*\$\{/g,
      /innerHTML\s*=\s*[^<]*\+/g,
      /document\.write\s*\(/g,
      /eval\s*\(/g
    ];

    xssPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'xss-risk',
          severity: 'high',
          file: file,
          line: this.getLineNumber(content, match.index),
          issue: 'Potential XSS vulnerability',
          fix: 'Use safe DOM manipulation or sanitize input'
        });
      }
    });

    return issues;
  }

  findInsecureRandom(content, file) {
    const issues = [];

    // Check for Math.random() in security contexts
    const randomPattern = /Math\.random\(\)/g;
    let match;
    while ((match = randomPattern.exec(content)) !== null) {
      issues.push({
        type: 'insecure-random',
        severity: 'medium',
        file: file,
        line: this.getLineNumber(content, match.index),
        issue: 'Insecure random number generation',
        fix: 'Use crypto.randomBytes() for security-sensitive operations'
      });
    }

    return issues;
  }

  findUnsafeEval(content, file) {
    const issues = [];

    // Check for eval usage
    const evalPattern = /\beval\s*\(/g;
    let match;
    while ((match = evalPattern.exec(content)) !== null) {
      issues.push({
        type: 'unsafe-eval',
        severity: 'high',
        file: file,
        line: this.getLineNumber(content, match.index),
        issue: 'Unsafe eval() usage detected',
        fix: 'Avoid eval() or use safer alternatives'
      });
    }

    return issues;
  }

  findInsecureDeserialization(content, file) {
    const issues = [];

    // Check for JSON.parse without validation
    const deserializationPattern = /JSON\.parse\s*\([^)]*\)/g;
    let match;
    while ((match = deserializationPattern.exec(content)) !== null) {
      issues.push({
        type: 'insecure-deserialization',
        severity: 'medium',
        file: file,
        line: this.getLineNumber(content, match.index),
        issue: 'JSON.parse without input validation',
        fix: 'Validate and sanitize input before parsing'
      });
    }

    return issues;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
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
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
          files.push(fullPath);
        }
      });
    }

    traverseDir(SRC_DIR);
    return files;
  }

  async scanConfiguration() {
    console.log('⚙️  Scanning configuration files...');

    const configFiles = [
      '.env.example',
      'tsconfig.json',
      'jest.config.js',
      '.eslintrc.js'
    ];

    let configIssues = 0;

    configFiles.forEach(file => {
      const filePath = path.join(CONFIG_DIR, file);

      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Check for security-related configuration issues
          if (file === '.env.example') {
            if (content.includes('sk-proj-') || content.includes('your-key-here')) {
              this.securityIssues.push({
                type: 'config-security',
                severity: 'low',
                file: file,
                issue: 'Example configuration contains placeholder secrets',
                fix: 'Ensure .env.example does not contain real credentials'
              });
              configIssues++;
            }
          }

          if (file === 'tsconfig.json') {
            if (!content.includes('"strict": true')) {
              this.securityIssues.push({
                type: 'typescript-security',
                severity: 'medium',
                file: file,
                issue: 'TypeScript strict mode not enabled',
                fix: 'Enable strict mode for better type safety'
              });
              configIssues++;
            }
          }
        } catch (error) {
          console.log(`  ⚠️  Could not scan config file ${file}:`, error.message);
        }
      }
    });

    this.scanResults.configuration = {
      filesScanned: configFiles.length,
      issuesFound: configIssues
    };

    console.log(`  ✅ Scanned ${configFiles.length} config files, found ${configIssues} issues`);
  }

  async scanAuthentication() {
    console.log('🔐 Scanning authentication and authorization...');

    const files = this.getAllTsFiles();
    let authIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for missing authentication
        if (content.includes('app.listen') && !content.includes('auth') && !content.includes('middleware')) {
          this.securityIssues.push({
            type: 'missing-auth',
            severity: 'high',
            file: file,
            issue: 'HTTP server without authentication middleware',
            fix: 'Implement proper authentication and authorization'
          });
          authIssues++;
        }

        // Check for insecure password handling
        if (content.includes('password') && !content.includes('hash') && !content.includes('bcrypt')) {
          this.securityIssues.push({
            type: 'insecure-password',
            severity: 'high',
            file: file,
            issue: 'Potential insecure password handling',
            fix: 'Use proper password hashing (bcrypt, argon2)'
          });
          authIssues++;
        }

        // Check for missing input validation
        if (content.includes('req.body') && !content.includes('validation') && !content.includes('sanitize')) {
          this.securityIssues.push({
            type: 'missing-validation',
            severity: 'medium',
            file: file,
            issue: 'Missing input validation on request body',
            fix: 'Implement input validation and sanitization'
          });
          authIssues++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.authentication = {
      filesScanned: files.length,
      issuesFound: authIssues
    };

    console.log(`  ✅ Scanned ${files.length} files, found ${authIssues} authentication issues`);
  }

  async scanDataHandling() {
    console.log('💾 Scanning data handling and storage...');

    const files = this.getAllTsFiles();
    let dataIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for logging sensitive data
        if (content.includes('console.log') && content.includes('password')) {
          this.securityIssues.push({
            type: 'sensitive-data-logging',
            severity: 'high',
            file: file,
            issue: 'Logging sensitive data (passwords)',
            fix: 'Remove sensitive data from logs or use log sanitization'
          });
          dataIssues++;
        }

        // Check for unencrypted data storage
        if (content.includes('fs.writeFile') && !content.includes('encrypt')) {
          this.securityIssues.push({
            type: 'unencrypted-storage',
            severity: 'medium',
            file: file,
            issue: 'Potential unencrypted data storage',
            fix: 'Implement encryption for sensitive data storage'
          });
          dataIssues++;
        }

        // Check for missing data validation
        if (content.includes('JSON.parse') && !content.includes('try') && !content.includes('catch')) {
          this.securityIssues.push({
            type: 'unvalidated-json',
            severity: 'medium',
            file: file,
            issue: 'JSON parsing without error handling',
            fix: 'Wrap JSON.parse in try-catch blocks'
          });
          dataIssues++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.dataHandling = {
      filesScanned: files.length,
      issuesFound: dataIssues
    };

    console.log(`  ✅ Scanned ${files.length} files, found ${dataIssues} data handling issues`);
  }

  generateSecurityReport() {
    const totalVulnerabilities = this.vulnerabilities.length;
    const highSeverity = this.vulnerabilities.filter(v => v.severity === 'high').length +
                        this.securityIssues.filter(i => i.severity === 'high').length;
    const mediumSeverity = this.securityIssues.filter(i => i.severity === 'medium').length;
    const lowSeverity = this.securityIssues.filter(i => i.severity === 'low').length;

    this.scanResults.summary = {
      totalVulnerabilities,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      overallRisk: highSeverity > 0 ? 'high' : mediumSeverity > 5 ? 'medium' : 'low'
    };

    // Generate recommendations
    if (highSeverity > 0) {
      this.recommendations.push({
        priority: 'urgent',
        message: `Address ${highSeverity} high-severity security issues immediately`,
        action: 'Review and fix critical vulnerabilities before deployment'
      });
    }

    if (totalVulnerabilities > 10) {
      this.recommendations.push({
        priority: 'high',
        message: 'Multiple security issues detected',
        action: 'Implement systematic security review process'
      });
    }

    if (this.scanResults.dependencies.highSeverity > 0) {
      this.recommendations.push({
        priority: 'urgent',
        message: 'High-severity dependency vulnerabilities found',
        action: 'Update vulnerable dependencies immediately'
      });
    }

    this.recommendations.push({
      priority: 'medium',
      message: 'Implement comprehensive security monitoring',
      action: 'Set up security scanning in CI/CD pipeline'
    });
  }

  printReport() {
    console.log('\n🛡️  Security Scan Report');
    console.log('======================\n');

    console.log('📊 Summary:');
    console.log(`  Risk Level: ${this.scanResults.summary.overallRisk.toUpperCase()}`);
    console.log(`  High Severity Issues: ${this.scanResults.summary.highSeverity}`);
    console.log(`  Medium Severity Issues: ${this.scanResults.summary.mediumSeverity}`);
    console.log(`  Low Severity Issues: ${this.scanResults.summary.lowSeverity}`);
    console.log(`  Total Issues: ${this.scanResults.summary.totalVulnerabilities}`);

    console.log('\n🔍 Detailed Results:');
    Object.entries(this.scanResults).forEach(([category, data]) => {
      if (category !== 'summary') {
        console.log(`  ${category}: ${data.issuesFound || data.totalVulnerabilities || 0} issues`);
      }
    });

    console.log('\n🚨 Critical Issues:');
    if (this.vulnerabilities.length === 0 && this.securityIssues.filter(i => i.severity === 'high').length === 0) {
      console.log('  ✅ No critical security issues found');
    } else {
      const criticalIssues = [...this.vulnerabilities, ...this.securityIssues.filter(i => i.severity === 'high')];
      criticalIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.issue}`);
        console.log(`     📁 ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`     💡 ${issue.fix}`);
      });
    }

    console.log('\n💡 Security Recommendations:');
    if (this.recommendations.length === 0) {
      console.log('  ✅ No additional recommendations');
    } else {
      this.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'urgent' ? '🔴' : rec.priority === 'high' ? '🟠' : '🟡';
        console.log(`  ${priority} ${index + 1}. ${rec.message}`);
        console.log(`     💡 ${rec.action}`);
      });
    }

    console.log('\n🔒 Security Best Practices:');
    console.log('  1. Regularly update dependencies (npm audit)');
    console.log('  2. Use environment variables for secrets');
    console.log('  3. Implement input validation and sanitization');
    console.log('  4. Use parameterized queries for databases');
    console.log('  5. Enable authentication and authorization');
    console.log('  6. Implement proper error handling');
    console.log('  7. Use secure random number generation');
    console.log('  8. Encrypt sensitive data at rest');
    console.log('  9. Set up security monitoring and alerting');
    console.log('  10. Regular security code reviews');

    console.log('\n✅ Security scan completed');
  }
}

// Run security scan if called directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.scanAll().catch(error => {
    console.error('❌ Security scan failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityScanner;
