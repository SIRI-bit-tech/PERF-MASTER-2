export declare class WebSocketClient {
    private wsUrl;
    private apiKey;
    private projectId;
    private ws;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectInterval;
    constructor(wsUrl: string, apiKey: string, projectId: string);
    connect(): void;
    private attemptReconnect;
    send(data: any): void;
    disconnect(): void;
}
