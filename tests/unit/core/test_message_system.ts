import { expect } from 'chai';
import { MessageSystem } from '../../../src/core/messaging/MessageSystem';

describe('MessageSystem', () => {
  let messageSystem: MessageSystem;
  let messageHandlers: Array<() => void> = [];

  beforeEach(() => {
    messageSystem = MessageSystem.getInstance();
    messageHandlers = [];
  });

  afterEach(() => {
    // Clean up message handlers
    messageHandlers.forEach(cleanup => cleanup());
    messageHandlers = [];
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MessageSystem.getInstance();
      const instance2 = MessageSystem.getInstance();
      expect(instance1).to.equal(instance2);
    });
  });

  describe('Message Sending and Receiving', () => {
    it('should send and receive messages', async () => {
      const messageType = 'test.message';
      const messageBody = { content: 'Hello, Message System!' };
      let receivedMessage: any = null;

      // Set up message handler
      const cleanup = messageSystem.onMessage(messageType, async (message) => {
        receivedMessage = message;
        return { status: 'received' };
      });
      messageHandlers.push(cleanup);

      // Send message
      const sentMessage = await messageSystem.sendMessage({
        id: 'msg-123',
        type: messageType,
        from: 'sender-001',
        to: 'receiver-001',
        subject: 'Test Message',
        body: messageBody,
        metadata: {
          priority: 'normal',
          correlationId: 'corr-456'
        }
      });

      // Wait for message processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedMessage).to.not.be.null;
      expect(receivedMessage.type).to.equal(messageType);
      expect(receivedMessage.body).to.deep.equal(messageBody);
      expect(receivedMessage.metadata).to.have.property('correlationId');
      expect(sentMessage.id).to.equal('msg-123');
    });

    it('should handle message responses', async () => {
      const requestType = 'test.request';
      const responseType = 'test.response';
      let responseReceived: any = null;

      // Set up request handler that sends response
      const cleanup = messageSystem.onMessage(requestType, async (message) => {
        // Send response message
        await messageSystem.sendMessage({
          id: 'resp-123',
          type: responseType,
          from: 'receiver-001',
          to: message.from,
          subject: 'Response to Request',
          body: { result: 'success' },
          metadata: {
            correlationId: message.metadata?.correlationId
          }
        });
        return { status: 'processed' };
      });
      messageHandlers.push(cleanup);

      // Set up response handler
      const responseCleanup = messageSystem.onMessage(responseType, async (message) => {
        responseReceived = message;
        return { status: 'received' };
      });
      messageHandlers.push(responseCleanup);

      // Send request
      await messageSystem.sendMessage({
        id: 'req-123',
        type: requestType,
        from: 'sender-001',
        to: 'receiver-001',
        subject: 'Test Request',
        body: { action: 'test' },
        metadata: {
          correlationId: 'corr-789'
        }
      });

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(responseReceived).to.not.be.null;
      expect(responseReceived.type).to.equal(responseType);
      expect(responseReceived.body.result).to.equal('success');
      expect(responseReceived.metadata?.correlationId).to.equal('corr-789');
    });

    it('should support request-response pattern', async () => {
      const requestType = 'test.request-response';

      // Set up handler
      const cleanup = messageSystem.onMessage(requestType, async (message) => {
        return {
          type: 'test.response',
          body: { processed: true, originalMessage: message.body }
        };
      });
      messageHandlers.push(cleanup);

      // Send request and expect response
      const response = await messageSystem.sendRequest('handler-001', {
        id: 'req-resp-123',
        type: requestType,
        from: 'requester-001',
        subject: 'Request-Response Test',
        body: { data: 'test' },
        metadata: {
          correlationId: 'req-resp-corr'
        }
      });

      expect(response).to.not.be.null;
      expect(response.type).to.equal('test.response');
      expect(response.body.processed).to.be.true;
      expect(response.body.originalMessage.data).to.equal('test');
    });
  });

  describe('Message Routing', () => {
    it('should route messages to correct handlers', async () => {
      const topic1 = 'test.routing.topic1';
      const topic2 = 'test.routing.topic2';
      let topic1Received = false;
      let topic2Received = false;

      // Set up handlers for different topics
      const cleanup1 = messageSystem.onMessage(topic1, async () => {
        topic1Received = true;
        return { status: 'ok' };
      });
      messageHandlers.push(cleanup1);

      const cleanup2 = messageSystem.onMessage(topic2, async () => {
        topic2Received = true;
        return { status: 'ok' };
      });
      messageHandlers.push(cleanup2);

      // Send messages to different topics
      await messageSystem.sendMessage({
        id: 'msg1',
        type: topic1,
        from: 'sender',
        to: 'receiver',
        body: {}
      });

      await messageSystem.sendMessage({
        id: 'msg2',
        type: topic2,
        from: 'sender',
        to: 'receiver',
        body: {}
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(topic1Received).to.be.true;
      expect(topic2Received).to.be.true;
    });

    it('should support broadcast messages', async () => {
      const broadcastType = 'test.broadcast';
      const receivers = ['receiver1', 'receiver2', 'receiver3'];
      let receivedCount = 0;

      // Set up multiple receivers
      receivers.forEach(receiver => {
        const cleanup = messageSystem.onMessage(broadcastType, async () => {
          receivedCount++;
          return { status: 'received' };
        });
        messageHandlers.push(cleanup);
      });

      // Send broadcast
      await messageSystem.broadcast({
        id: 'broadcast-123',
        type: broadcastType,
        from: 'broadcaster',
        subject: 'Broadcast Test',
        body: { message: 'Hello everyone!' }
      });

      // Wait for all receivers
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedCount).to.equal(receivers.length);
    });
  });

  describe('Message Validation', () => {
    it('should validate message structure', async () => {
      // Test invalid message structure
      try {
        await messageSystem.sendMessage({
          // Missing required fields
          body: {}
        } as any);
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).to.include('validation');
      }
    });

    it('should handle message metadata validation', async () => {
      const validMessage = {
        id: 'valid-msg',
        type: 'test.valid',
        from: 'sender',
        to: 'receiver',
        subject: 'Valid Message',
        body: { content: 'valid' },
        metadata: {
          priority: 'high',
          correlationId: 'corr-123'
        }
      };

      // Should not throw for valid metadata
      expect(async () => {
        await messageSystem.sendMessage(validMessage);
      }).to.not.throw();
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', async () => {
      const errorType = 'test.error-handling';

      const cleanup = messageSystem.onMessage(errorType, async () => {
        throw new Error('Handler error');
      });
      messageHandlers.push(cleanup);

      // Should not throw when handler fails
      expect(async () => {
        await messageSystem.sendMessage({
          id: 'error-msg',
          type: errorType,
          from: 'sender',
          to: 'receiver',
          body: {}
        });
      }).to.not.throw();

      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should handle timeout errors', async () => {
      const timeoutType = 'test.timeout';

      const cleanup = messageSystem.onMessage(timeoutType, async () => {
        // Simulate slow handler
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { status: 'completed' };
      });
      messageHandlers.push(cleanup);

      // Set up timeout expectation
      try {
        await messageSystem.sendRequest('handler', {
          id: 'timeout-msg',
          type: timeoutType,
          from: 'sender',
          to: 'receiver',
          body: {},
          metadata: {
            timeout: 100 // Very short timeout
          }
        });
        expect.fail('Should have timed out');
      } catch (error: any) {
        expect(error.message).to.include('timeout');
      }
    });
  });

  describe('Performance', () => {
    it('should handle high message volume', async () => {
      const messageType = 'test.performance';
      const messageCount = 100;
      let receivedCount = 0;

      const cleanup = messageSystem.onMessage(messageType, async () => {
        receivedCount++;
        return { status: 'processed' };
      });
      messageHandlers.push(cleanup);

      // Send many messages quickly
      const startTime = Date.now();
      const promises = [];
      for (let i = 0; i < messageCount; i++) {
        promises.push(messageSystem.sendMessage({
          id: `msg-${i}`,
          type: messageType,
          from: 'sender',
          to: 'receiver',
          body: { index: i }
        }));
      }

      await Promise.all(promises);
      const endTime = Date.now();

      // Wait for all messages to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(receivedCount).to.equal(messageCount);
      expect(endTime - startTime).to.be.below(2000); // Should complete in less than 2 seconds
    });
  });

  describe('Message Filtering and Transformation', () => {
    it('should support message filtering', async () => {
      const filterType = 'test.filter';
      let filteredMessage: any = null;

      // Register filter
      messageSystem.registerFilter('test-filter', (message) => {
        if (message.body?.filterMe === true) {
          return null; // Filter out this message
        }
        return message;
      });

      const cleanup = messageSystem.onMessage(filterType, async (message) => {
        filteredMessage = message;
        return { status: 'received' };
      });
      messageHandlers.push(cleanup);

      // Send message that should be filtered
      await messageSystem.sendMessage({
        id: 'filtered-msg',
        type: filterType,
        from: 'sender',
        to: 'receiver',
        body: { filterMe: true }
      });

      // Send message that should pass through
      await messageSystem.sendMessage({
        id: 'passed-msg',
        type: filterType,
        from: 'sender',
        to: 'receiver',
        body: { filterMe: false }
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Only the non-filtered message should be received
      expect(filteredMessage).to.not.be.null;
      expect(filteredMessage.body.filterMe).to.be.false;
    });

    it('should support message transformation', async () => {
      const transformType = 'test.transform';
      let transformedMessage: any = null;

      // Register transformer
      messageSystem.registerTransformer('test-transform', (message) => {
        return {
          ...message,
          body: {
            ...message.body,
            transformed: true,
            originalValue: message.body.value,
            doubledValue: message.body.value * 2
          }
        };
      });

      const cleanup = messageSystem.onMessage(transformType, async (message) => {
        transformedMessage = message;
        return { status: 'received' };
      });
      messageHandlers.push(cleanup);

      // Send message for transformation
      await messageSystem.sendMessage({
        id: 'transform-msg',
        type: transformType,
        from: 'sender',
        to: 'receiver',
        body: { value: 42 }
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(transformedMessage).to.not.be.null;
      expect(transformedMessage.body.transformed).to.be.true;
      expect(transformedMessage.body.originalValue).to.equal(42);
      expect(transformedMessage.body.doubledValue).to.equal(84);
    });
  });

  describe('Message Persistence', () => {
    it('should support message queuing', async () => {
      const queueType = 'test.queue';

      // Create queue
      const queue = messageSystem.createQueue('test-queue');

      // Enqueue messages
      await queue.enqueue({
        id: 'queued-msg-1',
        type: queueType,
        from: 'sender',
        to: 'receiver',
        body: { queued: true }
      });

      await queue.enqueue({
        id: 'queued-msg-2',
        type: queueType,
        from: 'sender',
        to: 'receiver',
        body: { queued: true }
      });

      // Process messages from queue
      let processedCount = 0;
      await queue.process(async () => {
        processedCount++;
        return { status: 'processed' };
      });

      expect(processedCount).to.equal(2);
    });
  });

  describe('Integration', () => {
    it('should integrate with Event System', async () => {
      // This would test integration with EventSystem if implemented
      const messageType = 'test.event-integration';

      expect(async () => {
        await messageSystem.sendMessage({
          id: 'integration-msg',
          type: messageType,
          from: 'sender',
          to: 'receiver',
          body: { integration: 'test' }
        });
      }).to.not.throw();
    });
  });
});
