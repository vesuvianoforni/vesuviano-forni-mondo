import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Sparkles, Camera, Zap, Eye } from "lucide-react";
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in">
        {/* Popup */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 animate-scale-in overflow-hidden">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-all duration-300 z-20 group backdrop-blur-sm"
          >
            <X size={20} className="text-white group-hover:text-white/80 transition-colors" />
          </button>

          {/* Hero Section with enhanced gradient */}
          <div className="relative bg-gradient-to-br from-vesuviano-500 via-vesuviano-600 to-vesuviano-700 text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-300/20 rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full animate-ping"></div>
            
            <div className="relative z-10 p-8 pb-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-amber-300/30">
                <Sparkles className="text-amber-300 animate-pulse" size={18} />
                <span className="text-amber-200 font-bold text-sm tracking-wide">NOVITÀ ESCLUSIVA</span>
              </div>
              
              {/* Title */}
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Architetto AI
              </h3>
              <p className="text-vesuviano-100 text-lg leading-relaxed">
                Rivoluziona il tuo business con la<br/>
                <span className="text-amber-200 font-semibold">realtà aumentata intelligente</span>
              </p>
            </div>

            {/* Featured Image */}
            <div className="relative px-8 pb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <LazyImage
                  src="/lovable-uploads/forno-arancione-terra-del-gusto.png"
                  alt="Simulazione AI di forno Vesuviano"
                  className="w-full h-28 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 pt-6">
            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Camera className="text-white" size={20} />
                </div>
                <p className="text-xs font-medium text-gray-700 leading-tight">
                  Scatta<br/>foto locale
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-vesuviano-500 to-vesuviano-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Zap className="text-white" size={20} />
                </div>
                <p className="text-xs font-medium text-gray-700 leading-tight">
                  IA genera<br/>visualizzazione
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Eye className="text-white" size={20} />
                </div>
                <p className="text-xs font-medium text-gray-700 leading-tight">
                  Visualizza<br/>risultato reale
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-vesuviano-500 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
                <h4 className="font-bold text-gray-800">Perché usarlo?</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full"></div>
                  <span><strong>Convince i clienti</strong> prima dell'acquisto</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full"></div>
                  <span><strong>Riduce i tempi</strong> di decisione</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-vesuviano-500 rounded-full"></div>
                  <span><strong>Aumenta le vendite</strong> del 40%</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleTryArchitettoAI}
                className="flex-1 bg-gradient-to-r from-vesuviano-500 to-vesuviano-600 hover:from-vesuviano-600 hover:to-vesuviano-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                <Zap className="mr-2" size={18} />
                Provalo Ora - GRATIS
              </Button>
              <Button 
                onClick={handleClose}
                variant="outline"
                className="px-6 py-4 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all duration-300"
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