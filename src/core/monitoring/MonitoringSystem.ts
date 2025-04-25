import { EventSystem } from '../events/EventSystem';
import { StorageSystem } from '../storage/StorageSystem';
import * as crypto from 'crypto';

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface Alert {
  id: string;
  name: string;
  condition: (metric: Metric) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved';
  timestamp: number;
  metadata?: Record<string, any>;
}

export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private eventSystem: EventSystem;
  private storageSystem: StorageSystem;
  private metrics: Map<string, Metric[]>;
  private alerts: Map<string, Alert>;
  private alertHandlers: Set<(alert: Alert) => void>;

  private constructor() {
    this.eventSystem = EventSystem.getInstance();
    this.storageSystem = StorageSystem.getInstance();
    this.metrics = new Map();
    this.alerts = new Map();
    this.alertHandlers = new Set();

    // Persist metrics periodically
    setInterval(() => this.persistMetrics(), 300000); // Every 5 minutes
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  public recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      labels
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(metric);

    // Check alerts
    this.checkAlerts(metric);

    // Emit metric event
    this.eventSystem.emit('monitoring:metric', metric);
  }

  public getMetrics(name: string, timeRange?: { start: number; end: number }): Metric[] {
    const metrics = this.metrics.get(name) || [];
    if (!timeRange) return metrics;

    return metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  public createAlert(
    name: string,
    condition: (metric: Metric) => boolean,
    message: string,
    severity: Alert['severity'] = 'warning'
  ): string {
    const id = crypto.randomUUID();
    const alert: Alert = {
      id,
      name,
      condition,
      message,
      severity,
      status: 'resolved',
      timestamp: Date.now()
    };

    this.alerts.set(id, alert);
    return id;
  }

  public onAlert(handler: (alert: Alert) => void): () => void {
    this.alertHandlers.add(handler);
    return () => {
      this.alertHandlers.delete(handler);
    };
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.status === 'active');
  }

  private checkAlerts(metric: Metric): void {
    for (const alert of this.alerts.values()) {
      if (alert.condition(metric)) {
        if (alert.status !== 'active') {
          alert.status = 'active';
          alert.timestamp = Date.now();
          this.notifyAlert(alert);
        }
      } else if (alert.status === 'active') {
        alert.status = 'resolved';
        alert.timestamp = Date.now();
        this.notifyAlert(alert);
      }
    }
  }

  private notifyAlert(alert: Alert): void {
    this.alertHandlers.forEach(handler => handler(alert));
    this.eventSystem.emit('monitoring:alert', alert);
  }

  private async persistMetrics(): Promise<void> {
    for (const [name, metrics] of this.metrics.entries()) {
      await this.storageSystem.set(`metrics:${name}`, metrics);
    }
  }

  public async loadPersistedMetrics(): Promise<void> {
    const keys = await this.storageSystem.get<string[]>('metrics:keys') || [];
    for (const key of keys) {
      const metrics = await this.storageSystem.get<Metric[]>(`metrics:${key}`);
      if (metrics) {
        this.metrics.set(key, metrics);
      }
    }
  }
} 