import { Helmet } from 'react-helmet-async';
import { getAlternatesForPath, LANGS, type AlternatesMap } from '@/lib/hreflang';

const BASE_URL = 'https://vesuvianoforni.com';

export interface SEOHeadProps {
  /** Page title. Should be unique per page. */
  title: string;
  /** Meta description, < 160 chars. */
  description: string;
  /** Canonical path or absolute URL. If a path, BASE_URL is prepended. */
  canonical?: string;
  /** Absolute URL of social share image. */
  ogImage?: string;
  /** When true, emits a noindex,nofollow robots meta. */
  noIndex?: boolean;
  /** Optional JSON-LD object (or array of objects). Will be JSON.stringified. */
  schemaJson?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Language code (it/en/fr/de/es). Defaults to it. */
  lang?: string;
  /** og:type, defaults to 'website'. */
  ogType?: string;
  /** Optional explicit hreflang alternates map. If omitted, auto-derived from canonical path. */
  alternates?: AlternatesMap;
}

const toAbsolute = (urlOrPath: string) => {
  if (!urlOrPath) return BASE_URL;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  return `${BASE_URL}${urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`}`;
};

const pathOf = (urlOrPath: string) => {
  if (/^https?:\/\//i.test(urlOrPath)) {
    try { return new URL(urlOrPath).pathname; } catch { return urlOrPath; }
  }
  return urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
};

const ogLocale = (lang: string) =>
  lang === 'en' ? 'en_US'
  : lang === 'fr' ? 'fr_FR'
  : lang === 'de' ? 'de_DE'
  : lang === 'es' ? 'es_ES'
  : 'it_IT';

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage,
  noIndex,
  schemaJson,
  lang = 'it',
  ogType = 'website',
  alternates,
}: SEOHeadProps) => {
  const canonicalInput = canonical || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = toAbsolute(canonicalInput);
  const canonicalPath = pathOf(canonicalInput);
  const image = ogImage ? toAbsolute(ogImage) : `${BASE_URL}https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/oven-gallery/site/vesuviano-social-banner.jpg`;
  const schemas = schemaJson
    ? (Array.isArray(schemaJson) ? schemaJson : [schemaJson])
    : [];

  const resolvedAlternates = alternates ?? getAlternatesForPath(canonicalPath) ?? undefined;
  const xDefaultPath = resolvedAlternates?.it ?? resolvedAlternates?.en;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang alternates (includes self-reference + x-default) */}
      {resolvedAlternates && LANGS.map((l) => (
        <link key={`hreflang-${l}`} rel="alternate" hrefLang={l} href={`${BASE_URL}${resolvedAlternates[l]}`} />
      ))}
      {resolvedAlternates && xDefaultPath && (
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${xDefaultPath}`} />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Vesuviano Forni" />
      <meta property="og:locale" content={ogLocale(lang)} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={canonicalUrl} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
