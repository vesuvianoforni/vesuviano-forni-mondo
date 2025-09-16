import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles, Camera } from "lucide-react";
import LazyImage from './LazyImage';

const ArchitettoAIPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Mostra il popup dopo 3 secondi, solo se non è già stato mostrato
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleTryArchitettoAI = () => {
    setIsVisible(false);
    document.getElementById('ai-architect')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
        {/* Popup */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-vesuviano-500 to-vesuviano-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-amber-300" size={24} />
                <span className="text-amber-300 font-semibold text-sm">NOVITÀ</span>
              </div>
              <h3 className="text-xl font-bold mb-1">Architetto AI</h3>
              <p className="text-vesuviano-100 text-sm">Visualizza il tuo forno nel tuo spazio</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <LazyImage
                src="/lovable-uploads/forno-arancione-terra-del-gusto.png"
                alt="Simulazione forno Vesuviano in ambiente reale"
                className="w-full h-32 object-contain rounded-lg bg-gray-50"
              />
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Camera className="text-vesuviano-500 mt-0.5" size={16} />
                <p className="text-sm text-gray-700">
                  <strong>Scatta una foto</strong> del tuo locale
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="text-vesuviano-500 mt-0.5" size={16} />
                <p className="text-sm text-gray-700">
                  <strong>Scegli il modello</strong> di forno Vesuviano
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-vesuviano-500 mt-0.5 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Visualizza il risultato</strong> in tempo reale
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleTryArchitettoAI}
                className="flex-1 bg-vesuviano-500 hover:bg-vesuviano-600 text-white font-semibold py-3"
              >
                Prova Architetto AI
              </Button>
              <Button 
                onClick={handleClose}
                variant="outline"
                className="px-6 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Dopo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArchitettoAIPopup;