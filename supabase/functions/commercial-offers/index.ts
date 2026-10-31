import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { BodySchema, SettingsSchema } from './schema.ts';
import { DEFAULT_OFFER_SETTINGS, canManageOffers, canManageOfferSettings, isPublicOfferAvailable, offerTotals, type OfferDocument, type OfferSettings, type CommercialOffer } from './domain.ts';
import { translateOffer } from './translate.ts';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return json({ error: 'Servizio non configurato' }, 503);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    if (req.method === 'GET') {
      const code = new URL(req.url).searchParams.get('code');
      if (!code || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)) return json({ error: 'Offerta non disponibile' },404);
      const { data, error } = await admin.from('commercial_offers').select('id,number,document,public_enabled,archived,created_at')
        .eq('public_code', code).maybeSingle();
      if (error) throw error;
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
      if (!data || !isPublicOfferAvailable(data as CommercialOffer, today)) return json({ error: 'Offerta non disponibile o scaduta' },404);
      // Only the selected company's public identity is disclosed, not other company settings or CRM identifiers.
      const doc = data.document as OfferDocument;
      const company = doc.settings_snapshot.companies[doc.company_entity];
      const document = { ...doc, settings_snapshot: { ...doc.settings_snapshot, companies: { [doc.company_entity]: company } } };
      return json({ offer: { number: data.number, document, created_at: data.created_at } });
    }
    if (req.method !== 'POST') return json({ error: 'Metodo non consentito' },405);
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i,'');
    if (!token) return json({ error: 'Non autenticato' },401);
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) return json({ error: 'Non autenticato' },401);
    const { data: roleRows, error: roleError } = await admin.from('user_roles').select('role').eq('user_id', auth.user.id);
    if (roleError) throw roleError;
    const roles = (roleRows ?? []).map(row => row.role);
    if (!canManageOffers(roles)) return json({ error: 'Accesso negato' },403);
    let raw: unknown;
    try { raw = await req.json(); } catch { return json({ error: 'Richiesta non valida' },400); }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return json({ error: 'Dati non validi', details: parsed.error.flatten() },400);
    const input = parsed.data;
    if (input.action === 'translate') return json({document:await translateOffer(input.document,input.source_language,input.target_language)});
    if (input.action === 'save_settings' && !canManageOfferSettings(roles)) return json({ error: 'Solo gli amministratori possono modificare le impostazioni' },403);
    if (input.action === 'save_settings') {
      const { error } = await admin.from('commercial_offer_settings').upsert({ key: 'vesuviano', settings: input.settings, updated_by: auth.user.id });
      if (error) throw error;
      return json({ settings: input.settings });
    }
    const { data: settingRow, error: settingError } = await admin.from('commercial_offer_settings').select('settings').eq('key','vesuviano').maybeSingle();
    if (settingError) throw settingError;
    const settings: OfferSettings = settingRow ? SettingsSchema.parse(settingRow.settings) : structuredClone(DEFAULT_OFFER_SETTINGS);
    if (input.action === 'settings') return json({ settings, can_edit: canManageOfferSettings(roles) });

    const { data: existing, error: readError } = await admin.from('commercial_offers').select('*').eq('id', input.id).maybeSingle();
    if (readError) throw readError;
    if (input.action === 'save') {
      if (existing && !input.expected_updated_at) return json({ error: 'Offerta già esistente: ricaricala prima di modificarla' },409);
      if (input.lead_id) {
        const { data: lead, error } = await admin.from('leads').select('id,pipeline').eq('id',input.lead_id).maybeSingle();
        if (error) throw error;
        if (!lead || lead.pipeline !== 'Vesuviano') return json({ error: 'Cliente Vesuviano non trovato' },400);
      }
      // Client input never controls bank/signature identity or totals. Preserve the saved identity on edits.
      const document = { ...input.document, settings_snapshot: existing?.document?.settings_snapshot ?? settings } as OfferDocument;
      const totals = offerTotals(document);
      const values = { lead_id: input.lead_id, customer_name: document.customer_name, title: document.title,
        status: input.status, document, amount: totals.subtotal, currency: document.currency };
      if (existing) {
        const { data, error } = await admin.from('commercial_offers').update(values).eq('id',input.id).eq('updated_at',input.expected_updated_at).select().maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: 'Offerta modificata da un altro utente: ricaricala' },409);
        return json({ offer: data });
      }
      if (input.expected_updated_at) return json({ error: 'Offerta non trovata' },404);
      const initials = document.customer_name.split(/\s+/).map(word => word.charAt(0).toUpperCase()).join('').replace(/[^A-Z0-9]/g,'').slice(0,4) || 'CLI';
      const number = `OFF-${initials}-${new Date().getFullYear()}-${input.id.slice(0,8).toUpperCase()}`;
      const { data, error } = await admin.from('commercial_offers').insert({ id: input.id, number, ...values, created_by: auth.user.id }).select().single();
      if (error?.code === '23505') return json({ error: 'Offerta già salvata: ricarica l’elenco' },409);
      if (error) throw error;
      return json({ offer: data });
    }
    if (!existing) return json({ error: 'Offerta non trovata' },404);
    if (input.action === 'share' && input.enabled && existing.archived) return json({ error: 'Ripristina l’offerta prima di attivare il link' },400);
    const changes = input.action === 'share' ? { public_enabled: input.enabled } : { archived: input.archived, ...(input.archived ? { public_enabled: false } : {}) };
    const { data, error } = await admin.from('commercial_offers').update(changes).eq('id',input.id).eq('updated_at',input.expected_updated_at).select().maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: 'Offerta modificata da un altro utente: ricaricala' },409);
    return json({ offer: data });
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 500;
    console.error('commercial_offer_error', typeof error === 'object' && error && 'code' in error ? String(error.code) : 'REQUEST_FAILED');
    return json({ error: status < 500 && error instanceof Error ? error.message : 'Impossibile completare l’operazione' }, status);
  }
});