import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { reportCustomMetric } from '@/hooks/usePerformanceMonitor';

interface LazyComponentLoaderProps {
  componentName: string;
  importFunction: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({
  componentName,
  importFunction,
  fallback,
  props = {},
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = 'auto',
  className = '',
  id,
  'aria-label': ariaLabel,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isIntersecting && !Component && !isLoading && !error) {
      setIsLoading(true);
      const startTime = performance.now();

      importFunction()
        .then((module) => {
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          
          setComponent(() => module.default);
          reportCustomMetric(`${componentName}_load_time`, loadTime, 'ms');
          
          console.log(`${componentName} loaded in ${Math.round(loadTime)}ms`);
        })
        .catch((err) => {
          console.error(`Failed to load ${componentName}:`, err);
          setError(`Failed to load ${componentName}`);
          reportCustomMetric(`${componentName}_load_error`, 1, 'count');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isIntersecting, Component, isLoading, error, componentName, importFunction]);

  const defaultFallback = (
    <div 
      className="flex items-center justify-center py-12"
      style={{ minHeight }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesuviano-600 mx-auto mb-4"></div>
        <p className="text-stone-600">Caricamento {componentName}...</p>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight }}
      id={id}
      aria-label={ariaLabel}
    >
      {error ? (
        <div 
          className="flex items-center justify-center py-12 text-red-600"
          style={{ minHeight }}
        >
          <div className="text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(false);
              }}
              className="px-4 py-2 bg-vesuviano-500 text-white rounded-lg hover:bg-vesuviano-600 transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
      ) : !isIntersecting ? (
        <div style={{ minHeight }} className="flex items-center justify-center">
          <div className="w-full h-16 bg-stone-100 animate-pulse rounded"></div>
        </div>
      ) : !Component || isLoading ? (
        fallback || defaultFallback
      ) : (
        <Suspense fallback={fallback || defaultFallback}>
          <Component {...props} />
        </Suspense>
      )}
    </div>
  );
};

// Pre-configured lazy loaders for common components
export const LazyOvenVisualizer: React.FC<{ className?: string; id?: string }> = (props) => (
  <LazyComponentLoader
    componentName="OvenVisualizer"
    importFunction={() => import('@/components/OvenVisualizer')}
    minHeight="600px"
    {...props}
  />
);

export const LazyClientsMap: React.FC<{ className?: string; id?: string }> = (props) => (
  <LazyComponentLoader
    componentName="ClientsMap"
    importFunction={() => import('@/components/ClientsMap')}
    minHeight="500px"
    {...props}
  />
);

export const LazyOvenGallery: React.FC<{ className?: string; id?: string }> = (props) => (
  <LazyComponentLoader
    componentName="OvenGallery"
    importFunction={() => import('@/components/OvenGallery')}
    minHeight="400px"
    {...props}
  />
);

export default LazyComponentLoader;