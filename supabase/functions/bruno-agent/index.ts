import { lineFor, listTemplates, sendWhatsApp } from './meta-whatsapp.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { ECONOMIC_TEXT_MODEL } from '../_shared/ai-models.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { sendMailboxEmail } from '../_shared/email-service.ts';
import { safeMailError } from '../_shared/email-rules.ts';
import { mediaField, sendGennaroWhatsApp } from './wasender.ts';
import { customerPersona, stageRule, TOOL_MAP } from '../_shared/bruno/persona.ts';

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
  signature_id: z.string().uuid().nullable().optional(),
  media_url: z.string().url().max(1000).optional(),
  template: z.object({ name: z.string().min(1).max(200), language: z.string().min(2).max(10), params: z.array(z.string().min(1).max(1000)).max(10) }).optional(),
});
const TemplatesSchema = z.object({ action: z.literal('wa_templates'), lead_id: z.string().uuid().optional() });
const SuggestSchema = z.object({
  action: z.literal('suggest'),
  lead_id: z.string().uuid(),
  instruction: z.string().max(1000).optional(),
});
const Body = z.discriminatedUnion('action', [SendSchema, SuggestSchema, TemplatesSchema]);

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
    if (input.action === 'wa_templates') {
      try {
        // Each country line has its own WhatsApp Business account, so templates follow the lead's line.
        const phone = input.lead_id ? (await admin.from('leads').select('phone').eq('id', input.lead_id).maybeSingle()).data?.phone : null;
        return json({ templates: await listTemplates(phone), line: lineFor(phone)?.label ?? 'WhatsApp Bruno' });
      }
      catch (e) { return json({ error: e instanceof Error ? e.message : 'Errore Meta' }, 502); }
    }

    const { data: lead } = await admin.from('leads').select('*').eq('id', input.lead_id).maybeSingle();
    if (!lead) return json({ error: 'Lead non trovato' }, 404);

    if (input.action === 'suggest') {
      const apiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!apiKey) return json({ error: 'LOVABLE_API_KEY non configurata' }, 500);
      const { data: history } = await admin.from('crm_messages').select('channel,direction,sender,body,created_at')
        .eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(20);
      const stage = lead.status || 'nuovo';
      const { data: kb } = await admin.from('bruno_knowledge').select('title,content,stages').eq('is_active', true).order('sort_order').limit(80);
      const kbText = (kb || []).filter((k) => !k.stages?.length || k.stages.includes(stage)).map((k) => `- ${k.title}: ${k.content}`).join('\n');
      const system = `${customerPersona('any')}
${TOOL_MAP}

# FASE ATTUALE
${stageRule(stage)}

# KNOWLEDGE BASE (fonte ufficiale)
${kbText}

Canali: whatsapp_api (linea ufficiale di Bruno), wasender (WhatsApp di Gennaro, default per relazione e trattativa), email (offerte, documenti). Applica il modulo WhatsApp o Email in base al canale scelto. Se il cliente ha detto di non essere interessato, proponi di chiudere come perso e non scrivere.
Rispondi SOLO con JSON: {"channel":"whatsapp_api|wasender|email","subject":"solo se email","message":"testo","reasoning":"perché questa mossa, max 2 frasi","suggest_stage":"fase consigliata o null"}`;
      const userMsg = `Fase attuale: ${stage}. Obiettivo: ${OBJECTIVES[stage] || OBJECTIVES.nuovo}
Lead: ${JSON.stringify({ nome: lead.contact_name, azienda: lead.company_name, paese: lead.country, citta: lead.city, fonte: lead.source, note: (lead.notes || '').slice(0, 1500), qualificazione: lead.qualification, prossima_attivita: lead.next_activity_type, data_attivita: lead.next_activity_date, ha_email: !!lead.email, ha_telefono: !!lead.phone })}
Storico (più recente prima): ${JSON.stringify((history || []).map((m) => ({ ...m, body: m.body.slice(0, 500) })))}
${input.instruction ? `Istruzione dell'operatore: ${input.instruction}` : ''}`;
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ECONOMIC_TEXT_MODEL,
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
          idempotency_key:input.idempotency_key, created_by:u.user.id, signature_id:input.signature_id }));
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
      if (!phone) { status = 'failed'; error = 'Telefono mancante'; }
      else {
        try { externalId = await sendWhatsApp(phone, input.template ? { template: input.template } : { text: input.body }); }
        catch (e) { status = 'failed'; error = e instanceof Error ? e.message : 'Errore WhatsApp'; }
      }
    } else if (input.channel === 'wasender') {
      const key = Deno.env.get('UDC_WASENDER_API_KEY');
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!key || !lovableKey) { status = 'failed'; error = 'WaSender di Gennaro non ancora collegato'; }
      else if (!phone) { status = 'failed'; error = 'Telefono mancante'; }
      else {
        try {
          externalId = await sendGennaroWhatsApp({ lovableKey, connectionKey: key }, { phone, text: input.body, mediaUrl: input.media_url });
        } catch (e) {
          status = 'failed';
          error = e instanceof Error ? e.message : 'WaSender: invio da verificare nella chat prima di riprovare.';
          console.error('WaSender submission failed', error);
        }
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
      ...(input.channel === 'whatsapp_api' && lineFor(phone) ? { metadata: { whatsapp_line: lineFor(phone)!.key } } : {}),
      ...(input.media_url ? { metadata: { ...(input.channel === 'whatsapp_api' && lineFor(phone) ? { whatsapp_line: lineFor(phone)!.key } : {}), media_url: input.media_url, message_type: Object.keys(mediaField(input.media_url))[0]?.replace('Url', '') || 'document', file_name: input.media_url.split('/').pop()?.split('?')[0] } } : {}),
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
