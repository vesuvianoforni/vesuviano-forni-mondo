import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import VesuvioBuono from "@/components/VesuvioBuono";
import ConsultationForm from "@/components/ConsultationForm";
import AIChatWidget from "@/components/chat/AIChatWidget";

interface LocalizedVesuvioBuonoProps {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Sistema VesuvioBuono® — Forno a Legna Zero Emissioni | Vesuviano Forni', description: 'VesuvioBuono®: il forno a legna napoletano a zero emissioni con abbattimento fumi integrato. Cottura tradizionale e conformità ambientale per le città.' },
  en: { title: 'VesuvioBuono® System — Zero-Emission Wood-Fired Oven | Vesuviano Forni', description: 'VesuvioBuono®: the zero-emission Neapolitan wood-fired oven with integrated smoke abatement. Traditional baking, urban-friendly environmental compliance.' },
  fr: { title: 'Système VesuvioBuono® — Four à Bois Zéro Émission | Vesuviano Forni', description: 'VesuvioBuono® : le four à bois napolitain zéro émission avec abattement des fumées intégré. Cuisson traditionnelle, conformité environnementale urbaine.' },
  de: { title: 'VesuvioBuono®-System — Emissionsfreier Holzofen | Vesuviano Forni', description: 'VesuvioBuono®: der emissionsfreie neapolitanische Holzofen mit integrierter Rauchabscheidung. Traditionelles Backen, urbane Umweltkonformität.' },
  es: { title: 'Sistema VesuvioBuono® — Horno de Leña Cero Emisiones | Vesuviano Forni', description: 'VesuvioBuono®: el horno de leña napolitano cero emisiones con abatimiento de humos integrado. Cocción tradicional y cumplimiento ambiental urbano.' },
};

const LocalizedVesuvioBuono = ({ lang }: LocalizedVesuvioBuonoProps) => {
  const { i18n, t } = useTranslation();
  const meta = META[lang] || META.it;

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return (
    <div className="min-h-screen bg-charcoal-900">
        <Header />
        <SEOHead lang={lang} title={meta.title} description={meta.description} />
        
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
