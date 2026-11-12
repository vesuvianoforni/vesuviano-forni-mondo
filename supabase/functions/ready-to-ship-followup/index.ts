// Sends queued ready-to-ship WhatsApp follow-ups from Gennaro's WaSender line, only in working hours.
// Each row is claimed once (pending -> sending) and never retried automatically, so no duplicate WhatsApp.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { sendGennaroWhatsApp } from '../_shared/wasender.ts';
import { followupText, isWorkingTime } from '../_shared/ready-to-ship-followup.ts';
import { readyToShipBookingUrl } from '../_shared/booking-link.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!isWorkingTime(new Date())) return json({ skipped: 'outside_working_hours' });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const lovableKey = Deno.env.get('LOVABLE_API_KEY') ?? '';
  const connectionKey = Deno.env.get('UDC_WASENDER_API_KEY') ?? '';

  const { data: automation } = await admin.from('bruno_automations').select('enabled').eq('key', 'ready_to_ship_followup').maybeSingle();
  if (automation && !automation.enabled) return json({ skipped: 'automation_disabled' });
  const { data: due } = await admin.from('ready_to_ship_followups').select('id')
    .eq('status', 'pending').lte('due_at', new Date().toISOString()).order('due_at').limit(10);
  const results: unknown[] = [];
  for (const { id } of due ?? []) {
    const { data: row } = await admin.from('ready_to_ship_followups').update({ status: 'sending' })
      .eq('id', id).eq('status', 'pending').select().maybeSingle();
    if (!row) continue;
    const phone = String(row.phone).replace(/\D/g, '').replace(/^00/, '');
    let bookingUrl = readyToShipBookingUrl();
    if (row.website_lead_id) {
      const request = await admin.from('website_leads').select('metadata').eq('id', row.website_lead_id).maybeSingle();
      const offerId = request.data?.metadata?.offer_id;
      if (typeof offerId === 'string') {
        const offer = await admin.from('commercial_offers').select('public_code').eq('id', offerId).maybeSingle();
        bookingUrl = readyToShipBookingUrl(offer.data?.public_code, row.language);
      }
    }
    const text = followupText(row.language, row.customer_name, row.model_name, row.email, bookingUrl);
    let status = 'sent'; let error: string | null = null; let externalId: string | null = null;
    try { externalId = await sendGennaroWhatsApp({ lovableKey, connectionKey }, { phone, text }); }
    catch (e) { status = 'failed'; error = e instanceof Error ? e.message : 'Errore WaSender'; console.error('Follow-up failed', id, error); }
    await admin.from('ready_to_ship_followups').update({ status, error, external_id: externalId, sent_at: status === 'sent' ? new Date().toISOString() : null }).eq('id', id);

    // Record in the customer's CRM timeline
    let leadId: string | null = null;
    if (row.website_lead_id) leadId = (await admin.from('leads').select('id').eq('website_lead_id', row.website_lead_id).maybeSingle()).data?.id ?? null;
    if (!leadId) leadId = (await admin.from('leads').select('id').ilike('email', row.email).order('created_at').limit(1).maybeSingle()).data?.id ?? null;
    if (leadId) {
      await admin.from('crm_messages').insert({ lead_id: leadId, channel: 'wasender', direction: 'outbound', sender: 'gennaro', body: text, status: status === 'sent' ? 'sent' : 'failed', error, external_id: externalId, ai_generated: true, metadata: { automation: 'ready_to_ship_followup' } });
    }
    results.push({ id, status });
  }
  return json({ processed: results });
});
