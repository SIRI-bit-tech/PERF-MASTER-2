import { APIClient } from './api';
import { MetricsCollector } from './metrics';
import { WebSocketClient } from './websocket';
import { PerfMasterConfig, PerformanceMetrics } from './types';

export class PerfMaster {
  private static instance: PerfMaster;
  private apiClient: APIClient;
  private metricsCollector: MetricsCollector;
  private wsClient: WebSocketClient;
  private config: PerfMasterConfig;

  private constructor(config: PerfMasterConfig) {
    this.config = config;
    this.apiClient = new APIClient({
      apiKey: config.apiKey,
      projectId: config.projectId,
      apiUrl: config.apiUrl,
    });
    
    this.wsClient = new WebSocketClient(
      config.wsUrl || 'wss://your-backend-url.onrender.com',
      config.apiKey,
      config.projectId
    );
    
    this.metricsCollector = new MetricsCollector();
  }

  static init(config: PerfMasterConfig): PerfMaster {
    if (!PerfMaster.instance) {
      PerfMaster.instance = new PerfMaster(config);
      PerfMaster.instance.start();
    }
    return PerfMaster.instance;
  }

  private start(): void {
    console.log('PerfMaster: Initializing...');
    
    // Start WebSocket connection
    this.wsClient.connect();
    
    // Start metrics collection
    this.metricsCollector.startCollecting((metrics) => {
      this.sendMetrics(metrics);
    });

    console.log('PerfMaster: Started successfully');
  }

  private sendMetrics(metrics: PerformanceMetrics): void {
    // Send via WebSocket for real-time
    this.wsClient.send(metrics);
    
    // Also send via REST API for backup
    this.apiClient.sendMetrics(metrics).catch(error => {
      console.error('PerfMaster: Failed to send metrics via REST', error);
    });
  }

  // Public API methods
  static trackEvent(eventName: string, data: any): void {
    if (PerfMaster.instance) {
      PerfMaster.instance.wsClient.send({
        type: 'event',
        name: eventName,
        data,
        timestamp: Date.now(),
      });
    }
  }

  static trackError(error: Error): void {
    if (PerfMaster.instance) {
      PerfMaster.instance.wsClient.send({
        type: 'error',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      });
    }
  }

  // Cleanup method
  static destroy(): void {
    if (PerfMaster.instance) {
      PerfMaster.instance.metricsCollector.stopCollecting();
      PerfMaster.instance.wsClient.disconnect();
      PerfMaster.instance = null as any;
    }
  }
}