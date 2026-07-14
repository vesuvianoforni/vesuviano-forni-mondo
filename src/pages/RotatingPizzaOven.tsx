import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useConsultationModal } from '@/contexts/ConsultationModalContext';
import realBosco100 from '@/assets/real-bosco-100-gold-mosaic.jpg.asset.json';
import realBosco120 from '@/assets/real-bosco-120-blue-mosaic.jpg.asset.json';
import ProductVideoSection from '@/components/ProductVideoSection';
const HERO_VIDEO = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/videos/site/rotating-oven-hero-bg.mp4';
const PIZZOLO_LOGO = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/pizzolo-siciliano-logo.png';
const ANSUM_LOGO = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/ansum-logo.png';
const CUGINI_LOGO = 'https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/cugini-pizza-logo.png';

const PATH = '/en/rotating-pizza-oven';
const URL = `https://vesuvianoforni.com${PATH}`;

const HREFLANGS = [
  { lang: 'en', href: URL },
  { lang: 'it', href: 'https://vesuvianoforni.com/it/forni-rotanti' },
  { lang: 'es', href: 'https://vesuvianoforni.com/es/hornos-rotativos' },
  { lang: 'x-default', href: URL },
];

const FAQS = [
  {
    q: 'How many pizzas per hour can a rotating oven handle?',
    a: 'Our rotating Real Bosco delivers consistent high throughput thanks to the moving floor: depending on plate size (100 or 120 cm) and operator skill, you can comfortably push 150–250+ pizzas per hour without quality drop between the first and the last cover.',
  },
  {
    q: 'Rotating wood-fired or gas — which is right for me?',
    a: 'Wood gives you the authentic Neapolitan flavour and the visual theatre customers love. Gas gives you instant heat-up, lower running costs and easier compliance indoors. The rotating mechanism is identical on both — pick the fuel that fits your venue, kitchen extraction and brand.',
  },
  {
    q: "What's the footprint and power supply?",
    a: 'The Real Bosco rotating sits on a 180 × 180 cm footprint. The rotor runs on standard single-phase mains (230 V / ~250 W) — no industrial supply required. We send full technical drawings before delivery so your kitchen fit-out matches.',
  },
  {
    q: 'How much maintenance does the rotating mechanism need?',
    a: 'Very little. The drive uses a sealed gear motor with refractory bearings designed for high-temperature continuous duty. A 10-minute monthly inspection and an annual grease service are all it needs. Spare parts ship from Naples within 48 hours.',
  },
  {
    q: "What's the lead time and how does UK delivery/installation work?",
    a: 'Production takes 4–6 weeks in our Naples workshop, plus 7–14 days for dedicated freight to the UK. We crate the oven, handle export and customs, then our install team positions the unit, connects the flue and rotor, tests the bake and trains your staff before first service.',
  },
];

const MODELS = [
  {
    name: 'Real Bosco — 100 cm rotating plate',
    image: realBosco100.url,
    diameter: '100 cm refractory rotating floor',
    capacity: '5–6 pizzas per bake · 150–200 pizzas/hour',
    footprint: '160 × 160 cm',
    weight: '1,350 kg',
    fuel: 'Wood or gas',
    power: 'Rotor: 230 V single-phase · ~250 W',
  },
  {
    name: 'Real Bosco — 120 cm rotating plate',
    image: realBosco120.url,
    diameter: '120 cm refractory rotating floor',
    capacity: '7–8 pizzas per bake · 200–250+ pizzas/hour',
    footprint: '180 × 180 cm',
    weight: '1,500 kg',
    fuel: 'Wood or gas',
    power: 'Rotor: 230 V single-phase · ~250 W',
  },
];

const scrollToForm = (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const RotatingPizzaOven = () => {
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
      <SEOHead
        lang="en"
        canonical={PATH}
        title="Commercial Rotating Pizza Ovens | Made in Naples | Vesuviano"
        description="Commercial rotating pizza ovens, handmade in Naples. Even bake, high volume, wood or gas. UK delivery and installation. Request a quote."
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
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-center pt-20 pb-8 md:py-0">
          <div className="max-w-3xl text-white w-full">
            <h1 className="font-playfair text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 break-words hyphens-auto">
              Commercial Rotating Pizza Ovens, Handmade in Naples
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 md:mb-8">
              A rotating deck for an even bake on every pizza — high throughput with less skill required. Wood or gas. UK delivery and installation.
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
              Family workshop since 1950 · Wood or gas · UK delivery & install
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-stone-900 text-white py-4">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm md:text-base text-stone-200 text-center">
            <span>Since 1950 · Made in Naples</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Up to 250+ pizzas/hour</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Wood or gas</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Full UK delivery + install</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Why a rotating pizza oven for commercial use
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: 'Even bake, every pizza',
                d: 'The rotating floor cooks each pizza uniformly: no turning by hand, no hot spots, consistent results across a full service.',
              },
              {
                t: 'High volume, less skill',
                d: 'Train staff faster and push more covers. Consistency without needing a master pizzaiolo on every shift.',
              },
              {
                t: 'Wood or gas, your choice',
                d: 'The rotating system in an authentic Neapolitan build, configured for your fuel and the space in your kitchen.',
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
              Our rotating range
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Choose the size that fits your kitchen and your volume. Real Bosco is available with a 100 cm or 120 cm rotating refractory plate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {MODELS.map((m) => (
              <Card key={m.name} className="border-stone-200 hover:border-vesuviano-300 transition-colors overflow-hidden">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <CardContent className="p-8">
                  <h3 className="font-playfair text-2xl font-bold text-charcoal-900 mb-4">{m.name}</h3>
                  <dl className="space-y-2 text-stone-700">
                    <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                      <dt className="font-medium">Chamber / plate</dt>
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
                      <dt className="font-medium">Fuel</dt>
                      <dd className="text-right">{m.fuel}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium">Rotor power</dt>
                      <dd className="text-right">{m.power}</dd>
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

      <ProductVideoSection />

      {/* Social proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Trusted by pizzerias across the UK and Europe
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { city: 'Pizzolo Bar — Brighton, UK', desc: '37 Ship Street, The Lanes, Brighton BN1 1AB. Sebastian model, built on place by our master builders.', img: PIZZOLO_LOGO },
              { city: 'Ansum Food Co — Porth, Cornwall', desc: 'Alexandra Rd, Porth, Newquay TR7 3NB. Real Bosco (gas), shipped from Naples.', img: ANSUM_LOGO, ig: 'https://www.instagram.com/ansumfood/' },
              { city: 'Cugini Pizza — UK', desc: 'Real Bosco wood-fired oven, shipped from Italy.', img: CUGINI_LOGO, ig: 'https://www.instagram.com/cuginipizza_/' },
            ].map((p) => (
              <div key={p.city} className="bg-stone-50 rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="bg-white h-56 flex items-center justify-center p-8 border-b border-stone-100 rounded-t-lg">
                  <img
                    src={p.img}
                    alt={`${p.city} — Vesuviano Forni client`}
                    className="max-h-full max-w-full object-contain bg-white"
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
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                      Follow on Instagram
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
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
              { n: '1', t: 'Free consultation', d: 'Tell us your venue, volume and space.' },
              { n: '2', t: 'We design your oven', d: 'Size, fuel and finish.' },
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
            <Link to="/en/gas-ovens" className="hover:underline">Gas ovens</Link>
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

export default RotatingPizzaOven;
