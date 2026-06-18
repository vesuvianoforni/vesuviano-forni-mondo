import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import RouteSEO from '@/components/RouteSEO';
import ConsultationForm from '@/components/ConsultationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useConsultationModal } from '@/contexts/ConsultationModalContext';

const PATH = '/en/electric-pizza-oven';
const URL = `https://vesuvianoforni.com${PATH}`;

const HREFLANGS = [
  { lang: 'en', href: URL },
  { lang: 'it', href: 'https://vesuvianoforni.com/it/forni-elettrici' },
  { lang: 'es', href: 'https://vesuvianoforni.com/es/hornos-electricos' },
  { lang: 'x-default', href: URL },
];

const FAQS = [
  {
    q: 'Does an electric oven really bake like a wood-fired one?',
    a: 'Yes — because it is not a metal-deck electric oven. Our patented refractory brick dome stores and radiates heat exactly like a traditional Neapolitan oven, producing the leopard-spotted cornicione and soft, pliable base you expect from wood. The fuel changes; the bake does not.',
  },
  {
    q: 'What power supply does it need (single or three-phase)?',
    a: 'Most models run on three-phase (400 V) for fast recovery during service; selected smaller models are available in single-phase (230 V). We confirm the exact spec for your venue before delivery so your electrician can pre-wire correctly.',
  },
  {
    q: 'Can I install it indoors without a flue or extraction?',
    a: 'Yes. No combustion means no flue and far fewer extraction requirements — ideal for shopping centres, food courts, hotels and indoor kitchens where a wood or gas flue is impossible. Local hood/ventilation rules for cooking still apply; we advise during the consultation.',
  },
  {
    q: 'What temperature does it reach, and what are the running costs?',
    a: 'The dome reaches authentic Neapolitan baking temperatures (450–500 °C floor / dome). Running costs depend on your tariff and volume, but the insulated refractory shell holds heat efficiently between bakes, keeping consumption far lower than continuous-load metal-deck ovens.',
  },
  {
    q: "What's the lead time and how does UK delivery/installation work?",
    a: 'Production takes 4–6 weeks in our Naples workshop, plus 7–14 days for dedicated freight to the UK. We crate the oven, handle export and customs, then our install team positions the unit, connects the electrical supply, tests the bake and trains your staff before first service.',
  },
];

const MODELS = [
  {
    name: 'Anastasia Electric — 100 cm',
    diameter: '100 cm refractory brick dome',
    capacity: '4–5 pizzas per bake · 80–120 pizzas/hour',
    footprint: '140 × 140 cm',
    weight: '1,900 kg',
    power: 'Three-phase 400 V · ~18 kW',
    temp: 'Up to 500 °C',
  },
  {
    name: 'Anastasia Electric — 120 cm',
    diameter: '120 cm refractory brick dome',
    capacity: '6–7 pizzas per bake · 130–180 pizzas/hour',
    footprint: '160 × 160 cm',
    weight: '2,300 kg',
    power: 'Three-phase 400 V · ~24 kW',
    temp: 'Up to 500 °C',
  },
];

const scrollToForm = (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const ElectricPizzaOven = () => {
  const { openModal } = useConsultationModal();

  useEffect(() => {
    loadLanguage('en');
    document.documentElement.lang = 'en';

    const created: HTMLLinkElement[] = [];
    HREFLANGS.forEach(({ lang, href }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', href);
      link.setAttribute('data-rt-hreflang', '1');
      document.head.appendChild(link);
      created.push(link);
    });
    return () => created.forEach((l) => l.remove());
  }, []);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <RouteSEO
        lang="en"
        path={PATH}
        title="Electric Neapolitan Pizza Ovens | Patented Brick Dome | Vesuviano"
        description="Patented electric Neapolitan pizza ovens with a refractory brick dome — the authentic wood-fired bake, no flue, plug-in. Handmade in Naples. UK delivery. Request a quote."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Sticky quote CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-stone-200 p-3 shadow-lg">
        <Button onClick={scrollToForm as any} className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white h-12 text-base font-semibold">
          Request a quote
        </Button>
      </div>

      {/* Hero */}
      <section className="relative min-h-[600px] h-[80vh] md:h-[70vh] md:min-h-[560px] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/lovable-uploads/forno-metallo-bianco-nuovo.webp"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/lovable-uploads/forno-elettrico-360-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-center pt-20 pb-8 md:py-0">
          <div className="max-w-3xl text-white w-full">
            <h1 className="font-playfair text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 break-words hyphens-auto">
              Patented Electric Neapolitan Pizza Ovens, Made in Naples
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 md:mb-8">
              The authentic wood-fired bake — electric. Our patented refractory brick dome delivers true Neapolitan results with no flue and no fuel: just plug in. UK delivery and installation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <Button
                onClick={scrollToForm as any}
                size="lg"
                className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
              >
                Request a quote
              </Button>
              <Button
                onClick={openModal}
                size="lg"
                variant="outline"
                className="border-white/70 text-white hover:bg-white/10 hover:text-white text-sm md:text-base px-4 md:px-6 py-5 md:py-6 bg-transparent w-full sm:w-auto whitespace-normal h-auto text-center leading-snug"
              >
                Not sure which model? Find yours in 60s →
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              Patented brick dome · Handmade in Naples since 1950 · No flue required
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-stone-900 text-white py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm md:text-base text-stone-200 text-center">
            <span>Patented refractory brick dome</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Authentic Neapolitan bake</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>No flue, plug-in</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>UK delivery + install</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Why a commercial electric pizza oven from Vesuviano
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: 'The bake of wood, the ease of electric',
                d: 'Our patented refractory brick dome holds and radiates heat like a traditional Naples oven, for leopard-spotted, soft-crust pizza — without the wood.',
              },
              {
                t: 'No flue, no fuel, fewer rules',
                d: 'Plug-in electric means simpler installation and far fewer extraction and ventilation headaches. Ideal for indoor venues, shopping centres and tight kitchens.',
              },
              {
                t: 'A patented Neapolitan design',
                d: 'Not a metal-deck electric oven: a hand-built refractory brick dome, patented and made in Naples. The real thing, electrified.',
              },
            ].map((f) => (
              <Card key={f.t} className="border-stone-200 hover:border-vesuviano-300 transition-colors">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-vesuviano-100 rounded-full flex items-center justify-center mb-5">
                    <div className="w-6 h-6 bg-vesuviano-500 rounded-full" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-charcoal-900 mb-3">{f.t}</h3>
                  <p className="text-stone-600 leading-relaxed">{f.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Models & specs */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Our electric range
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Choose the model that fits your space and your volume. Every oven is built around our patented refractory brick dome.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {MODELS.map((m) => (
              <Card key={m.name} className="border-stone-200 hover:border-vesuviano-300 transition-colors">
                <CardContent className="p-8">
                  <h3 className="font-playfair text-2xl font-bold text-charcoal-900 mb-4">{m.name}</h3>
                  <dl className="space-y-2 text-stone-700">
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">Chamber</dt>
                      <dd className="text-right">{m.diameter}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">Capacity</dt>
                      <dd className="text-right">{m.capacity}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">External footprint</dt>
                      <dd className="text-right">{m.footprint}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">Weight</dt>
                      <dd className="text-right">{m.weight}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">Electrical supply</dt>
                      <dd className="text-right">{m.power}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium">Max temperature</dt>
                      <dd className="text-right">{m.temp}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={scrollToForm as any}
              size="lg"
              className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-lg px-8 py-6"
            >
              Request a quote
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6 text-center">
            Trusted by pizzerias across the UK and Europe
          </h2>
          <p className="text-center text-stone-600 max-w-2xl mx-auto mb-12">
            From indoor venues without a flue to shopping centres and hotel kitchens, our patented electric ovens are baking authentic Neapolitan pizza every day.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-charcoal-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-12 text-center">
            From Naples to your kitchen, handled end to end
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', t: 'Free consultation', d: 'Your venue, volume and power supply.' },
              { n: '2', t: 'We design your oven', d: 'Model, finish and electrical spec.' },
              { n: '3', t: 'Delivery to the UK', d: 'Fully crated, customs handled.' },
              { n: '4', t: 'On-site installation & training', d: 'Ready for your first service.' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-14 h-14 rounded-full bg-vesuviano-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-playfair text-xl font-bold mb-2">{s.t}</h3>
                <p className="text-stone-300 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-stone-50 rounded-lg p-6">
                <h3 className="font-inter font-semibold text-charcoal-900 mb-2 text-lg">{f.q}</h3>
                <p className="text-stone-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl text-center">
          <p className="text-stone-600 mb-4">Looking at other oven types?</p>
          <div className="flex flex-wrap justify-center gap-4 text-vesuviano-700">
            <Link to="/en/commercial-wood-fired-pizza-oven" className="hover:underline">Wood-fired ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/rotating-pizza-oven" className="hover:underline">Rotating ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/gas-ovens" className="hover:underline">Gas ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/neapolitan-pizza-ovens" className="hover:underline">Neapolitan pizza ovens</Link>
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <div id="quote-form" className="scroll-mt-20">
        <ConsultationForm />
      </div>
    </div>
  );
};

export default ElectricPizzaOven;
