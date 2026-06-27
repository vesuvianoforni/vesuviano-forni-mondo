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
  it: { title: 'Chi Siamo — Forni Napoletani Artigianali dal 1950 | Vesuviano Forni', description: "Vesuviano Forni: dal 1950 costruiamo forni napoletani artigianali a Sant'Anastasia e Boscoreale. Sabbia vulcanica, mattoni refrattari, esportazione in tutto il mondo." },
  en: { title: 'About Us — Handcrafted Neapolitan Ovens Since 1950 | Vesuviano Forni', description: "Vesuviano Forni: handcrafting Neapolitan ovens since 1950 in Sant'Anastasia and Boscoreale. Volcanic sand, refractory bricks, shipping worldwide." },
  fr: { title: 'Qui Sommes-Nous — Fours Napolitains Artisanaux depuis 1950 | Vesuviano Forni', description: "Vesuviano Forni : fabricants artisanaux de fours napolitains depuis 1950 à Sant'Anastasia et Boscoreale. Sable volcanique, briques réfractaires, export mondial." },
  de: { title: 'Über Uns — Handgefertigte Neapolitanische Öfen seit 1950 | Vesuviano Forni', description: "Vesuviano Forni: handwerkliche neapolitanische Öfen seit 1950 aus Sant'Anastasia und Boscoreale. Vulkansand, Schamottsteine, weltweiter Export." },
  es: { title: 'Quiénes Somos — Hornos Napolitanos Artesanales desde 1950 | Vesuviano Forni', description: "Vesuviano Forni: fabricantes artesanales de hornos napolitanos desde 1950 en Sant'Anastasia y Boscoreale. Arena volcánica, refractarios, envío mundial." },
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
