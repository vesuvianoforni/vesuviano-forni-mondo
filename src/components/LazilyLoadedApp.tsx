import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LazilyLoadedAppProps {
  children: React.ReactNode;
}

const LazilyLoadedApp: React.FC<LazilyLoadedAppProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    // Simulate progressive loading with realistic progress
    const startLoading = () => {
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          setTimeout(() => setIsReady(true), 300);
          clearInterval(progressInterval);
        } else {
          setProgress(currentProgress);
        }
      }, 100);
    };

    // Start loading after a small delay
    const timeout = setTimeout(startLoading, 200);

    return () => {
      clearTimeout(timeout);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-vesuviano-50 to-stone-100 flex items-center justify-center z-50">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-vesuviano-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-vesuviano-900 mb-2">
              Vesuviano Forni
            </h1>
            <p className="text-stone-600 text-sm">
              Caricamento in corso...
            </p>
          </div>
          
          <div className="w-full bg-stone-200 rounded-full h-2 mb-4">
            <div 
              className="bg-vesuviano-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-xs text-stone-500">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LazilyLoadedApp;