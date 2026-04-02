import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
  minHeight?: string;
}

const LazySection = ({ 
  children, 
  fallback, 
  rootMargin = '200px',
  className = '',
  minHeight = '200px'
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  if (isVisible) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {fallback || null}
    </div>
  );
};

export default LazySection;
