// Image optimization utilities
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// Generate responsive image URLs for different screen sizes
export const generateResponsiveImageUrls = (
  baseUrl: string,
  config: ImageOptimizationConfig = {}
): string[] => {
  const {
    quality = 75,
    format = 'webp',
    fit = 'cover'
  } = config;

  // Common viewport widths
  const breakpoints = [320, 640, 768, 1024, 1280, 1920];
  
  // For now, return the original URL since we don't have an image service
  // In a real implementation, you'd integrate with services like:
  // - Cloudinary: `${baseUrl}/c_scale,w_${width},q_${quality},f_${format}/${path}`
  // - ImageKit: `${baseUrl}?tr=w-${width},q-${quality},f-${format}`
  // - Next.js Image API, etc.
  
  return breakpoints.map(width => {
    // Placeholder for actual image service integration
    return `${baseUrl}?w=${width}&q=${quality}&f=${format}&fit=${fit}`;
  });
};

// Generate srcSet string for img element
export const generateSrcSet = (
  baseUrl: string,
  config: ImageOptimizationConfig = {}
): string => {
  const urls = generateResponsiveImageUrls(baseUrl, config);
  const breakpoints = [320, 640, 768, 1024, 1280, 1920];
  
  return urls.map((url, index) => `${url} ${breakpoints[index]}w`).join(', ');
};

// Generate sizes attribute based on common layout patterns
export const generateSizes = (layout: 'full' | 'half' | 'third' | 'quarter' | 'hero' = 'full'): string => {
  switch (layout) {
    case 'hero':
      return '100vw';
    case 'full':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw';
    case 'half':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw';
    case 'third':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'quarter':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
    default:
      return '100vw';
  }
};

// Create optimized blur data URL for placeholder
export const createBlurDataURL = (width: number = 16, height: number = 16): string => {
  // Create a simple gradient blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradient)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Image preloader utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical images
export const preloadCriticalImages = async (images: string[]): Promise<void> => {
  const preloadPromises = images.map(preloadImage);
  
  try {
    await Promise.allSettled(preloadPromises);
    console.log('Critical images preloaded successfully');
  } catch (error) {
    console.warn('Some critical images failed to preload:', error);
  }
};

// Image format detection
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Get optimal image format based on browser support
export const getOptimalImageFormat = (): 'avif' | 'webp' | 'jpeg' => {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
};