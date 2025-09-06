export declare class APIClient {
    private baseURL;
    private apiKey;
    private projectId;
    constructor(config: {
        apiKey: string;
        projectId: string;
        apiUrl?: string;
    });
    private request;
    sendMetrics(metrics: any): Promise<void>;
    sendWebVitals(metric: any): Promise<void>;
}
