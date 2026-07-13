import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';
import ProductVideoSection from '@/components/ProductVideoSection';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import AvanziniPartnerStrip from '@/components/AvanziniPartnerStrip';

type Lang = 'en' | 'fr' | 'de' | 'es';

interface Props { lang: Lang; }

const PATHS: Record<Lang, string> = {
  en: '/en/neapolitan-pizza-ovens',
  fr: '/fr/fours-a-pizza-napolitains',
  de: '/de/neapolitanische-pizzaoefen',
  es: '/es/hornos-pizza-napolitana',
};

const CONTENT = {
  en: {
    seoTitle: 'Neapolitan Pizza Ovens | Handmade in Naples — Vesuviano Forni',
    seoDesc: 'Authentic Neapolitan pizza ovens, handcrafted in Naples with Vesuvian volcanic stone. Wood, gas and hybrid models for restaurants and pizzerias worldwide.',
    h1: 'Neapolitan Pizza Ovens',
    sub: 'Handcrafted in Naples since generations. The authentic dome that bakes a true 450°C Neapolitan pizza in 60–90 seconds.',
    aboutTitle: 'Why a real Neapolitan oven matters',
    aboutP1: 'A genuine Neapolitan pizza oven is not just a dome — it is a thermal machine engineered to hold 430–480°C on the cooking floor while the vault radiates the leopard-spot leoparding on the cornicione. Our ovens are built in Sant\'Anastasia and Boscoreale, at the foot of Vesuvius, with refractory clay and volcanic sand drawn from the same soil that has fired Neapolitan pizza for two centuries.',
    aboutP2: 'Every dome is shaped by hand, cured slowly, and finished with the traditional mosaic or majolica that has become the signature of Vesuviano Forni in over 40 countries.',
    featuresTitle: 'Built for the true Neapolitan craft',
    features: [
      { t: 'AVPN-grade temperature', d: 'Floor 430–480°C, vault 480°C — the exact window required by the Associazione Verace Pizza Napoletana.' },
      { t: '60–90 second bake', d: 'Cornicione, soft center, no burnt base. The cooking floor recovers heat between pies thanks to dense biscotto-style refractory.' },
      { t: 'Volcanic stone dome', d: 'Vesuvian sand and refractory clay give superior thermal inertia and the deep, dry heat Neapolitan dough needs.' },
      { t: 'Wood, gas or hybrid', d: 'Same dome geometry, three fuels. Hybrid configurations let you switch mid-service without flavour loss.' },
    ],
    modelsTitle: 'Our Neapolitan models',
    models: [
      { name: 'Anastasia', desc: 'The traditional dome — 5 to 9 pizzas per cycle.', href: '/en/traditional-ovens' },
      { name: 'Ottavio', desc: 'Compact wood-fired Neapolitan, ideal for premium pizzerias.', href: '/en/traditional-ovens' },
      { name: 'Real Bosco', desc: 'Large-capacity production dome for high-volume kitchens.', href: '/en/traditional-ovens' },
      { name: 'VesuvioBuono', desc: 'Hybrid wood/gas Neapolitan with patented insulation.', href: '/en/vesuviobuono-system' },
    ],
    ctaTitle: 'Bring an authentic Neapolitan oven to your restaurant',
    ctaText: 'Tell us about your project — our team in Naples will recommend the right model, fuel and finish.',
  },
  fr: {
    seoTitle: 'Fours à Pizza Napolitains | Fabriqués à Naples — Vesuviano Forni',
    seoDesc: 'Authentiques fours à pizza napolitains, fabriqués artisanalement à Naples avec la pierre volcanique du Vésuve. Modèles bois, gaz et hybrides pour restaurants et pizzerias.',
    h1: 'Fours à Pizza Napolitains',
    sub: 'Façonnés à la main à Naples depuis des générations. Le dôme authentique qui cuit une véritable pizza napolitaine à 450°C en 60 à 90 secondes.',
    aboutTitle: 'Pourquoi un vrai four napolitain change tout',
    aboutP1: 'Un véritable four à pizza napolitain n\'est pas seulement un dôme : c\'est une machine thermique conçue pour maintenir 430–480°C sur la sole pendant que la voûte rayonne la fameuse cuisson léopard du cornicione. Nos fours sont construits à Sant\'Anastasia et Boscoreale, au pied du Vésuve, avec l\'argile réfractaire et le sable volcanique du même sol qui cuit la pizza napolitaine depuis deux siècles.',
    aboutP2: 'Chaque dôme est façonné à la main, séché lentement et fini avec la mosaïque ou la majolique traditionnelle, signature de Vesuviano Forni dans plus de 40 pays.',
    featuresTitle: 'Conçu pour le vrai savoir-faire napolitain',
    features: [
      { t: 'Température certifiée AVPN', d: 'Sole 430–480°C, voûte 480°C — la fenêtre exacte exigée par l\'Associazione Verace Pizza Napoletana.' },
      { t: 'Cuisson en 60–90 secondes', d: 'Cornicione gonflé, cœur moelleux, pas de fond brûlé. La sole récupère sa chaleur entre chaque pizza grâce au biscotto réfractaire.' },
      { t: 'Dôme en pierre volcanique', d: 'Sable du Vésuve et argile réfractaire pour une inertie thermique supérieure et la chaleur sèche qu\'exige la pâte napolitaine.' },
      { t: 'Bois, gaz ou hybride', d: 'Même géométrie de dôme, trois combustibles. Les configurations hybrides permettent de basculer en plein service sans perte de saveur.' },
    ],
    modelsTitle: 'Nos modèles napolitains',
    models: [
      { name: 'Anastasia', desc: 'Le dôme traditionnel — 5 à 9 pizzas par cycle.', href: '/fr/fours-traditionnels' },
      { name: 'Ottavio', desc: 'Napolitain compact au bois, idéal pour les pizzerias premium.', href: '/fr/fours-traditionnels' },
      { name: 'Real Bosco', desc: 'Dôme grande capacité pour cuisines à fort volume.', href: '/fr/fours-traditionnels' },
      { name: 'VesuvioBuono', desc: 'Napolitain hybride bois/gaz avec isolation brevetée.', href: '/fr/systeme-vesuviobuono' },
    ],
    ctaTitle: 'Installez un véritable four napolitain dans votre restaurant',
    ctaText: 'Parlez-nous de votre projet — notre équipe à Naples vous conseillera le bon modèle, combustible et finition.',
  },
  de: {
    seoTitle: 'Neapolitanische Pizzaöfen | Handgefertigt in Neapel — Vesuviano Forni',
    seoDesc: 'Authentische neapolitanische Pizzaöfen, handgefertigt in Neapel aus vulkanischem Vesuv-Gestein. Holz-, Gas- und Hybridmodelle für Restaurants und Pizzerien weltweit.',
    h1: 'Neapolitanische Pizzaöfen',
    sub: 'Seit Generationen in Neapel von Hand gefertigt. Die authentische Kuppel, die eine echte neapolitanische Pizza bei 450°C in 60–90 Sekunden bäckt.',
    aboutTitle: 'Warum ein echter neapolitanischer Ofen den Unterschied macht',
    aboutP1: 'Ein echter neapolitanischer Pizzaofen ist nicht nur eine Kuppel — er ist eine Wärmemaschine, die 430–480°C auf dem Backboden hält, während das Gewölbe die berühmte Leoparden-Bräunung des Cornicione erzeugt. Unsere Öfen werden in Sant\'Anastasia und Boscoreale am Fuß des Vesuvs aus Schamotte und vulkanischem Sand gebaut — aus demselben Boden, der seit zwei Jahrhunderten neapolitanische Pizza backt.',
    aboutP2: 'Jede Kuppel wird von Hand geformt, langsam getrocknet und mit traditionellem Mosaik oder Majolika veredelt — die Signatur von Vesuviano Forni in über 40 Ländern.',
    featuresTitle: 'Gebaut für echtes neapolitanisches Handwerk',
    features: [
      { t: 'AVPN-konforme Temperatur', d: 'Boden 430–480°C, Gewölbe 480°C — exakt das Fenster, das die Associazione Verace Pizza Napoletana fordert.' },
      { t: 'Backzeit 60–90 Sekunden', d: 'Aufgeblähter Cornicione, weicher Kern, kein verbrannter Boden. Der Backboden regeneriert die Hitze zwischen den Pizzen dank dichtem Biscotto-Schamott.' },
      { t: 'Kuppel aus Vulkangestein', d: 'Vesuv-Sand und Schamotte für überlegene Wärmespeicherung und die trockene Hitze, die neapolitanischer Teig verlangt.' },
      { t: 'Holz, Gas oder Hybrid', d: 'Gleiche Kuppelgeometrie, drei Brennstoffe. Hybridkonfigurationen erlauben den Wechsel mitten im Service ohne Geschmacksverlust.' },
    ],
    modelsTitle: 'Unsere neapolitanischen Modelle',
    models: [
      { name: 'Anastasia', desc: 'Die traditionelle Kuppel — 5 bis 9 Pizzen pro Zyklus.', href: '/de/traditionelle-oefen' },
      { name: 'Ottavio', desc: 'Kompakter neapolitanischer Holzofen, ideal für Premium-Pizzerien.', href: '/de/traditionelle-oefen' },
      { name: 'Real Bosco', desc: 'Großvolumige Produktionskuppel für Hochleistungsküchen.', href: '/de/traditionelle-oefen' },
      { name: 'VesuvioBuono', desc: 'Hybrid-Neapolitaner Holz/Gas mit patentierter Isolierung.', href: '/de/vesuviobuono-system' },
    ],
    ctaTitle: 'Holen Sie einen echten neapolitanischen Ofen in Ihr Restaurant',
    ctaText: 'Erzählen Sie uns von Ihrem Projekt — unser Team in Neapel empfiehlt das richtige Modell, den Brennstoff und das Finish.',
  },
  es: {
    seoTitle: 'Hornos de Pizza Napolitana | Hechos a mano en Nápoles — Vesuviano Forni',
    seoDesc: 'Auténticos hornos de pizza napolitana, fabricados artesanalmente en Nápoles con piedra volcánica del Vesubio. Modelos de leña, gas e híbridos para restaurantes y pizzerías.',
    h1: 'Hornos de Pizza Napolitana',
    sub: 'Hechos a mano en Nápoles desde generaciones. La cúpula auténtica que cocina una verdadera pizza napolitana a 450°C en 60–90 segundos.',
    aboutTitle: 'Por qué un verdadero horno napolitano marca la diferencia',
    aboutP1: 'Un auténtico horno de pizza napolitana no es solo una cúpula: es una máquina térmica diseñada para mantener 430–480°C sobre la solera mientras la bóveda irradia el característico leopardeado del cornicione. Nuestros hornos se construyen en Sant\'Anastasia y Boscoreale, al pie del Vesubio, con arcilla refractaria y arena volcánica del mismo suelo que cuece la pizza napolitana desde hace dos siglos.',
    aboutP2: 'Cada cúpula se modela a mano, se cura lentamente y se acaba con el mosaico o la mayólica tradicional, la firma de Vesuviano Forni en más de 40 países.',
    featuresTitle: 'Construido para el verdadero oficio napolitano',
    features: [
      { t: 'Temperatura grado AVPN', d: 'Solera 430–480°C, bóveda 480°C — la ventana exacta que exige la Associazione Verace Pizza Napoletana.' },
      { t: 'Cocción en 60–90 segundos', d: 'Cornicione hinchado, centro suave, sin base quemada. La solera recupera el calor entre pizzas gracias al refractario tipo biscotto.' },
      { t: 'Cúpula de piedra volcánica', d: 'Arena del Vesubio y arcilla refractaria para una inercia térmica superior y el calor seco que exige la masa napolitana.' },
      { t: 'Leña, gas o híbrido', d: 'La misma geometría de cúpula, tres combustibles. Las configuraciones híbridas permiten cambiar en pleno servicio sin perder sabor.' },
    ],
    modelsTitle: 'Nuestros modelos napolitanos',
    models: [
      { name: 'Anastasia', desc: 'La cúpula tradicional — de 5 a 9 pizzas por ciclo.', href: '/es/hornos-tradicionales' },
      { name: 'Ottavio', desc: 'Napolitano compacto a leña, ideal para pizzerías premium.', href: '/es/hornos-tradicionales' },
      { name: 'Real Bosco', desc: 'Cúpula de gran capacidad para cocinas de alto volumen.', href: '/es/hornos-tradicionales' },
      { name: 'VesuvioBuono', desc: 'Napolitano híbrido leña/gas con aislamiento patentado.', href: '/es/sistema-vesuviobuono' },
    ],
    ctaTitle: 'Lleva un auténtico horno napolitano a tu restaurante',
    ctaText: 'Cuéntanos tu proyecto — nuestro equipo en Nápoles te recomendará el modelo, combustible y acabado adecuados.',
  },
} as const;

const LocalizedNeapolitanPizzaOvens = ({ lang }: Props) => {
  const c = CONTENT[lang];
  const path = PATHS[lang];

  useEffect(() => {
    loadLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEOHead lang={lang} canonical={path} title={c.seoTitle} description={c.seoDesc} />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src="/lovable-uploads/vesuviobuono-forno-legna.webp"
          alt={c.h1}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {c.h1}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">{c.sub}</p>
            <CtaButton dark className="px-8 py-6 text-lg" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                {c.aboutTitle}
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">{c.aboutP1}</p>
              <p className="text-lg text-stone-600 leading-relaxed">{c.aboutP2}</p>
            </div>
            <div>
              <img
                src="/lovable-uploads/vesuviobuono-verde-mosaico.webp"
                alt={c.h1}
                className="w-full h-80 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              {c.featuresTitle}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.features.map((f) => (
                <Card key={f.t} className="border-stone-200 hover:border-vesuviano-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mb-4">
                      <div className="w-6 h-6 bg-vesuviano-500 rounded-full" />
                    </div>
                    <h3 className="font-inter font-semibold text-charcoal-900 mb-2">{f.t}</h3>
                    <p className="text-sm text-stone-600">{f.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Models */}
          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              {c.modelsTitle}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.models.map((m) => (
                <Link key={m.name} to={m.href} className="block group">
                  <Card className="h-full border-stone-200 group-hover:border-vesuviano-400 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="font-playfair text-xl font-bold text-charcoal-900 mb-2 group-hover:text-vesuviano-600 transition-colors">
                        {m.name}
                      </h3>
                      <p className="text-stone-600">{m.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AvanziniPartnerStrip />

      {/* CTA Form */}
      <section id="consultation" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              {c.ctaTitle}
            </h2>
            <p className="text-lg text-stone-600">{c.ctaText}</p>
          </div>
          <ConsultationForm />
        </div>
      </section>
    </div>
  );
};

export default LocalizedNeapolitanPizzaOvens;
