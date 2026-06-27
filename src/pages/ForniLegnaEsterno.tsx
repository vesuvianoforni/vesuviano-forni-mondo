import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import ConsultationForm from '@/components/ConsultationForm';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const PATH = '/it/forno-a-legna-da-esterno';

const FAQS = [
  {
    q: 'Quanto costa un forno a legna da esterno professionale?',
    a: 'I nostri forni a legna da esterno partono da circa 4.500€ per il modello Ottavio compatto e arrivano oltre 12.000€ per le grandi cupole Real Bosco. Il prezzo include cottura refrattaria, isolamento, finitura a mosaico o intonaco. Il pagamento è 50% all\'ordine e 50% alla consegna.',
  },
  {
    q: 'Quanto tempo serve per scaldare un forno a legna da esterno?',
    a: 'Una cupola napoletana ben isolata raggiunge i 430–480°C in 60–90 minuti a partire dall\'accensione, e mantiene la temperatura di cottura per tutto il servizio. La sabbia vulcanica del Vesuvio garantisce un\'inerzia termica superiore rispetto ai forni industriali.',
  },
  {
    q: 'Posso installare un forno a legna da esterno in giardino o in terrazza?',
    a: 'Sì. Tutti i nostri forni da esterno sono progettati per resistere alle intemperie e possono essere installati in giardino, terrazza, dehor o area BBQ. Forniamo basi, canne fumarie e cappe coordinate. Per le installazioni in condominio verifichiamo insieme il regolamento e gli scarichi.',
  },
  {
    q: 'Meglio un forno a legna pronto all\'uso o costruito sul posto?',
    a: 'Il forno pronto all\'uso arriva già assemblato, testato e collaudato in fabbrica: si installa in mezza giornata. Il forno costruito sul posto permette dimensioni e finiture totalmente custom ma richiede 3–5 giorni di muratura. Entrambi usano gli stessi materiali refrattari vesuviani.',
  },
  {
    q: 'Quante pizze al cuoce un forno a legna da esterno Vesuviano?',
    a: 'Dipende dal diametro. Un Ottavio 100cm cuoce 5–6 pizze contemporaneamente (180–200 pizze/ora a regime). Un Real Bosco 140cm arriva a 9–10 pizze per infornata (oltre 300 pizze/ora). Tutti i modelli rispettano il disciplinare AVPN per la cottura in 60–90 secondi.',
  },
];

const MODELS = [
  { name: 'Ottavio', desc: 'Forno a legna da esterno compatto, 5–6 pizze per infornata. Perfetto per uso domestico premium o piccoli ristoranti.', href: '/it/forni-tradizionali' },
  { name: 'Anastasia', desc: 'La cupola tradizionale napoletana, 7–8 pizze per ciclo. Il modello più richiesto dalle pizzerie.', href: '/it/forni-tradizionali' },
  { name: 'Real Bosco', desc: 'Forno a legna da esterno di grande capacità, fino a 10 pizze per infornata. Per alti volumi e dehor.', href: '/it/forni-tradizionali' },
  { name: 'VesuvioBuono', desc: 'Sistema ibrido legna/gas con isolamento brevettato. Riduce i consumi di legna del 40%.', href: '/it/sistema-vesuviobuono' },
];

const ForniLegnaEsterno = () => {
  useEffect(() => {
    loadLanguage('it');
    document.documentElement.lang = 'it';
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
      <SEOHead
        lang="it"
        canonical={PATH}
        title="Forno a Legna da Esterno | Artigianale Napoletano — Vesuviano Forni"
        description="Forni a legna da esterno costruiti a mano a Napoli con pietra vulcanica del Vesuvio. Modelli pronti all'uso o su misura per pizzerie, ristoranti e ville. Spedizione in tutto il mondo."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src="/lovable-uploads/vesuviobuono-forno-legna.webp"
          alt="Forno a legna da esterno artigianale Vesuviano"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Forno a Legna da Esterno
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Costruito a mano a Napoli, con la pietra vulcanica del Vesuvio. La vera cupola napoletana per il tuo giardino, dehor o pizzeria — pronta a cuocere a 450°C in 90 secondi.
            </p>
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
                Il vero forno a legna da esterno napoletano
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                Un forno a legna da esterno non è solo una cupola: è una macchina termica progettata per resistere a pioggia, gelo e sole continuativo mantenendo la cottura della vera pizza napoletana. I nostri forni nascono nei laboratori di Sant'Anastasia e Boscoreale, ai piedi del Vesuvio, con argilla refrattaria e sabbia vulcanica raccolta dallo stesso suolo che da due secoli cuoce la pizza più famosa al mondo.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                Ogni forno a legna da esterno Vesuviano viene assemblato a mano, isolato con lana di roccia ad alta densità e rivestito con mosaico, maiolica o intonaco resistente agli agenti atmosferici. La cappa in acciaio inox e la canna fumaria coibentata garantiscono un tiraggio perfetto e zero condensa anche in inverno.
              </p>
            </div>
            <div>
              <img
                src="/lovable-uploads/vesuviobuono-verde-mosaico.webp"
                alt="Forno a legna esterno mosaico"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Perché scegliere un forno a legna da esterno Vesuviano
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'Resistente alle intemperie', d: 'Rivestimento, cappa e canna fumaria certificati per installazione esterna anno dopo anno, senza copertura.' },
                { t: 'Cottura 60–90 secondi', d: 'Cupola in refrattario vesuviano che raggiunge 480°C e cuoce la pizza napoletana come da disciplinare AVPN.' },
                { t: 'Pronto all\'uso o su misura', d: 'Scegli un forno a legna da esterno già assemblato e testato, oppure costruito sul posto in 3–5 giorni.' },
                { t: 'Spedizione mondiale', d: 'Imballaggio su pallet rinforzato fino a 2000kg. Esportiamo in oltre 40 paesi con installazione assistita.' },
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

          {/* Models */}
          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              I nostri forni a legna da esterno
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODELS.map((m) => (
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

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Domande frequenti sul forno a legna da esterno
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQS.map((f) => (
                <div key={f.q} className="bg-stone-50 rounded-lg p-6">
                  <h3 className="font-inter font-semibold text-charcoal-900 mb-2 text-lg">{f.q}</h3>
                  <p className="text-stone-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="consultation" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Richiedi il tuo forno a legna da esterno
            </h2>
            <p className="text-lg text-stone-600">
              Raccontaci il tuo progetto — il nostro team a Napoli ti consiglierà il modello, la finitura e la canna fumaria adatta al tuo spazio.
            </p>
          </div>
          <ConsultationForm />
        </div>
      </section>
    </div>
  );
};

export default ForniLegnaEsterno;
