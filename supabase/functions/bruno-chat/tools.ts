// Bruno ERP tools: CRM, messages (via bruno-agent), offers (via commercial-offers), orders.
// Every write goes through existing validated paths or explicit field allowlists.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const STAGES = ['nuovo', 'pre_qualificato', 'qualificato', 'trattativa', 'vinto', 'perso'];
const ORDER_STATUSES = ['nuovo', 'in_produzione', 'pronto', 'spedito', 'consegnato', 'annullato'];
const PAYMENT_STATUSES = ['in_attesa', 'acconto_ricevuto', 'pagato'];

const obj = (properties: Record<string, unknown>, required: string[] = []) =>
  ({ type: 'object', additionalProperties: false, properties, required });
const str = (description?: string) => ({ type: 'string', ...(description ? { description } : {}) });
const num = { type: 'number' };

export const TOOLS = [
  { type: 'function', name: 'search_leads', description: 'Cerca clienti/lead nel CRM per nome, azienda, email, telefono, città o fase.',
    parameters: obj({ query: str('testo libero, vuoto per tutti'), stage: str('fase opzionale') }) },
  { type: 'function', name: 'get_lead', description: 'Dettaglio cliente con ultime comunicazioni, offerte e ordini.',
    parameters: obj({ lead_id: str() }, ['lead_id']) },
  { type: 'function', name: 'update_lead', description: `Aggiorna fase (${STAGES.join(', ')}), note, prossima attività o dati contatto di un lead.`,
    parameters: obj({ lead_id: str(), status: str(), notes_append: str('testo da aggiungere alle note'),
      next_activity_type: str('es. chiamata, email, whatsapp, follow_up, riunione'), next_activity_date: str('ISO 8601'),
      next_activity_notes: str(), email: str(), phone: str(), city: str(), country: str(), company_name: str(), contact_name: str(), value: num }, ['lead_id']) },
  { type: 'function', name: 'create_lead', description: 'Crea un nuovo cliente nella pipeline Vesuviano.',
    parameters: obj({ contact_name: str(), company_name: str(), email: str(), phone: str(), city: str(), country: str(), notes: str(), source: str() }, ['contact_name']) },
  { type: 'function', name: 'send_message', description: 'Invia DAVVERO un messaggio al cliente (email da info@, wasender = WhatsApp di Gennaro, whatsapp_api = linea Bruno) o salva una nota interna (note). Usalo solo se l\'operatore ha chiesto di inviare.',
    parameters: obj({ lead_id: str(), channel: { type: 'string', enum: ['email', 'wasender', 'whatsapp_api', 'note'] }, subject: str(), body: str() }, ['lead_id', 'channel', 'body']) },
  { type: 'function', name: 'get_catalog', description: 'Prezzi di listino attivo per mercato (UK, FR, DE) e sconti per tipo cliente. Unica fonte di prezzi ammessa.',
    parameters: obj({ query: str('filtro nome prodotto'), market: { type: 'string', enum: ['UK', 'FR', 'DE'] } }) },
  { type: 'function', name: 'create_offer', description: 'Crea una bozza di offerta commerciale (stato offerta_pronta). I prezzi devono venire da get_catalog o dall\'operatore.',
    parameters: obj({ lead_id: str(), title: str(), language: { type: 'string', enum: ['it', 'en', 'fr', 'de', 'es'] },
      currency: { type: 'string', enum: ['EUR', 'GBP', 'USD', 'CHF'] }, description: str(),
      items: { type: 'array', items: obj({ product_name: str(), description: str(), quantity: num, unit_price: num, discount_percent: num }, ['product_name', 'quantity', 'unit_price']) } },
      ['lead_id', 'title', 'items']) },
  { type: 'function', name: 'list_orders', description: 'Elenca ordini, filtrabili per cliente o stato.',
    parameters: obj({ query: str(), status: str() }) },
  { type: 'function', name: 'create_order', description: 'Inserisce un nuovo ordine.',
    parameters: obj({ customer_name: str(), company_name: str(), customer_email: str(), customer_phone: str(), billing_address: str(),
      delivery_address: str(), vat_number: str(), total_amount: num, deposit_paid: num, notes: str() }, ['customer_name', 'total_amount']) },
  { type: 'function', name: 'update_order', description: `Aggiorna un ordine: stato (${ORDER_STATUSES.join(', ')}), pagamento (${PAYMENT_STATUSES.join(', ')}), spedizione, note.`,
    parameters: obj({ order_id: str(), status: str(), payment_status: str(), deposit_paid: num, carrier: str(), tracking_number: str(),
      estimated_delivery: str('YYYY-MM-DD'), notes: str() }, ['order_id']) },
];

type Ctx = { admin: SupabaseClient; userId: string; auth: string; url: string; anon: string };
const pick = (a: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => a[k] !== undefined && a[k] !== null && a[k] !== '').map((k) => [k, a[k]]));
const LEAD = 'id,contact_name,company_name,email,phone,city,country,status,customer_type,next_activity_type,next_activity_date,next_activity_notes,value,notes';
const clean = (q: unknown) => String(q ?? '').replace(/[%,()*]/g, ' ').trim().slice(0, 80);

async function callFn(ctx: Ctx, name: string, body: unknown) {
  const res = await fetch(`${ctx.url}/functions/v1/${name}`, { method: 'POST',
    headers: { Authorization: ctx.auth, apikey: ctx.anon, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `Errore ${res.status}`);
  return data;
}

export async function runTool(ctx: Ctx, name: string, a: Record<string, any>): Promise<unknown> {
  const { admin } = ctx;
  switch (name) {
    case 'search_leads': {
      let q = admin.from('leads').select(LEAD).eq('pipeline', 'Vesuviano').eq('archived', false).order('updated_at', { ascending: false }).limit(15);
      const t = clean(a.query);
      if (t) q = q.or(['contact_name', 'company_name', 'email', 'phone', 'city'].map((c) => `${c}.ilike.%${t}%`).join(','));
      if (a.stage) q = q.eq('status', a.stage);
      const { data, error } = await q; if (error) throw error;
      return (data ?? []).map((l) => ({ ...l, notes: (l.notes || '').slice(0, 200) }));
    }
    case 'get_lead': {
      const [{ data: lead }, { data: msgs }, { data: offers }] = await Promise.all([
        admin.from('leads').select(LEAD).eq('id', a.lead_id).maybeSingle(),
        admin.from('crm_messages').select('channel,direction,subject,body,created_at').eq('lead_id', a.lead_id).order('created_at', { ascending: false }).limit(12),
        admin.from('commercial_offers').select('id,number,title,status,amount,currency,created_at').eq('lead_id', a.lead_id).order('created_at', { ascending: false }).limit(5),
      ]);
      if (!lead) return { error: 'Lead non trovato' };
      const { data: orders } = lead.email ? await admin.from('orders').select('id,order_number,status,payment_status,total_amount,created_at').eq('customer_email', lead.email).limit(5) : { data: [] };
      return { lead: { ...lead, notes: (lead.notes || '').slice(0, 1500) }, messages: (msgs ?? []).map((m) => ({ ...m, body: m.body.slice(0, 400) })), offers, orders };
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
        subject: a.subject, ai_generated: true, idempotency_key: crypto.randomUUID() });
      return { sent: true, channel: a.channel, result: r?.status ?? r?.message?.status ?? 'ok' };
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
      return { created: true, number: offer.number, amount: offer.amount, currency: offer.currency, _link: `/erp/offerte` };
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
        payment_status: dep > 0 ? 'acconto_ricevuto' : 'in_attesa' }).select('id,order_number,total_amount').single();
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
  create_offer: 'Offerta creata', create_order: 'Ordine inserito', update_order: 'Ordine aggiornato',
};
