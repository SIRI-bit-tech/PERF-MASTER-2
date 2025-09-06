export class APIClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.projectId = config.projectId;
        this.baseURL = config.apiUrl || 'https://your-backend-url.onrender.com/api/v1';
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
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
    async sendMetrics(metrics) {
        await this.request('/metrics', {
            method: 'POST',
            body: JSON.stringify(metrics),
        });
    }
    async sendWebVitals(metric) {
        await this.request('/metrics/web-vitals', {
            method: 'POST',
            body: JSON.stringify(metric),
        });
    }
}
