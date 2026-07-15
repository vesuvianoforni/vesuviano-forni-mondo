import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const pizzoloLogo = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/client-logo-pizzolo.png';
const ansumLogo = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/client-logo-ansum.png';
const cuginiLogo = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/client-logo-cugini-pizza.png';

const clients = [
  { city: 'Pizzolo Bar — Brighton, UK', desc: '37 Ship Street, The Lanes, Brighton BN1 1AB. Sebastian model, built on place by our master builders.', img: pizzoloLogo },
  { city: 'Ansum Food Co — Porth, Cornwall', desc: 'Alexandra Rd, Porth, Newquay TR7 3NB. Real Bosco (gas), shipped from Naples.', img: ansumLogo, ig: 'https://www.instagram.com/ansumfood/' },
  { city: 'Cugini Pizza — UK', desc: 'Real Bosco wood-fired oven, shipped from Italy.', img: cuginiLogo, ig: 'https://www.instagram.com/cuginipizza_/' },
];

const TrustedByPizzerias = () => {
  const { i18n } = useTranslation();
  const [country, setCountry] = useState<string>('Italy');
  const [flag, setFlag] = useState<string>('🇮🇹');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('geo-detect');
        if (error) throw error;
        if (data?.country_name) setCountry(data.country_name);
        if (data?.flag) setFlag(data.flag);
      } catch (e) {
        console.error('geo-detect failed', e);
      }
    })();
  }, []);

  const lang = i18n.language;
  const title =
    lang.startsWith('it') ? `Scelti dalle pizzerie in ${country}` :
    lang.startsWith('fr') ? `Choisi par les pizzerias en ${country}` :
    lang.startsWith('de') ? `Vertraut von Pizzerien in ${country}` :
    lang.startsWith('es') ? `Elegidos por pizzerías en ${country}` :
    `Trusted by pizzerias in ${country}`;

  const subtitle =
    lang.startsWith('it') ? `Noi di Vesuviano siamo specializzati nella fornitura e assistenza dei nostri forni napoletani in ${country}, con numerose pizzerie già soddisfatte.` :
    lang.startsWith('fr') ? `Chez Vesuviano, nous sommes spécialisés dans la fourniture et l'assistance de nos fours napolitains en ${country}, avec de nombreuses pizzerias déjà satisfaites.` :
    lang.startsWith('de') ? `Wir bei Vesuviano sind spezialisiert auf Lieferung und Service unserer neapolitanischen Öfen in ${country}, mit zahlreichen bereits zufriedenen Pizzerien.` :
    lang.startsWith('es') ? `En Vesuviano estamos especializados en el suministro y la asistencia de nuestros hornos napolitanos en ${country}, con numerosas pizzerías ya satisfechas.` :
    `At Vesuviano we specialize in the supply and support of our Neapolitan ovens in ${country}, with many pizzerias already satisfied.`;

  return (
    <section id="clients-map" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
            {title} <span aria-hidden="true">{flag}</span>
          </h2>
          <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {clients.map((p) => (
            <div key={p.city} className="bg-stone-50 rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div className="bg-white h-56 flex items-center justify-center p-6">
                <img
                  src={p.img}
                  alt={`${p.city} — Vesuviano Forni client`}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="font-playfair font-bold text-charcoal-900 mb-1">{p.city}</h3>
                <p className="text-sm text-stone-600">{p.desc}</p>
                {p.ig && (
                  <a
                    href={p.ig}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-vesuviano-600 hover:text-vesuviano-700 mt-2"
                  >
                    Follow on Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedByPizzerias;
