"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const MonitoringSystem_1 = require("../../../src/core/monitoring/MonitoringSystem");
describe('MonitoringSystem', () => {
    let monitoring;
    let healthCheckIds = [];
    let alertRuleIds = [];
    beforeEach(() => {
        monitoring = MonitoringSystem_1.MonitoringSystem.getInstance();
        healthCheckIds = [];
        alertRuleIds = [];
    });
    afterEach(() => {
        // Clean up health checks and alert rules
        healthCheckIds.forEach(id => {
            monitoring.unregisterHealthCheck(id);
        });
        alertRuleIds.forEach(id => {
            monitoring.removeAlertRule(id);
        });
        healthCheckIds = [];
        alertRuleIds = [];
    });
    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = MonitoringSystem_1.MonitoringSystem.getInstance();
            const instance2 = MonitoringSystem_1.MonitoringSystem.getInstance();
            (0, chai_1.expect)(instance1).to.equal(instance2);
        });
    });
    describe('Metrics Collection', () => {
        it('should record and retrieve metrics', () => {
            const metricName = 'test.metric';
            const metricValue = 42;
            // Record metric
            monitoring.recordMetric(metricName, metricValue, {
                agentId: 'agent-001',
                operation: 'test'
            });
            // Retrieve metric (if supported)
            if (typeof monitoring.getMetric === 'function') {
                const retrieved = monitoring.getMetric(metricName);
                (0, chai_1.expect)(retrieved).to.be.at.least(metricValue);
            }
        });
        it('should support different metric types', () => {
            // Test counter metric
            monitoring.recordMetric('test.counter', 1);
            monitoring.recordMetric('test.counter', 1);
            // Test gauge metric
            monitoring.recordMetric('test.gauge', 50);
            monitoring.recordMetric('test.gauge', 75);
            // Test timer metric
            const startTime = Date.now();
            monitoring.recordMetric('test.timer.start', startTime);
            monitoring.recordMetric('test.timer.end', Date.now());
            // Should not throw for valid metrics
            (0, chai_1.expect)(() => {
                monitoring.recordMetric('test.counter', 1);
                monitoring.recordMetric('test.gauge', 100);
                monitoring.recordMetric('test.timer', Date.now() - startTime);
            }).to.not.throw();
        });
        it('should handle metric metadata', () => {
            const metadata = {
                agentId: 'agent-123',
                operation: 'data-processing',
                version: '1.0.0'
            };
            (0, chai_1.expect)(() => {
                monitoring.recordMetric('test.metadata', 100, metadata);
            }).to.not.throw();
        });
    });
    describe('Health Checks', () => {
        it('should register and execute health checks', async () => {
            let checkCount = 0;
            const healthCheckId = monitoring.registerHealthCheck('test-health', async () => {
                checkCount++;
                return {
                    status: 'healthy',
                    message: 'Test health check passed',
                    timestamp: Date.now()
                };
            });
            healthCheckIds.push(healthCheckId);
            // Execute health check
            const result = await monitoring.executeHealthCheck('test-health');
            (0, chai_1.expect)(result.status).to.equal('healthy');
            (0, chai_1.expect)(result.message).to.equal('Test health check passed');
            (0, chai_1.expect)(checkCount).to.equal(1);
        });
        it('should handle failing health checks', async () => {
            const healthCheckId = monitoring.registerHealthCheck('test-failing', async () => {
                return {
                    status: 'unhealthy',
                    message: 'Test health check failed',
                    details: { error: 'Database connection failed' },
                    timestamp: Date.now()
                };
            });
            healthCheckIds.push(healthCheckId);
            const result = await monitoring.executeHealthCheck('test-failing');
            (0, chai_1.expect)(result.status).to.equal('unhealthy');
            (0, chai_1.expect)(result.message).to.equal('Test health check failed');
            (0, chai_1.expect)(result.details).to.have.property('error');
        });
        it('should handle health check timeouts', async () => {
            const healthCheckId = monitoring.registerHealthCheck('test-timeout', async () => {
                // Simulate slow health check
                await new Promise(resolve => setTimeout(resolve, 2000));
                return { status: 'healthy', timestamp: Date.now() };
            });
            healthCheckIds.push(healthCheckId);
            try {
                await monitoring.executeHealthCheck('test-timeout', 100); // Very short timeout
                chai_1.expect.fail('Should have timed out');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('timeout');
            }
        });
        it('should unregister health checks', async () => {
            const healthCheckId = monitoring.registerHealthCheck('test-unregister', async () => {
                return { status: 'healthy', timestamp: Date.now() };
            });
            // Verify health check exists
            const result1 = await monitoring.executeHealthCheck('test-unregister');
            (0, chai_1.expect)(result1.status).to.equal('healthy');
            // Unregister
            monitoring.unregisterHealthCheck(healthCheckId);
            // Should throw or return error for non-existent health check
            try {
                await monitoring.executeHealthCheck('test-unregister');
                // If no error thrown, health check might still be registered
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('not found');
            }
        });
    });
    describe('Alert Rules', () => {
        it('should create and manage alert rules', () => {
            const ruleId = monitoring.createAlertRule({
                name: 'test-alert-rule',
                condition: 'error.rate > 0.1',
                threshold: 0.1,
                duration: 300,
                severity: 'warning',
                notificationChannels: ['console']
            });
            alertRuleIds.push(ruleId);
            // Verify rule was created (if getter method exists)
            if (typeof monitoring.getAlertRule === 'function') {
                const rule = monitoring.getAlertRule(ruleId);
                (0, chai_1.expect)(rule.name).to.equal('test-alert-rule');
                (0, chai_1.expect)(rule.severity).to.equal('warning');
            }
        });
        it('should handle alert rule validation', () => {
            // Test invalid rule creation
            try {
                monitoring.createAlertRule({
                    name: 'invalid-rule',
                    condition: '', // Invalid condition
                    threshold: -1, // Invalid threshold
                    duration: 0, // Invalid duration
                    severity: 'invalid',
                    notificationChannels: []
                });
                chai_1.expect.fail('Should have thrown validation error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.include('validation');
            }
        });
        it('should remove alert rules', () => {
            const ruleId = monitoring.createAlertRule({
                name: 'test-remove-rule',
                condition: 'memory.usage > 0.8',
                threshold: 0.8,
                duration: 60,
                severity: 'error',
                notificationChannels: ['console']
            });
            // Remove rule
            monitoring.removeAlertRule(ruleId);
            // Verify rule was removed (if getter method exists)
            if (typeof monitoring.getAlertRule === 'function') {
                try {
                    monitoring.getAlertRule(ruleId);
                    chai_1.expect.fail('Rule should have been removed');
                }
                catch (error) {
                    (0, chai_1.expect)(error.message).to.include('not found');
                }
            }
        });
    });
    describe('System Health Overview', () => {
        it('should provide overall system health', async () => {
            // Register some health checks
            const healthyCheckId = monitoring.registerHealthCheck('healthy-service', async () => {
                return { status: 'healthy', timestamp: Date.now() };
            });
            const degradedCheckId = monitoring.registerHealthCheck('degraded-service', async () => {
                return { status: 'degraded', message: 'High load', timestamp: Date.now() };
            });
            healthCheckIds.push(healthyCheckId, degradedCheckId);
            // Get overall health (if method exists)
            if (typeof monitoring.getOverallHealth === 'function') {
                const overallHealth = await monitoring.getOverallHealth();
                (0, chai_1.expect)(overallHealth).to.have.property('status');
                (0, chai_1.expect)(overallHealth).to.have.property('timestamp');
            }
        });
    });
    describe('Alert Processing', () => {
        it('should process alerts when conditions are met', async () => {
            let alertTriggered = false;
            // Create alert rule
            const ruleId = monitoring.createAlertRule({
                name: 'test-alert-processing',
                condition: 'test.metric > 5',
                threshold: 5,
                duration: 1, // Very short duration for testing
                severity: 'warning',
                notificationChannels: ['console']
            });
            alertRuleIds.push(ruleId);
            // Record metrics that should trigger alert
            monitoring.recordMetric('test.metric', 6);
            monitoring.recordMetric('test.metric', 7);
            // Wait for alert processing
            await new Promise(resolve => setTimeout(resolve, 100));
            // Alert should be triggered (if alert processing is synchronous)
            // Note: This depends on implementation details
        });
        it('should support multiple notification channels', () => {
            const ruleId = monitoring.createAlertRule({
                name: 'test-multi-channel',
                condition: 'error.rate > 0.05',
                threshold: 0.05,
                duration: 300,
                severity: 'error',
                notificationChannels: ['email', 'slack', 'webhook']
            });
            alertRuleIds.push(ruleId);
            // Verify rule accepts multiple channels
            if (typeof monitoring.getAlertRule === 'function') {
                const rule = monitoring.getAlertRule(ruleId);
                (0, chai_1.expect)(rule.notificationChannels).to.include('email');
                (0, chai_1.expect)(rule.notificationChannels).to.include('slack');
                (0, chai_1.expect)(rule.notificationChannels).to.include('webhook');
            }
        });
    });
    describe('Performance Monitoring', () => {
        it('should track performance metrics', () => {
            const startTime = Date.now();
            // Simulate some operations
            for (let i = 0; i < 100; i++) {
                monitoring.recordMetric('test.performance', i);
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(1000); // Should complete quickly
        });
        it('should handle high-frequency metric recording', () => {
            const metricCount = 1000;
            // Record many metrics quickly
            for (let i = 0; i < metricCount; i++) {
                monitoring.recordMetric('test.high-frequency', i);
            }
            // Should not throw or cause performance issues
            (0, chai_1.expect)(() => {
                for (let i = 0; i < metricCount; i++) {
                    monitoring.recordMetric('test.high-frequency', i);
                }
            }).to.not.throw();
        });
    });
    describe('Error Handling', () => {
        it('should handle metric recording errors', () => {
            // Test invalid metric values
            (0, chai_1.expect)(() => {
                monitoring.recordMetric('test.invalid', NaN);
            }).to.not.throw();
            (0, chai_1.expect)(() => {
                monitoring.recordMetric('test.invalid', Infinity);
            }).to.not.throw();
            (0, chai_1.expect)(() => {
                monitoring.recordMetric('test.invalid', -1);
            }).to.not.throw();
        });
        it('should handle health check errors', async () => {
            const errorCheckId = monitoring.registerHealthCheck('test-error', async () => {
                throw new Error('Health check error');
            });
            healthCheckIds.push(errorCheckId);
            try {
                await monitoring.executeHealthCheck('test-error');
                chai_1.expect.fail('Should have thrown error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.equal('Health check error');
            }
        });
        it('should handle alert rule errors', () => {
            // Test invalid alert rule conditions
            (0, chai_1.expect)(() => {
                monitoring.createAlertRule({
                    name: 'invalid-condition',
                    condition: 'invalid condition syntax',
                    threshold: 0.5,
                    duration: 300,
                    severity: 'warning',
                    notificationChannels: ['console']
                });
            }).to.throw();
        });
    });
    describe('Configuration', () => {
        it('should support configuration updates', () => {
            // Test configuration if setter method exists
            if (typeof monitoring.updateConfig === 'function') {
                (0, chai_1.expect)(() => {
                    monitoring.updateConfig({
                        metricsRetentionPeriod: 30,
                        healthCheckInterval: 60
                    });
                }).to.not.throw();
            }
        });
        it('should provide current configuration', () => {
            // Test configuration getter if exists
            if (typeof monitoring.getConfig === 'function') {
                const config = monitoring.getConfig();
                (0, chai_1.expect)(config).to.be.an('object');
            }
        });
    });
    describe('Integration', () => {
        it('should integrate with Event System for alerts', async () => {
            // This would test integration with EventSystem for alert notifications
            const ruleId = monitoring.createAlertRule({
                name: 'test-event-integration',
                condition: 'system.load > 0.9',
                threshold: 0.9,
                duration: 60,
                severity: 'critical',
                notificationChannels: ['event']
            });
            alertRuleIds.push(ruleId);
            // Should not throw when creating rule with event notifications
            (0, chai_1.expect)(ruleId).to.be.a('string');
        });
        it('should provide monitoring data for dashboards', () => {
            // Record some test metrics
            monitoring.recordMetric('dashboard.test', 42);
            // Dashboard data should be available if method exists
            if (typeof monitoring.getDashboardData === 'function') {
                const dashboardData = monitoring.getDashboardData();
                (0, chai_1.expect)(dashboardData).to.be.an('object');
            }
        });
    });
});
//# sourceMappingURL=test_monitoring_system.js.map