// Pure helpers: decide which article images to regenerate with Vesuviano ovens.
export type ArticleImage = { src: string; alt: string };
export type OvenRef = { model: string; fuels: string[]; url: string };

const SKIP = /(logo|infogra|diagram|chart|grafico|schema|table|tabella|icon|vesuvianoforni\.jpg)/i;

export function extractImages(html: string): ArticleImage[] {
  const out: ArticleImage[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = /src=["']([^"']+)["']/i.exec(tag)?.[1] ?? '';
    const alt = /alt=["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push({ src, alt });
  }
  return out;
}

/** Photos to replace: skip logos, infographics/diagrams and our own images. */
export function shouldReplace(img: ArticleImage, ownHosts: string[]): boolean {
  if (SKIP.test(img.src) || SKIP.test(img.alt)) return false;
  try { if (ownHosts.includes(new URL(img.src).hostname) && img.src.includes('/oven-gallery/')) return false; } catch { return false; }
  return true;
}

export function pickReferences(context: string, ovens: OvenRef[], index: number): OvenRef[] {
  if (!ovens.length) return [];
  const t = context.toLowerCase();
  const has = (o: OvenRef, f: string) => o.fuels.some(x => x.toLowerCase().startsWith(f));
  let pool = ovens;
  if (/rotat|rotan|drehof|rotatif|giratorio/.test(t)) pool = ovens.filter(o => /rotan/i.test(o.model));
  else if (/\bgas\b|gaz/.test(t)) pool = ovens.filter(o => has(o, 'gas'));
  else if (/electric|elettric|électri|elektr/.test(t)) pool = ovens.filter(o => has(o, 'elettr'));
  if (!pool.length) pool = ovens;
  const many = /(three|two|sizes|several|multiple|compar|tre |misure|dimensioni)/.test(t);
  const n = many ? Math.min(3, pool.length) : 1;
  return Array.from({ length: n }, (_, i) => pool[(index + i) % pool.length]);
}

export function buildPrompt(alt: string, title: string, refs: OvenRef[]): string {
  const ovens = refs.length > 1
    ? `${refs.length} pizza ovens side by side, each reproducing faithfully one of the reference ovens (shape, tiles/finish, colour, base)`
    : 'THIS exact pizza oven from the reference photo (keep shape, tiles/finish, colours and base identical)';
  return `Professional editorial photo, 16:9 landscape, for a blog article titled "${title}". Scene to depict: "${alt || title}". Show ${ovens} as the real subject, in a realistic setting matching the scene (pizzeria, restaurant, terrace or garden), natural warm light, high-end magazine quality. Do NOT add text, labels, logos or watermarks.`;
}

export function replaceAll(html: string | null, from: string, to: string): string | null {
  return html ? html.split(from).join(to) : html;
}
