import { PerformanceMetrics } from './types';

export class MetricsCollector {
  private observer: PerformanceObserver | null = null;
  private webVitalsObserver: PerformanceObserver | null = null;

  startCollecting(callback: (metrics: PerformanceMetrics) => void): void {
    // Collect Core Web Vitals
    this.collectWebVitals(callback);
    
    // Collect Navigation Timing
    this.collectNavigationTiming(callback);
    
    // Collect Resource Timing
    this.collectResourceTiming(callback);
    
    // Collect Memory Usage
    this.collectMemoryUsage(callback);
  }

  private collectWebVitals(callback: (metrics: PerformanceMetrics) => void): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          callback({
            lcp: lastEntry.startTime,
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            callback({
              fid: fidEntry.processingStart - fidEntry.startTime,
              timestamp: Date.now(),
              page_url: window.location.href,
              user_agent: navigator.userAgent,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          
          callback({
            cls: clsValue,
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Web Vitals collection not supported:', error);
      }
    }
  }

  private collectNavigationTiming(callback: (metrics: PerformanceMetrics) => void): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            callback({
              ttfb: navigation.responseStart - navigation.requestStart,
              fcp: navigation.responseEnd - navigation.requestStart,
              timestamp: Date.now(),
              page_url: window.location.href,
              user_agent: navigator.userAgent,
            });
          }
        }, 0);
      });
    }
  }

  private collectResourceTiming(callback: (metrics: PerformanceMetrics) => void): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const totalSize = entries.reduce((acc, entry) => {
            return acc + ((entry as any).transferSize || 0);
          }, 0);

          callback({
            bundle_size: totalSize,
            network_requests: entries.length,
            timestamp: Date.now(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
          });
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing collection failed:', error);
      }
    }
  }

  private collectMemoryUsage(callback: (metrics: PerformanceMetrics) => void): void {
    if (typeof window !== 'undefined' && 'memory' in (performance as any)) {
      setInterval(() => {
        const memory = (performance as any).memory;
        callback({
          memory_usage: memory.usedJSHeapSize,
          timestamp: Date.now(),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });
      }, 30000); // Every 30 seconds
    }
  }

  stopCollecting(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.webVitalsObserver) {
      this.webVitalsObserver.disconnect();
    }
  }
}