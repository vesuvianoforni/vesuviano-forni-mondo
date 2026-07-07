import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import AboutUs from "@/components/AboutUs";
import ConsultationForm from "@/components/ConsultationForm";
import AIChatWidget from "@/components/chat/AIChatWidget";
import { Link } from 'react-router-dom';

interface LocalizedAboutUsProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Chi Siamo — Vesuviano Forni | Brand napoletano, radici artigiane 50+ anni', description: "Vesuviano Forni: brand fondato nel 2025 che riunisce maestri artigiani napoletani con oltre 50 anni di esperienza. Forni professionali per pizza tra tradizione e innovazione." },
  en: { title: 'About Us — Vesuviano Forni | Neapolitan brand with 50+ years of craft', description: 'Vesuviano Forni: a brand founded in 2025 uniting Neapolitan master artisans with 50+ years of experience. Professional pizza ovens where tradition meets innovation.' },
  fr: { title: 'Qui Sommes-Nous — Vesuviano Forni | Marque napolitaine, 50+ ans de savoir-faire', description: "Vesuviano Forni : marque fondée en 2025 réunissant des maîtres artisans napolitains avec plus de 50 ans d'expérience. Fours à pizza professionnels, tradition et innovation." },
  de: { title: 'Über Uns — Vesuviano Forni | Neapolitanische Marke, 50+ Jahre Handwerk', description: 'Vesuviano Forni: 2025 gegründete Marke, die neapolitanische Meisterhandwerker mit über 50 Jahren Erfahrung vereint. Professionelle Pizzaöfen zwischen Tradition und Innovation.' },
  es: { title: 'Quiénes Somos — Vesuviano Forni | Marca napolitana, 50+ años de artesanía', description: 'Vesuviano Forni: marca fundada en 2025 que reúne a maestros artesanos napolitanos con más de 50 años de experiencia. Hornos profesionales entre tradición e innovación.' },
};

const LocalizedAboutUs = ({ lang }: LocalizedAboutUsProps) => {
  const { i18n, t } = useTranslation();
  const meta = META[lang] || META.it;

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  const getVesuvioBuonoPath = () => {
    const paths: Record<string, string> = {
      'it': '/it/sistema-vesuviobuono',
      'en': '/en/vesuviobuono-system',
      'fr': '/fr/systeme-vesuviobuono',
      'es': '/es/sistema-vesuviobuono',
      'de': '/de/vesuviobuono-system'
    };
    return paths[lang] || paths['it'];
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      
      <main>
        <AboutUs />
        
        <section id="consultation" aria-label="Consultation form">
          <ConsultationForm />
        </section>
      </main>

      <AIChatWidget />

      <footer className="bg-charcoal-900 text-white py-12 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-playfair text-2xl font-bold mb-4">
                Vesuviano<span className="text-vesuviano-500">Forni</span>
              </h3>
              <p className="text-stone-400 text-sm">
                {t('hero.subtitle')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('header.products')}</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><a href={`/${lang}#products`} className="hover:text-white transition-colors">{t('products.traditional.title')}</a></li>
                <li><a href={`/${lang}#products`} className="hover:text-white transition-colors">{t('products.gas.title')}</a></li>
                <li><a href={`/${lang}#products`} className="hover:text-white transition-colors">{t('products.electric.title')}</a></li>
                <li><a href={`/${lang}#products`} className="hover:text-white transition-colors">{t('products.rotating.title')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><a href={`/${lang}`} className="hover:text-white transition-colors">Home</a></li>
                <li><a href={`/${lang}#gallery`} className="hover:text-white transition-colors">{t('header.gallery')}</a></li>
                <li><a href={`/${lang}/architettoai`} className="hover:text-white transition-colors">Architetto AI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('header.contact')}</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>info@vesuvianoforni.com</li>
                <li>081 19231684</li>
                <li>{t('craftsmanship.laboratory.location')}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-sm text-stone-400">
            <p>© 2024 Vesuviano Forni. {t('products.badges.madeInNaples')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LocalizedAboutUs;
