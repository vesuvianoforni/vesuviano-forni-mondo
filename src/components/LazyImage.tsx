import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  priority?: boolean | undefined;
}

const LazyImage = ({ src, alt, className, width, height, priority = false }: LazyImageProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [inView, setInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loaded = loadedSrc === src;
  const failed = failedSrc === src;

  // Cached images can finish before hydration attaches React's load listener.
  useEffect(() => {
    const image = imgRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoadedSrc(src);
  }, [src, inView, priority]);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', priority && 'inline-block max-w-full', className)}
      style={{ width, height }}
    >
      {!priority && !loaded && !failed && (
        <div className="absolute inset-0 bg-charcoal-100 dark:bg-charcoal-800 animate-pulse" />
      )}
      {(priority || inView) && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            priority || loaded || failed ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;