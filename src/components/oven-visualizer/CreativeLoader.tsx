import React from 'react';
import { Wand2, Sparkles, Cpu, Zap } from 'lucide-react';

interface CreativeLoaderProps {
  message?: string;
}

const CreativeLoader: React.FC<CreativeLoaderProps> = ({ 
  message = "L'AI sta creando la tua immagine personalizzata..." 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="apple-card rounded-3xl p-8 text-center max-w-md mx-4">
        {/* Animated Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
            {/* Middle rotating ring */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 border-r-cyan-500 animate-spin animate-reverse" style={{ animationDuration: '1.5s' }}></div>
            {/* Inner pulsing dot */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 animation-delay-500">
            <Cpu className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-2 animation-delay-1000">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 animation-delay-1500">
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Magia AI in Corso
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-shimmer"></div>
        </div>

        {/* Loading Steps */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Analisi dello spazio</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-purple-600 animation-delay-500">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <span>Integrazione del forno</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-pink-600 animation-delay-1000">
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse"></div>
            <span>Finalizzazione dell'immagine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeLoader;