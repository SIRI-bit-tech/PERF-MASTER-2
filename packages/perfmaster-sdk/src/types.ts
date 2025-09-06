export interface PerfMasterConfig {
    apiKey: string;
    projectId: string;
    environment: 'development' | 'staging' | 'production';
    apiUrl?: string;
    wsUrl?: string;
  }
  
  export interface PerformanceMetrics {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    memory_usage?: number;
    cpu_usage?: number;
    bundle_size?: number;
    render_time?: number;
    network_requests?: number;
    dom_nodes?: number;
    timestamp: number;
    page_url: string;
    user_agent: string;
  }
  
  export interface WebVitalsMetric {
    name: string;
    value: number;
    id: string;
    timestamp: number;
  }