import { APIClient } from './api';
import { MetricsCollector } from './metrics';
import { WebSocketClient } from './websocket';
export class PerfMaster {
    constructor(config) {
        this.config = config;
        this.apiClient = new APIClient({
            apiKey: config.apiKey,
            projectId: config.projectId,
            apiUrl: config.apiUrl,
        });
        this.wsClient = new WebSocketClient(config.wsUrl || 'wss://your-backend-url.onrender.com', config.apiKey, config.projectId);
        this.metricsCollector = new MetricsCollector();
    }
    static init(config) {
        if (!PerfMaster.instance) {
            PerfMaster.instance = new PerfMaster(config);
            PerfMaster.instance.start();
        }
        return PerfMaster.instance;
    }
    start() {
        console.log('PerfMaster: Initializing...');
        // Start WebSocket connection
        this.wsClient.connect();
        // Start metrics collection
        this.metricsCollector.startCollecting((metrics) => {
            this.sendMetrics(metrics);
        });
        console.log('PerfMaster: Started successfully');
    }
    sendMetrics(metrics) {
        // Send via WebSocket for real-time
        this.wsClient.send(metrics);
        // Also send via REST API for backup
        this.apiClient.sendMetrics(metrics).catch(error => {
            console.error('PerfMaster: Failed to send metrics via REST', error);
        });
    }
    // Public API methods
    static trackEvent(eventName, data) {
        if (PerfMaster.instance) {
            PerfMaster.instance.wsClient.send({
                type: 'event',
                name: eventName,
                data,
                timestamp: Date.now(),
            });
        }
    }
    static trackError(error) {
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
    static destroy() {
        if (PerfMaster.instance) {
            PerfMaster.instance.metricsCollector.stopCollecting();
            PerfMaster.instance.wsClient.disconnect();
            PerfMaster.instance = null;
        }
    }
}
