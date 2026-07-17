import { z } from 'zod';
import { NoOrgError } from '../domain/errors';
import { jsonValueSchema, type JsonObject } from '../domain/types';

export interface RuntimeEvent {
  readonly type: string;
  readonly id: string;
  readonly timestamp: string;
  readonly payload: JsonObject;
}

export const runtimeEventSchema = z.object({
  type: z.string().trim().min(1),
  id: z.string().trim().min(1),
  timestamp: z.string().datetime(),
  payload: z.record(jsonValueSchema),
});

type Handler = (event: RuntimeEvent) => Promise<void> | void;

export interface EventBusOptions {
  readonly historyLimit?: number;
  readonly handlerTimeoutMs?: number;
}

export class EventBus {
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly history: RuntimeEvent[] = [];
  private readonly delivered = new Set<string>();
  private readonly inFlight = new Set<Promise<void>>();
  private readonly backgroundHandlers = new Set<Promise<void>>();
  private readonly historyLimit: number;
  private readonly handlerTimeoutMs: number;
  private closed = false;

  public constructor(options: number | EventBusOptions = {}) {
    const normalized = typeof options === 'number' ? { historyLimit: options } : options;
    this.historyLimit = normalized.historyLimit ?? 1000;
    this.handlerTimeoutMs = normalized.handlerTimeoutMs ?? 30000;
    if (this.historyLimit < 1 || this.handlerTimeoutMs < 1)
      throw new NoOrgError('INVALID_EVENT_BUS_LIMITS', 'Event bus limits must be positive');
  }

  public subscribe(type: string, handler: Handler): () => void {
    if (this.closed) throw new NoOrgError('EVENT_BUS_CLOSED', 'Event bus is closed');
    const handlers = this.handlers.get(type) ?? new Set<Handler>();
    handlers.add(handler);
    this.handlers.set(type, handlers);
    return () => handlers.delete(handler);
  }

  public async publish(event: RuntimeEvent): Promise<void> {
    if (this.closed) throw new NoOrgError('EVENT_BUS_CLOSED', 'Event bus is closed');
    const validated = runtimeEventSchema.parse(event) as RuntimeEvent;
    this.history.push(structuredClone(validated));
    while (this.history.length > this.historyLimit) this.history.shift();
    const dispatch = this.dispatch(validated);
    this.inFlight.add(dispatch);
    try {
      await dispatch;
    } finally {
      this.inFlight.delete(dispatch);
    }
  }

  public getHistory(type?: string): RuntimeEvent[] {
    return this.history
      .filter(event => type === undefined || event.type === type)
      .map(event => structuredClone(event));
  }

  public async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    await Promise.allSettled([...this.inFlight, ...this.backgroundHandlers]);
    this.handlers.clear();
  }

  private async dispatch(event: RuntimeEvent): Promise<void> {
    const handlers = [...(this.handlers.get(event.type) ?? [])];
    for (let index = 0; index < handlers.length; index += 1) {
      const handler = handlers[index];
      if (!handler) continue;
      const deliveryKey = `${event.id}:${event.type}:${index}`;
      if (this.delivered.has(deliveryKey)) continue;
      await this.dispatchHandler(handler, event);
      this.delivered.add(deliveryKey);
    }
  }

  private async dispatchHandler(handler: Handler, event: RuntimeEvent): Promise<void> {
    const operation = Promise.resolve().then(() => handler(structuredClone(event)));
    try {
      await this.withTimeout(operation, this.handlerTimeoutMs);
    } catch (error) {
      if (error instanceof NoOrgError && error.code === 'EVENT_HANDLER_TIMEOUT') {
        const settled = operation.catch(() => undefined);
        this.backgroundHandlers.add(settled);
        void settled.finally(() => this.backgroundHandlers.delete(settled));
      }
      throw error;
    }
  }

  private async withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<T>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new NoOrgError('EVENT_HANDLER_TIMEOUT', 'Event handler exceeded its deadline', true)
              ),
            timeoutMs
          );
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
