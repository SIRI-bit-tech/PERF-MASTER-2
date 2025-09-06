export class WebSocketClient {
    constructor(wsUrl, apiKey, projectId) {
        this.wsUrl = wsUrl;
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000;
    }
    connect() {
        try {
            const url = new URL(this.wsUrl);
            url.searchParams.set('api_key', this.apiKey);
            url.searchParams.set('project_id', this.projectId);
            this.ws = new WebSocket(url.toString());
            this.ws.onopen = () => {
                console.log('PerfMaster: WebSocket connected');
                this.reconnectAttempts = 0;
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('PerfMaster: Received data', data);
                }
                catch (error) {
                    console.error('PerfMaster: Failed to parse WebSocket message', error);
                }
            };
            this.ws.onclose = () => {
                console.log('PerfMaster: WebSocket disconnected');
                this.attemptReconnect();
            };
            this.ws.onerror = (error) => {
                console.error('PerfMaster: WebSocket error', error);
            };
        }
        catch (error) {
            console.error('PerfMaster: Failed to connect WebSocket', error);
        }
    }
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`PerfMaster: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval * this.reconnectAttempts);
        }
        else {
            console.error('PerfMaster: Max reconnection attempts reached');
        }
    }
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
