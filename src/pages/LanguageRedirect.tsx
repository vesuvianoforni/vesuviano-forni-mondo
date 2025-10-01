import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageRedirect = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    const detectedLang = i18n.language || 'it';
    const lang = detectedLang.split('-')[0]; // Get 'it' from 'it-IT'
    
    // Redirect to the detected language
    navigate(`/${lang}`, { replace: true });
  }, [i18n.language, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesuviano-500 mx-auto"></div>
        <p className="mt-4 text-stone-600">Loading...</p>
      </div>
    </div>
  );
};

export default LanguageRedirect;
