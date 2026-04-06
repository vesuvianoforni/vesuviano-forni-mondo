import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactBar = () => {
  const { t } = useTranslation();

  const handleContactClick = () => {
    const isHome = window.location.pathname === '/' || /^\/(it|en|fr|es|de)\/?$/.test(window.location.pathname);
    
    if (isHome) {
      const scrollToConsultation = () => {
        const el = document.getElementById('consultation');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      scrollToConsultation();
      setTimeout(scrollToConsultation, 300);
      setTimeout(scrollToConsultation, 800);
    } else {
      const el = document.getElementById('consultation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = '/#consultation';
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-2xl md:hidden">
      <div className="p-2.5 max-w-screen-xl mx-auto">
        <button
          onClick={handleContactClick}
          className="flex items-center justify-center gap-0.5 bg-vesuviano-500 hover:bg-vesuviano-600 text-white w-full py-3 rounded-xl transition-all duration-300 shadow-lg flex-col"
          aria-label={t('cta.getQuote')}
        >
          <span className="font-semibold text-sm">{t('cta.getQuote')}</span>
          <span className="text-[10px] font-normal opacity-80">{t('cta.getQuoteSubtext')}</span>
        </button>
      </div>
    </div>
  );
};

export default ContactBar;
