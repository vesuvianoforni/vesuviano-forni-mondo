import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import avanziniLogoAsset from '@/assets/avanzini-logo.png.asset.json';

const AVANZINI_LOGO_URL = avanziniLogoAsset.url;
const AVANZINI_URL =
  'https://www.avanzinibruciatori.it/bruciatori-per-forni-da-pizza-ad-uso-professionale/';

const AvanziniPartnerStrip = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'it';

  const gasHref =
    lang === 'it'
      ? '/it/forni-a-gas'
      : lang === 'fr'
      ? '/fr/fours-a-gaz'
      : '/en/commercial-gas-pizza-oven';

  const copy: Record<string, { eyebrow: string; title: string; body: string; cta: string; site: string }> = {
    it: {
      eyebrow: 'Partner ufficiale',
      title: 'Bruciatori Avanzini Drago',
      body:
        'Ogni forno a gas Vesuviano monta un bruciatore atmosferico Avanzini Drago serie D — silenzioso, efficiente e certificato IMQ, benchmark del settore dal 1960.',
      cta: 'Scopri i nostri forni a gas',
      site: 'Sito ufficiale Avanzini',
    },
    en: {
      eyebrow: 'Official partner',
      title: 'Avanzini Drago burners',
      body:
        'Every Vesuviano gas oven is fitted with an Avanzini Drago series D atmospheric burner — silent, efficient and IMQ-certified. The industry benchmark since 1960.',
      cta: 'Discover our gas ovens',
      site: 'Visit Avanzini',
    },
    fr: {
      eyebrow: 'Partenaire officiel',
      title: 'Brûleurs Avanzini Drago',
      body:
        'Chaque four à gaz Vesuviano est équipé d\'un brûleur atmosphérique Avanzini Drago série D — silencieux, efficace et certifié IMQ. Référence du secteur depuis 1960.',
      cta: 'Découvrir nos fours à gaz',
      site: 'Site officiel Avanzini',
    },
    de: {
      eyebrow: 'Offizieller Partner',
      title: 'Avanzini Drago Brenner',
      body:
        'Jeder Vesuviano-Gasofen ist mit einem atmosphärischen Avanzini Drago Serie D Brenner ausgestattet — leise, effizient und IMQ-zertifiziert. Branchenmaßstab seit 1960.',
      cta: 'Unsere Gasöfen entdecken',
      site: 'Avanzini Website',
    },
    es: {
      eyebrow: 'Socio oficial',
      title: 'Quemadores Avanzini Drago',
      body:
        'Cada horno de gas Vesuviano incorpora un quemador atmosférico Avanzini Drago serie D — silencioso, eficiente y certificado IMQ. Referencia del sector desde 1960.',
      cta: 'Descubre nuestros hornos de gas',
      site: 'Sitio oficial Avanzini',
    },
  };

  const t = copy[lang] || copy.it;

  return (
    <section aria-label="Avanzini Bruciatori partnership" className="py-14 md:py-16 bg-white border-y border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="grid md:grid-cols-[auto_1fr_auto] gap-8 md:gap-10 items-center">
          <a
            href={AVANZINI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 justify-self-center md:justify-self-start"
            aria-label={t.site}
          >
            <img
              src={AVANZINI_LOGO_URL}
              alt="Avanzini Bruciatori — since 1960"
              className="h-16 md:h-20 w-auto"
              loading="lazy"
            />
          </a>

          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-vesuviano-600 font-semibold mb-2">
              {t.eyebrow}
            </p>
            <h3 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
              {t.title}
            </h3>
            <p className="text-stone-600 leading-relaxed text-sm md:text-base max-w-2xl">
              {t.body}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-center md:items-end">
            <Link
              to={gasHref}
              className="inline-flex items-center gap-2 text-vesuviano-600 hover:text-vesuviano-700 font-semibold text-sm whitespace-nowrap"
            >
              {t.cta} →
            </Link>
            <a
              href={AVANZINI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-4"
            >
              {t.site}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvanziniPartnerStrip;
