import { PerformanceMetrics } from './types';
export declare class MetricsCollector {
    private observer;
    private webVitalsObserver;
    startCollecting(callback: (metrics: PerformanceMetrics) => void): void;
    private collectWebVitals;
    private collectNavigationTiming;
    private collectResourceTiming;
    private collectMemoryUsage;
    stopCollecting(): void;
}
