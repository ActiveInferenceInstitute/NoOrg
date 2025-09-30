#!/usr/bin/env node

/**
 * Advanced Security Scanner
 *
 * Comprehensive security analysis tool for the NoOrg Multi-Agent Framework.
 * Provides detailed vulnerability detection, security recommendations, and compliance checking.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
const CONFIG_DIR = path.join(__dirname, '..');

class AdvancedSecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.securityIssues = [];
    this.recommendations = [];
    this.scanResults = {};
    this.dependencyTree = new Map();
  }

  async scanAll() {
    console.log('🔒 Starting Advanced Security Scan...\n');

    await this.scanDependencies();
    await this.scanCodeSecurity();
    await this.scanConfiguration();
    await this.scanAuthentication();
    await this.scanDataHandling();
    await this.scanNetworkSecurity();
    await this.scanCryptography();
    await this.scanAccessControl();
    await this.scanCompliance();

    this.generateSecurityReport();
    this.printAdvancedReport();
  }

  async scanDependencies() {
    console.log('📦 Scanning dependencies for vulnerabilities...');

    try {
      // Run npm audit with detailed output
      const auditOutput = execSync('npm audit --json --audit-level high', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);

      this.scanResults.dependencies = {
        totalVulnerabilities: auditData.vulnerabilities?.length || 0,
        highSeverity: auditData.metadata?.vulnerabilities?.high || 0,
        moderateSeverity: auditData.metadata?.vulnerabilities?.moderate || 0,
        lowSeverity: auditData.metadata?.vulnerabilities?.low || 0,
        infoSeverity: auditData.metadata?.vulnerabilities?.info || 0
      };

      if (auditData.vulnerabilities && auditData.vulnerabilities.length > 0) {
        auditData.vulnerabilities.forEach(vuln => {
          const severity = this.mapSeverity(vuln.severity);
          if (severity === 'high' || severity === 'critical') {
            this.vulnerabilities.push({
              type: 'dependency-vulnerability',
              severity: 'critical',
              package: vuln.name,
              version: vuln.version,
              issue: vuln.title,
              cve: vuln.cve,
              fix: 'Update to latest secure version',
              impact: this.assessImpact(vuln)
            });
          }
        });
      }

      // Analyze dependency tree for supply chain risks
      await this.analyzeDependencyTree();

      console.log(`  📦 Found ${this.scanResults.dependencies.totalVulnerabilities} vulnerabilities`);
    } catch (error) {
      console.log('  ⚠️  Could not run dependency scan:', error.message);
    }
  }

  async analyzeDependencyTree() {
    try {
      const depTree = execSync('npm ls --json --depth=0', { encoding: 'utf8' });
      const tree = JSON.parse(depTree);

      this.scanResults.dependencyTree = {
        totalDependencies: Object.keys(tree.dependencies || {}).length,
        directDependencies: Object.keys(tree.dependencies || {}).length,
        maxDepth: 0,
        potentialRisks: 0
      };

      // Analyze for potential supply chain risks
      Object.entries(tree.dependencies || {}).forEach(([name, dep]) => {
        if (dep.dependencies && Object.keys(dep.dependencies).length > 20) {
          this.securityIssues.push({
            type: 'heavy-dependency',
            severity: 'medium',
            package: name,
            issue: `Package has ${Object.keys(dep.dependencies).length} dependencies`,
            fix: 'Consider lighter alternatives or audit dependency chain'
          });
        }
      });
    } catch (error) {
      console.log('  ⚠️  Could not analyze dependency tree:', error.message);
    }
  }

  async scanCodeSecurity() {
    console.log('🔍 Scanning source code for security issues...');

    const files = this.getAllTsFiles();
    let totalIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Comprehensive security checks
        const secrets = this.findHardcodedSecrets(content, file);
        const injections = this.findInjectionRisks(content, file);
        const xssRisks = this.findXSSRisks(content, file);
        const authIssues = this.findAuthIssues(content, file);
        const cryptoIssues = this.findCryptoIssues(content, file);
        const inputValidation = this.findInputValidationIssues(content, file);
        const errorHandling = this.findErrorHandlingIssues(content, file);

        this.securityIssues.push(...secrets, ...injections, ...xssRisks,
                               ...authIssues, ...cryptoIssues, ...inputValidation, ...errorHandling);

        totalIssues += secrets.length + injections.length + xssRisks.length +
                      authIssues.length + cryptoIssues.length + inputValidation.length + errorHandling.length;

      } catch (error) {
        console.log(`  ⚠️  Could not scan file ${file}:`, error.message);
      }
    });

    this.scanResults.codeSecurity = {
      filesScanned: files.length,
      issuesFound: totalIssues,
      criticalIssues: this.securityIssues.filter(i => i.severity === 'critical').length,
      highRiskIssues: this.securityIssues.filter(i => i.severity === 'high').length,
      mediumRiskIssues: this.securityIssues.filter(i => i.severity === 'medium').length
    };

    console.log(`  🔍 Scanned ${files.length} files, found ${totalIssues} security issues`);
  }

  findHardcodedSecrets(content, file) {
    const issues = [];
    const secretPatterns = [
      { pattern: /api[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'API Key', severity: 'critical' },
      { pattern: /password\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Password', severity: 'critical' },
      { pattern: /secret\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Secret', severity: 'critical' },
      { pattern: /token\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Token', severity: 'high' },
      { pattern: /private[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Private Key', severity: 'critical' },
      { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'AWS Secret Key', severity: 'critical' },
      { pattern: /database[_-]?url\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Database URL', severity: 'high' },
      { pattern: /jwt[_-]?secret\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'JWT Secret', severity: 'critical' },
      { pattern: /encryption[_-]?key\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'Encryption Key', severity: 'critical' },
      { pattern: /ssl[_-]?cert\s*[=:]?\s*['"`]([^'"`]+)['"`]/gi, type: 'SSL Certificate', severity: 'high' }
    ];

    secretPatterns.forEach(({ pattern, type, severity }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'hardcoded-secret',
          severity,
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: `Hardcoded ${type} detected`,
          fix: 'Use environment variables or secure secret management',
          details: {
            secretType: type,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  findInjectionRisks(content, file) {
    const issues = [];

    // SQL injection patterns
    const sqlPatterns = [
      /query\s*\+.*['"`]/g,
      /SELECT.*\+.*FROM/g,
      /INSERT.*\+.*VALUES/g,
      /UPDATE.*\+.*SET/g,
      /DELETE.*\+.*FROM/g,
      /execute.*\+/g
    ];

    sqlPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'sql-injection-risk',
          severity: 'critical',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential SQL injection vulnerability',
          fix: 'Use parameterized queries or prepared statements',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    // Command injection patterns
    const cmdPatterns = [
      /exec\s*\(/g,
      /spawn\s*\(/g,
      /child_process/g,
      /eval\s*\(/g
    ];

    cmdPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'command-injection-risk',
          severity: 'high',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential command injection vulnerability',
          fix: 'Validate and sanitize input before execution',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  findXSSRisks(content, file) {
    const issues = [];

    // XSS patterns
    const xssPatterns = [
      /innerHTML\s*=\s*[^<]*\$\{/g,
      /innerHTML\s*=\s*[^<]*\+/g,
      /document\.write\s*\(/g,
      /eval\s*\(/g,
      /setTimeout\s*\([^,]*\$\{/g,
      /setInterval\s*\([^,]*\$\{/g
    ];

    xssPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'xss-risk',
          severity: 'high',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential XSS vulnerability',
          fix: 'Use safe DOM manipulation or sanitize input',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  findAuthIssues(content, file) {
    const issues = [];

    // Authentication patterns
    const authPatterns = [
      /password.*==/g, // Plain text password comparison
      /auth.*false/g, // Disabled authentication
      /session.*null/g, // Null session handling
      /jwt.*decode.*false/g // JWT without verification
    ];

    authPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'authentication-issue',
          severity: 'high',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential authentication vulnerability',
          fix: 'Implement proper authentication mechanisms',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  findCryptoIssues(content, file) {
    const issues = [];

    // Cryptography patterns
    const cryptoPatterns = [
      /Math\.random/g, // Insecure random
      /md5|sha1/g, // Weak hashing
      /DES|3DES/g, // Weak encryption
      /ECB/g, // Insecure cipher mode
      /no\s+padding/g // Missing padding
    ];

    cryptoPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'cryptography-issue',
          severity: 'medium',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential cryptography vulnerability',
          fix: 'Use secure cryptographic algorithms and practices',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  findInputValidationIssues(content, file) {
    const issues = [];

    // Input validation patterns
    const validationPatterns = [
      /req\.body/g, // Unvalidated request body
      /req\.query/g, // Unvalidated query parameters
      /req\.params/g, // Unvalidated route parameters
      /input.*value/g // Unvalidated form inputs
    ];

    validationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Check if validation is present nearby
        const context = this.getContext(content, match.index, 10);
        if (!context.includes('validate') && !context.includes('sanitize') && !context.includes('schema')) {
          issues.push({
            type: 'input-validation-issue',
            severity: 'medium',
            file: path.relative(SRC_DIR, file),
            line: this.getLineNumber(content, match.index),
            issue: 'Potential input validation issue',
            fix: 'Implement proper input validation and sanitization',
            details: {
              pattern: pattern.source,
              lineContent: this.getLineContent(content, match.index),
              context: context
            }
          });
        }
      }
    });

    return issues;
  }

  findErrorHandlingIssues(content, file) {
    const issues = [];

    // Error handling patterns
    const errorPatterns = [
      /console\.error/g, // Console error logging
      /catch.*console/g, // Error logging to console
      /throw.*new Error/g // Unstructured error throwing
    ];

    errorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'error-handling-issue',
          severity: 'low',
          file: path.relative(SRC_DIR, file),
          line: this.getLineNumber(content, match.index),
          issue: 'Potential error handling issue',
          fix: 'Implement structured error handling and logging',
          details: {
            pattern: pattern.source,
            lineContent: this.getLineContent(content, match.index)
          }
        });
      }
    });

    return issues;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getLineContent(content, index) {
    const lines = content.split('\n');
    const lineNumber = this.getLineNumber(content, index);
    return lines[lineNumber - 1]?.trim() || '';
  }

  getContext(content, index, radius = 5) {
    const lines = content.split('\n');
    const lineNumber = this.getLineNumber(content, index);
    const start = Math.max(0, lineNumber - radius - 1);
    const end = Math.min(lines.length, lineNumber + radius);
    return lines.slice(start, end).join('\n');
  }

  mapSeverity(severity) {
    const severityMap = {
      'low': 'low',
      'moderate': 'medium',
      'high': 'high',
      'critical': 'critical'
    };
    return severityMap[severity] || 'medium';
  }

  assessImpact(vulnerability) {
    // Assess potential impact based on vulnerability details
    if (vulnerability.severity === 'critical') {
      return 'Critical system compromise possible';
    } else if (vulnerability.severity === 'high') {
      return 'Significant security impact';
    } else if (vulnerability.severity === 'moderate') {
      return 'Moderate security impact';
    }
    return 'Low security impact';
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

  async scanConfiguration() {
    console.log('⚙️ Scanning configuration files...');

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
          console.log(`  ⚠️ Could not scan config file ${file}:`, error.message);
        }
      }
    });

    this.scanResults.configuration = {
      filesScanned: configFiles.length,
      issuesFound: configIssues
    };

    console.log(`  ⚙️ Scanned ${configFiles.length} config files, found ${configIssues} issues`);
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
            file: path.relative(SRC_DIR, file),
            issue: 'HTTP server without authentication middleware',
            fix: 'Implement proper authentication and authorization'
          });
          authIssues++;
        }

        // Check for insecure password handling
        if (content.includes('password') && !content.includes('hash') && !content.includes('bcrypt')) {
          this.securityIssues.push({
            type: 'insecure-password',
            severity: 'critical',
            file: path.relative(SRC_DIR, file),
            issue: 'Potential insecure password handling',
            fix: 'Use proper password hashing (bcrypt, argon2)'
          });
          authIssues++;
        }

        // Check for missing input validation
        if (content.includes('req.body') && !content.includes('validate') && !content.includes('schema')) {
          this.securityIssues.push({
            type: 'missing-validation',
            severity: 'high',
            file: path.relative(SRC_DIR, file),
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

    console.log(`  🔐 Scanned ${files.length} files, found ${authIssues} authentication issues`);
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
            file: path.relative(SRC_DIR, file),
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
            file: path.relative(SRC_DIR, file),
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
            file: path.relative(SRC_DIR, file),
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

    console.log(`  💾 Scanned ${files.length} files, found ${dataIssues} data handling issues`);
  }

  async scanNetworkSecurity() {
    console.log('🌐 Scanning network security...');

    const files = this.getAllTsFiles();
    let networkIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for insecure protocols
        if (content.includes('http://') && !content.includes('localhost') && !content.includes('127.0.0.1')) {
          this.securityIssues.push({
            type: 'insecure-protocol',
            severity: 'medium',
            file: path.relative(SRC_DIR, file),
            issue: 'Using insecure HTTP protocol',
            fix: 'Use HTTPS for all external communications'
          });
          networkIssues++;
        }

        // Check for missing SSL/TLS validation
        if (content.includes('rejectUnauthorized') && content.includes('false')) {
          this.securityIssues.push({
            type: 'ssl-validation-disabled',
            severity: 'high',
            file: path.relative(SRC_DIR, file),
            issue: 'SSL certificate validation disabled',
            fix: 'Enable SSL certificate validation'
          });
          networkIssues++;
        }

        // Check for CORS misconfiguration
        if (content.includes('cors') && content.includes('*')) {
          this.securityIssues.push({
            type: 'cors-misconfiguration',
            severity: 'medium',
            file: path.relative(SRC_DIR, file),
            issue: 'Overly permissive CORS configuration',
            fix: 'Restrict CORS origins to specific domains'
          });
          networkIssues++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.networkSecurity = {
      filesScanned: files.length,
      issuesFound: networkIssues
    };

    console.log(`  🌐 Scanned ${files.length} files, found ${networkIssues} network security issues`);
  }

  async scanCryptography() {
    console.log('🔐 Scanning cryptography usage...');

    const files = this.getAllTsFiles();
    let cryptoIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for weak cryptographic algorithms
        const weakCrypto = [
          'md5', 'sha1', 'des', '3des', 'rc4', 'blowfish'
        ];

        weakCrypto.forEach(algorithm => {
          if (content.toLowerCase().includes(algorithm)) {
            this.securityIssues.push({
              type: 'weak-crypto',
              severity: 'high',
              file: path.relative(SRC_DIR, file),
              issue: `Use of weak cryptographic algorithm: ${algorithm}`,
              fix: 'Use strong algorithms like AES-256, SHA-256, or argon2'
            });
            cryptoIssues++;
          }
        });

        // Check for insecure random number generation
        if (content.includes('Math.random()')) {
          this.securityIssues.push({
            type: 'insecure-random',
            severity: 'medium',
            file: path.relative(SRC_DIR, file),
            issue: 'Using Math.random() for security-sensitive operations',
            fix: 'Use crypto.randomBytes() or crypto.randomInt()'
          });
          cryptoIssues++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.cryptography = {
      filesScanned: files.length,
      issuesFound: cryptoIssues
    };

    console.log(`  🔐 Scanned ${files.length} files, found ${cryptoIssues} cryptography issues`);
  }

  async scanAccessControl() {
    console.log('🔑 Scanning access control...');

    const files = this.getAllTsFiles();
    let accessIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Check for missing authorization
        if (content.includes('req.user') && !content.includes('auth') && !content.includes('middleware')) {
          this.securityIssues.push({
            type: 'missing-authorization',
            severity: 'high',
            file: path.relative(SRC_DIR, file),
            issue: 'Using req.user without proper authorization middleware',
            fix: 'Implement proper authorization checks'
          });
          accessIssues++;
        }

        // Check for privilege escalation
        if (content.includes('admin') || content.includes('root') || content.includes('superuser')) {
          const context = this.getContext(content, content.indexOf('admin'), 5);
          if (!context.includes('check') && !context.includes('validate') && !context.includes('authorize')) {
            this.securityIssues.push({
              type: 'privilege-escalation-risk',
              severity: 'medium',
              file: path.relative(SRC_DIR, file),
              issue: 'Potential privilege escalation vulnerability',
              fix: 'Implement proper authorization and privilege checks'
            });
            accessIssues++;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.accessControl = {
      filesScanned: files.length,
      issuesFound: accessIssues
    };

    console.log(`  🔑 Scanned ${files.length} files, found ${accessIssues} access control issues`);
  }

  async scanCompliance() {
    console.log('📋 Scanning compliance requirements...');

    const complianceChecks = [
      {
        name: 'GDPR Compliance',
        check: (content) => content.includes('gdpr') || content.includes('data protection') || content.includes('privacy'),
        severity: 'medium'
      },
      {
        name: 'PCI DSS Compliance',
        check: (content) => content.includes('pci') || content.includes('payment') || content.includes('card'),
        severity: 'high'
      },
      {
        name: 'HIPAA Compliance',
        check: (content) => content.includes('hipaa') || content.includes('health') || content.includes('medical'),
        severity: 'high'
      },
      {
        name: 'SOX Compliance',
        check: (content) => content.includes('sox') || content.includes('financial') || content.includes('audit'),
        severity: 'medium'
      }
    ];

    const files = this.getAllTsFiles();
    let complianceIssues = 0;

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();

        complianceChecks.forEach(({ name, check, severity }) => {
          if (check(content)) {
            const context = this.getContext(content, content.indexOf(name.toLowerCase()), 3);
            if (!context.includes('compliance') && !context.includes('audit') && !context.includes('security')) {
              this.securityIssues.push({
                type: 'compliance-risk',
                severity,
                file: path.relative(SRC_DIR, file),
                issue: `Potential ${name} compliance requirement`,
                fix: `Implement ${name} compliance measures`,
                details: { complianceFramework: name }
              });
              complianceIssues++;
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    this.scanResults.compliance = {
      filesScanned: files.length,
      issuesFound: complianceIssues,
      frameworksChecked: complianceChecks.length
    };

    console.log(`  📋 Scanned ${files.length} files, found ${complianceIssues} compliance issues`);
  }

  generateSecurityReport() {
    const totalVulnerabilities = this.vulnerabilities.length;
    const criticalIssues = this.securityIssues.filter(i => i.severity === 'critical').length;
    const highIssues = this.securityIssues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.securityIssues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.securityIssues.filter(i => i.severity === 'low').length;

    this.scanResults.summary = {
      totalVulnerabilities,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      overallRisk: criticalIssues > 0 ? 'critical' : highIssues > 5 ? 'high' : mediumIssues > 10 ? 'medium' : 'low'
    };

    // Generate recommendations
    if (criticalIssues > 0) {
      this.recommendations.push({
        priority: 'urgent',
        message: `Address ${criticalIssues} critical security issues immediately`,
        action: 'Fix critical vulnerabilities before deployment'
      });
    }

    if (highIssues > 0) {
      this.recommendations.push({
        priority: 'high',
        message: `Address ${highIssues} high-severity security issues`,
        action: 'Fix high-severity vulnerabilities within 1 week'
      });
    }

    if (totalVulnerabilities > 20) {
      this.recommendations.push({
        priority: 'high',
        message: 'Multiple security issues detected',
        action: 'Implement systematic security review process'
      });
    }

    this.recommendations.push({
      priority: 'medium',
      message: 'Implement comprehensive security monitoring',
      action: 'Set up security scanning in CI/CD pipeline'
    });
  }

  printAdvancedReport() {
    console.log('\n🛡️ Advanced Security Scan Report');
    console.log('================================\n');

    const riskLevel = this.scanResults.summary.overallRisk.toUpperCase();

    console.log(`🔒 Security Risk Level: ${riskLevel}`);
    console.log(`🚨 Critical Issues: ${this.scanResults.summary.criticalIssues}`);
    console.log(`⚠️ High Issues: ${this.scanResults.summary.highIssues}`);
    console.log(`📋 Medium Issues: ${this.scanResults.summary.mediumIssues}`);
    console.log(`ℹ️ Low Issues: ${this.scanResults.summary.lowIssues}`);
    console.log(`📊 Total Issues: ${this.scanResults.summary.totalVulnerabilities}\n`);

    // Detailed results
    console.log('📊 Detailed Scan Results:');
    Object.entries(this.scanResults).forEach(([category, data]) => {
      if (category !== 'summary') {
        console.log(`  ${category}: ${data.issuesFound || data.totalVulnerabilities || 0} issues`);
      }
    });

    console.log('\n🚨 Critical Security Issues:');
    const criticalIssues = [...this.vulnerabilities, ...this.securityIssues.filter(i => i.severity === 'critical')];
    if (criticalIssues.length === 0) {
      console.log('  ✅ No critical security issues found');
    } else {
      criticalIssues.forEach((issue, index) => {
        console.log(`  🔴 ${index + 1}. ${issue.issue}`);
        console.log(`     📁 ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`     💡 ${issue.fix}`);
        if (issue.cve) console.log(`     🔗 CVE: ${issue.cve}`);
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

    console.log('\n🛠️ Security Tools:');
    console.log('  • npm audit - Dependency vulnerability scanning');
    console.log('  • eslint-plugin-security - Code security linting');
    console.log('  • snyk - Comprehensive security scanning');
    console.log('  • OWASP ZAP - Web application security testing');
    console.log('  • Burp Suite - Professional security testing');

    console.log('\n✅ Advanced security scan completed');
  }
}

// Run security scan if called directly
if (require.main === module) {
  const scanner = new AdvancedSecurityScanner();
  scanner.scanAll().catch(error => {
    console.error('❌ Advanced security scan failed:', error);
    process.exit(1);
  });
}

module.exports = AdvancedSecurityScanner;
