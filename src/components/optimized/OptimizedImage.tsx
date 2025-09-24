import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '100vw',
  quality = 75,
  blurDataURL,
  onLoad,
  onError,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    // Create responsive breakpoints
    const breakpoints = [480, 768, 1024, 1280, 1920];
    
    // For assets, create a basic responsive set
    if (baseSrc.includes('/src/assets/') || baseSrc.startsWith('/lovable-uploads/')) {
      return `${baseSrc} 1x`;
    }
    
    return `${baseSrc} 1x`;
  };

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Create blur placeholder
  const blurPlaceholder = blurDataURL || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-stone-200 animate-pulse"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
          <div className="text-stone-500 text-sm">Failed to load image</div>
        </div>
      )}

      {/* Main image */}
      {inView && !error && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          className={cn(
            'transition-opacity duration-300 w-full h-full object-cover',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default OptimizedImage;