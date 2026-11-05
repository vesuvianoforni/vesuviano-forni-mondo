// Bruno ERP tools: CRM, messages (via bruno-agent), offers (via commercial-offers), orders.
// Every write goes through existing validated paths or explicit field allowlists.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const STAGES = ['nuovo', 'pre_qualificato', 'qualificato', 'trattativa', 'vinto', 'perso'];
const ORDER_STATUSES = ['nuovo', 'confermato', 'in_produzione', 'pronto_spedizione', 'spedito', 'consegnato', 'annullato'];
const PAYMENT_STATUSES = ['in_attesa', 'acconto_pagato', 'saldato'];

const obj = (properties: Record<string, unknown>, required: string[] = []) =>
  ({ type: 'object', additionalProperties: false, properties, required });
const str = (description?: string) => ({ type: 'string', ...(description ? { description } : {}) });
const num = { type: 'number' };

export const TOOLS = [
  { type: 'function', name: 'search_leads', description: 'Cerca clienti/lead nel CRM per nome, azienda, email, telefono, città o fase.',
    parameters: obj({ query: str('testo libero, vuoto per tutti'), stage: str('fase opzionale') }) },
  { type: 'function', name: 'get_lead', description: 'Dettaglio cliente con ultime comunicazioni, offerte e ordini.',
    parameters: obj({ lead_id: str() }, ['lead_id']) },
  { type: 'function', name: 'propose_call', description: 'Prepara una telefonata di Bruno in INGLESE dal numero UK +447457416033. NON telefona: crea una proposta con pulsante di avvio mostrato direttamente in chat. call_type: "qualifica" (scoprire esigenze, capacità, alimentazione, consegna e tempi del progetto) oppure "trattativa" (feedback sull\'offerta ricevuta, obiezioni, prossimo passo; mai nuovi sconti). Usa "instructions" per le indicazioni operative del team, anche in italiano. Il fuso orario del cliente è ricavato automaticamente dal prefisso del numero (+39 Italia, +44 UK, ecc.): non chiederlo mai all\'operatore.',
    parameters: obj({ lead_id: str(), objective: str('obiettivo concreto della chiamata'), call_type: { type: 'string', enum: ['qualifica', 'trattativa'], description: 'tipologia della chiamata' }, instructions: str('istruzioni operative del team per questa chiamata, anche in italiano'), customer_timezone: str('solo se il prefisso non è riconosciuto, es. Europe/London') }, ['lead_id','objective','call_type']) },
  { type: 'function', name: 'approve_call', description: 'Avvia DAVVERO una proposta di chiamata esistente. Solo dopo che l’operatore ha approvato esplicitamente quella proposta. Non usare per un semplice invito a preparare una telefonata.',
    parameters: obj({ call_id: str('id della proposta di chiamata già salvata') }, ['call_id']) },
  { type: 'function', name: 'update_lead', description: `Aggiorna fase (${STAGES.join(', ')}), note, prossima attività o dati contatto di un lead.`,
    parameters: obj({ lead_id: str(), status: str(), notes_append: str('testo da aggiungere alle note'),
      next_activity_type: str('es. chiamata, email, whatsapp, follow_up, riunione'), next_activity_date: str('ISO 8601'),
      next_activity_notes: str(), email: str(), phone: str(), city: str(), country: str(), company_name: str(), contact_name: str(), value: num }, ['lead_id']) },
  { type: 'function', name: 'create_lead', description: 'Crea un nuovo cliente nella pipeline Vesuviano.',
    parameters: obj({ contact_name: str(), company_name: str(), email: str(), phone: str(), city: str(), country: str(), notes: str(), source: str() }, ['contact_name']) },
  { type: 'function', name: 'send_message', description: 'Invia DAVVERO un messaggio al cliente (email da info@, wasender = WhatsApp di Gennaro, whatsapp_api = linea Bruno) o salva una nota interna (note). Usalo solo se l\'operatore ha chiesto di inviare. body e subject vanno SEMPRE scritti nella lingua del cliente (customer_language da get_lead), anche se l\'istruzione è in italiano; le note interne restano in italiano.',
    parameters: obj({ lead_id: str(), channel: { type: 'string', enum: ['email', 'wasender', 'whatsapp_api', 'note'] }, subject: str(), body: str() }, ['lead_id', 'channel', 'body']) },
  { type: 'function', name: 'get_catalog', description: 'Prezzi di listino attivo per mercato (UK, FR, DE) e sconti per tipo cliente. Unica fonte di prezzi ammessa.',
    parameters: obj({ query: str('filtro nome prodotto'), market: { type: 'string', enum: ['UK', 'FR', 'DE'] } }) },
  { type: 'function', name: 'create_offer', description: 'Crea una bozza di offerta commerciale (stato offerta_pronta). I prezzi devono venire da get_catalog o dall\'operatore.',
    parameters: obj({ lead_id: str(), title: str(), language: { type: 'string', enum: ['it', 'en', 'fr', 'de', 'es'] },
      currency: { type: 'string', enum: ['EUR', 'GBP', 'USD', 'CHF'] }, description: str(),
      items: { type: 'array', items: obj({ product_name: str(), description: str(), quantity: num, unit_price: num, discount_percent: num }, ['product_name', 'quantity', 'unit_price']) },
      send_via: { type: 'string', enum: ['wasender', 'email'], description: 'opzionale: invia subito l\'offerta al cliente (default wasender se l\'operatore chiede di inviarla)' },
      message: str('testo di accompagnamento opzionale, nella lingua del cliente') },
      ['lead_id', 'title', 'items']) },
  { type: 'function', name: 'send_offer', description: 'Invia al cliente un\'offerta esistente con link e PDF (wasender = WhatsApp di Gennaro, default; oppure email).',
    parameters: obj({ offer_number: str('es. OF-2026-0001'), channel: { type: 'string', enum: ['wasender', 'email'] }, message: str('testo di accompagnamento opzionale') }, ['offer_number']) },
  { type: 'function', name: 'search_knowledge_base', description: 'Knowledge base ufficiale di Bruno: condizioni, tempi, consegna, pagamento, misure, obiezioni, casi. Usala per ogni domanda tecnica o commerciale prima di rispondere.',
    parameters: obj({ query: str('parole chiave, vuoto per tutto'), stage: str('fase del cliente per filtrare le regole') }) },
  { type: 'function', name: 'get_product_assets', description: 'Libreria materiali: foto, video, schede tecniche, cataloghi, certificazioni e documenti, sia collegati ai prodotti sia aziendali generali (laboratorio, imballo, spedizioni...). Cerca per modello, titolo o tag. Usalo per sapere cosa puoi inviare.',
    parameters: obj({ query: str('modello, argomento o tag (es. Ottavio, imballo, laboratorio)'), kind: { type: 'string', enum: ['foto', 'video', 'scheda', 'catalogo', 'certificazione', 'documento'] }, language: str('it/en/fr/de/es: passa SEMPRE la customer_language del lead quando il materiale è per un cliente (schede tecniche e cataloghi nella sua lingua)') }) },
  { type: 'function', name: 'send_attachment', description: 'Invia DAVVERO al cliente un file della libreria materiali (asset_id da get_product_assets) con una riga di introduzione nella lingua del cliente. wasender = WhatsApp Gennaro (default) con file allegato; email = link al file.',
    parameters: obj({ lead_id: str(), asset_id: str(), channel: { type: 'string', enum: ['wasender', 'email'] }, caption: str('riga di introduzione'), subject: str() }, ['lead_id', 'asset_id', 'caption']) },
  { type: 'function', name: 'update_qualification', description: `Salva i dati di qualificazione del cliente appena emersi (chiavi: uso, volume_pizze, misura, alimentazione, finitura, paese, citta, cap, accesso, tempi, modello_consigliato, note). Unisce ai dati già presenti.`,
    parameters: obj({ lead_id: str(), uso: str(), volume_pizze: str(), misura: str(), alimentazione: str(), finitura: str(), paese: str(), citta: str(), cap: str(), accesso: str(), tempi: str(), modello_consigliato: str(), note: str() }, ['lead_id']) },
  { type: 'function', name: 'list_orders', description: 'Elenca ordini, filtrabili per cliente o stato.',
    parameters: obj({ query: str(), status: str() }) },
  { type: 'function', name: 'create_order', description: 'Inserisce un nuovo ordine.',
    parameters: obj({ customer_name: str(), company_name: str(), customer_email: str(), customer_phone: str(), billing_address: str(),
      delivery_address: str(), vat_number: str(), total_amount: num, deposit_paid: num, notes: str() }, ['customer_name', 'total_amount']) },
  { type: 'function', name: 'update_order', description: `Aggiorna un ordine: stato (${ORDER_STATUSES.join(', ')}), pagamento (${PAYMENT_STATUSES.join(', ')}), spedizione, note.`,
    parameters: obj({ order_id: str(), status: str(), payment_status: str(), deposit_paid: num, carrier: str(), tracking_number: str(),
      estimated_delivery: str('YYYY-MM-DD'), notes: str() }, ['order_id']) },
];

type Ctx = { admin: SupabaseClient; userId: string; auth: string; url: string; anon: string; actionId?: string };
const pick = (a: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').map((k) => [k, a[k]]));
import { customerLanguage } from './language.ts';
import { stageRule } from '../_shared/bruno/persona.ts';
const QUAL_KEYS = ['uso', 'volume_pizze', 'misura', 'alimentazione', 'finitura', 'paese', 'citta', 'cap', 'accesso', 'tempi', 'modello_consigliato', 'note'];
const LEAD = 'id,qualification,contact_name,company_name,email,phone,city,country,status,customer_type,next_activity_type,next_activity_date,next_activity_notes,value,notes';
const clean = (q: unknown) => String(q ?? '').replace(/[%,()*]/g, ' ').trim().slice(0, 80);

async function callFn(ctx: Ctx, name: string, body: unknown) {
  const res = await fetch(`${ctx.url}/functions/v1/${name}`, { method: 'POST',
    headers: { Authorization: ctx.auth, apikey: ctx.anon, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if(name==='bruno-agent'&&res.status===422&&data.message?.id)return data;
  if (!res.ok) {
    const fields = data.details && typeof data.details === 'object' ? Object.keys(data.details).join(', ') : '';
    throw new Error(`${typeof data.error === 'string' ? data.error : `Errore ${res.status}`}${fields ? ` (campi: ${fields})` : ''}`);
  }
  return data;
}

const OFFER_TEXT: Record<string, (n: string, name: string) => string> = {
  it: (n, name) => `Buongiorno ${name}, come promesso le inviamo la nostra offerta ${n}.`,
  en: (n, name) => `Hello ${name}, as promised here is our offer ${n}.`,
  fr: (n, name) => `Bonjour ${name}, comme convenu voici notre offre ${n}.`,
  de: (n, name) => `Guten Tag ${name}, wie besprochen erhalten Sie unser Angebot ${n}.`,
  es: (n, name) => `Hola ${name}, como acordamos le enviamos nuestra oferta ${n}.`,
};
const OFFER_LABELS: Record<string, [string, string]> = { it: ['Vedi offerta', 'Scarica PDF'], en: ['View offer', 'Download PDF'], fr: ["Voir l'offre", 'Télécharger le PDF'], de: ['Angebot ansehen', 'PDF herunterladen'], es: ['Ver oferta', 'Descargar PDF'] };
export function offerUrls(offer: { public_code: string }) {
  const base = `https://vesuvianoforni.com/offerta/${encodeURIComponent(offer.public_code)}`;
  return { public_url: base, pdf_url: `${base}?pdf=1` };
}
async function shareOffer(ctx: Ctx, offer: any) {
  if (offer.public_enabled) return offer;
  const r = await callFn(ctx, 'commercial-offers', { action: 'share', id: offer.id, enabled: true, expected_updated_at: offer.updated_at });
  return r.offer;
}
async function deliverOffer(ctx: Ctx, offer: any, lead: any, channel: 'wasender' | 'email', message?: string) {
  const lang = OFFER_LABELS[offer.document?.language] ? offer.document.language : 'it';
  const { public_url, pdf_url } = offerUrls(offer);
  const intro = (message || '').trim() || OFFER_TEXT[lang](offer.number, lead.contact_name || '');
  const body = `${intro}\n\n${OFFER_LABELS[lang][0]}: ${public_url}\n${OFFER_LABELS[lang][1]}: ${pdf_url}`;
  const r = await callFn(ctx, 'bruno-agent', { action: 'send', lead_id: lead.id, channel, body,
    subject: `Vesuviano Forni · ${offer.number}`, ai_generated: true, idempotency_key: ctx.actionId || crypto.randomUUID() });
  const status = r?.message?.status ?? r?.smtp_status ?? r?.status ?? 'unknown';
  if (['sent','delivered','read','accepted'].includes(status) && offer.status === 'offerta_pronta') {
    const {error} = await ctx.admin.from('commercial_offers').update({ status: 'offerta_inviata' }).eq('id', offer.id); if(error)throw error;
  }
  return { ...r, sent_via: channel === 'wasender' ? 'WhatsApp Gennaro' : 'email', result: status };
}

export async function runTool(ctx: Ctx, name: string, a: Record<string, any>): Promise<unknown> {
  const { admin } = ctx;
  switch (name) {
    case 'propose_call': {
      const opt = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
      const type = String(a.call_type || '').trim().toLowerCase().startsWith('tratt') ? 'trattativa' : 'qualifica';
      const objective = opt(a.objective) && opt(a.objective)!.length >= 10 ? opt(a.objective) : `${type === 'trattativa' ? 'Trattativa' : 'Qualifica'} del cliente: ${opt(a.objective) || 'esigenze, progetto e tempi'}`;
      const r = await callFn(ctx, 'bruno-voice', { action: 'propose', lead_id: String(a.lead_id || '').trim(), objective, call_type: type, instructions: opt(a.instructions), customer_timezone: opt(a.customer_timezone) });
      return { ...r, _link: '/erp/bruno', instruction: 'Proposta salvata, NON è partita alcuna chiamata. Il pulsante Chiama ora compare direttamente sotto la tua risposta in chat: riassumi in 2 righe obiettivo e destinatario, non mostrare ID.' };
    }
    case 'approve_call': return await callFn(ctx, 'bruno-voice', { action: 'approve', call_id: a.call_id });
    case 'search_leads': {
      let q = admin.from('leads').select(LEAD).eq('pipeline', 'Vesuviano').eq('archived', false).order('updated_at', { ascending: false }).limit(15);
      const t = clean(a.query);
      if (t) q = q.or(['contact_name', 'company_name', 'email', 'phone', 'city'].map((c) => `${c}.ilike.%${t}%`).join(','));
      if (a.stage) q = q.eq('status', a.stage);
      const { data, error } = await q; if (error) throw error;
      return (data ?? []).map((l) => ({ ...l, customer_language: customerLanguage(l), notes: (l.notes || '').slice(0, 200) }));
    }
    case 'get_lead': {
      const [{ data: lead }, { data: msgs }, { data: offers }] = await Promise.all([
        admin.from('leads').select(LEAD).eq('id', a.lead_id).maybeSingle(),
        admin.from('crm_messages').select('channel,direction,subject,body,created_at').eq('lead_id', a.lead_id).order('created_at', { ascending: false }).limit(12),
        admin.from('commercial_offers').select('id,number,title,status,amount,currency,created_at').eq('lead_id', a.lead_id).order('created_at', { ascending: false }).limit(5),
      ]);
      if (!lead) return { error: 'Lead non trovato' };
      const { data: orders } = lead.email ? await admin.from('orders').select('id,order_number,status,payment_status,total_amount,created_at').eq('customer_email', lead.email).limit(5) : { data: [] };
      return { stage_rule: stageRule(lead.status), lead: { ...lead, customer_language: customerLanguage(lead), notes: (lead.notes || '').slice(0, 1500) }, messages: (msgs ?? []).map((m) => ({ ...m, body: m.body.slice(0, 400) })), offers, orders };
    }
    case 'update_lead': {
      if (a.status && !STAGES.includes(a.status)) return { error: 'Fase non valida' };
      const { data: lead } = await admin.from('leads').select('id,notes').eq('id', a.lead_id).maybeSingle();
      if (!lead) return { error: 'Lead non trovato' };
      const patch: Record<string, unknown> = pick(a, ['status', 'next_activity_type', 'next_activity_date', 'next_activity_notes', 'email', 'phone', 'city', 'country', 'company_name', 'contact_name', 'value']);
      if (a.notes_append) patch.notes = `${lead.notes ? lead.notes + '\n' : ''}[Bruno ${new Date().toISOString().slice(0, 10)}] ${a.notes_append}`;
      if (!Object.keys(patch).length) return { error: 'Nessuna modifica' };
      const { data, error } = await admin.from('leads').update(patch).eq('id', a.lead_id).select(LEAD).single(); if (error) throw error;
      return { updated: true, lead: data, _link: `/erp/crm?lead=${a.lead_id}` };
    }
    case 'create_lead': {
      const { data, error } = await admin.from('leads').insert({ ...pick(a, ['contact_name', 'company_name', 'email', 'phone', 'city', 'country', 'notes']),
        source: a.source || 'bruno', status: 'nuovo', pipeline: 'Vesuviano' }).select('id,contact_name').single();
      if (error) throw error;
      return { created: true, lead: data, _link: `/erp/crm?lead=${data.id}` };
    }
    case 'send_message': {
      const r = await callFn(ctx, 'bruno-agent', { action: 'send', lead_id: a.lead_id, channel: a.channel, body: a.body,
        subject: a.subject, ai_generated: true, idempotency_key: ctx.actionId || crypto.randomUUID() });
      return { ...r, channel: a.channel, result: r?.message?.status ?? r?.smtp_status ?? r?.status ?? 'unknown' };
    }
    case 'get_catalog': {
      const { data: pl } = await admin.from('price_lists').select('id').eq('status', 'active').maybeSingle();
      if (!pl) return { error: 'Nessun listino attivo' };
      let q = admin.from('products').select('id,name,category,description,product_prices(market,amount,currency,price_list_id)').eq('is_active', true).order('sort_order').limit(60);
      const t = clean(a.query); if (t) q = q.ilike('name', `%${t}%`);
      const [{ data, error }, { data: tiers }] = await Promise.all([q, admin.from('discount_tiers').select('code,label,percentage')]);
      if (error) throw error;
      return { products: (data ?? []).map((p: any) => ({ id: p.id, name: p.name, category: p.category,
        prices: (p.product_prices ?? []).filter((x: any) => x.price_list_id === pl.id && (!a.market || x.market === a.market)).map((x: any) => ({ market: x.market, amount: x.amount, currency: x.currency })) })),
        discounts: tiers };
    }
    case 'create_offer': {
      const { data: lead } = await admin.from('leads').select('*').eq('id', a.lead_id).maybeSingle();
      if (!lead) return { error: 'Lead non trovato' };
      const { settings } = await callFn(ctx, 'commercial-offers', { action: 'settings' });
      const valid = new Date(Date.now() + (settings.validity_days || 30) * 86400000).toISOString().slice(0, 10);
      const keys = ['language', 'currency', 'price_list', 'company_entity', 'vat_regime', 'payment_method', 'payment_agreement', 'include_certification', 'include_warranty', 'warranty_years', 'inclusions', 'exclusions', 'timeline_produzione', 'timeline_consegna', 'timeline_installazione', 'timeline_collaudo'];
      const document = { ...Object.fromEntries(keys.map((k) => [k, settings[k]])),
        ...(a.language ? { language: a.language } : {}), ...(a.currency ? { currency: a.currency } : {}),
        customer_name: lead.company_name || lead.contact_name || 'Cliente', customer_contact: lead.contact_name || '',
        customer_email: lead.email || '', customer_phone: lead.phone || '', customer_address: [lead.city, lead.country].filter(Boolean).join(', '),
        customer_vat: '', title: a.title, description: a.description || '', valid_until: valid,
        items: (a.items || []).map((i: any) => ({ id: crypto.randomUUID(), product_id: null, product_name: i.product_name, description: i.description || '',
          image_url: '', quantity: Number(i.quantity) || 1, unit_price: Number(i.unit_price), discount_percent: Number(i.discount_percent) || 0, notes: '' })) };
      const { offer } = await callFn(ctx, 'commercial-offers', { action: 'save', id: crypto.randomUUID(), lead_id: lead.id, document, status: 'offerta_pronta' });
      const shared = await shareOffer(ctx, offer);
      const out: Record<string, unknown> = { created: true, offer_id: offer.id, number: offer.number, amount: offer.amount, currency: offer.currency, ...offerUrls(shared), _link: `/erp/offerte` };
      if (a.send_via) Object.assign(out, await deliverOffer(ctx, shared, lead, a.send_via, a.message));
      return out;
    }
    case 'send_offer': {
      const { data: offer } = await admin.from('commercial_offers').select('*').eq('number', String(a.offer_number || '').trim()).maybeSingle();
      if (!offer) return { error: 'Offerta non trovata' };
      if (offer.archived) return { error: 'Offerta archiviata' };
      if (!offer.lead_id) return { error: 'Offerta senza cliente collegato' };
      const { data: lead } = await admin.from('leads').select('*').eq('id', offer.lead_id).maybeSingle();
      if (!lead) return { error: 'Lead non trovato' };
      const shared = await shareOffer(ctx, offer);
      return { number: offer.number, ...offerUrls(shared), ...(await deliverOffer(ctx, shared, lead, a.channel || 'wasender', a.message)) };
    }
    case 'search_knowledge_base': {
      let q = admin.from('bruno_knowledge').select('category,title,content,stages').eq('is_active', true).order('sort_order').limit(40);
      const t = clean(a.query); if (t) q = q.or(`title.ilike.%${t}%,content.ilike.%${t}%,category.ilike.%${t}%`);
      const { data, error } = await q; if (error) throw error;
      const rows = (data ?? []).filter((k: any) => !a.stage || !k.stages?.length || k.stages.includes(a.stage));
      return rows.length ? rows : { empty: true, hint: 'Nessuna voce: non inventare, rispondi che verifichi e segnala al team.' };
    }
    case 'get_product_assets': {
      let q = admin.from('product_assets').select('id,kind,title,url,language,tags,description,products(name,category)').eq('is_active', true).order('sort_order').order('created_at', { ascending: false }).limit(200);
      if (a.kind) q = q.eq('kind', a.kind);
      const { data, error } = await q; if (error) throw error;
      const t = clean(a.query)?.toLowerCase();
      const words = t ? t.split(/\s+/).filter(Boolean) : [];
      const matched = (data ?? []).filter((x: any) => {
        if (!words.length) return true;
        const hay = [x.title, x.description, x.products?.name, x.products?.category, ...(x.tags || [])].join(' ').toLowerCase();
        return words.some((w: string) => hay.includes(w));
      });
      // Lingua: prima quella del cliente, poi materiali universali, poi inglese; le altre lingue solo se non c'è altro.
      const want = a.language;
      const rank = (x: any) => !want ? 0 : x.language === want ? 0 : !x.language ? 1 : x.language === 'en' ? 2 : 3;
      const best = matched.length ? Math.min(...matched.map(rank)) : 0;
      const rows = matched.filter((x: any) => rank(x) <= Math.max(best, 1)).sort((p: any, q: any) => rank(p) - rank(q)).slice(0, 40);
      if (!rows.length) return { empty: true, hint: 'Nessun materiale trovato: dillo all\'operatore, non inventare link.' };
      const out = rows.map((x: any) => ({ id: x.id, kind: x.kind, title: x.title, url: x.url, language: x.language ?? 'universale', tags: x.tags, product: x.products?.name ?? 'Materiale aziendale' }));
      return want && best > 1
        ? { items: out, language_note: `Nessun materiale in ${want.toUpperCase()}: questi sono in altra lingua. Avvisa l'operatore prima di inviarli al cliente.` }
        : out;
    }
    case 'send_attachment': {
      const { data: asset } = await admin.from('product_assets').select('id,title,url,kind').eq('id', a.asset_id).maybeSingle();
      if (!asset) return { error: 'File non trovato' };
      const channel = a.channel === 'email' ? 'email' : 'wasender';
      const body = channel === 'email' ? `${a.caption}\n\n${asset.title}: ${asset.url}` : a.caption;
      const r = await callFn(ctx, 'bruno-agent', { action: 'send', lead_id: a.lead_id, channel, body, subject: a.subject,
        ...(channel === 'wasender' ? { media_url: asset.url } : {}), ai_generated: true, idempotency_key: ctx.actionId || crypto.randomUUID() });
      return { ...r, channel, file: asset.title, result: r?.message?.status ?? r?.smtp_status ?? r?.status ?? 'unknown' };
    }
    case 'update_qualification': {
      const { data: lead } = await admin.from('leads').select('id,qualification').eq('id', a.lead_id).maybeSingle();
      if (!lead) return { error: 'Lead non trovato' };
      const qualification = { ...(lead.qualification || {}), ...pick(a, QUAL_KEYS) };
      const { error } = await admin.from('leads').update({ qualification }).eq('id', a.lead_id); if (error) throw error;
      return { updated: true, qualification };
    }
    case 'list_orders': {
      let q = admin.from('orders').select('id,order_number,customer_name,company_name,customer_email,status,payment_status,total_amount,deposit_paid,balance_due,estimated_delivery,created_at').order('created_at', { ascending: false }).limit(15);
      const t = clean(a.query); if (t) q = q.or(`customer_name.ilike.%${t}%,company_name.ilike.%${t}%,order_number.ilike.%${t}%,customer_email.ilike.%${t}%`);
      if (a.status) q = q.eq('status', a.status);
      const { data, error } = await q; if (error) throw error; return data;
    }
    case 'create_order': {
      const total = Number(a.total_amount) || 0, dep = Number(a.deposit_paid) || 0;
      const { data, error } = await admin.from('orders').insert({ ...pick(a, ['customer_name', 'company_name', 'customer_email', 'customer_phone', 'billing_address', 'delivery_address', 'vat_number', 'notes']),
        total_amount: total, deposit_paid: dep, balance_due: total - dep, created_by: ctx.userId,
        payment_status: dep > 0 ? 'acconto_pagato' : 'in_attesa' }).select('id,order_number,total_amount').single();
      if (error) throw error;
      return { created: true, order: data, _link: '/erp/ordini' };
    }
    case 'update_order': {
      if (a.status && !ORDER_STATUSES.includes(a.status)) return { error: 'Stato ordine non valido' };
      if (a.payment_status && !PAYMENT_STATUSES.includes(a.payment_status)) return { error: 'Stato pagamento non valido' };
      const patch: Record<string, unknown> = pick(a, ['status', 'payment_status', 'deposit_paid', 'carrier', 'tracking_number', 'estimated_delivery', 'notes']);
      if (a.deposit_paid !== undefined) {
        const { data: o } = await admin.from('orders').select('total_amount').eq('id', a.order_id).maybeSingle();
        if (o) patch.balance_due = Number(o.total_amount) - Number(a.deposit_paid);
      }
      const { data, error } = await admin.from('orders').update(patch).eq('id', a.order_id).select('id,order_number,status,payment_status').maybeSingle();
      if (error) throw error; if (!data) return { error: 'Ordine non trovato' };
      return { updated: true, order: data };
    }
  }
  return { error: 'Strumento sconosciuto' };
}

export const TOOL_LABELS: Record<string, string> = {
  update_lead: 'CRM aggiornato', create_lead: 'Cliente creato', send_message: 'Messaggio inviato',
  create_offer: 'Offerta creata', send_offer: 'Offerta inviata', create_order: 'Ordine inserito', update_order: 'Ordine aggiornato',
  send_attachment: 'File inviato',
  propose_call: 'Proposta chiamata salvata', approve_call: 'Richiesta chiamata inoltrata',
};
