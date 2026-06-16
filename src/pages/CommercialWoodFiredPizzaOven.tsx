import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import RouteSEO from '@/components/RouteSEO';
import ConsultationForm from '@/components/ConsultationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useConsultationModal } from '@/contexts/ConsultationModalContext';

const PATH = '/en/commercial-wood-fired-pizza-oven';
const URL = `https://vesuvianoforni.com${PATH}`;

const HREFLANGS = [
  { lang: 'en', href: URL },
  { lang: 'it', href: 'https://vesuvianoforni.com/it/forno-a-legna-da-esterno' },
  { lang: 'fr', href: 'https://vesuvianoforni.com/fr/four-a-pizza-bois' },
  { lang: 'x-default', href: URL },
];

const FAQS = [
  {
    q: 'How long is delivery to the UK?',
    a: 'Once your oven is built, delivery to the UK takes 7–14 days by dedicated freight. We crate the oven on a reinforced pallet, handle all export documentation and clear customs on your behalf, so the unit arrives door-to-door at your venue.',
  },
  {
    q: 'Do you handle installation and extraction/flue requirements?',
    a: 'Yes. Our UK install team positions the oven, connects the insulated flue and tests the draft before first firing. We work with your extraction contractor on hood, make-up air and combustion clearances so the oven passes inspection on day one.',
  },
  {
    q: "What's the lead time to build my oven?",
    a: 'A commercial wood-fired oven is hand-built to order in our Naples workshop. Standard lead time is 4–6 weeks for production, plus 2 weeks for UK delivery and install. Custom mosaic finishes or large diameters can add 2–3 weeks.',
  },
  {
    q: 'Can the oven meet UK indoor venue regulations?',
    a: 'Yes. For indoor pizzerias we recommend our VesuvioBuono low-emission build or pairing the oven with a SmokeZapper filtration unit — together they cut visible smoke and particulates by up to 95%, meeting the strictest UK urban planning and clean-air requirements.',
  },
  {
    q: 'What after-sales support do you offer in the UK?',
    a: 'Every commercial oven ships with a 5-year structural warranty on the refractory dome and 2 years on metal parts. We provide remote support in English, replacement parts shipped from Naples within 48 hours, and on-site service visits across the UK when needed.',
  },
];

const MODELS = [
  {
    name: 'Ottavio',
    diameter: '100 cm',
    capacity: '5–6 pizzas / bake · ~180/hr',
    footprint: '140 × 140 cm',
    weight: '1,600 kg',
    fuel: 'Wood (gas optional)',
  },
  {
    name: 'Anastasia',
    diameter: '120 cm',
    capacity: '7–8 pizzas / bake · ~240/hr',
    footprint: '160 × 160 cm',
    weight: '2,100 kg',
    fuel: 'Wood (gas optional)',
  },
  {
    name: 'Real Bosco',
    diameter: '140 cm',
    capacity: '9–10 pizzas / bake · 300+/hr',
    footprint: '180 × 180 cm',
    weight: '2,600 kg',
    fuel: 'Wood (gas optional)',
  },
  {
    name: 'VesuvioBuono',
    diameter: '120 cm',
    capacity: '7–8 pizzas / bake · ~240/hr',
    footprint: '160 × 160 cm',
    weight: '2,300 kg',
    fuel: 'Hybrid wood + gas (low-emission)',
  },
];

const scrollToForm = (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const CommercialWoodFiredPizzaOven = () => {
  const { openModal } = useConsultationModal();

  useEffect(() => {
    loadLanguage('en');
    document.documentElement.lang = 'en';

    // Inject hreflang alternates
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
    <div className="min-h-screen bg-white">
      <Header />
      <RouteSEO
        lang="en"
        path={PATH}
        title="Commercial Wood-Fired Pizza Ovens | Handmade in Naples | Vesuviano"
        description="Authentic Neapolitan wood-fired pizza ovens for professional pizzerias and restaurants. Handmade in Naples since 1950. UK delivery and installation. Request a quote."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Sticky quote CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-stone-200 p-3 shadow-lg">
        <Button onClick={scrollToForm as any} className="w-full bg-vesuviano-600 hover:bg-vesuviano-700 text-white h-12 text-base font-semibold">
          Request a quote
        </Button>
      </div>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[560px] overflow-hidden">
        <img
          src="/lovable-uploads/vesuviobuono-forno-legna.webp"
          alt="Commercial wood-fired Neapolitan pizza oven installed in a UK pizzeria"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Commercial Wood-Fired Pizza Ovens, Handmade in Naples
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Authentic Neapolitan wood-fired ovens built for professional pizzerias and restaurants — since 1950. Delivered and installed across the UK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                onClick={scrollToForm as any}
                size="lg"
                className="bg-vesuviano-600 hover:bg-vesuviano-700 text-white text-lg px-8 py-6"
              >
                Request a quote
              </Button>
              <Button
                onClick={openModal}
                size="lg"
                variant="outline"
                className="border-white/70 text-white hover:bg-white/10 hover:text-white text-base px-6 py-6 bg-transparent"
              >
                Not sure which model? Find your perfect oven in 60s →
              </Button>
            </div>
            <p className="text-sm text-white/80">
              Family workshop since 1950 · Refractory Neapolitan build · Worldwide delivery & installation
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-stone-900 text-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm md:text-base text-stone-200 text-center">
            <span>Since 1950 · Made in Naples</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Installed in UK pizzerias</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Up to 300 pizzas/hour</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Full UK delivery + on-site install</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Why a Vesuviano wood-fired oven
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: 'True Neapolitan bake',
                d: 'Floor temperatures of 430–450°C cook a pizza in 60–90 seconds, with the leopard-spotting and soft cornicione your customers expect from authentic Neapolitan pizza.',
              },
              {
                t: 'Built to run all service, every day',
                d: 'Hand-laid refractory bricks and a Naples-built dome hold heat through the busiest service, so the 200th pizza bakes like the first.',
              },
              {
                t: 'A craft, not a catalogue',
                d: 'Every oven is handmade in our family workshop. Choose dome size, finish and mosaic to match your venue — yours alone, not a mass-produced unit.',
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

      {/* Models */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Our wood-fired range
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Choose the size that fits your kitchen and your volume. Every model ships ready for professional use.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-stone-200 mb-10">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-charcoal-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Model</th>
                  <th className="px-4 py-3 font-semibold">Chamber Ø</th>
                  <th className="px-4 py-3 font-semibold">Capacity</th>
                  <th className="px-4 py-3 font-semibold">Footprint</th>
                  <th className="px-4 py-3 font-semibold">Weight</th>
                  <th className="px-4 py-3 font-semibold">Fuel</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.name} className="border-t border-stone-200">
                    <td className="px-4 py-3 font-playfair font-bold text-vesuviano-700">{m.name}</td>
                    <td className="px-4 py-3 text-stone-700">{m.diameter}</td>
                    <td className="px-4 py-3 text-stone-700">{m.capacity}</td>
                    <td className="px-4 py-3 text-stone-700">{m.footprint}</td>
                    <td className="px-4 py-3 text-stone-700">{m.weight}</td>
                    <td className="px-4 py-3 text-stone-700">{m.fuel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Trusted by pizzerias across the UK and Europe
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { city: 'Pizzolo Bar — Brighton, UK', desc: 'Vesuviano wood-fired oven, commissioned and installed on site.', img: '/lovable-uploads/vesuviobuono-verde-mosaico.webp' },
              { city: 'Naples Authentic — London, UK', desc: 'Anastasia 120 cm dome, serving 300+ pizzas per night.', img: '/lovable-uploads/vesuviobuono-forno-legna.webp' },
              { city: 'Vera Pizza Co. — Manchester, UK', desc: 'Real Bosco 140 cm for high-volume weekend service.', img: '/lovable-uploads/vesuviobuono-verde-mosaico.webp' },
            ].map((p) => (
              <div key={p.city} className="bg-stone-50 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={p.img}
                  alt={`Commercial wood-fired Neapolitan pizza oven installed at ${p.city}`}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 className="font-playfair font-bold text-charcoal-900 mb-1">{p.city}</h3>
                  <p className="text-sm text-stone-600">{p.desc}</p>
                </div>
              </div>
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

      {/* How it works */}
      <section className="py-20 bg-charcoal-900 text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-12 text-center">
            From Naples to your kitchen, handled end to end
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', t: 'Free consultation', d: 'Tell us your venue, volume and space.' },
              { n: '2', t: 'We design your oven', d: 'Model, size and finish to match.' },
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
        <div className="container mx-auto px-6 max-w-3xl">
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
        <div className="container mx-auto px-6 max-w-6xl text-center">
          <p className="text-stone-600 mb-4">Looking at other fuel options?</p>
          <div className="flex flex-wrap justify-center gap-4 text-vesuviano-700">
            <Link to="/en/gas-ovens" className="hover:underline">Gas ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/rotating-ovens" className="hover:underline">Rotating ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/electric-ovens" className="hover:underline">Electric ovens</Link>
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

export default CommercialWoodFiredPizzaOven;
