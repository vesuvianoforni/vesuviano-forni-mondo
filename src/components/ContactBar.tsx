import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContactBar = () => {
  const { t } = useTranslation();

  const handleWhatsAppClick = () => {
    const whatsappUrl = 'https://wa.link/a2959l';
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleContactClick = () => {
    const consultationSection = document.getElementById('consultation');
    if (consultationSection) {
      consultationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around p-3 max-w-screen-xl mx-auto">
        <button
          onClick={handleWhatsAppClick}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex-1 mx-1"
          aria-label="Contattaci su WhatsApp"
        >
          <img 
            src="/lovable-uploads/whatsapp-logo.png" 
            alt="WhatsApp" 
            className="h-5 w-5 object-contain brightness-0 invert"
          />
          <span className="font-medium text-sm">WhatsApp</span>
        </button>

        <button
          onClick={handleContactClick}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex-1 mx-1"
          aria-label="Richiedi consulenza"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium text-sm">{t('hero.cta')}</span>
        </button>
      </div>
    </div>
  );
};

export default ContactBar;
