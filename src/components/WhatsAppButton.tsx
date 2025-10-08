import React from 'react';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const whatsappUrl = 'https://wa.link/a2959l';
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-white hover:bg-gray-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 group border border-gray-200 animate-float"
      aria-label="Contattaci su WhatsApp"
      title="Contattaci su WhatsApp"
    >
      <img 
        src="/lovable-uploads/whatsapp-logo-inline.png" 
        alt="WhatsApp" 
        className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          Contattaci su WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </button>
  );
};

export default WhatsAppButton;