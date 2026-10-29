import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { sendMailboxEmail } from '../_shared/email-service.ts';
import { safeMailError } from '../_shared/email-rules.ts';

// Obiettivi di Bruno per fase pipeline (tenere allineato a src/lib/brunoObjectives.ts)
const OBJECTIVES: Record<string, string> = {
  nuovo: "Qualificare il lead: capire se apre una nuova pizzeria o sostituisce un forno, modello/alimentazione di interesse, numero pizze, tempi e paese di installazione.",
  pre_qualificato: "Stabilire il contatto: presentarsi, ricordare la richiesta e chiedere il momento migliore per sentirsi.",
  qualificato: "Proporre una telefonata con Gennaro se ha dubbi tecnici, altrimenti preparare e inviare direttamente un'offerta.",
  trattativa: "Fissare una telefonata per discutere l'offerta e fare follow-up cortesi e utili finché il cliente non dice che non è più interessato.",
  vinto: "Back-office: confermare acconto, tempi di produzione e logistica di consegna.",
  perso: "Nessuna azione commerciale: non inviare follow-up.",
};

const SendSchema = z.object({
  action: z.literal('send'),
  lead_id: z.string().uuid(),
  channel: z.enum(['whatsapp_api', 'wasender', 'email', 'note']),
  body: z.string().min(1).max(4000),
  subject: z.string().max(300).optional(),
  ai_generated: z.boolean().optional(),
  idempotency_key: z.string().uuid().optional(),
});
const SuggestSchema = z.object({
  action: z.literal('suggest'),
  lead_id: z.string().uuid(),
  instruction: z.string().max(1000).optional(),
});
const Body = z.discriminatedUnion('action', [SendSchema, SuggestSchema]);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const digits = (p?: string | null) => (p || '').replace(/\D/g, '').replace(/^00/, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return json({ error: 'Servizio non configurato' }, 503);
    const admin = createClient(url, serviceKey);
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: 'Non autenticato' }, 401);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id);
    if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;

    const { data: lead } = await admin.from('leads').select('*').eq('id', input.lead_id).maybeSingle();
    if (!lead) return json({ error: 'Lead non trovato' }, 404);

    if (input.action === 'suggest') {
      const apiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!apiKey) return json({ error: 'LOVABLE_API_KEY non configurata' }, 500);
      const { data: history } = await admin.from('crm_messages').select('channel,direction,sender,body,created_at')
        .eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(20);
      const stage = lead.status || 'nuovo';
      const system = `Sei Bruno, agente AI Sales & Back-office di Vesuviano Forni (forni per pizza artigianali napoletani: Anastasia, Ottavio, Real Bosco, Sebastian, VesuvioBuono, Forno Rotante; legna, gas, elettrico, rotante). Pagamento 50% acconto, 50% alla consegna. Usa sempre "Prodotti", mai "Soluzioni".
Canali: whatsapp_api (linea di Bruno, messaggi rapidi), wasender (WhatsApp personale di Gennaro, il commerciale: tono caldo, follow-up e negoziazione), email (offerte, documenti, comunicazioni formali).
Regole: messaggi brevi, umani, una sola domanda per volta, nessuna promessa di prezzo o sconto non presente nei dati, scrivi nella lingua del cliente (deducila da paese/storico, default italiano). Se il cliente ha detto di non essere interessato, proponi di chiudere come perso e non scrivere.
Rispondi SOLO con JSON: {"channel":"whatsapp_api|wasender|email","subject":"solo se email","message":"testo","reasoning":"perché questa mossa, max 2 frasi","suggest_stage":"fase consigliata o null"}`;
      const userMsg = `Fase attuale: ${stage}. Obiettivo: ${OBJECTIVES[stage] || OBJECTIVES.nuovo}
Lead: ${JSON.stringify({ nome: lead.contact_name, azienda: lead.company_name, paese: lead.country, citta: lead.city, fonte: lead.source, note: (lead.notes || '').slice(0, 1500), prossima_attivita: lead.next_activity_type, data_attivita: lead.next_activity_date, ha_email: !!lead.email, ha_telefono: !!lead.phone })}
Storico (più recente prima): ${JSON.stringify((history || []).map((m) => ({ ...m, body: m.body.slice(0, 500) })))}
${input.instruction ? `Istruzione dell'operatore: ${input.instruction}` : ''}`;
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-6-astra',
          reasoning_effort: 'low',
          messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'bruno_suggestion', strict: true,
              schema: {
                type: 'object', additionalProperties: false,
                required: ['channel', 'subject', 'message', 'reasoning', 'suggest_stage'],
                properties: {
                  channel: { type: 'string', enum: ['whatsapp_api', 'wasender', 'email'] },
                  subject: { type: ['string', 'null'] },
                  message: { type: 'string' },
                  reasoning: { type: 'string' },
                  suggest_stage: { type: ['string', 'null'] },
                },
              },
            },
          },
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error('AI gateway', res.status, text);
        const msg = res.status === 429 ? 'Troppe richieste, riprova tra poco.' : res.status === 402 ? 'Crediti AI esauriti.' : 'Errore AI';
        return json({ error: msg, details: text }, res.status);
      }
      const content = JSON.parse(text).choices?.[0]?.message?.content || '{}';
      let suggestion;
      try { suggestion = JSON.parse(content.replace(/^```json\s*|```$/g, '')); } catch { suggestion = { message: content }; }
      return json({ suggestion, objective: OBJECTIVES[stage] });
    }

    // Email is a durable SMTP submission plus an independent IMAP Sent-copy operation.
    if (input.channel === 'email') {
      if (!input.idempotency_key) return json({ error: 'Identificativo invio mancante' },400);
      const recipient = z.string().email().safeParse(lead.email?.trim());
      if (!recipient.success) return json({ error:'Email cliente mancante o non valida' },400);
      try {
        return json(await sendMailboxEmail(admin, { lead_id:lead.id, recipient:recipient.data,
          subject:input.subject || 'Vesuviano Forni', body:input.body,
          idempotency_key:input.idempotency_key, created_by:u.user.id }));
      } catch(e) {
        const code = safeMailError(e);
        console.error('Mailbox submission failed',code);
        return json({error:code},422);
      }
    }

    // SEND (other channels remain unchanged)
    let status = 'sent';
    let error: string | null = null;
    let externalId: string | null = null;
    const phone = digits(lead.phone);

    if (input.channel === 'whatsapp_api') {
      const lk = Deno.env.get('LOVABLE_API_KEY');
      const wk = Deno.env.get('WHATSAPP_API_KEY');
      if (!wk || !lk) { status = 'failed'; error = 'WhatsApp API di Bruno non ancora collegato'; }
      else if (!phone) { status = 'failed'; error = 'Telefono mancante'; }
      else {
        const r = await fetch('https://connector-gateway.lovable.dev/whatsapp/messages', {
          method: 'POST',
          headers: { Authorization: `Bearer ${lk}`, 'X-Connection-Api-Key': wk, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: input.body } }),
        });
        const t = await r.text();
        if (!r.ok) { status = 'failed'; error = `WhatsApp ${r.status}: ${t.slice(0, 300)}`; }
        else { try { externalId = JSON.parse(t).messages?.[0]?.id ?? null; } catch { /* ignore */ } }
      }
    } else if (input.channel === 'wasender') {
      const key = Deno.env.get('WASENDER_API_KEY');
      if (!key) { status = 'failed'; error = 'WaSender di Gennaro non ancora collegato'; }
      else if (!phone) { status = 'failed'; error = 'Telefono mancante'; }
      else {
        const r = await fetch('https://www.wasenderapi.com/api/send-message', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: `+${phone}`, text: input.body }),
        });
        const t = await r.text();
        if (!r.ok) { status = 'failed'; error = `WaSender ${r.status}: ${t.slice(0, 300)}`; }
        else { try { externalId = String(JSON.parse(t).data?.msgId ?? '') || null; } catch { /* ignore */ } }
      }
    } else {
      status = 'logged';
    }

    const { data: msg, error: dbErr } = await admin.from('crm_messages').insert({
      lead_id: lead.id, channel: input.channel,
      direction: input.channel === 'note' ? 'internal' : 'outbound',
      sender: input.channel === 'whatsapp_api' ? 'bruno' : input.channel === 'wasender' ? 'gennaro' : 'operator',
      subject: input.subject ?? null, body: input.body, status, error, external_id: externalId,
      ai_generated: input.ai_generated ?? false, created_by: u.user.id,
    }).select().single();
    if (dbErr) return json({ error: dbErr.message }, 500);

    // Intervento umano diretto: Bruno si mette in pausa 48h su questo lead
    if (input.channel === 'wasender' && !input.ai_generated) {
      await admin.from('leads').update({ bruno_paused_until: new Date(Date.now() + 48 * 3600e3).toISOString() }).eq('id', lead.id);
    }
    return json({ message: msg }, status === 'failed' ? 422 : 200);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'Errore' }, 500);
  }
});
