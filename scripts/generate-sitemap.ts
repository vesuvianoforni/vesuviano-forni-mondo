import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'https://vesuvianoforni.com';
const LANGS = ['it', 'en', 'fr', 'de', 'es'] as const;

const staticPages = [
  // Homepages
  { paths: { it: '/it', en: '/en', fr: '/fr', de: '/de', es: '/es' }, priority: '1.0', changefreq: 'weekly' },

  // Product pages
  { paths: { it: '/it/forni-tradizionali', en: '/en/traditional-ovens', fr: '/fr/fours-traditionnels', de: '/de/traditionelle-oefen', es: '/es/hornos-tradicionales' }, priority: '0.9', changefreq: 'monthly' },
  { paths: { it: '/it/forni-gas', en: '/en/gas-ovens', fr: '/fr/fours-gaz', de: '/de/gasoefen', es: '/es/hornos-gas' }, priority: '0.9', changefreq: 'monthly' },
  { paths: { it: '/it/forni-elettrici', en: '/en/electric-ovens', fr: '/fr/fours-electriques', de: '/de/elektrooefen', es: '/es/hornos-electricos' }, priority: '0.9', changefreq: 'monthly' },
  { paths: { it: '/it/forni-rotanti', en: '/en/rotating-ovens', fr: '/fr/fours-rotatifs', de: '/de/drehoefen', es: '/es/hornos-rotativos' }, priority: '0.9', changefreq: 'monthly' },
  { paths: { it: '/it/sistema-vesuviobuono', en: '/en/vesuviobuono-system', fr: '/fr/systeme-vesuviobuono', de: '/de/vesuviobuono-system', es: '/es/sistema-vesuviobuono' }, priority: '0.9', changefreq: 'monthly' },

  // Secondary pages
  { paths: { it: '/it/pronta-consegna', en: '/en/ready-to-ship', fr: '/fr/pret-a-expedier', de: '/de/versandfertig', es: '/es/listo-para-enviar' }, priority: '0.8', changefreq: 'weekly' },
  { paths: { it: '/it/architettoai', en: '/en/architettoai', fr: '/fr/architettoai', de: '/de/architettoai', es: '/es/architettoai' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/blog', en: '/en/blog', fr: '/fr/blog', de: '/de/blog', es: '/es/blog' }, priority: '0.8', changefreq: 'daily' },
  { paths: { it: '/built-on-place', en: '/built-on-place', fr: '/built-on-place', de: '/built-on-place', es: '/built-on-place' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/bruciatori', en: '/en/burners', fr: '/fr/bruleurs', de: '/de/brenner', es: '/es/quemadores' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/depuratore-fumi', en: '/en/wood-smoke-purifier', fr: '/fr/purificateur-fumee', de: '/de/rauchfilter', es: '/es/purificador-humo' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/collezioni', en: '/en/collections', fr: '/fr/collections', de: '/de/kollektionen', es: '/es/colecciones' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/chi-siamo', en: '/en/about-us', fr: '/fr/qui-sommes-nous', de: '/de/ueber-uns', es: '/es/quienes-somos' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/servizi', en: '/en/services', fr: '/fr/services', de: '/de/dienstleistungen', es: '/es/servicios' }, priority: '0.8', changefreq: 'monthly' },
  { paths: { it: '/it/informazioni-utili', en: '/en/useful-information', fr: '/fr/informations-utiles', de: '/de/nuetzliche-informationen', es: '/es/informacion-util' }, priority: '0.8', changefreq: 'monthly' },

  // Other
  { paths: { it: '/book-a-slot-call', en: '/book-a-slot-call', fr: '/book-a-slot-call', de: '/book-a-slot-call', es: '/book-a-slot-call' }, priority: '0.7', changefreq: 'monthly' },

  // Neapolitan pizza ovens SEO cluster (no IT variant — IT alternate points to EN as fallback)
  { paths: { it: '/en/neapolitan-pizza-ovens', en: '/en/neapolitan-pizza-ovens', fr: '/fr/fours-a-pizza-napolitains', de: '/de/neapolitanische-pizzaoefen', es: '/es/hornos-pizza-napolitana' }, priority: '0.8', changefreq: 'monthly' },
];

// Single-language SEO landing pages (no hreflang siblings)
const singleLangPages: { path: string; priority: string; changefreq: string }[] = [
  { path: '/it/forno-a-legna-da-esterno', priority: '0.7', changefreq: 'monthly' },
  { path: '/fr/four-a-pizza-bois', priority: '0.7', changefreq: 'monthly' },
  { path: '/en/commercial-wood-fired-pizza-oven', priority: '0.7', changefreq: 'monthly' },
  { path: '/en/rotating-pizza-oven', priority: '0.7', changefreq: 'monthly' },
  { path: '/en/electric-pizza-oven', priority: '0.7', changefreq: 'monthly' },
];

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(paths: Record<string, string>, lang: string, priority: string, changefreq: string, lastmod: string) {
  const hreflangs = LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}${escapeXml(paths[l])}" />`
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${escapeXml(paths.it)}" />`;

  return `  <url>
    <loc>${DOMAIN}${escapeXml(paths[lang])}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangs}
${xDefault}
  </url>`;
}

async function fetchBlogPosts() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase credentials not available, skipping blog posts');
      return [];
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug_it, slug_en, slug_fr, slug_de, slug_es, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error) {
      console.warn('Supabase error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch blog posts:', (err as Error).message);
    return [];
  }
}

async function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls: string[] = [];

  // Static pages
  for (const page of staticPages) {
    for (const lang of LANGS) {
      urls.push(buildUrl(page.paths, lang, page.priority, page.changefreq, today));
    }
  }

  // Single-language SEO pages
  for (const p of singleLangPages) {
    urls.push(`  <url>
    <loc>${DOMAIN}${escapeXml(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
  }

  // Blog posts
  const posts = await fetchBlogPosts();
  for (const post of posts) {
    const lastmod = (post.updated_at || today).split('T')[0];
    const paths: Record<string, string> = {};
    for (const lang of LANGS) {
      const slug = (post as any)[`slug_${lang}`];
      if (slug) paths[lang] = `/${lang}/blog/${slug}`;
    }
    for (const lang of LANGS) {
      if (!paths[lang]) continue;
      const hreflangs = LANGS.map(l => {
        if (!paths[l]) return '';
        return `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}${escapeXml(paths[l])}" />`;
      }).filter(Boolean).join('\n');
      const xDefault = paths.it
        ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${escapeXml(paths.it)}" />`
        : '';
      urls.push(`  <url>
    <loc>${DOMAIN}${escapeXml(paths[lang])}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${hreflangs}
${xDefault}
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml);
  console.log(`Generated public/sitemap.xml (${urls.length} URLs)`);
}

generateSitemap().catch(err => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
