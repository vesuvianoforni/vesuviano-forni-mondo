import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from "@/components/Header";
import RouteSEO from "@/components/RouteSEO";
import VesuvioBuono from "@/components/VesuvioBuono";
import ConsultationForm from "@/components/ConsultationForm";
import AIChatWidget from "@/components/chat/AIChatWidget";

interface LocalizedVesuvioBuonoProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const LocalizedVesuvioBuono = ({ lang }: LocalizedVesuvioBuonoProps) => {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  const pageTitle = `VesuvioBuono® - ${t('vesuvioBuono.subtitle')} | Vesuviano Forni`;
  const pageDescription = t('vesuvioBuono.subtitle');

  return (
    <div className="min-h-screen bg-charcoal-900">
        <Header />
        <RouteSEO lang={lang} title={pageTitle} description={pageDescription} />
        
        <main>
          {/* VesuvioBuono Section */}
          <VesuvioBuono />
          
          {/* Consultation Section */}
          <section id="consultation" aria-label="Consultation form">
            <ConsultationForm />
          </section>
        </main>

        <AIChatWidget />

        {/* Footer */}
        <footer className="bg-charcoal-900 text-white py-12 border-t border-stone-800">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div>
                <h3 className="font-playfair text-2xl font-bold mb-4">
                  Vesuviano<span className="text-vesuviano-500">Forni</span>
                </h3>
                <p className="text-stone-400 text-sm">
                  {t('hero.subtitle')}
                </p>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-4">{t('header.products')}</h4>
                <ul className="space-y-2 text-sm text-stone-400">
                  <li>
                    <a href={`/${lang}#products`} className="hover:text-white transition-colors">
                      {t('products.traditional.title')}
                    </a>
                  </li>
                  <li>
                    <a href={`/${lang}#products`} className="hover:text-white transition-colors">
                      {t('products.gas.title')}
                    </a>
                  </li>
                  <li>
                    <a href={`/${lang}#products`} className="hover:text-white transition-colors">
                      {t('products.electric.title')}
                    </a>
                  </li>
                  <li>
                    <a href={`/${lang}#products`} className="hover:text-white transition-colors">
                      {t('products.rotating.title')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold mb-4">Links</h4>
                <ul className="space-y-2 text-sm text-stone-400">
                  <li>
                    <a href={`/${lang}`} className="hover:text-white transition-colors">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href={`/${lang}#gallery`} className="hover:text-white transition-colors">
                      {t('header.gallery')}
                    </a>
                  </li>
                  <li>
                    <a href={`/${lang}/architettoai`} className="hover:text-white transition-colors">
                      Architetto AI
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
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

export default LocalizedVesuvioBuono;
