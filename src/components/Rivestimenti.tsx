
import { Button } from "@/components/ui/button";
import CtaButton from './CtaButton';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

const Rivestimenti = () => {
  const { t } = useTranslation();

  const rivestimenti = [
    {
      key: 'mosaicato',
      title: 'Mosaico',
      description: 'Mosaico Appiani, tra le migliori marche italiane di ceramica. Tessere lavorate a mano per un effetto artistico unico e senza tempo.',
      image: "/__l5e/assets-v1/de255509-511f-467a-b6f6-1d4e87d8365e/mosaico-appiani.png",
      colors: ['Mosaico Classico', 'Mosaico Moderno', 'Mosaico Artistico']
    },
    {
      key: 'verniciato',
      title: 'Verniciato',
      description: 'Finitura liscia e uniforme con vernici resistenti al calore, disponibile in un ampio ventaglio di colori.',
      image: "/__l5e/assets-v1/28d0f035-ead8-4446-91cd-2d27069cfcec/verniciato-rivestimento.png",
      colors: ['Rosso Vesuvio', 'Nero Antracite', 'Bianco Panna', 'Verde Oliva']
    },
    {
      key: 'palladiana',
      title: 'Palladiana',
      description: 'Composizione irregolare di frammenti di marmo per un look elegante ispirato alla tradizione veneziana.',
      image: "/__l5e/assets-v1/80c530da-0a3d-4a62-a52d-87243b188552/palladiana-rivestimento.png",
      colors: ['Marmi Misti', 'Toni Neutri', 'Contrasto Scuro']
    },
    {
      key: 'dogheMetalliche',
      title: 'Doghe Metalliche',
      description: 'Rivestimento moderno in doghe di metallo per un design contemporaneo e industriale.',
      image: "/__l5e/assets-v1/b885b811-59cb-4437-a25c-7f1d3fe9df0d/doghe-metalliche-rivestimento.png",
      colors: ['Acciaio Spazzolato', 'Nero Opaco', 'Bianco Metallizzato']
    }
  ];



  return (
    <section id="rivestimenti" className="py-20 bg-gradient-to-br from-stone-50 to-vesuviano-50">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="outline" className="mb-4 text-vesuviano-600 border-vesuviano-200">
              {t('rivestimenti.badge', 'Personalizzazione')}
            </Badge>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-900 mb-4">
              {t('rivestimenti.title', 'Rivestimenti')} <span className="text-vesuviano-600">{t('rivestimenti.titleHighlight', 'Esclusivi')}</span>
            </h2>
            <p className="font-inter text-lg text-stone-600 max-w-3xl mx-auto">
              {t('rivestimenti.subtitle', 'Ogni forno Vesuviano può essere personalizzato con rivestimenti di alta qualità che uniscono estetica e funzionalità, per integrarsi perfettamente nel tuo ambiente.')}
            </p>
          </div>

          {/* Rivestimenti Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {rivestimenti.map((rivestimento, index) => (
              <Card 
                key={rivestimento.key}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-stone-200 hover:border-vesuviano-300 animate-fade-in bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={rivestimento.image} 
                    alt={t(`rivestimenti.${rivestimento.key}.title`, rivestimento.title)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-playfair text-xl font-bold">
                      {t(`rivestimenti.${rivestimento.key}.title`, rivestimento.title)}
                    </h3>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                    {t(`rivestimenti.${rivestimento.key}.description`, rivestimento.description)}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                      {t('rivestimenti.availableOptions', 'Opzioni Disponibili')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rivestimento.colors.map((color, colorIndex) => (
                        <span 
                          key={colorIndex}
                          className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full hover:bg-vesuviano-100 hover:text-vesuviano-700 transition-colors duration-200"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button 
                    size="sm"
                    className="w-full bg-stone-100 text-stone-700 hover:bg-vesuviano-500 hover:text-white transition-all duration-300 text-xs"
                    onClick={() => document.getElementById('oven-gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {t('rivestimenti.viewSamples', 'Vedi Campioni')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Processo di Personalizzazione */}
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center mb-8">
              <h3 className="font-playfair text-3xl font-bold text-charcoal-900 mb-4">
                {t('rivestimenti.process.title', 'Processo di Personalizzazione')}
              </h3>
              <p className="text-stone-600 max-w-2xl mx-auto">
                {t('rivestimenti.process.description', 'Dal concept alla realizzazione, ti accompagniamo in ogni fase per creare il forno perfetto per te.')}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { 
                  step: '01', 
                  title: t('rivestimenti.process.step1.title', 'Consulenza'),
                  desc: t('rivestimenti.process.step1.desc', 'Analisi delle tue esigenze')
                },
                { 
                  step: '02', 
                  title: t('rivestimenti.process.step2.title', 'Design'),
                  desc: t('rivestimenti.process.step2.desc', 'Progettazione personalizzata')
                },
                { 
                  step: '03', 
                  title: t('rivestimenti.process.step3.title', 'Campioni'),
                  desc: t('rivestimenti.process.step3.desc', 'Selezione materiali')
                },
                { 
                  step: '04', 
                  title: t('rivestimenti.process.step4.title', 'Realizzazione'),
                  desc: t('rivestimenti.process.step4.desc', 'Produzione artigianale')
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-vesuviano-100 rounded-full flex items-center justify-center group-hover:bg-vesuviano-500 transition-all duration-300">
                    <span className="font-playfair text-xl font-bold text-vesuviano-600 group-hover:text-white transition-colors duration-300">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-charcoal-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-stone-600">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <CtaButton className="px-8 py-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rivestimenti;
