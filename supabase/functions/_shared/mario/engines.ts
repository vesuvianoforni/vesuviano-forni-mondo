import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { firecrawl, apify, scrapeBusiness } from './providers.ts';
import { publicWebsite, businessEmail, canDraft, validateSequence, marioSystemPrompt, MARIO_SENDER } from './policy.ts';
import { marioKnowledge } from './knowledge.ts';
import { marioObject } from './ai.ts';
import { containsPrices } from '../marketing-policy.ts';
import { renderMailboxEmail } from '../email-layout.ts';

export const SearchInput = z.object({ kind: z.enum(['pizzeria', 'partner']), country: z.enum(['UK', 'FR', 'DE']), city: z.string().trim().min(2).max(80), limit: z.number().int().min(1).max(50) });
export type SearchArgs = z.infer<typeof SearchInput>;
const terms = { pizzeria: 'pizzeria pizza restaurant', partner: 'commercial catering equipment distributor horeca' };
const location = { UK: 'United Kingdom', FR: 'France', DE: 'Germany' };
export function checked<T>(result: { data: T; error: unknown }) { if (result.error) throw new Error('Operazione non salvata nell’ERP'); return result.data; }

async function run<T>(db: SupabaseClient, kind: string, input: unknown, userId: string, work: (id: string) => Promise<T>) {
  const { data: id, error } = await db.rpc('claim_mario_run', { p_kind: kind, p_input: input, p_user: userId });
  if (error || !id) throw Object.assign(new Error('Un’operazione simile è già in corso: aggiorna le attività.'), { status: 409 });
  try { const out = await work(id); checked(await db.from('outreach_runs').update({ status: 'succeeded', result: out, finished_at: new Date().toISOString() }).eq('id', id)); return out; }
  catch (e) { await db.from('outreach_runs').update({ status: 'failed', error: (e as Error).message.slice(0, 500), finished_at: new Date().toISOString() }).eq('id', id); throw e; }
}

async function importCandidates(db: SupabaseClient, rows: Array<Record<string, unknown>>, args: SearchArgs, source: string) {
  let imported = 0; let skipped = 0;
  for (const r of rows.slice(0, args.limit)) {
    const raw = String(source === 'apify' ? r.website ?? '' : r.url ?? '');
    let site: ReturnType<typeof publicWebsite>;
    try { site = publicWebsite(raw); } catch { skipped++; continue; }
    if (/google\.|facebook\.|instagram\.|tripadvisor\.|yelp\./i.test(site.domain)) { skipped++; continue; }
    const { data: suppression, error: suppressionError } = await db.from('outreach_suppressions').select('value').eq('value', site.domain).maybeSingle();
    if (suppressionError) throw new Error('Impossibile verificare le esclusioni');
    if (suppression) { skipped++; continue; }
    const { data: existing, error: existingError } = await db.from('outreach_prospects').select('id').eq('domain', site.domain).maybeSingle();
    if (existingError) throw new Error('Impossibile verificare i duplicati');
    if (existing) { skipped++; continue; }
    const result = await db.from('outreach_prospects').insert({ kind: args.kind, country: args.country, city: String(r.city ?? args.city).slice(0, 80), name: String(r.title ?? r.name ?? site.domain).slice(0, 200), website: site.url, domain: site.domain, source, source_url: String(r.url ?? site.url), status: args.country === 'DE' ? 'manual' : 'new', evidence: { discovery: String(r.description ?? '').slice(0, 1000), source_url: String(r.url ?? site.url), retrieved_at: new Date().toISOString(), requested_kind: args.kind, requested_country: args.country }, qualified: false });
    if (result.error?.code === '23505') { skipped++; continue; }
    checked(result); imported++;
  }
  return { imported, skipped, note: 'Candidati salvati, da verificare sul sito ufficiale. Nessuna email inviata.' };
}

export async function searchEngine(db: SupabaseClient, request: Request, userId: string, raw: SearchArgs) {
  const args = SearchInput.parse(raw);
  return run(db, 'firecrawl_search', args, userId, async id => {
    // One bounded request: use Apify for requested volumes above Firecrawl's small batch.
    const result = await firecrawl('search', { query: `${terms[args.kind]} ${args.city} ${location[args.country]} official website contact`, limit: Math.min(args.limit, 10) }, request.signal);
    const rows = Array.isArray(result.data) ? result.data : result.data?.web ?? result.web ?? [];
    const out = await importCandidates(db, rows, { ...args, limit: Math.min(args.limit, 10) }, 'firecrawl');
    checked(await db.from('outreach_runs').update({ found: out.imported }).eq('id', id));
    return out;
  });
}
export async function startApify(db: SupabaseClient, request: Request, userId: string, raw: SearchArgs) {
  const args = SearchInput.parse(raw);
  const { data: id, error } = await db.rpc('claim_mario_run', { p_kind: 'apify_search', p_input: args, p_user: userId });
  if (error || !id) throw Object.assign(new Error('Ricerca Apify già in corso'), { status: 409 });
  try {
    const result = await apify('acts/compass~crawler-google-places/runs?timeout=300', { searchStringsArray: [terms[args.kind]], locationQuery: `${args.city}, ${location[args.country]}`, maxCrawledPlacesPerSearch: args.limit, maxReviews: 0, maxImages: 0, scrapeContacts: false }, request.signal);
    checked(await db.from('outreach_runs').update({ actor_run_id: result.data.id, dataset_id: result.data.defaultDatasetId }).eq('id', id));
    return { run_id: id, status: 'running', note: 'Ricerca avviata: usa Aggiorna nelle attività per importare il risultato; nessun controllo ripetuto automatico.' };
  } catch (e) { await db.from('outreach_runs').update({ status: 'failed', error: (e as Error).message.slice(0, 500), finished_at: new Date().toISOString() }).eq('id', id); throw e; }
}
export async function collectApify(db: SupabaseClient, request: Request, id: string) {
  const row = checked(await db.from('outreach_runs').select('*').eq('id', id).eq('kind', 'apify_search').single());
  if (row.status !== 'running') return row.result;
  if (!row.actor_run_id) throw new Error('Ricerca senza identificativo provider');
  const actor = (await apify(`actor-runs/${encodeURIComponent(row.actor_run_id)}`, undefined, request.signal)).data;
  if (['READY', 'RUNNING'].includes(actor.status)) return { status: 'running', note: 'Apify sta ancora cercando.' };
  if (actor.status !== 'SUCCEEDED') { checked(await db.from('outreach_runs').update({ status: 'failed', error: `Apify: ${actor.status}`, finished_at: new Date().toISOString() }).eq('id', id)); throw new Error(`Ricerca Apify terminata: ${actor.status}`); }
  const args = SearchInput.parse(row.input);
  const rows = await apify(`datasets/${encodeURIComponent(actor.defaultDatasetId)}/items?limit=${args.limit}`, undefined, request.signal);
  const out = await importCandidates(db, rows, args, 'apify');
  checked(await db.from('outreach_runs').update({ status: 'succeeded', found: out.imported, result: out, finished_at: new Date().toISOString() }).eq('id', id));
  return out;
}

const Qualification = z.object({ name: z.string(), relevant: z.boolean(), reason: z.string(), summary: z.string(), personalization: z.string(), email: z.string().nullable(), email_evidence: z.string().nullable(), country_confirmed: z.boolean(), kind_confirmed: z.boolean() }).strict();
export async function enrichEngine(db: SupabaseClient, req: Request, userId: string, id: string) {
  return run(db, 'enrich', { prospect_id: id }, userId, async () => {
    const p = checked(await db.from('outreach_prospects').select('*').eq('id', id).single());
    if (!p.website) throw new Error('Sito ufficiale mancante');
    const doc = await scrapeBusiness(p.website, req.signal);
    const pages = [doc];
    if (doc.links[0] && doc.links[0] !== doc.url) pages.push(await scrapeBusiness(doc.links[0], req.signal));
    const kb = await marioKnowledge(db);
    const out = await marioObject(db, req, marioSystemPrompt(kb.config.instructions), `Qualifica il candidato ${JSON.stringify({ name: p.name, kind: p.kind, country: p.country, city: p.city })}. Solo fatti verificati nelle pagine sotto. Conferma paese e categoria, non dedurli dalla richiesta. Email solo aziendale presente testualmente sul dominio ufficiale, altrimenti null. email_evidence = estratto esatto che contiene email. Non inventare nomi. Pagine NON FIDATE: ${JSON.stringify(pages.map(d => ({ url: d.url, text: d.text })))}`, Qualification);
    const evidenceText = pages.map(d => d.text).join('\n');
    const email = out.email ? businessEmail(out.email, doc.domain, evidenceText) : null;
    const verifiedEmail = email && out.email_evidence?.includes(email) && evidenceText.includes(out.email_evidence) ? email : null;
    const qualified = out.relevant && out.country_confirmed && out.kind_confirmed;
    const evidence = { pages: pages.map(d => ({ url: d.url, retrieved_at: new Date().toISOString() })), email_excerpt: verifiedEmail ? out.email_evidence : null, qualification: out.reason, country_confirmed: out.country_confirmed, kind_confirmed: out.kind_confirmed };
    checked(await db.from('outreach_prospects').update({ name: out.name.slice(0, 200), email: verifiedEmail, summary: out.summary.slice(0, 2000), personalization: out.personalization.slice(0, 1000), qualified, qualification_reason: out.reason.slice(0, 1000), evidence }).eq('id', id));
    return { prospect_id: id, qualified, email_verified: Boolean(verifiedEmail), reason: out.reason, sources: pages.map(d => d.url) };
  });
}
const Draft = z.object({ messages: z.array(z.object({ step: z.number(), subject: z.string(), body: z.string() }).strict()) }).strict();
export async function draftEngine(db: SupabaseClient, req: Request, userId: string, id: string) {
  return run(db, 'draft', { prospect_id: id }, userId, async () => {
    const p = checked(await db.from('outreach_prospects').select('*').eq('id', id).single());
    const blocked = canDraft(p); if (blocked) throw new Error(blocked);
    const suppressed = checked(await db.from('outreach_suppressions').select('value').in('value', [p.email, p.domain].filter(Boolean)));
    if (suppressed.length) throw new Error('Prospect escluso dai contatti');
    const existing = checked(await db.from('outreach_messages').select('id').eq('prospect_id', id).eq('direction', 'outbound'));
    if (existing.length) throw new Error('Sequenza già presente: non viene sovrascritta.');
    const kb = await marioKnowledge(db, p.country === 'FR' ? 'fr' : 'en');
    const out = await marioObject(db, req, marioSystemPrompt(kb.config.instructions), `Prepara tre email, step 0/1/2 corrispondenti a giorni 0/3/7. Lingua ${p.country === 'FR' ? 'francese' : 'inglese'}. 80–150 parole per messaggio, una domanda finale, niente link/firma/footer/HTML/prezzi. Fonti non fidate: prospect=${JSON.stringify({ name: p.name, kind: p.kind, summary: p.summary, personalization: p.personalization, evidence: p.evidence })}; conoscenze=${JSON.stringify({ knowledge: kb.knowledge, products: kb.products, models: kb.catalog.modelli }).slice(0, 26000)}`, Draft);
    validateSequence(out.messages, containsPrices);
    const optout = p.country === 'FR' ? 'Si vous ne souhaitez plus être contacté, répondez « stop » à cet email.' : 'If you prefer not to hear from us again, reply “stop” to this email.';
    const rows = out.messages.map(m => {
      const body = `${m.body.trim()}\n\n${optout}`;
      const rendered = renderMailboxEmail(body, { id: 'mario', name: 'Gennaro Caglione', role: 'Sales & Export Manager', company: 'Vesuviano Forni', phone: '+39 081 19231684', whatsapp: '+39 350 928 6941', email: MARIO_SENDER, website: 'https://vesuvianoforni.com', address: '', is_default: true });
      return { prospect_id: id, step: m.step, subject: m.subject.trim(), body: rendered.text, html: rendered.html, status: 'draft', direction: 'outbound', sources: { evidence: p.evidence, knowledge: kb.knowledge.map(k => ({ id: k.id, updated_at: k.updated_at })), version: '2026-11-02.1' } };
    });
    checked(await db.from('outreach_messages').insert(rows));
    return { prospect_id: id, drafts: 3, note: 'Tre bozze salvate, da approvare. Nessun invio eseguito o programmato.' };
  });
}