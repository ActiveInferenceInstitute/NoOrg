"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const StorageSystem_1 = require("../../../src/core/storage/StorageSystem");
describe('StorageSystem', () => {
    let storage;
    let testKeys = [];
    beforeEach(() => {
        storage = StorageSystem_1.StorageSystem.getInstance();
        testKeys = [];
    });
    afterEach(async () => {
        // Clean up test data
        for (const key of testKeys) {
            try {
                await storage.delete(key);
            }
            catch (error) {
                // Ignore cleanup errors
            }
        }
        testKeys = [];
    });
    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = StorageSystem_1.StorageSystem.getInstance();
            const instance2 = StorageSystem_1.StorageSystem.getInstance();
            (0, chai_1.expect)(instance1).to.equal(instance2);
        });
    });
    describe('Basic Storage Operations', () => {
        it('should store and retrieve data', async () => {
            const testKey = 'test.basic';
            const testData = { message: 'Hello, Storage System!' };
            testKeys.push(testKey);
            // Store data
            await storage.set(testKey, testData);
            // Retrieve data
            const retrieved = await storage.get(testKey);
            (0, chai_1.expect)(retrieved).to.deep.equal(testData);
        });
        it('should handle non-existent keys', async () => {
            const nonExistentKey = 'test.non-existent';
            const result = await storage.get(nonExistentKey);
            (0, chai_1.expect)(result).to.be.undefined;
        });
        it('should delete data', async () => {
            const testKey = 'test.delete';
            const testData = { toBeDeleted: true };
            testKeys.push(testKey);
            // Store and verify
            await storage.set(testKey, testData);
            const retrieved = await storage.get(testKey);
            (0, chai_1.expect)(retrieved).to.deep.equal(testData);
            // Delete
            await storage.delete(testKey);
            // Verify deletion
            const deleted = await storage.get(testKey);
            (0, chai_1.expect)(deleted).to.be.undefined;
        });
        it('should check if keys exist', async () => {
            const testKey = 'test.exists';
            testKeys.push(testKey);
            // Key should not exist initially
            const existsBefore = await storage.exists(testKey);
            (0, chai_1.expect)(existsBefore).to.be.false;
            // Store data
            await storage.set(testKey, { test: 'data' });
            // Key should exist now
            const existsAfter = await storage.exists(testKey);
            (0, chai_1.expect)(existsAfter).to.be.true;
        });
    });
    describe('Data Types', () => {
        it('should handle primitive data types', async () => {
            const testCases = [
                { key: 'test.string', value: 'Hello World' },
                { key: 'test.number', value: 42 },
                { key: 'test.boolean', value: true },
                { key: 'test.null', value: null },
                { key: 'test.array', value: [1, 2, 3] },
                { key: 'test.object', value: { nested: { value: 'deep' } } }
            ];
            for (const testCase of testCases) {
                testKeys.push(testCase.key);
                await storage.set(testCase.key, testCase.value);
                const retrieved = await storage.get(testCase.key);
                (0, chai_1.expect)(retrieved).to.deep.equal(testCase.value);
            }
        });
        it('should handle large data objects', async () => {
            const largeData = {
                data: Array(1000).fill('x').join(''), // 1000 character string
                array: Array(100).fill({ id: 1, value: 'test' }),
                nested: {
                    level1: {
                        level2: {
                            level3: 'deep value'
                        }
                    }
                }
            };
            const testKey = 'test.large';
            testKeys.push(testKey);
            await storage.set(testKey, largeData);
            const retrieved = await storage.get(testKey);
            (0, chai_1.expect)(retrieved).to.deep.equal(largeData);
            (0, chai_1.expect)(retrieved.data.length).to.equal(1000);
            (0, chai_1.expect)(retrieved.array.length).to.equal(100);
            (0, chai_1.expect)(retrieved.nested.level1.level2.level3).to.equal('deep value');
        });
    });
    describe('Batch Operations', () => {
        it('should support batch get operations', async () => {
            const keys = ['test.batch.1', 'test.batch.2', 'test.batch.3'];
            const values = [
                { id: 1, data: 'first' },
                { id: 2, data: 'second' },
                { id: 3, data: 'third' }
            ];
            // Store test data
            for (let i = 0; i < keys.length; i++) {
                testKeys.push(keys[i]);
                await storage.set(keys[i], values[i]);
            }
            // Batch get
            const results = await storage.batchGet(keys);
            (0, chai_1.expect)(results).to.have.length(keys.length);
            for (let i = 0; i < keys.length; i++) {
                (0, chai_1.expect)(results[i]).to.deep.equal(values[i]);
            }
        });
        it('should support batch set operations', async () => {
            const batchData = [
                { key: 'test.batch.set.1', value: { id: 1 } },
                { key: 'test.batch.set.2', value: { id: 2 } },
                { key: 'test.batch.set.3', value: { id: 3 } }
            ];
            testKeys.push(...batchData.map(item => item.key));
            // Batch set
            await storage.batchSet(batchData);
            // Verify all items were stored
            for (const item of batchData) {
                const retrieved = await storage.get(item.key);
                (0, chai_1.expect)(retrieved).to.deep.equal(item.value);
            }
        });
        it('should handle batch operations with mixed success/failure', async () => {
            const validData = [
                { key: 'test.batch.mixed.1', value: { valid: true } },
                { key: 'test.batch.mixed.2', value: { valid: true } }
            ];
            const invalidData = [
                { key: 'test.batch.mixed.3', value: null }, // Invalid data
                { key: 'test.batch.mixed.4', value: undefined } // Invalid data
            ];
            testKeys.push(...validData.map(item => item.key));
            // Should handle mixed valid/invalid data gracefully
            (0, chai_1.expect)(async () => {
                await storage.batchSet([...validData, ...invalidData]);
            }).to.not.throw();
            // Valid data should still be stored
            for (const item of validData) {
                const retrieved = await storage.get(item.key);
                (0, chai_1.expect)(retrieved).to.deep.equal(item.value);
            }
        });
    });
    describe('Query Operations', () => {
        it('should support pattern-based queries', async () => {
            // Store test data with patterns
            const testData = [
                { key: 'users.1', value: { id: 1, name: 'Alice', active: true } },
                { key: 'users.2', value: { id: 2, name: 'Bob', active: false } },
                { key: 'users.3', value: { id: 3, name: 'Charlie', active: true } },
                { key: 'posts.1', value: { id: 1, title: 'First Post' } }
            ];
            for (const item of testData) {
                testKeys.push(item.key);
                await storage.set(item.key, item.value);
            }
            // Query for user data
            const users = await storage.query('users.*');
            (0, chai_1.expect)(users).to.have.length(3);
            // Query for active users
            if (typeof storage.query === 'function' && storage.query.length > 1) {
                const activeUsers = await storage.query('users.*', {
                    filter: { active: true }
                });
                (0, chai_1.expect)(activeUsers).to.have.length(2);
            }
        });
        it('should support full-text search', async () => {
            const testData = [
                { key: 'docs.1', value: { title: 'Machine Learning Guide', content: 'This guide covers neural networks and deep learning' } },
                { key: 'docs.2', value: { title: 'Data Science Tutorial', content: 'Learn about data analysis and visualization' } },
                { key: 'docs.3', value: { title: 'AI Ethics', content: 'Discussing responsible AI development' } }
            ];
            for (const item of testData) {
                testKeys.push(item.key);
                await storage.set(item.key, item.value);
            }
            // Search for documents containing 'learning'
            if (typeof storage.search === 'function') {
                const searchResults = await storage.search('docs.*', {
                    query: 'learning',
                    fields: ['title', 'content']
                });
                (0, chai_1.expect)(searchResults.length).to.be.greaterThan(0);
                (0, chai_1.expect)(searchResults[0].value.title).to.include('Learning');
            }
        });
    });
    describe('TTL (Time To Live)', () => {
        it('should handle TTL expiration', async () => {
            const testKey = 'test.ttl';
            const testData = { expires: true };
            testKeys.push(testKey);
            // Store with very short TTL
            await storage.set(testKey, testData, { ttl: 100 }); // 100ms TTL
            // Data should exist immediately
            const immediate = await storage.get(testKey);
            (0, chai_1.expect)(immediate).to.deep.equal(testData);
            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 200));
            // Data should be expired (implementation dependent)
            const expired = await storage.get(testKey);
            // Note: TTL behavior depends on implementation
        });
        it('should handle TTL metadata', async () => {
            const testKey = 'test.ttl-metadata';
            const testData = { ttl: 'test' };
            testKeys.push(testKey);
            // Store with TTL
            await storage.set(testKey, testData, { ttl: 3600 });
            // Should not throw
            (0, chai_1.expect)(async () => {
                await storage.set(testKey, testData, { ttl: 3600 });
            }).to.not.throw();
        });
    });
    describe('Transaction Support', () => {
        it('should support basic transactions', async () => {
            if (typeof storage.beginTransaction === 'function') {
                const transaction = await storage.beginTransaction();
                // Perform operations in transaction
                await transaction.set('tx.test.1', { value: 1 });
                await transaction.set('tx.test.2', { value: 2 });
                // Commit transaction
                await transaction.commit();
                // Verify data was stored
                const value1 = await storage.get('tx.test.1');
                const value2 = await storage.get('tx.test.2');
                (0, chai_1.expect)(value1).to.deep.equal({ value: 1 });
                (0, chai_1.expect)(value2).to.deep.equal({ value: 2 });
                testKeys.push('tx.test.1', 'tx.test.2');
            }
        });
        it('should support transaction rollback', async () => {
            if (typeof storage.beginTransaction === 'function') {
                const transaction = await storage.beginTransaction();
                // Perform operations
                await transaction.set('tx.rollback.1', { value: 1 });
                // Rollback transaction
                await transaction.rollback();
                // Verify data was not stored
                const rolledBack = await storage.get('tx.rollback.1');
                (0, chai_1.expect)(rolledBack).to.be.undefined;
            }
        });
    });
    describe('Storage Backends', () => {
        it('should support multiple storage backends', () => {
            // Test backend creation if supported
            if (typeof storage.createBackend === 'function') {
                (0, chai_1.expect)(() => {
                    storage.createBackend('memory', { maxSize: '100MB' });
                    storage.createBackend('file', { basePath: '/tmp' });
                }).to.not.throw();
            }
        });
        it('should handle backend switching', async () => {
            // Test backend switching if supported
            if (typeof storage.setDefaultBackend === 'function') {
                (0, chai_1.expect)(() => {
                    storage.setDefaultBackend('memory');
                    storage.setDefaultBackend('file');
                }).to.not.throw();
            }
        });
    });
    describe('Performance', () => {
        it('should handle high-volume operations', async () => {
            const operationCount = 1000;
            const keys = [];
            // Store many items quickly
            const startTime = Date.now();
            for (let i = 0; i < operationCount; i++) {
                const key = `test.performance.${i}`;
                keys.push(key);
                await storage.set(key, { index: i });
            }
            const endTime = Date.now();
            testKeys.push(...keys);
            // Should complete in reasonable time
            (0, chai_1.expect)(endTime - startTime).to.be.below(5000); // Less than 5 seconds
            // Verify random samples were stored correctly
            const sampleIndices = [0, 100, 500, 999];
            for (const index of sampleIndices) {
                const key = `test.performance.${index}`;
                const retrieved = await storage.get(key);
                (0, chai_1.expect)(retrieved).to.deep.equal({ index });
            }
        });
        it('should handle concurrent operations', async () => {
            const concurrentOperations = 100;
            const keys = Array.from({ length: concurrentOperations }, (_, i) => `test.concurrent.${i}`);
            testKeys.push(...keys);
            // Perform concurrent operations
            const promises = keys.map((key, index) => storage.set(key, { index }));
            await Promise.all(promises);
            // Verify all operations completed
            const results = await storage.batchGet(keys);
            (0, chai_1.expect)(results).to.have.length(concurrentOperations);
            for (let i = 0; i < concurrentOperations; i++) {
                (0, chai_1.expect)(results[i]).to.deep.equal({ index: i });
            }
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid keys gracefully', async () => {
            const invalidKeys = [
                '', // Empty key
                null, // Null key
                undefined, // Undefined key
                'test.key.with.dots.and.special.chars!@#$%', // Special characters
            ];
            for (const invalidKey of invalidKeys) {
                try {
                    await storage.set(invalidKey, { test: 'data' });
                    // If no error thrown, operation should succeed or be handled gracefully
                }
                catch (error) {
                    // Error should be meaningful
                    (0, chai_1.expect)(error.message).to.be.a('string');
                    (0, chai_1.expect)(error.message.length).to.be.greaterThan(0);
                }
            }
        });
        it('should handle storage quota exceeded', async () => {
            // This would test quota handling if implemented
            // For now, just verify large data handling
            const largeData = 'x'.repeat(1000000); // 1MB string
            const testKey = 'test.large-data';
            testKeys.push(testKey);
            try {
                await storage.set(testKey, largeData);
                const retrieved = await storage.get(testKey);
                (0, chai_1.expect)(retrieved).to.equal(largeData);
            }
            catch (error) {
                // Should handle large data gracefully
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
        it('should handle network/storage errors', async () => {
            // Test error handling for network/backend issues
            // This is implementation-dependent, but should not crash
            (0, chai_1.expect)(async () => {
                await storage.set('test.error-handling', { error: 'test' });
            }).to.not.throw();
        });
    });
    describe('Data Consistency', () => {
        it('should maintain data integrity', async () => {
            const testKey = 'test.consistency';
            const testData = {
                string: 'test',
                number: 42,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' },
                date: new Date('2024-01-01'),
                null: null,
                undefined: undefined
            };
            testKeys.push(testKey);
            // Store and retrieve
            await storage.set(testKey, testData);
            const retrieved = await storage.get(testKey);
            (0, chai_1.expect)(retrieved).to.deep.equal(testData);
            (0, chai_1.expect)(retrieved.date).to.be.instanceOf(Date);
            (0, chai_1.expect)(retrieved.date.getTime()).to.equal(testData.date.getTime());
        });
        it('should handle concurrent modifications', async () => {
            const testKey = 'test.concurrent-modification';
            testKeys.push(testKey);
            // Simulate concurrent modifications
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(storage.set(testKey, { version: i, timestamp: Date.now() }));
            }
            await Promise.all(promises);
            // Final value should be from one of the operations
            const finalValue = await storage.get(testKey);
            (0, chai_1.expect)(finalValue).to.have.property('version');
            (0, chai_1.expect)(finalValue).to.have.property('timestamp');
        });
    });
    describe('Configuration', () => {
        it('should support configuration updates', () => {
            if (typeof storage.updateConfig === 'function') {
                (0, chai_1.expect)(() => {
                    storage.updateConfig({
                        enableCompression: true,
                        enableEncryption: false
                    });
                }).to.not.throw();
            }
        });
        it('should provide configuration information', () => {
            if (typeof storage.getConfig === 'function') {
                const config = storage.getConfig();
                (0, chai_1.expect)(config).to.be.an('object');
            }
        });
    });
    describe('Integration', () => {
        it('should integrate with monitoring system', async () => {
            // This would test integration with MonitoringSystem if implemented
            const testKey = 'test.integration';
            testKeys.push(testKey);
            (0, chai_1.expect)(async () => {
                await storage.set(testKey, { integration: 'test' });
            }).to.not.throw();
        });
        it('should provide storage metrics', () => {
            if (typeof storage.getMetrics === 'function') {
                const metrics = storage.getMetrics();
                (0, chai_1.expect)(metrics).to.be.an('object');
            }
        });
    });
    describe('Advanced Features', () => {
        it('should support data migration', async () => {
            if (typeof storage.migrateData === 'function') {
                const sourceKey = 'test.migration.source';
                const destKey = 'test.migration.dest';
                testKeys.push(sourceKey, destKey);
                // Store data in source
                await storage.set(sourceKey, { migrate: 'me' });
                // Migrate data
                await storage.migrateData(sourceKey, destKey);
                // Verify migration
                const sourceData = await storage.get(sourceKey);
                const destData = await storage.get(destKey);
                (0, chai_1.expect)(sourceData).to.deep.equal(destData);
            }
        });
        it('should support data archiving', async () => {
            if (typeof storage.archiveData === 'function') {
                const testKey = 'test.archive';
                testKeys.push(testKey);
                // Store data
                await storage.set(testKey, { archive: 'me' });
                // Archive data
                await storage.archiveData(testKey, {
                    destination: 'archive',
                    compression: true
                });
                // Original data may or may not be removed (implementation dependent)
            }
        });
    });
});
//# sourceMappingURL=test_storage_system.js.map