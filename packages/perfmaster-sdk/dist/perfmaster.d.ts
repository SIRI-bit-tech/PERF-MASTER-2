import { PerfMasterConfig } from './types';
export declare class PerfMaster {
    private static instance;
    private apiClient;
    private metricsCollector;
    private wsClient;
    private config;
    private constructor();
    static init(config: PerfMasterConfig): PerfMaster;
    private start;
    private sendMetrics;
    static trackEvent(eventName: string, data: any): void;
    static trackError(error: Error): void;
    static destroy(): void;
}
