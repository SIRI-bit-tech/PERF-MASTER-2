export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 1000;
  
    constructor(
      private wsUrl: string,
      private apiKey: string,
      private projectId: string
    ) {}
  
    connect(): void {
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
          } catch (error) {
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
  
      } catch (error) {
        console.error('PerfMaster: Failed to connect WebSocket', error);
      }
    }
  
    private attemptReconnect(): void {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`PerfMaster: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval * this.reconnectAttempts);
      } else {
        console.error('PerfMaster: Max reconnection attempts reached');
      }
    }
  
    send(data: any): void {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      }
    }
  
    disconnect(): void {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  }