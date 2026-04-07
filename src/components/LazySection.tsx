import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
  minHeight?: string;
  id?: string;
}

const LazySection = ({ 
  children, 
  fallback, 
  rootMargin = '200px',
  className = '',
  minHeight = '200px',
  id
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

  // Force visible when navigating to a hash that matches a child section
  useEffect(() => {
    if (isVisible) return;
    
    const checkHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      // Check if this LazySection contains the target id
      if (ref.current) {
        // Force render, then scroll after a tick
        setIsVisible(true);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    
    // Also listen for programmatic scroll attempts
    const handleScrollRequest = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && ref.current) {
        setIsVisible(true);
      }
    };
    window.addEventListener('force-lazy-load', handleScrollRequest);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('force-lazy-load', handleScrollRequest);
    };
  }, [isVisible]);

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
