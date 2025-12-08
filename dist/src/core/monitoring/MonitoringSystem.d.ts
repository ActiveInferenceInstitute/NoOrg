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
export declare class MonitoringSystem {
    private static instance;
    private eventSystem;
    private storageSystem;
    private metrics;
    private alerts;
    private alertHandlers;
    private constructor();
    static getInstance(): MonitoringSystem;
    recordMetric(name: string, value: number, labels?: Record<string, string>): void;
    getMetrics(name: string, timeRange?: {
        start: number;
        end: number;
    }): Metric[];
    createAlert(name: string, condition: (metric: Metric) => boolean, message: string, severity?: Alert['severity']): string;
    onAlert(handler: (alert: Alert) => void): () => void;
    getActiveAlerts(): Alert[];
    private checkAlerts;
    private notifyAlert;
    private persistMetrics;
    loadPersistedMetrics(): Promise<void>;
}
export {};
//# sourceMappingURL=MonitoringSystem.d.ts.map