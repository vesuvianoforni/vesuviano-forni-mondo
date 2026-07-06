
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Path mappings for each page across languages
  const pathMappings: Record<string, Record<string, string>> = {
    'traditional-ovens': {
      it: '/forni-tradizionali',
      en: '/traditional-ovens',
      fr: '/fours-traditionnels',
      es: '/hornos-tradicionales',
      de: '/traditionelle-oefen'
    },
    'gas-ovens': {
      it: '/forni-gas',
      en: '/gas-ovens',
      fr: '/fours-gaz',
      es: '/hornos-gas',
      de: '/gasoefen'
    },
    'electric-ovens': {
      it: '/forni-elettrici',
      en: '/electric-ovens',
      fr: '/fours-electriques',
      es: '/hornos-electricos',
      de: '/elektrooefen'
    },
    'rotating-ovens': {
      it: '/forni-rotativi',
      en: '/rotating-ovens',
      fr: '/fours-rotatifs',
      es: '/hornos-rotativos',
      de: '/drehoefen'
    },
    'ready-to-ship': {
      it: '/pronta-consegna',
      en: '/ready-to-ship',
      fr: '/pret-a-expedier',
      es: '/listo-para-enviar',
      de: '/versandfertig'
    },
    'vesuviobuono': {
      it: '/sistema-vesuviobuono',
      en: '/vesuviobuono-system',
      fr: '/systeme-vesuviobuono',
      es: '/sistema-vesuviobuono',
      de: '/vesuviobuono-system'
    },
    'architettoai': {
      it: '/architettoai',
      en: '/architettoai',
      fr: '/architettoai',
      es: '/architettoai',
      de: '/architettoai'
    },
    'thank-you': {
      it: '/thank-you-it',
      en: '/thank-you-en',
      fr: '/thank-you-fr',
      es: '/thank-you-es',
      de: '/thank-you-de'
    },
    'finishes': {
      it: '/rivestimenti',
      en: '/finishes',
      fr: '/revetements',
      es: '/revestimientos',
      de: '/verkleidungen'
    }
  };


  const changeLanguage = async (languageCode: string) => {
    const currentPath = location.pathname;
    const currentLangMatch = currentPath.match(/^\/(it|en|fr|de|es)/);
    const currentLang = currentLangMatch ? currentLangMatch[1] : 'it';
    
    // Get the path without the language prefix
    let pathWithoutLang = currentPath;
    if (currentLangMatch) {
      pathWithoutLang = currentPath.substring(currentLangMatch[0].length) || '/';
    }
    
    // Check if we need to map the path
    let newPath = `/${languageCode}`;
    
    if (pathWithoutLang === '/' || pathWithoutLang === '') {
      newPath = `/${languageCode}`;
    } else {
      // Blog post: look up localized slug in DB
      const blogMatch = pathWithoutLang.match(/^\/blog\/(.+)$/);
      if (blogMatch) {
        const currentSlug = blogMatch[1];
        const currentSlugField = `slug_${currentLang}`;
        const targetSlugField = `slug_${languageCode}`;
        try {
          const { data } = await (supabase
            .from('blog_posts') as any)
            .select(targetSlugField)
            .eq(currentSlugField, currentSlug)
            .maybeSingle();
          const targetSlug = (data as any)?.[targetSlugField];
          if (targetSlug) {
            newPath = `/${languageCode}/blog/${targetSlug}`;
          } else {
            newPath = `/${languageCode}/blog`;
          }
        } catch {
          newPath = `/${languageCode}/blog`;
        }
      } else {
        // Try static path mappings
        let mappingFound = false;
        for (const [key, mapping] of Object.entries(pathMappings)) {
          if (mapping[currentLang] === pathWithoutLang) {
            newPath = `/${languageCode}${mapping[languageCode]}`;
            mappingFound = true;
            break;
          }
        }
        if (!mappingFound) {
          newPath = `/${languageCode}${pathWithoutLang}`;
        }
      }
    }
    
    navigate(newPath);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe size={16} />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-vesuviano-50' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
