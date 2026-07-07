import { useTranslation } from 'react-i18next';
import { MapPin, Sparkles, Wrench, Cpu, Globe2 } from 'lucide-react';
import CtaButton from './CtaButton';
import pillarCraftsmanship from '@/assets/about-craftsmanship.jpg';
import pillarEngineering from '@/assets/about-engineering.jpg';
import pillarInnovation from '@/assets/about-innovation-rotante.png.asset.json';
import pillarGlobal from '@/assets/about-global-new.jpg';

type AboutCopy = {
  sectionTitle: string;
  intro: string;
  brandTitle: string;
  brand: string[];
  missionTitle: string;
  mission: string[];
  traditionTitle: string;
  tradition: string;
  rdTitle: string;
  rd: string;
  scopeTitle: string;
  scope: string;
  whereTitle: string;
  whereSubtitle: string;
  whereDescription: string;
  pillars: { title: string; desc: string }[];
  ctaTitle: string;
  ctaDesc: string;
  bornCaption: string;
};

const copy: Record<string, AboutCopy> = {
  it: {
    sectionTitle: 'Chi Siamo',
    intro: "Vesuviano Forni è un brand fondato nel 2025 con la missione di riunire alcuni dei più esperti maestri artigiani napoletani, con oltre 50 anni di sapere e maestria nella costruzione di forni professionali per pizza.",
    brandTitle: 'Un brand giovane, radici profonde',
    brand: [
      "Sebbene Vesuviano Forni sia nato come brand nel 2025, le sue radici sono molto più profonde. L'azienda riunisce artigiani storici dell'area vesuviana, che costruiscono forni professionali per pizza da generazioni, utilizzando le tecniche tradizionali napoletane.",
      "Il brand è nato per preservare e valorizzare l'autentico artigianato napoletano, il patrimonio culturale dell'area vesuviana e l'arte della costruzione tradizionale dei forni, introducendo al tempo stesso innovazioni moderne supportate da ingegneri specializzati ed esperti tecnici.",
    ],
    missionTitle: 'La nostra missione',
    mission: [
      "Vesuviano Forni è specializzata nella produzione artigianale di forni professionali per pizza a Napoli, unendo l'autentica tradizione napoletana a prestazioni moderne, innovazione e servizio internazionale.",
    ],
    traditionTitle: 'Tradizione tramandata',
    tradition: "I nostri forni sono realizzati da maestri artigiani con tecniche tramandate di generazione in generazione. Questa profonda maestria è il cuore di ogni forno che costruiamo e dà ai nostri prodotti autenticità napoletana, durata e rese di cottura eccezionali.",
    rdTitle: 'Innovazione e R&D',
    rd: "La tradizione deve evolvere. Per questo Vesuviano Forni lavora con un team di ricerca e sviluppo dedicato, focalizzato sulle ultime tecnologie per i forni professionali: forni elettrici, forni rotanti e soluzioni a basse emissioni e senza fuliggine.",
    scopeTitle: 'Al servizio del mondo Ho.Re.Ca.',
    scope: "Progettiamo e produciamo forni professionali per pizzerie, ristoranti, hotel, food hall e attività dell'ospitalità in tutto il mondo. La nostra missione è offrire uno dei migliori rapporti qualità-prezzo del mercato, senza compromessi su materiali, durata, design e prestazioni di cottura.",
    whereTitle: 'Dove Siamo',
    whereSubtitle: 'Radicati alle pendici del Vesuvio',
    whereDescription: "I nostri laboratori sorgono ai piedi del Vesuvio, in Campania. Utilizziamo la sabbia vulcanica nella produzione dei nostri forni, conferendo proprietà termiche uniche e un'autenticità impossibile da replicare.",
    pillars: [
      { title: 'Artigianato', desc: '50+ anni di maestria napoletana' },
      { title: 'Ingegneria', desc: 'Team R&D e tecnici specializzati' },
      { title: 'Innovazione', desc: 'Elettrici, rotanti, basse emissioni' },
      { title: 'Global', desc: 'Ho.Re.Ca. in tutto il mondo' },
    ],
    ctaTitle: 'Parliamo del tuo progetto',
    ctaDesc: 'Contattaci per una consulenza personalizzata: costruiamo insieme il forno perfetto per la tua attività.',
    bornCaption: "Dove nasce l'eccellenza",
  },
  en: {
    sectionTitle: 'About Us',
    intro: 'Vesuviano Forni is a brand founded in 2025 with the mission of bringing together some of the most experienced Neapolitan oven artisans, with over 50 years of craftsmanship and know-how in the construction of professional pizza ovens.',
    brandTitle: 'A young brand, deep roots',
    brand: [
      'Although Vesuviano Forni was founded as a brand in 2025, its roots are much deeper. The company brings together historic artisans from the Vesuvian area, who have been building professional pizza ovens for generations using traditional Neapolitan construction techniques.',
      'The brand was created to preserve and promote authentic Neapolitan craftsmanship, the cultural heritage of the Vesuvian area and the art of traditional oven building, while also introducing modern innovations supported by specialized engineers and technical experts.',
    ],
    missionTitle: 'Our mission',
    mission: [
      'Vesuviano Forni specializes in handcrafted professional pizza ovens built in Naples, Italy, combining authentic Neapolitan tradition with modern performance, innovation and international service.',
    ],
    traditionTitle: 'Tradition handed down',
    tradition: 'Our ovens are made by expert artisans using techniques handed down through generations. This deep craftsmanship is at the heart of every oven we build, giving our products their authentic Neapolitan identity, durability and cooking performance.',
    rdTitle: 'Innovation and R&D',
    rd: 'Tradition must evolve. That is why Vesuviano Forni works with a dedicated research and development team focused on the latest technologies in professional pizza ovens, including electric ovens, rotating ovens and low-emission / soot-free solutions.',
    scopeTitle: 'Serving the global Ho.Re.Ca.',
    scope: 'We design and manufacture professional ovens for pizzerias, restaurants, hotels, food halls and hospitality businesses worldwide. Our mission is to offer one of the best quality-to-price ratios in the market, without compromising on materials, durability, design or cooking performance.',
    whereTitle: 'Where We Are',
    whereSubtitle: 'Rooted at the foot of Vesuvius',
    whereDescription: 'Our workshops are located at the foot of Mount Vesuvius, in Campania. We use volcanic sand in our ovens, giving them unique thermal properties and authenticity impossible to replicate.',
    pillars: [
      { title: 'Craftsmanship', desc: '50+ years of Neapolitan mastery' },
      { title: 'Engineering', desc: 'Dedicated R&D and technical team' },
      { title: 'Innovation', desc: 'Electric, rotating, low-emission' },
      { title: 'Global', desc: 'Serving Ho.Re.Ca. worldwide' },
    ],
    ctaTitle: 'Let’s talk about your project',
    ctaDesc: 'Get in touch for a personalized consultation — together we’ll build the perfect oven for your business.',
    bornCaption: 'Where excellence is born',
  },
  fr: {
    sectionTitle: 'Qui Sommes-Nous',
    intro: "Vesuviano Forni est une marque fondée en 2025 avec pour mission de rassembler certains des maîtres artisans napolitains les plus expérimentés, forts de plus de 50 ans de savoir-faire dans la construction de fours à pizza professionnels.",
    brandTitle: 'Une marque jeune aux racines profondes',
    brand: [
      "Bien que Vesuviano Forni ait été fondée en tant que marque en 2025, ses racines sont bien plus profondes. L'entreprise réunit des artisans historiques de la région vésuvienne qui construisent depuis des générations des fours à pizza professionnels selon les techniques traditionnelles napolitaines.",
      "La marque est née pour préserver et promouvoir l'authentique artisanat napolitain, le patrimoine culturel de la région vésuvienne et l'art traditionnel de la construction de fours, tout en introduisant des innovations modernes soutenues par des ingénieurs spécialisés et des experts techniques.",
    ],
    missionTitle: 'Notre mission',
    mission: [
      "Vesuviano Forni est spécialisée dans la fabrication artisanale de fours à pizza professionnels à Naples, alliant l'authentique tradition napolitaine à des performances modernes, à l'innovation et à un service international.",
    ],
    traditionTitle: 'Une tradition transmise',
    tradition: "Nos fours sont réalisés par des maîtres artisans selon des techniques transmises de génération en génération. Ce savoir-faire profond est au cœur de chaque four et confère à nos produits leur identité napolitaine, leur durabilité et leurs performances de cuisson.",
    rdTitle: 'Innovation et R&D',
    rd: "La tradition doit évoluer. C'est pourquoi Vesuviano Forni s'appuie sur une équipe de recherche et développement dédiée aux dernières technologies pour fours à pizza professionnels : fours électriques, fours rotatifs et solutions à faibles émissions / sans suie.",
    scopeTitle: 'Au service du Ho.Re.Ca. mondial',
    scope: "Nous concevons et fabriquons des fours professionnels pour pizzerias, restaurants, hôtels, food halls et acteurs de l'hôtellerie dans le monde entier. Notre mission est d'offrir l'un des meilleurs rapports qualité-prix du marché, sans compromis sur les matériaux, la durabilité, le design ou les performances de cuisson.",
    whereTitle: 'Où Nous Sommes',
    whereSubtitle: 'Enracinés au pied du Vésuve',
    whereDescription: "Nos ateliers sont situés au pied du Vésuve, en Campanie. Nous utilisons du sable volcanique dans la production de nos fours, leur conférant des propriétés thermiques uniques.",
    pillars: [
      { title: 'Artisanat', desc: '50+ ans de maîtrise napolitaine' },
      { title: 'Ingénierie', desc: 'Équipe R&D et techniciens' },
      { title: 'Innovation', desc: 'Électriques, rotatifs, bas émissions' },
      { title: 'Global', desc: 'Ho.Re.Ca. dans le monde entier' },
    ],
    ctaTitle: 'Parlons de votre projet',
    ctaDesc: 'Contactez-nous pour une consultation personnalisée : construisons ensemble le four idéal pour votre activité.',
    bornCaption: "Où naît l'excellence",
  },
  de: {
    sectionTitle: 'Über Uns',
    intro: 'Vesuviano Forni ist eine 2025 gegründete Marke mit der Mission, einige der erfahrensten neapolitanischen Ofenmeister zusammenzubringen – mit über 50 Jahren Handwerkskunst und Know-how im Bau professioneller Pizzaöfen.',
    brandTitle: 'Junge Marke, tiefe Wurzeln',
    brand: [
      'Obwohl Vesuviano Forni 2025 als Marke gegründet wurde, reichen die Wurzeln viel weiter zurück. Das Unternehmen vereint historische Handwerker aus der Vesuv-Region, die seit Generationen professionelle Pizzaöfen nach traditioneller neapolitanischer Bauweise fertigen.',
      'Die Marke entstand, um die authentische neapolitanische Handwerkskunst, das kulturelle Erbe der Vesuv-Region und die Kunst des traditionellen Ofenbaus zu bewahren und zugleich moderne Innovationen einzuführen, unterstützt von spezialisierten Ingenieuren und technischen Experten.',
    ],
    missionTitle: 'Unsere Mission',
    mission: [
      'Vesuviano Forni ist auf die handwerkliche Fertigung professioneller Pizzaöfen in Neapel spezialisiert und verbindet authentische neapolitanische Tradition mit moderner Leistung, Innovation und internationalem Service.',
    ],
    traditionTitle: 'Weitergegebene Tradition',
    tradition: 'Unsere Öfen werden von erfahrenen Handwerkern mit Techniken gefertigt, die über Generationen weitergegeben wurden. Diese tiefe Handwerkskunst ist das Herz jedes Ofens und verleiht unseren Produkten authentische neapolitanische Identität, Langlebigkeit und Backleistung.',
    rdTitle: 'Innovation und F&E',
    rd: 'Tradition muss sich weiterentwickeln. Deshalb arbeitet Vesuviano Forni mit einem eigenen Forschungs- und Entwicklungsteam an den neuesten Technologien für professionelle Pizzaöfen: Elektroöfen, Drehöfen sowie emissionsarme und rußfreie Lösungen.',
    scopeTitle: 'Für die Ho.Re.Ca. weltweit',
    scope: 'Wir entwickeln und produzieren professionelle Öfen für Pizzerien, Restaurants, Hotels, Food-Halls und Hospitality-Betriebe weltweit. Unser Ziel: eines der besten Preis-Leistungs-Verhältnisse am Markt – ohne Kompromisse bei Materialien, Langlebigkeit, Design und Backleistung.',
    whereTitle: 'Wo Wir Sind',
    whereSubtitle: 'Verwurzelt am Fuße des Vesuvs',
    whereDescription: 'Unsere Werkstätten befinden sich am Fuße des Vesuvs in Kampanien. Wir verwenden vulkanischen Sand bei der Herstellung unserer Öfen, was ihnen einzigartige thermische Eigenschaften verleiht.',
    pillars: [
      { title: 'Handwerk', desc: '50+ Jahre neapolitanische Meisterschaft' },
      { title: 'Engineering', desc: 'F&E und technisches Team' },
      { title: 'Innovation', desc: 'Elektro, Dreh, emissionsarm' },
      { title: 'Global', desc: 'Ho.Re.Ca. weltweit' },
    ],
    ctaTitle: 'Sprechen wir über Ihr Projekt',
    ctaDesc: 'Kontaktieren Sie uns für eine individuelle Beratung – wir bauen den perfekten Ofen für Ihren Betrieb.',
    bornCaption: 'Wo Exzellenz entsteht',
  },
  es: {
    sectionTitle: 'Quiénes Somos',
    intro: 'Vesuviano Forni es una marca fundada en 2025 con la misión de reunir a algunos de los maestros artesanos napolitanos más experimentados, con más de 50 años de artesanía y saber hacer en la construcción de hornos profesionales para pizza.',
    brandTitle: 'Una marca joven, raíces profundas',
    brand: [
      'Aunque Vesuviano Forni nació como marca en 2025, sus raíces son mucho más profundas. La empresa reúne a artesanos históricos del área vesubiana, que llevan generaciones construyendo hornos profesionales para pizza con las técnicas tradicionales napolitanas.',
      'La marca nació para preservar y promover la auténtica artesanía napolitana, el patrimonio cultural del área vesubiana y el arte de la construcción tradicional de hornos, introduciendo al mismo tiempo innovaciones modernas apoyadas por ingenieros especializados y expertos técnicos.',
    ],
    missionTitle: 'Nuestra misión',
    mission: [
      'Vesuviano Forni se especializa en hornos profesionales para pizza fabricados artesanalmente en Nápoles, combinando la auténtica tradición napolitana con rendimiento moderno, innovación y servicio internacional.',
    ],
    traditionTitle: 'Tradición transmitida',
    tradition: 'Nuestros hornos son fabricados por maestros artesanos con técnicas transmitidas de generación en generación. Esta artesanía profunda es el corazón de cada horno y aporta a nuestros productos identidad napolitana, durabilidad y rendimiento de cocción.',
    rdTitle: 'Innovación e I+D',
    rd: 'La tradición debe evolucionar. Por eso Vesuviano Forni trabaja con un equipo dedicado de investigación y desarrollo centrado en las últimas tecnologías para hornos profesionales: hornos eléctricos, hornos rotativos y soluciones de bajas emisiones y sin hollín.',
    scopeTitle: 'Al servicio del Ho.Re.Ca. global',
    scope: 'Diseñamos y fabricamos hornos profesionales para pizzerías, restaurantes, hoteles, food halls y negocios de hospitalidad en todo el mundo. Nuestra misión es ofrecer una de las mejores relaciones calidad-precio del mercado, sin comprometer materiales, durabilidad, diseño ni rendimiento de cocción.',
    whereTitle: 'Dónde Estamos',
    whereSubtitle: 'Arraigados a los pies del Vesubio',
    whereDescription: 'Nuestros talleres están ubicados a los pies del Vesubio, en Campania. Utilizamos arena volcánica en la producción de nuestros hornos, otorgándoles propiedades térmicas únicas.',
    pillars: [
      { title: 'Artesanía', desc: '50+ años de maestría napolitana' },
      { title: 'Ingeniería', desc: 'Equipo I+D y técnicos' },
      { title: 'Innovación', desc: 'Eléctricos, rotativos, bajas emisiones' },
      { title: 'Global', desc: 'Ho.Re.Ca. en todo el mundo' },
    ],
    ctaTitle: 'Hablemos de tu proyecto',
    ctaDesc: 'Contáctanos para una consultoría personalizada: construyamos juntos el horno perfecto para tu negocio.',
    bornCaption: 'Donde nace la excelencia',
  },
};

const PILLAR_IMAGES: string[] = [pillarCraftsmanship, pillarEngineering, pillarInnovation.url, pillarGlobal];

const AboutUs = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const l = copy[lang] || copy.it;

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-vesuviano-100 text-vesuviano-700 px-4 py-1.5 rounded-full text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Est. 2025 · Napoli, Italia</span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-5">
              {l.sectionTitle}
            </h1>
            <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              {l.intro}
            </p>
          </div>

          {/* Brand + Mission */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-4">
                {l.brandTitle}
              </h2>
              {l.brand.map((p, i) => (
                <p key={i} className="text-stone-600 leading-relaxed mb-4 text-sm md:text-base last:mb-0">{p}</p>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-4">
                  {l.missionTitle}
                </h2>
                {l.mission.map((p, i) => (
                  <p key={i} className="text-stone-600 leading-relaxed mb-4 text-sm md:text-base last:mb-0">{p}</p>
                ))}
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/lovable-uploads/artigiano-mani-argilla.webp"
                  alt="Mani esperte di artigiano napoletano che lavora l'argilla refrattaria"
                  className="w-full h-48 md:h-56 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-playfair text-lg font-bold">Napoli, Italia</h4>
                  <p className="text-xs opacity-90">{l.bornCaption}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tradition / R&D / Scope */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Wrench className="w-6 h-6 text-vesuviano-600 mb-3" />
              <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-2">{l.traditionTitle}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{l.tradition}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Cpu className="w-6 h-6 text-vesuviano-600 mb-3" />
              <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-2">{l.rdTitle}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{l.rd}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Globe2 className="w-6 h-6 text-vesuviano-600 mb-3" />
              <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-2">{l.scopeTitle}</h3>
              <p className="text-stone-600 leading-relaxed text-sm">{l.scope}</p>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {l.pillars.map((p, i) => {
              const isDrawing = i === 2;
              return (
                <div key={p.title} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className={`relative aspect-[4/3] overflow-hidden ${isDrawing ? 'bg-stone-50' : ''}`}>
                    <img
                      src={PILLAR_IMAGES[i]}
                      alt={p.title}
                      width={1024}
                      height={1024}
                      loading="lazy"
                      className={`w-full h-full ${isDrawing ? 'object-contain p-4' : 'object-cover'} group-hover:scale-105 transition-transform duration-500`}
                    />
                    {!isDrawing && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-playfair font-semibold text-charcoal-900 text-base md:text-lg mb-1">{p.title}</h4>
                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Where We Are */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 bg-vesuviano-100 text-vesuviano-700 px-3 py-1 rounded-full text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Campania, Italia</span>
              </div>
            </div>
            <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-charcoal-900 mb-2">
              {l.whereTitle}
            </h2>
            <p className="text-sm text-vesuviano-600 font-medium mb-2">{l.whereSubtitle}</p>
            <p className="text-stone-600 leading-relaxed text-sm md:text-base mb-4">
              {l.whereDescription}
            </p>
            <div className="relative rounded-lg overflow-hidden">
              <img
                src="/lovable-uploads/vesuvio-mappa-laboratori.webp"
                alt="Mappa dei laboratori Vesuviano alle pendici del Vesuvio"
                className="w-full h-48 md:h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-2 left-2 text-white">
                <p className="text-xs font-medium opacity-90">📍 Sant'Anastasia &amp; Boscoreale (NA)</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-vesuviano-50 rounded-xl p-6 md:p-8">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
              {l.ctaTitle}
            </h2>
            <p className="text-stone-600 mb-5 max-w-2xl mx-auto text-sm md:text-base">
              {l.ctaDesc}
            </p>
            <CtaButton className="px-8 py-3" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
