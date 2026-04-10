import { useState, useEffect } from 'react';
import { X, Phone } from 'lucide-react';

const CALLBACK_TEXTS: Record<string, { question: string; yes: string; no: string }> = {
  it: { question: 'Vorresti che ti chiamassimo?', yes: 'Sì, grazie!', no: 'No, grazie.' },
  en: { question: 'Would you like us to call you?', yes: 'Yes, please!', no: 'No, thanks.' },
  fr: { question: 'Souhaitez-vous qu\'on vous appelle ?', yes: 'Oui, merci !', no: 'Non, merci.' },
  de: { question: 'Möchten Sie, dass wir Sie anrufen?', yes: 'Ja, bitte!', no: 'Nein, danke.' },
  es: { question: '¿Te gustaría que te llamemos?', yes: '¡Sí, por favor!', no: 'No, gracias.' },
};

function getBrowserLang(): string {
  const nav = navigator.language || (navigator as any).userLanguage || 'it';
  const short = nav.substring(0, 2).toLowerCase();
  return ['it', 'en', 'fr', 'de', 'es'].includes(short) ? short : 'en';
}

const DISMISSED_KEY = 'vesuviano_callback_dismissed';

const CallbackPopup = () => {
  const [visible, setVisible] = useState(false);
  const lang = getBrowserLang();
  const t = CALLBACK_TEXTS[lang] || CALLBACK_TEXTS.en;

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  const handleYes = () => {
    dismiss();
    window.dispatchEvent(new CustomEvent('vesuviano-callback-request'));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] animate-fade-in md:bottom-24 md:right-6 bottom-20 right-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 w-72 relative">
        <button onClick={dismiss} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📞</span>
          <h3 className="font-semibold text-stone-800 text-base leading-tight">{t.question}</h3>
        </div>

        <hr className="border-stone-200 mb-3" />

        <div className="flex flex-col gap-2">
          <button
            onClick={handleYes}
            className="text-left text-vesuviano-600 font-semibold text-base hover:text-vesuviano-700 transition-colors px-1 py-1"
          >
            {t.yes}
          </button>
          <button
            onClick={dismiss}
            className="text-left text-vesuviano-600 font-semibold text-base hover:text-vesuviano-700 transition-colors px-1 py-1"
          >
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallbackPopup;
