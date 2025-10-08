import React from 'react';
import { MessageCircle } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-2xl md:hidden">
      <div className="flex items-center gap-2 p-2.5 max-w-screen-xl mx-auto">
        <button
          onClick={handleWhatsAppClick}
          className="flex items-center justify-center gap-2 bg-[#25D366]/90 hover:bg-[#25D366] text-white px-5 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg backdrop-blur-sm flex-1"
          aria-label="Contattaci su WhatsApp"
        >
          <img 
            src="/lovable-uploads/whatsapp-logo.png" 
            alt="WhatsApp" 
            className="h-5 w-5 object-contain brightness-0 invert"
          />
          <span className="font-semibold text-sm">WhatsApp</span>
        </button>

        <button
          onClick={handleContactClick}
          className="flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground px-5 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg backdrop-blur-sm flex-1"
          aria-label={t('consultation.title')}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold text-sm">{t('consultation.contact')}</span>
        </button>
      </div>
    </div>
  );
};

export default ContactBar;
