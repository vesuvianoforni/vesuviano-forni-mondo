import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import CtaButton from './CtaButton';

const labels: Record<string, {
  title: string;
  points: { heading: string; detail: string }[];
}> = {
  it: {
    title: 'La vera esperienza del forno napoletano, adattata al tuo modo di lavorare',
    points: [
      { heading: 'La vera cottura napoletana, riconosciuta e apprezzata in tutto il mondo', detail: 'con suolo, cupola e dinamica di calore progettati per risultati autentici' },
      { heading: 'Scegli il forno giusto per il tuo locale', detail: 'versioni a legna, gas, elettriche e rotanti, in base a spazio, volumi e necessità' },
      { heading: 'Pizza sempre costante, anche nei momenti di massimo lavoro', detail: 'senza variazioni tra una cottura e l\'altra' },
      { heading: 'Servizio più veloce senza compromettere la qualità', detail: 'più pizze sfornate con lo stesso standard grazie alla cupola bassa Napoletana' },
      { heading: 'Controllo totale del forno, ogni giorno', detail: 'per lavorare con sicurezza, continuità e senza stress' },
    ],
  },
  en: {
    title: 'The true Neapolitan oven experience, adapted to the way you work',
    points: [
      { heading: 'Authentic Neapolitan cooking, recognised and appreciated worldwide', detail: 'with floor, dome and heat dynamics designed for authentic results' },
      { heading: 'Choose the right oven for your venue', detail: 'wood, gas, electric and rotating versions, based on space, volumes and needs' },
      { heading: 'Consistent pizza, even during peak hours', detail: 'no variation between one bake and the next' },
      { heading: 'Faster service without compromising quality', detail: 'more pizzas baked to the same standard thanks to the low Neapolitan dome' },
      { heading: 'Total oven control, every day', detail: 'work with confidence, consistency and zero stress' },
    ],
  },
  fr: {
    title: 'La véritable expérience du four napolitain, adaptée à votre façon de travailler',
    points: [
      { heading: 'La vraie cuisson napolitaine, reconnue et appréciée dans le monde entier', detail: 'avec sole, dôme et dynamique de chaleur conçus pour des résultats authentiques' },
      { heading: 'Choisissez le four adapté à votre établissement', detail: 'versions bois, gaz, électrique et rotatives, selon l\'espace, les volumes et les besoins' },
      { heading: 'Pizza toujours constante, même en plein rush', detail: 'sans variation d\'une cuisson à l\'autre' },
      { heading: 'Service plus rapide sans compromettre la qualité', detail: 'plus de pizzas enfournées au même standard grâce au dôme bas napolitain' },
      { heading: 'Contrôle total du four, chaque jour', detail: 'pour travailler avec assurance, continuité et sans stress' },
    ],
  },
  de: {
    title: 'Das echte neapolitanische Ofenerlebnis, angepasst an Ihre Arbeitsweise',
    points: [
      { heading: 'Authentisches neapolitanisches Backen, weltweit anerkannt und geschätzt', detail: 'mit Boden, Kuppel und Wärmedynamik für authentische Ergebnisse' },
      { heading: 'Wählen Sie den richtigen Ofen für Ihr Lokal', detail: 'Holz-, Gas-, Elektro- und Rotationsversionen, je nach Platz, Volumen und Bedarf' },
      { heading: 'Konstante Pizza, auch in Stoßzeiten', detail: 'ohne Schwankungen zwischen den Backvorgängen' },
      { heading: 'Schnellerer Service ohne Qualitätseinbußen', detail: 'mehr Pizzen mit dem gleichen Standard dank der niedrigen neapolitanischen Kuppel' },
      { heading: 'Totale Ofenkontrolle, jeden Tag', detail: 'arbeiten Sie mit Sicherheit, Kontinuität und ohne Stress' },
    ],
  },
  es: {
    title: 'La verdadera experiencia del horno napolitano, adaptada a tu forma de trabajar',
    points: [
      { heading: 'La auténtica cocción napolitana, reconocida y apreciada en todo el mundo', detail: 'con suelo, cúpula y dinámica de calor diseñados para resultados auténticos' },
      { heading: 'Elige el horno adecuado para tu local', detail: 'versiones a leña, gas, eléctricas y rotativas, según espacio, volúmenes y necesidades' },
      { heading: 'Pizza siempre constante, incluso en los momentos de máximo trabajo', detail: 'sin variaciones entre una cocción y otra' },
      { heading: 'Servicio más rápido sin comprometer la calidad', detail: 'más pizzas horneadas con el mismo estándar gracias a la cúpula baja napolitana' },
      { heading: 'Control total del horno, cada día', detail: 'para trabajar con seguridad, continuidad y sin estrés' },
    ],
  },
};

const ValueProposition = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'it';
  const l = labels[lang] || labels.it;

  return (
    <section className="relative bg-gradient-to-b from-stone-50 to-stone-100 overflow-hidden">
      {/* Oven dome image with fade */}
      <div className="relative w-full h-[250px] sm:h-[320px] md:h-[400px] overflow-hidden">
        <img
          src="/images/cupola-forno.png"
          alt="Cupola forno napoletano Vesuviano"
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-stone-50" />
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-12 md:pb-20 -mt-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-8 md:mb-12 text-center leading-snug">
            {l.title}
          </h2>

          <div className="space-y-5 md:space-y-6 mb-10 md:mb-12">
            {l.points.map((point, i) => (
              <div key={i} className="flex gap-3 md:gap-4">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-vesuviano-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900 text-sm md:text-base leading-snug">
                    {point.heading}
                  </p>
                  <p className="text-stone-600 text-xs md:text-sm mt-0.5 leading-relaxed">
                    {point.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <CtaButton />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
