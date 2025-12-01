import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
  title?: string;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] p-0 border-0 bg-black/90" onClick={onClose}>
        <DialogTitle className="sr-only">{title || imageAlt}</DialogTitle>
        
        {/* Close button - Più grande su mobile */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-50 p-3 md:p-2 rounded-full bg-white/90 text-black hover:bg-white transition-colors shadow-lg touch-manipulation"
          aria-label="Chiudi immagine ingrandita"
        >
          <X className="w-8 h-8 md:w-6 md:h-6" />
        </button>

        {/* Image container */}
        <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Title overlay if provided */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white text-xl font-playfair font-semibold text-center">
              {title}
            </h3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomModal;