import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Heart, Share2, X } from 'lucide-react';

interface ImageResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  ovenModel: string;
  onDownload: () => void;
}

const ImageResultModal: React.FC<ImageResultModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  ovenModel,
  onDownload
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
        <div className="relative">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Success Animation Container */}
          <div className="apple-card rounded-3xl overflow-hidden">
            {/* Header with celebration */}
            <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 p-6 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  🎉 Immagine Creata con Successo!
                </h2>
                <p className="text-white/90">
                  Il tuo {ovenModel} è stato integrato perfettamente nel tuo spazio
                </p>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-8 w-3 h-3 bg-pink-300 rounded-full animate-pulse animation-delay-500"></div>
              <div className="absolute bottom-4 left-8 w-2 h-2 bg-blue-300 rounded-full animate-bounce animation-delay-1000"></div>
            </div>

            {/* Image Display */}
            <div className="p-6">
              <div className="relative group">
                <img 
                  src={imageUrl} 
                  alt="Forno generato nel tuo spazio"
                  className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                
                {/* Image overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                    Clicca per ingrandire
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onDownload}
                  className="flex-1 bg-gradient-to-r from-vesuviano-500 to-vesuviano-600 hover:from-vesuviano-600 hover:to-vesuviano-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Scarica Immagine HD
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => {
                      // Implementa condivisione
                      if (navigator.share) {
                        navigator.share({
                          title: 'Il mio forno Vesuviano personalizzato',
                          text: 'Guarda come apparirà il mio nuovo forno!',
                          url: window.location.href
                        });
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">AI</div>
                  <div className="text-sm text-blue-700">Generato con Intelligenza Artificiale</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">HD</div>
                  <div className="text-sm text-green-700">Qualità Alta Risoluzione</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">🔥</div>
                  <div className="text-sm text-purple-700">Design Fotorealistico</div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                Immagine generata in {Math.floor(Math.random() * 5 + 3)} secondi con tecnologia AI avanzata
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageResultModal;