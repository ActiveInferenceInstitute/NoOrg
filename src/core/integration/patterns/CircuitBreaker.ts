import { EventSystem } from '../../events/EventSystem';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenTimeout?: number;
  monitorInterval?: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lastStatusChange: number;
}

type WrappedFunction<T> = (...args: any[]) => Promise<T>;

export class CircuitBreaker {
  private static breakers = new Map<string, CircuitBreaker>();
  private eventSystem: EventSystem;
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private monitorInterval?: NodeJS.Timeout;

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.eventSystem = EventSystem.getInstance();
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenTimeout: 30000, // 30 seconds
      monitorInterval: 5000, // 5 seconds
      ...config
    };

    this.state = {
      failures: 0,
      lastFailure: 0,
      status: 'CLOSED',
      lastStatusChange: Date.now()
    };

    this.startMonitoring();
  }

  public static getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!CircuitBreaker.breakers.has(name)) {
      CircuitBreaker.breakers.set(name, new CircuitBreaker(name, config));
    }
    return CircuitBreaker.breakers.get(name)!;
  }

  public wrap<T>(fn: WrappedFunction<T>): WrappedFunction<T> {
    return async (...args: any[]): Promise<T> => {
      await this.checkState();

      try {
        const result = await fn(...args);
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure(error as Error);
        throw error;
      }
    };
  }

  public async execute<T>(fn: WrappedFunction<T>, ...args: any[]): Promise<T> {
    return this.wrap(fn)(...args);
  }

  public getState(): CircuitBreakerState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = {
      failures: 0,
      lastFailure: 0,
      status: 'CLOSED',
      lastStatusChange: Date.now()
    };
    this.emitStateChange();
  }

  private async checkState(): Promise<void> {
    const now = Date.now();

    switch (this.state.status) {
      case 'OPEN':
        if (now - this.state.lastStatusChange >= this.config.resetTimeout) {
          this.transitionTo('HALF_OPEN');
        } else {
          throw new Error(`Circuit breaker ${this.name} is OPEN`);
        }
        break;

      case 'HALF_OPEN':
        if (now - this.state.lastStatusChange >= this.config.halfOpenTimeout!) {
          this.transitionTo('CLOSED');
        }
        break;
    }
  }

  private onSuccess(): void {
    if (this.state.status === 'HALF_OPEN') {
      this.transitionTo('CLOSED');
    }
    this.state.failures = 0;
  }

  private onFailure(error: Error): void {
    this.state.failures++;
    this.state.lastFailure = Date.now();

    if (this.state.failures >= this.config.failureThreshold) {
      this.transitionTo('OPEN');
    }

    this.eventSystem.emit('circuit:failure', {
      name: this.name,
      error,
      state: this.getState()
    });
  }

  private transitionTo(status: CircuitBreakerState['status']): void {
    this.state.status = status;
    this.state.lastStatusChange = Date.now();
    this.emitStateChange();
  }

  private emitStateChange(): void {
    this.eventSystem.emit('circuit:state_change', {
      name: this.name,
      state: this.getState()
    });
  }

  private startMonitoring(): void {
    if (this.config.monitorInterval) {
      this.monitorInterval = setInterval(() => {
        this.eventSystem.emit('circuit:monitor', {
          name: this.name,
          state: this.getState()
        });
      }, this.config.monitorInterval);
    }
  }

  public dispose(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    CircuitBreaker.breakers.delete(this.name);
  }
} 