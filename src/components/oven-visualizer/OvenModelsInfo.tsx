
import React from 'react';

const OvenModelsInfo = () => {
  return (
    <div className="mt-8 md:mt-12 text-center">
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200">
        <h3 className="font-playfair text-xl md:text-2xl font-bold text-charcoal-900 mb-3 md:mb-4">
          I Nostri Modelli di Forno
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/vesuviobuono-marrone-completo.jpg" 
              alt="VesuvioBuono" 
              className="w-16 h-16 md:w-24 md:h-24 object-cover mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
            />
            <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">VesuvioBuono</h4>
            <p className="text-xs md:text-sm text-stone-600">Rivestimento a mosaico premium con tecnologia avanzata</p>
          </div>
          <div className="text-center">
            <img 
              src="/lovable-uploads/forno-arancione-terra-del-gusto.png" 
              alt="Verniciato" 
              className="w-16 h-16 md:w-24 md:h-24 object-cover mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
            />
            <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">Verniciato</h4>
            <p className="text-xs md:text-sm text-stone-600">Finitura verniciata tradizionale in terracotta</p>
          </div>
          <div className="text-center">
            <img 
              src="/lovable-uploads/vesuviobuono-verde-mosaico.jpg" 
              alt="Mosaicato" 
              className="w-16 h-16 md:w-24 md:h-24 object-cover mx-auto mb-3 md:mb-4 rounded-lg border border-stone-200"
            />
            <h4 className="font-semibold text-stone-900 mb-1 md:mb-2 text-sm md:text-base">Mosaicato</h4>
            <p className="text-xs md:text-sm text-stone-600">Rivestimento a mosaico personalizzabile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvenModelsInfo;
