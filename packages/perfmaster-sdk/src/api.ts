export class APIClient {
    private baseURL: string;
    private apiKey: string;
    private projectId: string;
  
    constructor(config: { apiKey: string; projectId: string; apiUrl?: string }) {
      this.apiKey = config.apiKey;
      this.projectId = config.projectId;
      this.baseURL = config.apiUrl || 'https://your-backend-url.onrender.com/api/v1';
    }
  
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${this.baseURL}${endpoint}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "X-Project-ID": this.projectId,
        ...options.headers,
      };
  
      const response = await fetch(url, {
        ...options,
        headers,
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
  
      return response.json();
    }
  
    async sendMetrics(metrics: any): Promise<void> {
      await this.request('/metrics', {
        method: 'POST',
        body: JSON.stringify(metrics),
      });
    }
  
    async sendWebVitals(metric: any): Promise<void> {
      await this.request('/metrics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
      });
    }
  }