
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const labels: Record<string, {
  title: string;
  subtitle: string;
  description: string;
}> = {
  it: {
    title: 'Dove Siamo',
    subtitle: 'Radicati alle pendici del Vesuvio',
    description: 'I nostri laboratori sorgono ai piedi del Vesuvio, in Campania. Utilizziamo la sabbia vulcanica nella produzione dei nostri forni, conferendo proprietà termiche uniche e un\'autenticità impossibile da replicare.',
  },
  en: {
    title: 'Where We Are',
    subtitle: 'Rooted at the foot of Vesuvius',
    description: 'Our workshops are located at the foot of Mount Vesuvius, in Campania. We use volcanic sand in our ovens, giving them unique thermal properties and authenticity impossible to replicate.',
  },
  fr: {
    title: 'Où Nous Sommes',
    subtitle: 'Enracinés au pied du Vésuve',
    description: 'Nos ateliers sont situés au pied du Vésuve, en Campanie. Nous utilisons le sable volcanique dans la production de nos fours, leur conférant des propriétés thermiques uniques.',
  },
  de: {
    title: 'Wo Wir Sind',
    subtitle: 'Verwurzelt am Fuße des Vesuvs',
    description: 'Unsere Werkstätten befinden sich am Fuße des Vesuvs in Kampanien. Wir verwenden vulkanischen Sand bei der Herstellung unserer Öfen, was ihnen einzigartige thermische Eigenschaften verleiht.',
  },
  es: {
    title: 'Dónde Estamos',
    subtitle: 'Arraigados a los pies del Vesubio',
    description: 'Nuestros talleres están ubicados a los pies del Vesubio, en Campania. Utilizamos arena volcánica en la producción de nuestros hornos, otorgándoles propiedades térmicas únicas.',
  },
};

const WhereWeAre = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const l = labels[lang] || labels.it;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 bg-vesuviano-100 text-vesuviano-700 px-3 py-1.5 rounded-full text-xs font-medium mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Campania, Italia</span>
            </div>
            <h2 className="font-playfair text-2xl md:text-4xl font-bold text-stone-900 mb-2">
              {l.title}
            </h2>
            <p className="text-sm md:text-base text-vesuviano-600 font-medium mb-2">
              {l.subtitle}
            </p>
            <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              {l.description}
            </p>
          </div>

          {/* Map Image */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuvio-mappa-laboratori.webp"
              alt="Mappa dei laboratori Vesuviano alle pendici del Vesuvio"
              className="w-full h-48 md:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-xs md:text-sm font-medium opacity-90">📍 Sant'Anastasia & Boscoreale (NA)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereWeAre;
