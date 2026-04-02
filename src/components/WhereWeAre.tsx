
import { useTranslation } from 'react-i18next';
import { MapPin, Mountain, Flame } from 'lucide-react';

const labels: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  lab1: string;
  lab1desc: string;
  lab2: string;
  lab2desc: string;
  volcanoTitle: string;
  volcanoDesc: string;
  sandTitle: string;
  sandDesc: string;
}> = {
  it: {
    title: 'Dove Siamo',
    subtitle: 'Radicati alle pendici del Vesuvio',
    description: 'I nostri laboratori sorgono ai piedi del famoso Vulcano Vesuvio, in Campania. Da qui nasce il nome "Vesuviano": un legame profondo con la terra vulcanica che ci circonda. Utilizziamo la sabbia vulcanica del Vesuvio nella produzione dei nostri forni, conferendo proprietà termiche uniche e un\'autenticità impossibile da replicare.',
    lab1: 'Laboratorio Sant\'Anastasia',
    lab1desc: 'Laboratorio di produzione artigianale',
    lab2: 'Laboratorio Boscoreale',
    lab2desc: 'Laboratorio di produzione artigianale',
    volcanoTitle: 'Il Vulcano Vesuvio',
    volcanoDesc: 'I nostri laboratori sorgono alle sue pendici, dove la terra è ricca di minerali vulcanici',
    sandTitle: 'Sabbia Vulcanica',
    sandDesc: 'Ingrediente segreto dei nostri forni: la sabbia del Vesuvio garantisce proprietà termiche superiori',
  },
  en: {
    title: 'Where We Are',
    subtitle: 'Rooted at the foot of Vesuvius',
    description: 'Our workshops are located at the foot of the famous Mount Vesuvius, in Campania. This is where the name "Vesuviano" comes from: a deep bond with the volcanic land that surrounds us. We use Vesuvius volcanic sand in the production of our ovens, giving them unique thermal properties and an authenticity impossible to replicate.',
    lab1: 'Sant\'Anastasia Workshop',
    lab1desc: 'Artisan production workshop',
    lab2: 'Boscoreale Workshop',
    lab2desc: 'Artisan production workshop',
    volcanoTitle: 'Mount Vesuvius',
    volcanoDesc: 'Our workshops sit at its slopes, where the soil is rich in volcanic minerals',
    sandTitle: 'Volcanic Sand',
    sandDesc: 'The secret ingredient of our ovens: Vesuvius sand provides superior thermal properties',
  },
  fr: {
    title: 'Où Nous Sommes',
    subtitle: 'Enracinés au pied du Vésuve',
    description: 'Nos ateliers sont situés au pied du célèbre Vésuve, en Campanie. C\'est de là que vient le nom "Vesuviano" : un lien profond avec la terre volcanique qui nous entoure. Nous utilisons le sable volcanique du Vésuve dans la production de nos fours, leur conférant des propriétés thermiques uniques.',
    lab1: 'Atelier Sant\'Anastasia',
    lab1desc: 'Atelier de production artisanale',
    lab2: 'Atelier Boscoreale',
    lab2desc: 'Atelier de production artisanale',
    volcanoTitle: 'Le Vésuve',
    volcanoDesc: 'Nos ateliers se trouvent à ses pieds, où la terre est riche en minéraux volcaniques',
    sandTitle: 'Sable Volcanique',
    sandDesc: 'L\'ingrédient secret de nos fours : le sable du Vésuve garantit des propriétés thermiques supérieures',
  },
  de: {
    title: 'Wo Wir Sind',
    subtitle: 'Verwurzelt am Fuße des Vesuvs',
    description: 'Unsere Werkstätten befinden sich am Fuße des berühmten Vulkans Vesuv in Kampanien. Daher der Name "Vesuviano": eine tiefe Verbindung mit dem vulkanischen Land. Wir verwenden vulkanischen Sand des Vesuvs bei der Herstellung unserer Öfen, was ihnen einzigartige thermische Eigenschaften verleiht.',
    lab1: 'Werkstatt Sant\'Anastasia',
    lab1desc: 'Handwerkliche Produktionswerkstatt',
    lab2: 'Werkstatt Boscoreale',
    lab2desc: 'Handwerkliche Produktionswerkstatt',
    volcanoTitle: 'Der Vesuv',
    volcanoDesc: 'Unsere Werkstätten liegen an seinen Hängen, wo der Boden reich an vulkanischen Mineralien ist',
    sandTitle: 'Vulkansand',
    sandDesc: 'Die geheime Zutat unserer Öfen: Vesuvsand bietet überlegene thermische Eigenschaften',
  },
  es: {
    title: 'Dónde Estamos',
    subtitle: 'Arraigados a los pies del Vesubio',
    description: 'Nuestros talleres están ubicados a los pies del famoso Volcán Vesubio, en Campania. De aquí nace el nombre "Vesuviano": un vínculo profundo con la tierra volcánica que nos rodea. Utilizamos arena volcánica del Vesubio en la producción de nuestros hornos, otorgándoles propiedades térmicas únicas.',
    lab1: 'Taller Sant\'Anastasia',
    lab1desc: 'Taller de producción artesanal',
    lab2: 'Taller Boscoreale',
    lab2desc: 'Taller de producción artesanal',
    volcanoTitle: 'El Vesubio',
    volcanoDesc: 'Nuestros talleres se encuentran a sus pies, donde la tierra es rica en minerales volcánicos',
    sandTitle: 'Arena Volcánica',
    sandDesc: 'El ingrediente secreto de nuestros hornos: la arena del Vesubio garantiza propiedades térmicas superiores',
  },
};

const WhereWeAre = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const l = labels[lang] || labels.it;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-vesuviano-100 text-vesuviano-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              <span>Campania, Italia</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {l.title}
            </h2>
            <p className="text-xl text-vesuviano-600 font-medium mb-4">
              {l.subtitle}
            </p>
            <p className="text-stone-600 max-w-3xl mx-auto leading-relaxed text-lg">
              {l.description}
            </p>
          </div>

          {/* Map + Info Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Map Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <img
                src="/lovable-uploads/vesuvio-mappa-laboratori.png"
                alt="Mappa dei laboratori Vesuviano alle pendici del Vesuvio"
                className="w-full h-full object-cover min-h-[320px] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium opacity-90">📍 Sant'Anastasia & Boscoreale (NA)</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="flex flex-col gap-4">
              {/* Labs */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vesuviano-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-vesuviano-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-900 mb-1">{l.lab1}</h4>
                    <p className="text-sm text-stone-600">{l.lab1desc}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vesuviano-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-vesuviano-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-900 mb-1">{l.lab2}</h4>
                    <p className="text-sm text-stone-600">{l.lab2desc}</p>
                  </div>
                </div>
              </div>

              {/* Volcano */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mountain className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-900 mb-1">{l.volcanoTitle}</h4>
                    <p className="text-sm text-stone-600">{l.volcanoDesc}</p>
                  </div>
                </div>
              </div>

              {/* Volcanic Sand */}
              <div className="bg-gradient-to-r from-vesuviano-50 to-orange-50 rounded-xl p-6 shadow-md border border-vesuviano-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-vesuviano-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal-900 mb-1">{l.sandTitle}</h4>
                    <p className="text-sm text-stone-600">{l.sandDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhereWeAre;
