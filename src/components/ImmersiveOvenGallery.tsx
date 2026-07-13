import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageZoomModal from './ImageZoomModal';
import heroBgAsset from '@/assets/gallery-hero-bg.jpg.asset.json';
import realBoscoCutout from '@/assets/real-bosco-cutout.png.asset.json';
import sebastianCutout from '@/assets/sebastian-cutout.png.asset.json';
import startProjectBgAsset from '@/assets/start-project-bg.jpg.asset.json';
const HERO_BG_URL = heroBgAsset.url;
const START_PROJECT_BG_URL = startProjectBgAsset.url;
const IMAGE_OVERRIDES: Record<string, string> = {
  'Real Bosco': realBoscoCutout.url,
  'Sebastian': sebastianCutout.url,
};

interface Oven {
  id: string;
  name: string;
  tagline: string;
  image_url: string;
  description?: string | null;
  fuels: string[];
  diameters: number[];
  coatings: string[];
  canBuiltOnPlace?: boolean;
}

// The 3 model names we surface from configurator_ovens
const MODEL_NAMES = ['Anastasia', 'Real Bosco', 'Sebastian'];

const MODEL_META: Record<
  string,
  {
    tagline: string;
    description: string;
    coatings: string[];
    diameters: number[];
    fuels: string[];
    canBuiltOnPlace?: boolean;
  }
> = {
  'Anastasia': {
    tagline: 'Signature Collection',
    description:
      'Linea di punta Vesuviano — disponibile da 100 a 140 cm. Rivestimenti nobili in mosaico o palladiana, firma artigianale in ogni dettaglio.',
    coatings: ['mezzo-mosaico', 'mosaico', 'palladiana'],
    diameters: [100, 110, 120, 130, 140],
    fuels: ['Legna', 'Gas', 'Elettrico'],
  },
  'Real Bosco': {
    tagline: 'Heritage Line',
    description:
      'Il forno napoletano essenziale, dalle dimensioni compatte alle più generose (80–140 cm). Disponibile a legna, gas e nella versione rotante.',
    coatings: ['mezzo-mosaico', 'mosaico', 'verniciato', 'doghe-metalliche'],
    diameters: [80, 100, 110, 120, 130, 140],
    fuels: ['Legna', 'Gas', 'Rotante'],
  },
  'Sebastian': {
    tagline: 'Professional Series',
    description:
      'Progettato per pizzerie ad alto volume, da 60 a 140 cm. Rivestimento tecnico in doghe metalliche, può essere costruito sul posto.',
    coatings: ['doghe-metalliche'],
    diameters: [60, 80, 100, 120, 130, 140],
    fuels: ['Legna', 'Gas', 'Elettrico'],
    canBuiltOnPlace: true,
  },
};

const ImmersiveOvenGallery = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { lang } = useParams<{ lang?: string }>();
  const builtOnPlaceHref = '/built-on-place';
  const [ovens, setOvens] = useState<Oven[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');
  const [zoomed, setZoomed] = useState<Oven | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const modelFilters = [
    { value: 'all', label: 'Tutti i modelli' },
    { value: 'Real Bosco', label: 'Real Bosco' },
    { value: 'Sebastian', label: 'Sebastian' },
    { value: 'Anastasia', label: 'Anastasia' },
  ];


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('configurator_ovens')
          .select('id, model_name, image_url, description, fuel_type, diameter')
          .eq('is_active', true)
          .in('model_name', MODEL_NAMES);
        if (error) throw error;
        const ordered = MODEL_NAMES
          .map((n) => (data || []).find((d: any) => d.model_name === n))
          .filter(Boolean)
          .map((d: any) => {
            const meta = MODEL_META[d.model_name];
            return {
              id: d.id,
              name: d.model_name,
              image_url: IMAGE_OVERRIDES[d.model_name] || d.image_url,
              description: d.description || meta?.description || '',
              fuels: meta?.fuels || (d.fuel_type ?? []),
              diameters: meta?.diameters || (d.diameter ? [d.diameter] : []),
              tagline: meta?.tagline || '',
              coatings: meta?.coatings || [],
              canBuiltOnPlace: meta?.canBuiltOnPlace,
            } as Oven;
          });
        setOvens(ordered);
      } catch (e) {
        console.error('Error fetching ovens', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = ovens.filter((o) => selectedModel === 'all' || o.name === selectedModel);
  const shown = filtered;


  const scrollToForm = () => {
    document.getElementById('immersive-consultation')?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({
        title: t('consultation.messages.requiredFields'),
        description: t('consultation.messages.fillRequired'),
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-consultation-email', {
        body: { ...form, country: '', ovenType: '' },
      });
      if (error) throw error;
      toast({
        title: t('consultation.messages.success'),
        description: t('consultation.messages.successDescription'),
      });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      toast({
        title: t('consultation.messages.error'),
        description: t('consultation.messages.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 bg-[#f7f3ec]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <section
      id="oven-gallery"
      className="bg-[#f7f3ec] text-stone-800 selection:bg-orange-200 selection:text-orange-900"
    >
      {/* Immersive hero with background image */}
      <div className="relative min-h-[85vh] md:min-h-[92vh] flex items-end overflow-hidden">
        <img
          src={HERO_BG_URL}
          alt="Vesuviano oven collection"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-[#f7f3ec]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24 pt-32 md:pt-40">
          <div className="max-w-3xl space-y-6 md:space-y-8">
            <div className="inline-block border border-orange-300/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-orange-100 text-[10px] uppercase tracking-[0.4em] font-semibold">
                {t('craftsmanship.since', 'Handcrafted Since 1950')}
              </span>
            </div>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl text-stone-50 font-light leading-[1.05]">
              {t('ovenGallery.title')}
            </h1>
            <p className="max-w-xl text-stone-100/90 font-light text-base md:text-lg leading-relaxed">
              {t('ovenGallery.subtitle')}
            </p>
            <div className="flex items-center gap-3 pt-2 text-stone-200/80 text-[10px] uppercase tracking-[0.3em] animate-pulse">
              <ChevronDown className="w-4 h-4" />
              <span>Scorri per esplorare</span>
            </div>
          </div>
        </div>
      </div>


      {/* Sticky compact filter bar */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#f7f3ec]/95 backdrop-blur-md border-y border-stone-300/70">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
            {/* Model filter */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="hidden md:inline shrink-0 text-[9px] uppercase tracking-[0.3em] text-stone-500">
                Modello
              </span>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 snap-x">
                {modelFilters.map((c) => {
                  const active = selectedModel === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setSelectedModel(c.value)}
                      className={`shrink-0 snap-start px-4 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'border-stone-300 text-stone-700 hover:border-orange-500/70 hover:text-orange-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32">


        {/* Immersive gallery */}
        {shown.length === 0 ? (
          <div className="text-center py-20 text-stone-500">Nessun modello trovato</div>
        ) : (
          <div className="grid grid-cols-1 gap-24 md:gap-40">
            {shown.map((oven, idx) => {
              const reversed = idx % 2 === 1;
              const num = String(idx + 1).padStart(2, '0');
              return (
                <article
                  key={oven.id}
                  className="group relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center animate-fade-in"
                >
                  <div className={`lg:col-span-7 relative ${reversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="absolute -inset-20 bg-orange-500/15 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    <button
                      onClick={() => setZoomed(oven)}
                      className="block w-full aspect-[3/2] rounded-sm border border-stone-300/60 overflow-hidden shadow-xl transition-transform duration-700 group-hover:scale-[1.02] cursor-zoom-in bg-[#f7f3ec]"
                    >
                      <img
                        src={oven.image_url}
                        alt={oven.name}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>

                    <div
                      className={`absolute top-4 ${reversed ? 'right-6' : 'left-6'} text-stone-400/40 text-8xl md:text-9xl font-playfair italic select-none pointer-events-none`}
                    >
                      {num}
                    </div>
                  </div>
                  <div className={`lg:col-span-5 space-y-6 md:space-y-8 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="space-y-2">
                      {oven.tagline && (
                        <h3 className="text-orange-600 text-xs tracking-[0.3em] uppercase">
                          {oven.tagline}
                        </h3>
                      )}
                      <h2 className="font-playfair text-4xl md:text-5xl text-stone-900 leading-tight">
                        {oven.name}
                      </h2>
                    </div>
                    {oven.description && (
                      <p className="text-stone-600 font-light leading-relaxed text-base md:text-lg">
                        {oven.description}
                      </p>
                    )}
                    <dl className="grid grid-cols-2 gap-4 pt-4 text-sm">
                      {oven.diameters.length > 0 && (
                        <div>
                          <dt className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Diametri</dt>
                          <dd className="text-stone-800">{oven.diameters.join(' · ')} cm</dd>
                        </div>
                      )}
                      {oven.fuels.length > 0 && (
                        <div>
                          <dt className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Alimentazione</dt>
                          <dd className="text-stone-800">{oven.fuels.join(' · ')}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {oven.canBuiltOnPlace && (
                        <Link
                          to={builtOnPlaceHref}
                          className="inline-flex items-center gap-1.5 text-[10px] text-orange-700 hover:text-orange-900 uppercase tracking-widest border border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 rounded-full px-3 py-1 transition-colors"
                        >
                          Può essere costruito sul posto
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}



        {/* Unified consultation */}
        <section
          id="immersive-consultation"
          className="relative overflow-hidden rounded-sm scroll-mt-24 shadow-lg p-8 md:p-16 lg:p-24"
        >
          {/* Background image */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${START_PROJECT_BG_URL})` }}
          />
          {/* Overlay for readability */}
          <div aria-hidden className="absolute inset-0 bg-stone-950/70" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8 mb-14 md:mb-20 relative">
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white">
              {t('consultation.header.title')}
            </h2>
            <p className="text-stone-200 text-base md:text-lg font-light">
              {t('consultation.header.subtitle')}
            </p>
          </div>

          <form onSubmit={submit} className="max-w-4xl mx-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 md:gap-x-12 gap-y-8 md:gap-y-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                  {t('consultation.form.name')}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-400/60 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors placeholder:text-stone-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                  {t('consultation.form.email')}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-400/60 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors placeholder:text-stone-400"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                  {t('consultation.form.phone')}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-400/60 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors placeholder:text-stone-400"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                  {t('consultation.form.message')}
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-400/60 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors resize-none placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="mt-12 md:mt-16 text-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-4 px-10 md:px-12 py-5 bg-orange-600 text-white text-xs uppercase tracking-[0.3em] font-bold hover:bg-orange-700 transition-all shadow-[0_10px_40px_-10px_rgba(194,65,12,0.5)] cursor-pointer group disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t('cta.getQuote')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="mt-6 text-stone-300 text-[10px] uppercase tracking-widest italic">
                {t('consultation.responseTime', 'Response within 24-48h')}
              </p>
            </div>
          </form>
        </section>

        <footer className="text-center">
          <p className="text-stone-500 text-xs tracking-[0.3em] uppercase">
            • Napoli • Since 1950 •
          </p>
        </footer>
      </div>


      {zoomed && (
        <ImageZoomModal
          isOpen={!!zoomed}
          onClose={() => setZoomed(null)}
          imageUrl={zoomed.image_url}
          imageAlt={zoomed.name}
          title={zoomed.name}
        />
      )}
    </section>
  );
};

export default ImmersiveOvenGallery;
