import React, { Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: string;
  id?: string;
  'aria-label'?: string;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesuviano-600"></div>
    </div>
  ),
  className = '',
  minHeight = 'auto',
  id,
  'aria-label': ariaLabel,
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className={className}
      style={{ minHeight }}
      id={id}
      aria-label={ariaLabel}
    >
      {isIntersecting ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        <div style={{ minHeight }} className="flex items-center justify-center">
          <div className="w-full h-16 bg-stone-100 animate-pulse rounded"></div>
        </div>
      )}
    </section>
  );
};

export default LazySection;