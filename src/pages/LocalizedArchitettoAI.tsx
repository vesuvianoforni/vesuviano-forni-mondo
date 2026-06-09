import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '@/i18n/config';
import ArchitettoAI from './ArchitettoAI';
import RouteSEO from '@/components/RouteSEO';

interface LocalizedArchitettoAIProps {
  lang: string;
}

const META: Record<string, { title: string; description: string }> = {
  it: { title: 'Architetto AI - Visualizza il tuo Forno | Vesuviano', description: 'Visualizza il forno Vesuviano nel tuo spazio con AI e Realtà Aumentata. Render 3D personalizzati in pochi secondi.' },
  en: { title: 'AI Architect - Visualize Your Oven | Vesuviano', description: 'Visualize a Vesuviano oven in your space with AI and Augmented Reality. Personalized 3D renders in seconds.' },
  fr: { title: 'Architecte IA - Visualisez votre Four | Vesuviano', description: 'Visualisez votre four Vesuviano dans votre espace grâce à l’IA et la réalité augmentée. Rendus 3D personnalisés.' },
  de: { title: 'AI-Architekt - Visualisieren Sie Ihren Ofen | Vesuviano', description: 'Visualisieren Sie Ihren Vesuviano-Ofen mit KI und Augmented Reality. Personalisierte 3D-Renderings in Sekunden.' },
  es: { title: 'Arquitecto IA - Visualiza tu Horno | Vesuviano', description: 'Visualiza tu horno Vesuviano en tu espacio con IA y Realidad Aumentada. Renders 3D personalizados al instante.' },
};

const LocalizedArchitettoAI = ({ lang }: LocalizedArchitettoAIProps) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      loadLanguage(lang);
    }
  }, [lang, i18n]);

  const meta = META[lang] || META.it;
  return (
    <>
      <RouteSEO lang={lang} title={meta.title} description={meta.description} />
      <ArchitettoAI />
    </>
  );
};

export default LocalizedArchitettoAI;
