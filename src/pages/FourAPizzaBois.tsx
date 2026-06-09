import { useEffect } from 'react';
import { loadLanguage } from '@/i18n/config';
import Header from '@/components/Header';
import RouteSEO from '@/components/RouteSEO';
import ConsultationForm from '@/components/ConsultationForm';
import CtaButton from '@/components/CtaButton';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const PATH = '/fr/four-a-pizza-bois';

const FAQS = [
  {
    q: 'Combien coûte un four à pizza bois professionnel ?',
    a: 'Nos fours à pizza bois commencent à environ 4 500 € pour le modèle Ottavio compact et atteignent plus de 12 000 € pour les grandes coupoles Real Bosco. Le prix inclut la sole réfractaire, l\'isolation et la finition mosaïque ou enduit. Paiement 50% à la commande et 50% à la livraison.',
  },
  {
    q: 'Combien de temps faut-il pour chauffer un four à pizza bois ?',
    a: 'Une coupole napolitaine bien isolée atteint 430–480°C en 60 à 90 minutes après l\'allumage et maintient la température de cuisson pendant tout le service. Le sable volcanique du Vésuve garantit une inertie thermique supérieure aux fours industriels.',
  },
  {
    q: 'Puis-je installer un four à pizza bois dans mon jardin ou en terrasse ?',
    a: 'Oui. Tous nos fours à pizza bois extérieurs sont conçus pour résister aux intempéries et peuvent être installés en jardin, terrasse, véranda ou espace barbecue. Nous fournissons socles, conduits de fumée et hottes assortis.',
  },
  {
    q: 'Vaut-il mieux un four à pizza bois prêt à l\'emploi ou construit sur place ?',
    a: 'Le four prêt à l\'emploi arrive déjà assemblé, testé et certifié en usine : installation en une demi-journée. Le four construit sur place permet dimensions et finitions entièrement sur mesure mais demande 3 à 5 jours de maçonnerie. Les deux utilisent les mêmes matériaux réfractaires vésuviens.',
  },
  {
    q: 'Combien de pizzas cuit un four à pizza bois Vesuviano ?',
    a: 'Selon le diamètre. Un Ottavio 100cm cuit 5 à 6 pizzas simultanément (180–200 pizzas/h). Un Real Bosco 140cm atteint 9 à 10 pizzas par fournée (plus de 300 pizzas/h). Tous nos modèles respectent le cahier des charges AVPN pour la cuisson en 60–90 secondes.',
  },
];

const MODELS = [
  { name: 'Ottavio', desc: 'Four à pizza bois compact, 5–6 pizzas par fournée. Idéal pour usage domestique premium ou petits restaurants.', href: '/fr/fours-traditionnels' },
  { name: 'Anastasia', desc: 'La coupole napolitaine traditionnelle, 7–8 pizzas par cycle. Le modèle le plus demandé par les pizzerias.', href: '/fr/fours-traditionnels' },
  { name: 'Real Bosco', desc: 'Four à pizza bois grande capacité, jusqu\'à 10 pizzas par fournée. Pour gros volumes et terrasses.', href: '/fr/fours-traditionnels' },
  { name: 'VesuvioBuono', desc: 'Système hybride bois/gaz avec isolation brevetée. Réduit la consommation de bois de 40%.', href: '/fr/systeme-vesuviobuono' },
];

const FourAPizzaBois = () => {
  useEffect(() => {
    loadLanguage('fr');
    document.documentElement.lang = 'fr';
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
        lang="fr"
        path={PATH}
        title="Four à Pizza Bois | Artisanal Napolitain — Vesuviano Forni"
        description="Fours à pizza bois fabriqués à la main à Naples avec la pierre volcanique du Vésuve. Modèles prêts à l'emploi ou sur mesure pour pizzerias, restaurants et particuliers. Livraison mondiale."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img
          src="/lovable-uploads/vesuviobuono-forno-legna.webp"
          alt="Four à pizza bois artisanal Vesuviano"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative h-full container mx-auto px-6 flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Four à Pizza Bois
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Fabriqué à la main à Naples, avec la pierre volcanique du Vésuve. La véritable coupole napolitaine pour votre restaurant, terrasse ou jardin — prête à cuire à 450°C en 90 secondes.
            </p>
            <CtaButton dark className="px-8 py-6 text-lg" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-6">
                Le véritable four à pizza bois napolitain
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed mb-6">
                Un four à pizza bois n'est pas qu'une coupole : c'est une machine thermique conçue pour maintenir 430–480°C sur la sole pendant que la voûte rayonne la cuisson léopard du cornicione. Nos fours naissent dans les ateliers de Sant'Anastasia et Boscoreale, au pied du Vésuve, avec l'argile réfractaire et le sable volcanique du même sol qui cuit la pizza napolitaine depuis deux siècles.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                Chaque four à pizza bois Vesuviano est assemblé à la main, isolé à la laine de roche haute densité et revêtu de mosaïque, majolique ou enduit résistant aux intempéries. La hotte inox et le conduit de fumée isolé garantissent un tirage parfait et zéro condensation, même en hiver.
              </p>
            </div>
            <div>
              <img
                src="/lovable-uploads/vesuviobuono-verde-mosaico.webp"
                alt="Four à pizza bois mosaïque"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Pourquoi choisir un four à pizza bois Vesuviano
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'Résistant aux intempéries', d: 'Revêtement, hotte et conduit certifiés pour installation extérieure année après année, sans bâche.' },
                { t: 'Cuisson 60–90 secondes', d: 'Coupole en réfractaire vésuvien qui atteint 480°C et cuit la pizza napolitaine selon le cahier des charges AVPN.' },
                { t: 'Prêt à l\'emploi ou sur mesure', d: 'Choisissez un four à pizza bois déjà assemblé et testé, ou construit sur place en 3 à 5 jours.' },
                { t: 'Livraison mondiale', d: 'Emballage palette renforcé jusqu\'à 2000kg. Nous exportons dans plus de 40 pays avec installation assistée.' },
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

          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Nos fours à pizza bois
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

          <div className="mb-20">
            <h2 className="font-playfair text-3xl font-bold text-charcoal-900 mb-8 text-center">
              Questions fréquentes sur le four à pizza bois
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

      <section id="consultation" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Demandez votre four à pizza bois
            </h2>
            <p className="text-lg text-stone-600">
              Parlez-nous de votre projet — notre équipe à Naples vous conseillera le modèle, la finition et le conduit adaptés à votre espace.
            </p>
          </div>
          <ConsultationForm />
        </div>
      </section>
    </div>
  );
};

export default FourAPizzaBois;
