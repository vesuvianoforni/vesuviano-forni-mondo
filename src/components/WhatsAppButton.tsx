import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WhatsAppButton = () => {
  const { t } = useTranslation();
  
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t('whatsapp.message', 'Ciao, vorrei informazioni sui vostri forni professionali 🔥'));
    const whatsappUrl = `https://wa.me/393509286941?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      aria-label={t('whatsapp.tooltip')}
      title={t('whatsapp.tooltip')}
    >
      <MessageCircle size={24} className="group-hover:animate-pulse" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          {t('whatsapp.tooltip')}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
      
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
    </button>
  );
};

export default WhatsAppButton;