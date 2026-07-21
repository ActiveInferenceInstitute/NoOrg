import { EventBus } from '../../src/events/event-bus';

describe('EventBus', () => {
  it('delivers each event once and protects history from callers', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.subscribe('task.completed', () => {
      count += 1;
    });
    await bus.publish({
      type: 'task.completed',
      id: 'event-1',
      timestamp: new Date().toISOString(),
      payload: { id: 'task-1' },
    });
    expect(count).toBe(1);
    const history = bus.getHistory();
    (history[0]!.payload as Record<string, unknown>).id = 'changed';
    expect(bus.getHistory()[0]!.payload.id).toBe('task-1');
    expect(bus.getHistory('task.completed')).toHaveLength(1);
    await bus.close();
  });

  it('does not redeliver a repeated event identifier', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.subscribe('task.completed', () => {
      count += 1;
    });
    const event = {
      type: 'task.completed',
      id: 'event-repeat',
      timestamp: new Date().toISOString(),
      payload: { id: 'task-1' },
    };
    await bus.publish(event);
    await bus.publish(event);
    expect(count).toBe(1);
    await bus.close();
    await bus.close();
  });

  it('tracks a timed-out handler until it settles during close', async () => {
    const bus = new EventBus({ handlerTimeoutMs: 10 });
    let settled = false;
    bus.subscribe('slow', async () => {
      await new Promise(resolve => setTimeout(resolve, 35));
      settled = true;
    });
    await expect(
      bus.publish({
        type: 'slow',
        id: 'event-slow',
        timestamp: new Date().toISOString(),
        payload: {},
      })
    ).rejects.toThrow('deadline');
    await bus.close();
    expect(settled).toBe(true);
  });

  it('waits for timed-out handlers when close races with publish', async () => {
    const bus = new EventBus({ handlerTimeoutMs: 10 });
    let settled = false;
    bus.subscribe('slow-race', async () => {
      await new Promise(resolve => setTimeout(resolve, 35));
      settled = true;
    });
    const publish = bus
      .publish({
        type: 'slow-race',
        id: 'event-slow-race',
        timestamp: new Date().toISOString(),
        payload: {},
      })
      .catch(() => undefined);

    await bus.close();
    await publish;
    expect(settled).toBe(true);
  });

  it('rejects invalid limits and operations after close', async () => {
    expect(() => new EventBus({ historyLimit: 0 })).toThrow('limits must be positive');
    expect(() => new EventBus({ handlerTimeoutMs: 0 })).toThrow('limits must be positive');
    const numericOptions = new EventBus(10);
    await numericOptions.close();
    const bus = new EventBus();
    await bus.close();
    expect(() => bus.subscribe('closed', () => undefined)).toThrow('closed');
    await expect(
      bus.publish({
        type: 'closed',
        id: 'closed',
        timestamp: new Date().toISOString(),
        payload: {},
      })
    ).rejects.toThrow('closed');
  });
});
