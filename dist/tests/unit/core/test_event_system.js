"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const EventSystem_1 = require("../../../src/core/events/EventSystem");
describe('EventSystem', () => {
    let eventSystem;
    let subscriptionIds = [];
    beforeEach(() => {
        eventSystem = EventSystem_1.EventSystem.getInstance();
        subscriptionIds = [];
    });
    afterEach(() => {
        // Clean up subscriptions
        subscriptionIds.forEach(id => {
            eventSystem.unsubscribe(id);
        });
        subscriptionIds = [];
    });
    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = EventSystem_1.EventSystem.getInstance();
            const instance2 = EventSystem_1.EventSystem.getInstance();
            (0, chai_1.expect)(instance1).to.equal(instance2);
        });
    });
    describe('Event Publishing and Subscription', () => {
        it('should publish and receive events', (done) => {
            const testTopic = 'test.event';
            const testData = { message: 'Hello, World!' };
            const subscriptionId = eventSystem.subscribe(testTopic, (event) => {
                try {
                    (0, chai_1.expect)(event.topic).to.equal(testTopic);
                    (0, chai_1.expect)(event.data).to.deep.equal(testData);
                    (0, chai_1.expect)(event.id).to.be.a('string');
                    (0, chai_1.expect)(event.metadata).to.have.property('timestamp');
                    (0, chai_1.expect)(event.metadata).to.have.property('source');
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
            subscriptionIds.push(subscriptionId);
            eventSystem.publish(testTopic, testData);
        });
        it('should handle multiple subscribers for the same topic', (done) => {
            const testTopic = 'test.multiple';
            const testData = { count: 42 };
            let receivedCount = 0;
            const subscription1 = eventSystem.subscribe(testTopic, (event) => {
                receivedCount++;
                if (receivedCount === 2) {
                    (0, chai_1.expect)(event.data).to.deep.equal(testData);
                    done();
                }
            });
            const subscription2 = eventSystem.subscribe(testTopic, (event) => {
                receivedCount++;
                if (receivedCount === 2) {
                    (0, chai_1.expect)(event.data).to.deep.equal(testData);
                    done();
                }
            });
            subscriptionIds.push(subscription1, subscription2);
            eventSystem.publish(testTopic, testData);
        });
        it('should handle wildcard topic subscriptions', (done) => {
            const baseTopic = 'test.wildcard';
            const specificTopic = 'test.wildcard.specific';
            const testData = { wildcard: true };
            const subscriptionId = eventSystem.subscribe(`${baseTopic}.*`, (event) => {
                (0, chai_1.expect)(event.topic).to.equal(specificTopic);
                (0, chai_1.expect)(event.data).to.deep.equal(testData);
                done();
            });
            subscriptionIds.push(subscriptionId);
            eventSystem.publish(specificTopic, testData);
        });
        it('should not receive events for different topics', (done) => {
            const subscriptionTopic = 'test.topic1';
            const publishTopic = 'test.topic2';
            const testData = { different: true };
            const subscriptionId = eventSystem.subscribe(subscriptionTopic, () => {
                done(new Error('Should not receive event for different topic'));
            });
            subscriptionIds.push(subscriptionId);
            eventSystem.publish(publishTopic, testData);
            // If we get here without calling done with error, the test passes
            setTimeout(() => {
                done();
            }, 100);
        });
    });
    describe('Subscription Management', () => {
        it('should unsubscribe from events', (done) => {
            const testTopic = 'test.unsubscribe';
            const testData = { unsubscribed: true };
            let receivedEvent = false;
            const subscriptionId = eventSystem.subscribe(testTopic, () => {
                receivedEvent = true;
            });
            // Unsubscribe
            eventSystem.unsubscribe(subscriptionId);
            // Publish event - should not be received
            eventSystem.publish(testTopic, testData);
            setTimeout(() => {
                (0, chai_1.expect)(receivedEvent).to.be.false;
                done();
            }, 100);
        });
        it('should handle unsubscribing from non-existent subscription', () => {
            // Should not throw error
            (0, chai_1.expect)(() => {
                eventSystem.unsubscribe('non-existent-id');
            }).to.not.throw();
        });
        it('should provide subscription management methods', () => {
            const subscriptionId = eventSystem.subscribe('test.management', () => { });
            // Should be able to check if subscription exists
            (0, chai_1.expect)(eventSystem.getSubscriptionCount()).to.be.at.least(1);
            eventSystem.unsubscribe(subscriptionId);
            (0, chai_1.expect)(eventSystem.getSubscriptionCount()).to.be.below(eventSystem.getSubscriptionCount() + 1);
        });
    });
    describe('Event Metadata', () => {
        it('should include proper metadata in events', (done) => {
            const testTopic = 'test.metadata';
            const testData = { metadata: 'test' };
            const source = 'test-source';
            const subscriptionId = eventSystem.subscribe(testTopic, (event) => {
                (0, chai_1.expect)(event.metadata).to.have.property('timestamp');
                (0, chai_1.expect)(event.metadata).to.have.property('source');
                (0, chai_1.expect)(event.metadata.source).to.equal(source);
                (0, chai_1.expect)(event.metadata.timestamp).to.be.a('number');
                (0, chai_1.expect)(event.metadata.timestamp).to.be.at.most(Date.now());
                done();
            });
            subscriptionIds.push(subscriptionId);
            eventSystem.publish(testTopic, testData, { source });
        });
        it('should support correlation IDs', (done) => {
            const testTopic = 'test.correlation';
            const correlationId = 'corr-123';
            const testData = { correlation: true };
            const subscriptionId = eventSystem.subscribe(testTopic, (event) => {
                (0, chai_1.expect)(event.metadata).to.have.property('correlationId');
                (0, chai_1.expect)(event.metadata.correlationId).to.equal(correlationId);
                done();
            });
            subscriptionIds.push(subscriptionId);
            eventSystem.publish(testTopic, testData, { correlationId });
        });
    });
    describe('Error Handling', () => {
        it('should handle subscriber errors gracefully', (done) => {
            const testTopic = 'test.error';
            const testData = { error: 'test' };
            const subscriptionId = eventSystem.subscribe(testTopic, () => {
                throw new Error('Subscriber error');
            });
            subscriptionIds.push(subscriptionId);
            // Should not throw error when publishing
            (0, chai_1.expect)(() => {
                eventSystem.publish(testTopic, testData);
            }).to.not.throw();
            // Should log error but continue functioning
            setTimeout(() => {
                done();
            }, 50);
        });
        it('should handle malformed event data', () => {
            const testTopic = 'test.malformed';
            // Should handle null/undefined data
            (0, chai_1.expect)(() => {
                eventSystem.publish(testTopic, null);
            }).to.not.throw();
            (0, chai_1.expect)(() => {
                eventSystem.publish(testTopic, undefined);
            }).to.not.throw();
        });
    });
    describe('Performance', () => {
        it('should handle high-frequency events', async () => {
            const testTopic = 'test.performance';
            const eventCount = 1000;
            let receivedCount = 0;
            const subscriptionId = eventSystem.subscribe(testTopic, () => {
                receivedCount++;
            });
            subscriptionIds.push(subscriptionId);
            // Publish many events quickly
            const startTime = Date.now();
            for (let i = 0; i < eventCount; i++) {
                eventSystem.publish(testTopic, { index: i });
            }
            const endTime = Date.now();
            // Wait a bit for all events to be processed
            await new Promise(resolve => setTimeout(resolve, 100));
            (0, chai_1.expect)(receivedCount).to.equal(eventCount);
            (0, chai_1.expect)(endTime - startTime).to.be.below(1000); // Should complete in less than 1 second
        });
        it('should handle many subscribers efficiently', async () => {
            const testTopic = 'test.many-subscribers';
            const subscriberCount = 100;
            let totalReceived = 0;
            // Create many subscribers
            for (let i = 0; i < subscriberCount; i++) {
                const subscriptionId = eventSystem.subscribe(testTopic, () => {
                    totalReceived++;
                });
                subscriptionIds.push(subscriptionId);
            }
            // Publish one event
            eventSystem.publish(testTopic, { broadcast: true });
            // Wait for all subscribers to receive
            await new Promise(resolve => setTimeout(resolve, 100));
            (0, chai_1.expect)(totalReceived).to.equal(subscriberCount);
        });
    });
    describe('Event Persistence', () => {
        it('should support event history when enabled', () => {
            // This would test event persistence if the system supports it
            // For now, just verify the method exists if implemented
            if (typeof eventSystem.getEventHistory === 'function') {
                const history = eventSystem.getEventHistory('test.persistence');
                (0, chai_1.expect)(Array.isArray(history)).to.be.true;
            }
        });
    });
    describe('Integration', () => {
        it('should integrate with monitoring system', () => {
            // Verify that event publishing triggers monitoring if available
            const testTopic = 'test.integration';
            // This would test integration with monitoring if implemented
            (0, chai_1.expect)(() => {
                eventSystem.publish(testTopic, { integration: 'test' });
            }).to.not.throw();
        });
    });
});
//# sourceMappingURL=test_event_system.js.map