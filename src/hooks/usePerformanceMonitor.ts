import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({});

  useEffect(() => {
    // Only run in production and if browser supports the APIs
    if (import.meta.env.DEV || typeof window === 'undefined') return;

    const reportMetric = (name: string, value: number) => {
      metricsRef.current = { ...metricsRef.current, [name]: value };
      
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`Performance metric - ${name}:`, value);
      }

      // Send to analytics service
      if ('gtag' in window && typeof window.gtag === 'function') {
        window.gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: Math.round(value),
          custom_map: { metric_1: name }
        });
      }
    };

    // Web Vitals observation
    const observeWebVitals = () => {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('fcp', entry.startTime);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportMetric('lcp', lastEntry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fidEntry = entry as any;
          if (fidEntry.processingStart && fidEntry.startTime) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            reportMetric('fid', fid);
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        }
        reportMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        reportMetric('ttfb', ttfb);
      }
    };

    // Resource loading monitoring
    const observeResources = () => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Monitor slow resources
          if (resource.duration > 1000) { // > 1 second
            console.warn('Slow resource detected:', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize
            });
          }

          // Monitor large resources
          if (resource.transferSize > 1024 * 1024) { // > 1MB
            console.warn('Large resource detected:', {
              name: resource.name,
              size: Math.round(resource.transferSize / 1024 / 1024 * 100) / 100 + 'MB'
            });
          }
        }
      }).observe({ entryTypes: ['resource'] });
    };

    // Long task monitoring
    const observeLongTasks = () => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime
          });
          
          // Send to analytics
          if ('gtag' in window && typeof window.gtag === 'function') {
            window.gtag('event', 'long_task', {
              duration: Math.round(entry.duration),
              start_time: Math.round(entry.startTime)
            });
          }
        }
      }).observe({ entryTypes: ['longtask'] });
    };

    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };

        // Warn if memory usage is high
        if (memoryUsage.used > memoryUsage.limit * 0.8) {
          console.warn('High memory usage detected:', memoryUsage);
        }

        // Send to analytics every 30 seconds
        setInterval(() => {
          if ('gtag' in window && typeof window.gtag === 'function') {
            window.gtag('event', 'memory_usage', {
              used_memory: memoryUsage.used,
              total_memory: memoryUsage.total
            });
          }
        }, 30000);
      }
    };

    // Initialize all monitoring
    try {
      observeWebVitals();
      observeResources();
      observeLongTasks();
      monitorMemory();
    } catch (error) {
      console.error('Performance monitoring setup failed:', error);
    }

    // Cleanup function
    return () => {
      // Performance observers are automatically cleaned up when the component unmounts
    };
  }, []);

  return metricsRef.current;
};

// Export utility function to manually report custom metrics
export const reportCustomMetric = (name: string, value: number, unit?: string) => {
  if (import.meta.env.DEV) {
    console.log(`Custom metric - ${name}:`, value, unit || '');
  }

  if ('gtag' in window && typeof window.gtag === 'function') {
    window.gtag('event', 'custom_metric', {
      metric_name: name,
      metric_value: Math.round(value),
      metric_unit: unit || 'ms'
    });
  }
};