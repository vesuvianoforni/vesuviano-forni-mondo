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
import brickBgAsset from '@/assets/start-project-bg.jpg.asset.json';
import heroVideoAsset from '@/assets/hero-gas.mp4.asset.json';
import avanziniLogoAsset from '@/assets/avanzini-logo.png.asset.json';
import spettaclVideoAsset from '@/assets/e_nu_spettacl_vesuviano.mp4.asset.json';
import gasOvenMosaic from '@/assets/vesuviano-gas-oven-mosaic.png.asset.json';
const BRICK_BG_URL = brickBgAsset.url;
const HERO_VIDEO_URL = heroVideoAsset.url;
const AVANZINI_LOGO_URL = avanziniLogoAsset.url;
const SPETTACL_VIDEO_URL = spettaclVideoAsset.url;

const ansumLogo = { url: '/lovable-uploads/client-logo-ansum.png' };
const cuginiLogo = { url: '/lovable-uploads/client-logo-cugini-pizza.png' };
const pizzoloLogo = { url: '/lovable-uploads/client-logo-pizzolo.png' };
const heroBg = { url: '/lovable-uploads/forno-arancione-terra-del-gusto.webp' };

const PATH = '/en/commercial-gas-pizza-oven';
const URL = `https://vesuvianoforni.com${PATH}`;

const HREFLANGS = [
  { lang: 'en', href: URL },
  { lang: 'it', href: 'https://vesuvianoforni.com/it/forni-a-gas' },
  { lang: 'fr', href: 'https://vesuvianoforni.com/fr/fours-a-gaz' },
  { lang: 'x-default', href: URL },
];

const FAQS = [
  {
    q: 'Why choose a gas pizza oven over wood-fired?',
    a: 'A gas oven gives you the same Neapolitan dome geometry and 430–480°C cooking temperature, but with instant start-up, perfectly stable heat and no smoke management. It is the right choice for venues without a wood flue, urban locations with strict emission rules, or operators who want predictable fuel costs and faster service turnaround.',
  },
  {
    q: 'How long is delivery to the UK?',
    a: 'Once your oven is built, delivery to the UK takes 7–14 days by dedicated freight. We crate the oven on a reinforced pallet, handle all export documentation and clear customs on your behalf, so the unit arrives door-to-door at your venue.',
  },
  {
    q: 'Which gas types are supported?',
    a: 'Our commercial gas ovens run on natural gas (mains) or LPG (propane/butane). The burner is factory-set for your gas type and pressure — just tell us your venue connection at order stage and we calibrate before shipping.',
  },
  {
    q: 'Do you handle installation and certification in the UK?',
    a: 'Yes. Our UK install team positions the oven, connects the gas line through a Gas Safe registered engineer, commissions the burner and issues the compliance paperwork your local authority requires.',
  },
  {
    q: "What's the lead time to build my oven?",
    a: 'A commercial gas oven is hand-built to order in our Naples workshop. Standard lead time is 4–6 weeks for production, plus 2 weeks for UK delivery and install. Custom mosaic finishes or large diameters can add 2–3 weeks.',
  },
  {
    q: 'What after-sales support do you offer in the UK?',
    a: 'Every commercial oven ships with a 5-year structural warranty on the refractory dome and 2 years on metal parts and the burner. We provide remote support in English, replacement parts shipped from Naples within 48 hours, and on-site service visits across the UK when needed.',
  },
];

const scrollToForm = (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const CommercialGasPizzaOven = () => {
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
        title="Commercial Gas Pizza Ovens | Handmade in Naples | Vesuviano"
        description="Professional Neapolitan gas pizza ovens for pizzerias and restaurants. Instant start-up, stable 450°C, low emissions. Handmade in Naples, UK delivery and Gas Safe install."
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
          src={HERO_VIDEO_URL}
          poster={heroBg.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Professional Neapolitan gas pizza oven in a commercial pizzeria"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 flex items-center pt-20 pb-8 md:py-0">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 break-words hyphens-auto">
              Commercial Gas Pizza Ovens, Handmade in Naples
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-6 md:mb-8">
              Authentic Neapolitan gas-fired ovens built for professional pizzerias and restaurants — fast start-up, stable 450°C and clean operation, delivered and installed across the UK.
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
              Family workshop since 1950 · Refractory Neapolitan build · Natural gas or LPG
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
            <span>Natural gas or LPG</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>Ready to bake in 30 minutes</span>
            <span className="hidden md:inline text-stone-500">|</span>
            <span>UK delivery + Gas Safe install</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-12 text-center">
            Why a Vesuviano gas oven
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center mb-16 max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-stone-100 aspect-[9/16] max-h-[520px]">
              <video
                src={SPETTACL_VIDEO_URL}
                controls
                playsInline
                preload="metadata"
                aria-label="A Vesuviano gas oven in action"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <blockquote className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 leading-tight mb-4">
                “E' nu spettacl”
              </blockquote>
              <p className="text-xl md:text-2xl text-vesuviano-600 font-medium">
                It’s a beautiful oven
              </p>
              <p className="text-stone-500 mt-4">
                A real reaction from a real pizzeria — because a Vesuviano gas oven is not just a tool, it’s the heart of the show.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: 'Neapolitan bake, gas precision',
                d: 'Same refractory dome geometry as our wood-fired ovens — 430–480°C on the cooking floor — with a thermostatic burner that holds temperature service after service, no fire-tending required.',
              },
              {
                t: 'Open in minutes, not hours',
                d: 'A turn of the dial and the oven is up to temperature in around 30 minutes. Perfect for split shifts, lunch service or venues that need quick start-up without managing a wood fire.',
              },
              {
                t: 'Cleaner, simpler, urban-ready',
                d: 'No wood storage, no ash, no smoke. Ideal for shopping centres, food halls and city venues where extraction and clean-air rules rule out a wood flue.',
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

      {/* Why Neapolitan gas + Features */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                A real Neapolitan oven that runs on gas
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                Our gas ovens are not converted electric ovens or pressed-metal boxes — they are full refractory Neapolitan domes, hand-built in Sant'Anastasia and Boscoreale with the same volcanic sand and refractory clay we have used for two centuries. The difference is the burner: a professional A, B or C-series gas burner mounted at the dome opening, calibrated to your gas type and venue.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                The result is a true Neapolitan bake — leoparded cornicione, soft centre, 60–90 second cook time — with the operational simplicity of a modern commercial appliance.
              </p>
            </div>
            <div>
              <img
                src={gasOvenMosaic.url}
                alt="Handmade Neapolitan gas pizza oven with mosaic tile dome"
                className="w-full h-[500px] object-contain rounded-lg shadow-lg bg-white"
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
                { t: 'AVPN-grade temperature', d: 'Floor 430–480°C, vault 480°C — the exact window required by the Associazione Verace Pizza Napoletana, held automatically by the burner thermostat.' },
                { t: '60–90 second bake', d: 'Same cornicione, same soft centre as wood-fired. The dense biscotto-style floor recovers heat between pies for non-stop service.' },
                { t: 'Volcanic stone dome', d: 'Vesuvian sand and refractory clay give superior thermal inertia — even with a gas flame, the bake stays Neapolitan, not industrial.' },
                { t: 'A, B or C-series burner', d: 'Professional burners sized to your dome and gas type (natural or LPG), with safety valve and CE certification for commercial use.' },
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
              { city: 'Ansum Food Co — Porth, Cornwall', desc: 'Alexandra Rd, Porth, Newquay TR7 3NB. Real Bosco gas oven, shipped from Naples.', img: ansumLogo.url, ig: 'https://www.instagram.com/ansumfood/' },
              { city: 'Cugini Pizza — UK', desc: 'Real Bosco oven, shipped from Italy and configured for commercial UK service.', img: cuginiLogo.url, ig: 'https://www.instagram.com/cuginipizza_/' },
              { city: 'Pizzolo Bar — Brighton, UK', desc: '37 Ship Street, The Lanes, Brighton BN1 1AB. Sebastian model, built on place by our master builders.', img: pizzoloLogo.url },
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

      {/* Avanzini burners */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
            <div>
              <a
                href="https://www.avanzinibruciatori.it/bruciatori-per-forni-da-pizza-ad-uso-professionale/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                aria-label="Avanzini Bruciatori — official website"
              >
                <img
                  src={AVANZINI_LOGO_URL}
                  alt="Avanzini Bruciatori — since 1960"
                  className="w-full max-w-[220px] mx-auto"
                  loading="lazy"
                />
              </a>
              <p className="text-xs uppercase tracking-[0.2em] text-vesuviano-600 mt-6 font-semibold">
                Official partner
              </p>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Every gas oven we ship is fitted with an Avanzini <em>Drago</em> series D burner —
                the industry benchmark for professional pizza ovens since 1960, IMQ-certified and
                trusted by the most prestigious oven makers in Italy.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-vesuviano-600 font-semibold mb-3">
                The burner inside every oven
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                Avanzini Drago — the quiet, efficient heart of a gas oven
              </h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                Drago is an atmospheric multigas burner designed specifically for pizza ovens.
                Combustion happens through natural chimney draft — no fan, no noise, no constant
                maintenance. Two independent flames (maintenance and boost) give you fast heat-up,
                stable service temperature and real fuel savings compared to wood.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { t: 'Only 3 cm inside the oven', d: 'Recessed into the cooking floor — hidden from view, never overheats or deforms.' },
                  { t: 'Silent operation', d: 'No fan means no vibration, no noise and far less servicing than blown-air burners.' },
                  { t: 'Uniform cooking', d: 'The Venturi flame is soft, highly radiant and luminous — even heat across the whole floor.' },
                  { t: 'Fully automatic', d: 'External control panel, safety-certified auto-ignition, easy two-flame regulation.' },
                  { t: 'Natural gas or LPG', d: 'Multigas ready. Configured for UK regulations before shipping.' },
                  { t: 'IMQ certified', d: 'Efficiency and safety verified by independent Italian testing.' },
                ].map((f) => (
                  <div key={f.t} className="bg-white rounded-lg p-5 border border-stone-200">
                    <h3 className="font-inter font-semibold text-charcoal-900 mb-1 text-sm">{f.t}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-20 text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BRICK_BG_URL})` }} />
        <div aria-hidden className="absolute inset-0 bg-charcoal-900/80" />
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-12 text-center">
            From Naples to your kitchen, handled end to end
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', t: 'Free consultation', d: 'Tell us your venue, gas type and volume.' },
              { n: '2', t: 'We design your oven', d: 'Model, size, burner and finish to match.' },
              { n: '3', t: 'Delivery to the UK', d: 'Fully crated, customs handled.' },
              { n: '4', t: 'Gas Safe install & training', d: 'Commissioned and ready for first service.' },
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
            <Link to="/en/commercial-wood-fired-pizza-oven" className="hover:underline">Wood-fired ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/rotating-pizza-oven" className="hover:underline">Rotating ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/electric-pizza-oven" className="hover:underline">Electric ovens</Link>
            <span className="text-stone-300">·</span>
            <Link to="/en/neapolitan-pizza-ovens" className="hover:underline">Neapolitan pizza ovens</Link>
          </div>
        </div>
      </section>

      {/* Finishes */}
      <Rivestimenti />

      {/* CTA Form */}
      <div id="quote-form" className="scroll-mt-20">
        <ConsultationForm />
      </div>
    </div>
  );
};

export default CommercialGasPizzaOven;
