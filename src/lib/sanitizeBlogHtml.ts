// Sanitizes AI-imported blog HTML:
// 1. Removes any BabyLoveGrowth attribution ("Article généré par BabyLoveGrowth", etc.)
// 2. Rewrites broken internal vesuvianoforni.com links to valid localized routes
//    (falls back to /{lang}/blog when no safe target is known).

const VALID_PATHS: Record<string, Set<string>> = {
  it: new Set([
    "/it", "/it/forni-tradizionali", "/it/forni-gas", "/it/forni-elettrici",
    "/it/forni-rotanti", "/it/sistema-vesuviobuono", "/it/pronta-consegna",
    "/it/bruciatori", "/it/depuratore-fumi", "/it/blog", "/it/informazioni-utili",
    "/it/collezioni", "/it/rivestimenti", "/it/chi-siamo", "/it/servizi",
    "/it/forno-a-legna-da-esterno",
  ]),
  en: new Set([
    "/en", "/en/traditional-ovens", "/en/gas-ovens", "/en/electric-ovens",
    "/en/rotating-ovens", "/en/vesuviobuono-system", "/en/ready-to-ship",
    "/en/burners", "/en/wood-smoke-purifier", "/en/blog", "/en/useful-information",
    "/en/collections", "/en/finishes", "/en/about-us", "/en/services",
    "/en/neapolitan-pizza-ovens", "/en/commercial-wood-fired-pizza-oven",
    "/en/commercial-gas-pizza-oven", "/en/rotating-pizza-oven", "/en/electric-pizza-oven",
  ]),
  fr: new Set([
    "/fr", "/fr/fours-traditionnels", "/fr/fours-gaz", "/fr/fours-electriques",
    "/fr/fours-rotatifs", "/fr/systeme-vesuviobuono", "/fr/pret-a-expedier",
    "/fr/bruleurs", "/fr/purificateur-fumee", "/fr/blog", "/fr/informations-utiles",
    "/fr/collections", "/fr/revetements", "/fr/qui-sommes-nous", "/fr/services",
    "/fr/fours-a-pizza-napolitains", "/fr/four-a-pizza-bois",
  ]),
  de: new Set([
    "/de", "/de/traditionelle-oefen", "/de/gasoefen", "/de/elektrooefen",
    "/de/drehoefen", "/de/vesuviobuono-system", "/de/sofort-lieferbar",
    "/de/brenner", "/de/rauchfilter", "/de/blog",
  ]),
  es: new Set([
    "/es", "/es/hornos-tradicionales", "/es/hornos-gas", "/es/hornos-electricos",
    "/es/hornos-rotativos", "/es/sistema-vesuviobuono", "/es/listo-para-enviar",
    "/es/quemadores", "/es/purificador-humo", "/es/blog", "/es/informacion-util",
    "/es/colecciones", "/es/revestimientos", "/es/quienes-somos", "/es/servicios",
    "/es/hornos-pizza-napolitana",
  ]),
};

// Heuristic keyword-based fallback: map a broken slug to the best valid page.
function guessTarget(pathname: string, lang: string): string | null {
  const p = pathname.toLowerCase();
  const valid = VALID_PATHS[lang];
  if (!valid) return null;

  const has = (path: string) => (valid.has(path) ? path : null);

  const testWood = /wood|legna|bois|holz|lena|leña/.test(p);
  const testGas = /\bgas\b|\bgaz\b/.test(p);
  const testElec = /electric|elettric|electriqu|elektro|electric|eléctric/.test(p);
  const testRot = /rotat|rotant|rotatif|dreh|rotativ/.test(p);
  const testNap = /napolit|napolet|neapol|napolet|napolitan/.test(p);
  const testBurn = /burner|bruciator|bruleur|brenner|quemador/.test(p);
  const testBlog = /\bblog\b/.test(p);

  if (testBlog) return has(`/${lang}/blog`);
  if (testNap) {
    return (
      has(`/${lang}/fours-a-pizza-napolitains`) ||
      has(`/${lang}/neapolitan-pizza-ovens`) ||
      has(`/${lang}/hornos-pizza-napolitana`)
    );
  }
  if (testWood) {
    return (
      has(`/${lang}/four-a-pizza-bois`) ||
      has(`/${lang}/forno-a-legna-da-esterno`) ||
      has(`/${lang}/commercial-wood-fired-pizza-oven`) ||
      has(`/${lang}/forni-tradizionali`) ||
      has(`/${lang}/traditional-ovens`) ||
      has(`/${lang}/fours-traditionnels`) ||
      has(`/${lang}/traditionelle-oefen`) ||
      has(`/${lang}/hornos-tradicionales`)
    );
  }
  if (testGas) {
    return (
      has(`/${lang}/forni-gas`) || has(`/${lang}/gas-ovens`) ||
      has(`/${lang}/fours-gaz`) || has(`/${lang}/gasoefen`) ||
      has(`/${lang}/hornos-gas`)
    );
  }
  if (testElec) {
    return (
      has(`/${lang}/forni-elettrici`) || has(`/${lang}/electric-ovens`) ||
      has(`/${lang}/fours-electriques`) || has(`/${lang}/elektrooefen`) ||
      has(`/${lang}/hornos-electricos`)
    );
  }
  if (testRot) {
    return (
      has(`/${lang}/forni-rotanti`) || has(`/${lang}/rotating-ovens`) ||
      has(`/${lang}/fours-rotatifs`) || has(`/${lang}/drehoefen`) ||
      has(`/${lang}/hornos-rotativos`)
    );
  }
  if (testBurn) {
    return (
      has(`/${lang}/bruciatori`) || has(`/${lang}/burners`) ||
      has(`/${lang}/bruleurs`) || has(`/${lang}/brenner`) ||
      has(`/${lang}/quemadores`)
    );
  }
  return null;
}

const INTERNAL_HOST_RE = /^(https?:)?\/\/(www\.)?vesuvianoforni\.com/i;

function fixHref(rawHref: string, lang: string): string {
  const href = rawHref.trim();
  // Anchor / mailto / tel — leave alone
  if (/^(mailto:|tel:|#)/i.test(href)) return href;

  let pathname = "";
  let isInternal = false;

  if (INTERNAL_HOST_RE.test(href)) {
    isInternal = true;
    pathname = href.replace(INTERNAL_HOST_RE, "") || "/";
  } else if (href.startsWith("/")) {
    isInternal = true;
    pathname = href;
  } else {
    // External link — leave alone
    return href;
  }

  // Strip query/hash for validation
  const [pathOnly, ...rest] = pathname.split(/[?#]/);
  const suffix = pathname.slice(pathOnly.length);
  let normalized = pathOnly.replace(/\/+$/, "") || "/";

  // If link uses another language prefix, remap prefix to current lang
  const langMatch = normalized.match(/^\/(it|en|fr|de|es)(\/|$)/);
  if (langMatch && langMatch[1] !== lang) {
    normalized = "/" + lang + normalized.slice(3);
  }

  const valid = VALID_PATHS[lang];
  if (valid && valid.has(normalized)) {
    return (isInternal ? normalized : href) + suffix;
  }

  // Try heuristic fallback
  const guessed = guessTarget(normalized, lang);
  if (guessed) return guessed;

  // Ultimate fallback: blog list, else home
  return valid?.has(`/${lang}/blog`) ? `/${lang}/blog` : `/${lang}`;
}

const ATTRIBUTION_RE =
  /<(p|div|small|footer|em|span)[^>]*>[\s\S]{0,400}?babylovegrowth[\s\S]{0,400}?<\/\1>/gi;

const STRAY_ATTRIBUTION_RE =
  /\b(Article[a-z]*\s+g[eé]n[eé]r[eé][^<>\n]{0,60}BabyLoveGrowth|Articolo\s+generato[^<>\n]{0,60}BabyLoveGrowth|Article\s+generated\s+by\s+BabyLoveGrowth|Artikel\s+erstellt\s+von\s+BabyLoveGrowth|Art[ií]culo\s+generado\s+por\s+BabyLoveGrowth)[^<>\n]*/gi;

export function sanitizeBlogHtml(html: string, lang: string): string {
  if (!html) return html;

  let out = html;

  // 1) Remove wrapping tags that contain the attribution
  out = out.replace(ATTRIBUTION_RE, "");
  // 2) Remove any leftover plain-text attribution phrases
  out = out.replace(STRAY_ATTRIBUTION_RE, "");
  // 3) Remove any <a> pointing to babylovegrowth.ai
  out = out.replace(
    /<a\b[^>]*href=["'][^"']*babylovegrowth\.ai[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,
    "",
  );

  // 4) Rewrite hrefs
  out = out.replace(
    /(<a\b[^>]*\shref=)(["'])([^"']+)\2/gi,
    (_m, prefix, quote, href) => `${prefix}${quote}${fixHref(href, lang)}${quote}`,
  );

  return out;
}
