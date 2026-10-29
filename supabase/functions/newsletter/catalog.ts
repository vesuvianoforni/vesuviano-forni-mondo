import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

const SITE = 'https://vesuvianoforni.com';
const PAGES: Record<string, Record<string, string>> = {
  home: { it: '/it', en: '/en', fr: '/fr', de: '/de', es: '/es' },
  pronta_consegna: { it: '/it/pronta-consegna', en: '/en/ready-to-ship', fr: '/fr/pret-a-expedier', de: '/de/sofort-lieferbar', es: '/es/listo-para-enviar' },
  forni_legna: { it: '/it/forni-tradizionali', en: '/en/traditional-ovens', fr: '/fr/fours-traditionnels', de: '/de/traditionelle-oefen', es: '/es/hornos-tradicionales' },
  forni_gas: { it: '/it/forni-gas', en: '/en/gas-ovens', fr: '/fr/fours-gaz', de: '/de/gasoefen', es: '/es/hornos-gas' },
  forni_elettrici: { it: '/it/forni-elettrici', en: '/en/electric-ovens', fr: '/fr/fours-electriques', de: '/de/elektrooefen', es: '/es/hornos-electricos' },
  forni_rotanti: { it: '/it/forni-rotanti', en: '/en/rotating-ovens', fr: '/fr/fours-rotatifs', de: '/de/drehoefen', es: '/es/hornos-rotativos' },
  blog: { it: '/it/blog', en: '/en/blog', fr: '/fr/blog', de: '/de/blog', es: '/es/blog' },
};
const EXTRA = {
  landing_legna_commerciale: '/en/commercial-wood-fired-pizza-oven', landing_gas_commerciale: '/en/commercial-gas-pizza-oven',
  landing_rotante: '/en/rotating-pizza-oven', landing_elettrico: '/en/electric-pizza-oven', costruito_sul_posto: '/built-on-place',
  catalogo_pdf_en: '/catalogo/en',
};

export type Asset = { url: string; label: string };

/** Real Vesuviano material (photos, ready-to-ship stock, blog, videos, localized pages) the AI may use. */
export async function loadCatalog(admin: SupabaseClient, lang: string) {
  const L = PAGES.home[lang] ? lang : 'en';
  const [ovens, rts, blog, videos, gallery] = await Promise.all([
    admin.from('configurator_ovens').select('model_name,fuel_type,diameter,pizza_capacity,delivery_time_weeks,description,image_url,additional_images').eq('is_active', true).limit(60),
    admin.from('ready_to_ship_ovens').select('id,model_name,custom_title,diameter,coating,fuel_type,description,list_price,sale_price,delivery_price,delivery_description,images').eq('is_sold', false).limit(30),
    admin.from('blog_posts').select(`title_${L},slug_${L},meta_description_${L},featured_image`).eq('is_published', true).order('published_at', { ascending: false }).limit(15),
    admin.from('commercial_videos').select('title,language,purpose,public_url').limit(40),
    admin.from('ovens').select('name,category,image_url').limit(60),
  ]);
  const ok = (u?: string | null) => !!u && u.startsWith('https://');
  const images: Asset[] = [];
  const push = (url: string | null | undefined, label: string) => { if (ok(url) && !images.some((i) => i.url === url)) images.push({ url: url!, label }); };

  const pronta = (rts.data || []).map((r: any) => {
    (r.images || []).forEach((u: string, i: number) => push(u, `Pronta consegna – ${r.custom_title || r.model_name} ${r.diameter}cm (foto ${i + 1})`));
    return { titolo: r.custom_title || `${r.model_name} ${r.diameter}cm`, modello: r.model_name, diametro: r.diameter, rivestimento: r.coating,
      alimentazione: r.fuel_type, descrizione: (r.description || '').slice(0, 400), prezzo_listino: r.list_price, prezzo_offerta: r.sale_price,
      consegna: r.delivery_price ? `${r.delivery_price} € ${r.delivery_description || ''}` : r.delivery_description || 'inclusa',
      foto: (r.images || []).filter(ok), link: `${SITE}${PAGES.pronta_consegna[L]}` };
  });
  const modelli = (ovens.data || []).map((o: any) => {
    push(o.image_url, `${o.model_name} ${o.diameter}cm`);
    (o.additional_images || []).slice(0, 4).forEach((u: string, i: number) => push(u, `${o.model_name} ${o.diameter}cm (foto ${i + 2})`));
    return { modello: o.model_name, alimentazioni: o.fuel_type, diametro: o.diameter, pizze: o.pizza_capacity, settimane_produzione: o.delivery_time_weeks, descrizione: (o.description || '').slice(0, 200) };
  });
  (gallery.data || []).forEach((g: any) => push(g.image_url, `${g.name} (${g.category})`));
  const articoli = (blog.data || []).map((b: any) => {
    push(b.featured_image, `Blog: ${b[`title_${L}`]}`);
    return { titolo: b[`title_${L}`], descrizione: b[`meta_description_${L}`], link: `${SITE}/${L}/blog/${b[`slug_${L}`]}` };
  });
  const video = (videos.data || []).filter((v: any) => ok(v.public_url)).map((v: any) => ({ titolo: v.title, lingua: v.language, uso: v.purpose, link: v.public_url }));
  const links: Record<string, string> = { whatsapp_gennaro: 'https://wa.me/393509286941' };
  for (const [k, v] of Object.entries(PAGES)) links[k] = `${SITE}${v[L]}`;
  for (const [k, v] of Object.entries(EXTRA)) links[k] = `${SITE}${v}`;
  video.forEach((v, i) => { links[`video_${i + 1}`] = v.link; });
  articoli.forEach((a, i) => { links[`articolo_${i + 1}`] = a.link; });
  return { images, links, pronta, modelli, articoli, video };
}
