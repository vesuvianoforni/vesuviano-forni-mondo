import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import Rivestimenti from "@/components/Rivestimenti";
import ConsultationForm from "@/components/ConsultationForm";
import AIChatWidget from "@/components/chat/AIChatWidget";

interface Props {
  lang: 'it' | 'en' | 'fr' | 'es' | 'de';
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Rivestimenti Forni — Mosaico, Verniciato, Palladiana, Doghe Metalliche | Vesuviano Forni', description: 'Personalizza il tuo forno napoletano con i rivestimenti Vesuviano: mosaico, verniciato, palladiana e doghe metalliche. Finiture artigianali su misura.' },
  en: { title: 'Oven Finishes — Mosaic, Painted, Palladiana, Metal Slats | Vesuviano Forni', description: 'Customize your Neapolitan oven with Vesuviano finishes: mosaic, painted, palladiana and metal slats. Handcrafted made-to-measure coatings.' },
  fr: { title: 'Revêtements Fours — Mosaïque, Peint, Palladiana, Lames Métalliques | Vesuviano Forni', description: 'Personnalisez votre four napolitain avec les revêtements Vesuviano : mosaïque, peint, palladiana et lames métalliques. Finitions artisanales sur mesure.' },
  de: { title: 'Ofen-Verkleidungen — Mosaik, Lackiert, Palladiana, Metallleisten | Vesuviano Forni', description: 'Personalisieren Sie Ihren neapolitanischen Ofen mit Vesuviano-Verkleidungen: Mosaik, lackiert, Palladiana und Metallleisten. Handgefertigte Maßoberflächen.' },
  es: { title: 'Revestimientos Hornos — Mosaico, Pintado, Palladiana, Lamas Metálicas | Vesuviano Forni', description: 'Personaliza tu horno napolitano con los revestimientos Vesuviano: mosaico, pintado, palladiana y lamas metálicas. Acabados artesanales a medida.' },
};

const LocalizedRivestimenti = ({ lang }: Props) => {
  const { i18n } = useTranslation();
  const meta = META[lang] || META.it;

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <SEOHead lang={lang} title={meta.title} description={meta.description} />
      <main className="pt-20">
        <Rivestimenti />
        <section id="consultation" aria-label="Consultation form">
          <ConsultationForm />
        </section>
      </main>
      <AIChatWidget />
    </div>
  );
};

export default LocalizedRivestimenti;
