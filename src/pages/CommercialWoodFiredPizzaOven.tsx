import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useConsultationModal } from '@/contexts/ConsultationModalContext';
import Rivestimenti from '@/components/Rivestimenti';
const pizzoloLogo = { url: '/lovable-uploads/client-logo-pizzolo.png' };
const ansumLogo = { url: '/lovable-uploads/client-logo-ansum.png' };
const cuginiLogo = { url: '/lovable-uploads/client-logo-cugini-pizza.png' };
const heroBg = { url: '/lovable-uploads/vesuviobuono-forno-azione.jpg' };


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
    <div className="min-h-screen bg-white overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <SEOHead
        lang="en"
        canonical={PATH}
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
      <section className="relative min-h-[600px] h-[80vh] md:h-[70vh] md:min-h-[560px] overflow-hidden">
        <img
          src={heroBg.url}
          alt="Burning logs inside a traditional Neapolitan wood-fired pizza oven"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-center pt-20 pb-8 md:py-0">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 break-words hyphens-auto">
              Commercial Wood-Fired Pizza Ovens, Handmade in Naples
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 md:mb-8">
              Authentic Neapolitan wood-fired ovens built for professional pizzerias and restaurants — since 1950. Delivered and installed across the UK.
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
              Family workshop since 1950 · Refractory Neapolitan build · Worldwide delivery & installation
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
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
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

      {/* Why a real Neapolitan oven matters + Features */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                Why a real Neapolitan oven matters
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                A genuine Neapolitan pizza oven is not just a dome — it is a thermal machine engineered to hold 430–480°C on the cooking floor while the vault radiates the leopard-spot leoparding on the cornicione. Our ovens are built in Sant'Anastasia and Boscoreale, at the foot of Vesuvius, with refractory clay and volcanic sand drawn from the same soil that has fired Neapolitan pizza for two centuries.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                Every dome is shaped by hand, cured slowly, and finished with the traditional mosaic or majolica that has become the signature of Vesuviano Forni in over 40 countries.
              </p>
            </div>
            <div>
              <img
                src="/lovable-uploads/vesuviobuono-verde-mosaico.webp"
                alt="Handmade Neapolitan wood-fired pizza oven with green mosaic finish"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Built for the true Neapolitan craft
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'AVPN-grade temperature', d: 'Floor 430–480°C, vault 480°C — the exact window required by the Associazione Verace Pizza Napoletana.' },
                { t: '60–90 second bake', d: 'Cornicione, soft center, no burnt base. The cooking floor recovers heat between pies thanks to dense biscotto-style refractory.' },
                { t: 'Volcanic stone dome', d: 'Vesuvian sand and refractory clay give superior thermal inertia and the deep, dry heat Neapolitan dough needs.' },
                { t: 'Wood, gas or hybrid', d: 'Same dome geometry, three fuels. Hybrid configurations let you switch mid-service without flavour loss.' },
              ].map((f) => (
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
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Trusted by pizzerias across the UK and Europe
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { city: 'Pizzolo Bar — Brighton, UK', desc: '37 Ship Street, The Lanes, Brighton BN1 1AB. Sebastian model, built on place by our master builders.', img: pizzoloLogo.url },
              { city: 'Ansum Food Co — Porth, Cornwall', desc: 'Alexandra Rd, Porth, Newquay TR7 3NB. Real Bosco (gas), shipped from Naples.', img: ansumLogo.url, ig: 'https://www.instagram.com/ansumfood/' },
              { city: 'Cugini Pizza — UK', desc: 'Real Bosco wood-fired oven, shipped from Italy.', img: cuginiLogo.url, ig: 'https://www.instagram.com/cuginipizza_/' },
            ].map((p) => (
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
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
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
