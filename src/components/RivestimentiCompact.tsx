import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  { key: 'verniciato', image: "/lovable-uploads/forno-arancione-terra-del-gusto.webp" },
  { key: 'mosaicato', image: "/lovable-uploads/vesuviobuono-verde-mosaico.webp" },
  { key: 'ferro', image: "/lovable-uploads/forno-nero-metallico-nuovo.webp" },
  { key: 'personalizzato', image: "/lovable-uploads/vesuviobuono-osteria-pizza.webp" },
];

const RivestimentiCompact = () => {
  const { t } = useTranslation();

  return (
    <section id="rivestimenti" className="py-14 md:py-16 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-10">
          <Badge variant="outline" className="mb-3 text-vesuviano-600 border-vesuviano-200">
            {t('rivestimenti.badge', 'Personalizzazione')}
          </Badge>
          <h2 className="font-playfair text-2xl md:text-4xl font-bold text-charcoal-900 mb-2">
            {t('rivestimenti.title', 'Rivestimenti')}{' '}
            <span className="text-vesuviano-600">{t('rivestimenti.titleHighlight', 'Esclusivi')}</span>
          </h2>
          <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto">
            {t('rivestimenti.subtitleShort', { defaultValue: 'Choose the finish that fits your style.' })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
          {items.map((it) => (
            <Card
              key={it.key}
              className="group overflow-hidden border-stone-200 hover:border-vesuviano-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-white">
                <img
                  src={it.image}
                  alt={t(`rivestimenti.${it.key}.title`)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="font-playfair text-white text-sm md:text-lg font-bold leading-tight">
                    {t(`rivestimenti.${it.key}.title`, it.key.charAt(0).toUpperCase() + it.key.slice(1))}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RivestimentiCompact;
