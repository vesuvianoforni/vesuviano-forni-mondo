import { useTranslation } from 'react-i18next';
import zapperProduct from '@/assets/zapper-product.png';
import { Button } from "@/components/ui/button";
import { Wind, ShieldCheck, Leaf, ArrowRight } from "lucide-react";

const ZapperSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Wind,
      title: "Riduzione fumi fino al 95%",
      description: "Tecnologia certificata per abbattere fumi, odori e polveri sottili di fuliggine"
    },
    {
      icon: ShieldCheck,
      title: "Conformità normativa garantita",
      description: "Nessun reclamo dai vicini, nessuna multa. Ideale per aperture in centro città"
    },
    {
      icon: Leaf,
      title: "Aria pulita, sempre",
      description: "Sistemi compatibili con forni a legna, gas ed elettrici"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-stone-900 to-stone-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full text-sm font-medium text-green-400 mb-6">
            <span>🤝</span>
            <span>Partner Ufficiale</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            Apri il tuo forno in <span className="text-green-400">centro città</span>
          </h2>
          <p className="text-lg sm:text-xl text-stone-400 max-w-3xl mx-auto">
            Con ZAPPER® elimini fumi, odori e polveri sottili. Il sistema di abbattimento fumi certificato che ti permette di operare ovunque, senza reclami e nel rispetto delle normative.
          </p>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          {/* Left: Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-stone-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => window.open('https://www.smokezapper.it', '_blank')}
              >
                Scopri ZAPPER®
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
                onClick={() => window.open('https://smokezapper.it/contatti', '_blank')}
              >
                Richiedi consulenza tecnica
              </Button>
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://smokezapper.it/assets/hero-zapper-team-guQxyLHy.webp"
                alt="ZAPPER® Team"
                className="w-full rounded-2xl object-cover max-h-[300px]"
                loading="lazy"
              />
            </div>
            <div className="text-center">
              <img
                src="https://smokezapper.it/assets/logo-zapper-white-CZHj_Kxv.svg"
                alt="ZAPPER® Logo"
                className="h-8 w-auto mx-auto mb-4 opacity-90"
                loading="lazy"
              />
              <p className="text-stone-300 text-sm mb-4">
                Tecnologia italiana certificata per l'abbattimento fumi. Oltre 2500 clienti soddisfatti con valutazione Trustpilot 4.8/5.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">95%</div>
                  <div className="text-stone-500 text-xs">Riduzione fumi</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">2500+</div>
                  <div className="text-stone-500 text-xs">Clienti soddisfatti</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">4.8★</div>
                  <div className="text-stone-500 text-xs">Trustpilot</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZapperSection;
