import React from 'react';

// Critical CSS that should be inlined for fastest loading
const CriticalCSS: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical loading styles */
        .hero-skeleton {
          background: linear-gradient(135deg, #8B5A3C 0%, #D2B48C  100%);
          min-height: 100vh;
          position: relative;
        }
        
        .hero-skeleton::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .critical-font-preload {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        /* Minimize CLS */
        .hero-logo-placeholder {
          width: 128px;
          height: 128px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin: 0 auto;
        }
        
        .hero-content-placeholder {
          max-width: 768px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .hero-title-placeholder {
          height: 3rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .hero-text-placeholder {
          height: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .hero-buttons-placeholder {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .hero-button-placeholder {
          width: 140px;
          height: 48px;
          background: rgba(139, 90, 60, 0.8);
          border-radius: 6px;
        }
      `
    }} />
  );
};

export default CriticalCSS;