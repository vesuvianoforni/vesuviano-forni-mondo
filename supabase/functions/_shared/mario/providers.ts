import { publicWebsite } from './policy.ts';

export class ProviderError extends Error {
  constructor(public status: number, public details: string) { super(`Servizio ricerca [${status}]: ${details}`); }
}
export async function providerJSON(url: string, headers: Record<string, string>, body?: unknown, signal?: AbortSignal) {
  const res = await fetch(url, { method: body ? 'POST' : 'GET', headers: { ...headers, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal });
  if (!res.ok) {
    const details = await res.text();
    console.error('Mario provider', res.status);
    throw new ProviderError(res.status, details.slice(0, 1600));
  }
  return await res.json();
}
export function firecrawl(path: string, body: unknown, signal?: AbortSignal) {
  const key = Deno.env.get('FIRECRAWL_API_KEY');
  if (!key) throw new ProviderError(503, 'Firecrawl non collegato');
  // Verified linked connection uses direct transport, not the connector gateway.
  return providerJSON(`https://api.firecrawl.dev/v2/${path}`, { Authorization: `Bearer ${key}` }, body, signal);
}
export function apify(path: string, body?: unknown, signal?: AbortSignal) {
  const key = Deno.env.get('APIFY_API_KEY'); const lovable = Deno.env.get('LOVABLE_API_KEY');
  if (!key || !lovable) throw new ProviderError(503, 'Apify non collegato');
  return providerJSON(`https://connector-gateway.lovable.dev/apify/${path}`, { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': key }, body, signal);
}
export async function scrapeBusiness(url: string, signal?: AbortSignal) {
  const safe = publicWebsite(url);
  const res = await firecrawl('scrape', { url: safe.url, formats: ['markdown', 'links'], onlyMainContent: false }, signal);
  const doc = res.data ?? res;
  if (!doc.markdown) throw new ProviderError(422, 'Pagina priva di testo verificabile');
  // Never fetch page URLs ourselves. Only Firecrawl can resolve external pages.
  if (doc.metadata?.sourceURL && publicWebsite(doc.metadata.sourceURL).domain !== safe.domain) throw new ProviderError(422, 'Il sito reindirizza a un altro dominio: verifica manuale richiesta');
  return { ...safe, text: String(doc.markdown).slice(0, 16000), links: (doc.links ?? []).filter((s: string) => {
    try { return publicWebsite(s).domain === safe.domain && /contact|contatt|kontakt|about|propos/i.test(new URL(s).pathname); } catch { return false; }
  }).slice(0, 2) as string[] };
}