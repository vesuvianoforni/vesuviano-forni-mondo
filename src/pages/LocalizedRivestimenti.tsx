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
  it: { title: 'Rivestimenti Forni Napoletani — Verniciato, Mosaico, Ferro | Vesuviano Forni', description: 'Scopri i rivestimenti Vesuviano: verniciato, mosaicato, ferro e personalizzato. Finiture artigianali per ogni forno napoletano.' },
  en: { title: 'Neapolitan Oven Finishes — Painted, Mosaic, Iron | Vesuviano Forni', description: 'Discover Vesuviano finishes: painted, mosaic, iron and custom. Handcrafted coatings for every Neapolitan oven.' },
  fr: { title: 'Revêtements Fours Napolitains — Peint, Mosaïque, Fer | Vesuviano Forni', description: 'Découvrez les revêtements Vesuviano : peint, mosaïque, fer et personnalisé. Finitions artisanales pour chaque four napolitain.' },
  de: { title: 'Verkleidungen Neapolitanische Öfen — Lackiert, Mosaik, Eisen | Vesuviano Forni', description: 'Entdecken Sie die Vesuviano-Verkleidungen: lackiert, Mosaik, Eisen und maßgefertigt. Handwerkliche Oberflächen für jeden Ofen.' },
  es: { title: 'Revestimientos Hornos Napolitanos — Pintado, Mosaico, Hierro | Vesuviano Forni', description: 'Descubre los revestimientos Vesuviano: pintado, mosaico, hierro y personalizado. Acabados artesanales para cada horno napolitano.' },
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
