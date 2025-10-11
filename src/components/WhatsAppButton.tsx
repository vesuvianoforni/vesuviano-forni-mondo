import React from 'react';

const WhatsAppButton = () => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Invia evento a Google Tag Manager
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'click_whatsapp',
      source: 'desktop_button',
    });
    
    // Delay di 300ms prima del redirect per dare tempo a GTM
    setTimeout(() => {
      const whatsappUrl = 'https://wa.link/a2959l';
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-400 bg-white hover:bg-gray-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 group border border-gray-200 animate-float hidden md:block"
      aria-label="Contattaci su WhatsApp"
      title="Contattaci su WhatsApp"
      data-gtm-event="click_whatsapp"
      data-gtm-source="desktop_button"
      data-whatsapp-link="https://wa.link/a2959l"
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