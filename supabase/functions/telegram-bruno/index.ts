// Telegram bot (@Erp_vesuviano_bot): Bruno's command cockpit for the internal team.
// Entry points: Telegram webhook (secret header), DB-queued notifications/ticks ({notify_id, token}),
// and the ERP pairing action (user JWT).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { card, CHANNEL, COMMANDS, cut, dueSummary, esc, fmtDate, HELP, leadContext, leadName, leadUrl, messageBody, priority, romeClock, STAGE, type LeadLite } from './cockpit.ts';
import { communicationUrl, directCallLabel } from './cockpit.ts';
import { communicationChannel, directCallEvidence } from '../bruno-chat/coordination.ts';

const GATEWAY = 'https://connector-gateway.lovable.dev/telegram';
const BOT_USERNAME = 'Erp_vesuviano_bot';
const LEAD_COLS = 'id,contact_name,company_name,country,city,status,phone,email,next_activity_type,next_activity_date,value';
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function webhookSecret(key: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`telegram-webhook:${key}`));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function safeEqual(a: string | null, b: string) {
  if (!a || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0;
}

// deno-lint-ignore no-explicit-any
async function tg(method: string, body: unknown): Promise<any> {
  const res = await fetch(`${GATEWAY}/${method}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`, 'X-Connection-Api-Key': Deno.env.get('TELEGRAM_API_KEY') || '', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out.ok === false) console.error('telegram', method, res.status, JSON.stringify(out).slice(0, 300));
  return out?.result ?? null;
}
type Kb = { inline_keyboard: unknown[][] };
const html = (chat_id: number, text: string, reply_markup?: Kb, extra: Record<string, unknown> = {}) =>
  tg('sendMessage', { chat_id, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true, ...(reply_markup ? { reply_markup } : {}), ...extra });
async function say(chat_id: number, text: string) {
  for (let i = 0; i < text.length; i += 3800) await html(chat_id, esc(text.slice(i, i + 3800)));
}
const openBtn = (leadId: string) => ({ text: '📂 Apri scheda', url: leadUrl(leadId) });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL')!, service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const key = Deno.env.get('TELEGRAM_API_KEY');
  if (!key || !service) return json({ error: 'Servizio non configurato' }, 503);
  const admin = createClient(url, service);
  const groups = async () => ((await admin.from('telegram_links').select('chat_id').lt('chat_id', 0)).data ?? []).map((r) => Number(r.chat_id));

  // ---------- Shared helpers ----------
  async function linked(chatId: number) {
    const { data: link } = await admin.from('telegram_links').select('user_id').eq('chat_id', chatId).maybeSingle();
    if (!link) return null;
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', link.user_id);
    return roles?.some((r) => r.role === 'admin' || r.role === 'commerciale') ? link.user_id as string : null;
  }
  // Real session for the linked user, so every existing role check and RLS still applies.
  async function session(userId: string) {
    const { data: au } = await admin.auth.admin.getUserById(userId);
    const { data: gl, error: ge } = await admin.auth.admin.generateLink({ type: 'magiclink', email: au.user!.email! });
    if (ge) throw ge;
    const { data: s, error: se } = await createClient(url, anon).auth.verifyOtp({ token_hash: gl.properties.hashed_token, type: 'magiclink' });
    if (se || !s.session) throw se ?? new Error('session');
    return s.session.access_token;
  }
  const bruno = (token: string, body: unknown) => fetch(`${url}/functions/v1/bruno-chat`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, apikey: anon, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const signOut = (token: string) => createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } }).auth.signOut().catch(() => {});

  const LABEL: Record<string, string> = { update_lead: 'Aggiornare CRM', create_lead: 'Creare cliente', send_message: 'Inviare messaggio', create_offer: 'Creare offerta', send_offer: 'Inviare offerta', create_order: 'Inserire ordine', update_order: 'Aggiornare ordine', send_attachment: 'Inviare file' };
  LABEL.propose_call = 'Preparare chiamata in inglese';
  LABEL.approve_call = 'Avviare chiamata approvata in inglese';
  // deno-lint-ignore no-explicit-any
  const describe = (a: { name: string; args: Record<string, any> }) => {
    const x = a.args;
    if (a.name === 'propose_call') return `• Telefonata Bruno in inglese da +447457416033 · ${x.call_type === 'trattativa' ? 'Trattativa' : 'Qualifica'} · ${x.objective ?? ''}${x.instructions ? ` · Istruzioni: ${x.instructions}` : ''} · ${x.customer_timezone ?? ''}. Questa approvazione salva la proposta; l’avvio richiede una conferma separata.`;
    if (a.name === 'approve_call') return `• Avviare ora la telefonata in inglese da +447457416033 · Proposta ${x.call_id ?? ''}`;
    // deno-lint-ignore no-explicit-any
    const bits = [x.contact_name, x.customer_name, x.title, x.channel && (CHANNEL[x.channel] ?? x.channel), x.send_via && (CHANNEL[x.send_via] ?? x.send_via), x.status && (STAGE[x.status] ?? x.status), x.next_activity_type, x.next_activity_date && fmtDate(x.next_activity_date), x.total_amount && `${x.total_amount}`, x.subject, x.body && `«${cut(String(x.body), 500)}»`, x.notes_append || x.notes, Array.isArray(x.items) && x.items.map((i: any) => `${i.quantity}× ${i.product_name} ${i.unit_price ?? ''}`).join(', ')].filter(Boolean);
    return `• ${LABEL[a.name] ?? a.name}${bits.length ? ': ' + bits.join(' · ') : ''}`;
  };

  /** Send an instruction to Bruno; writes come back as a proposal with buttons. */
  async function converse(chatId: number, userId: string, who: string, isGroup: boolean, text: string) {
    const token = await session(userId);
    try {
      await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
      await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: isGroup ? `[${who}] ${text}` : text });
      const { data: hist } = await admin.from('telegram_bruno_messages').select('role,content').eq('chat_id', chatId).order('id', { ascending: false }).limit(20);
      const res = await bruno(token, {
        messages: (hist ?? []).reverse(), propose_writes: true, source:'telegram', requested_label:who,
        instructions: `Stai rispondendo su Telegram, la cabina di comando del team${isGroup ? ': ogni messaggio utente inizia con [Nome] di chi scrive; rivolgiti a quella persona' : ''}. Le azioni che modificano dati o scrivono ai clienti non vengono eseguite subito: chiama comunque lo strumento, poi spiega la proposta in massimo 3 righe in italiano; per i messaggi al cliente il testo esatto è nella proposta, aggiungi sotto una breve traduzione italiana se è in un'altra lingua. Non dire mai che un'azione è già fatta. Niente tabelle o markdown.`,
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return html(chatId, card({ icon: '⚠️', type: 'Errore', body: [esc(out.error ?? res.status)] }));
      await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'assistant', content: String(out.text).slice(0, 8000) });
      const proposals = Array.isArray(out.proposals) ? out.proposals : [];
      if (!proposals.length) return say(chatId, out.text);
      const { data: p,error:saveError } = await admin.from('telegram_pending').insert({ chat_id: chatId, actions: proposals, summary: out.text }).select('id').single();
      if(saveError||!p)return html(chatId,card({icon:'⚠️',type:'Proposta salvata nel piano',body:['Apri Bruno → Piano nell’ERP per verificarla e approvarla.']}));
      return html(chatId, card({ icon: '📋', type: 'Proposta di azione', body: [esc(out.text)], context: [...proposals.map((a: never) => esc(describe(a))), `Richiesta da ${esc(who)} · scade tra 24h`] }), {
        inline_keyboard: [[{ text: '✅ Approva', callback_data: `ok:${p.id}` }, { text: '✏️ Modifica', callback_data: `ed:${p.id}` }, { text: '❌ Annulla', callback_data: `no:${p.id}` }]],
      });
    } finally { await signOut(token); }
  }

  // ---------- Read-only cockpit views ----------
  const OPEN_OFFERS = ['offerta_inviata', 'negoziazione'];
  async function agenda() {
    const end = new Date(); end.setUTCHours(23, 59, 59, 999);
    const { data } = await admin.from('leads').select(LEAD_COLS).eq('archived', false).not('status', 'in', '(vinto,perso)').not('next_activity_date', 'is', null).lte('next_activity_date', end.toISOString()).order('next_activity_date').limit(15);
    return (data ?? []) as LeadLite[];
  }
  async function unanswered(hours = 72) {
    const since = new Date(Date.now() - hours * 3600_000).toISOString();
    const { data } = await admin.from('crm_messages').select('lead_id,direction,created_at,channel').gte('created_at', since).in('direction', ['inbound', 'outbound']).order('created_at', { ascending: false }).limit(1000);
    const last = new Map<string, { direction: string; channel: string; created_at: string }>();
    for (const m of data ?? []) if (m.lead_id && !last.has(m.lead_id)) last.set(m.lead_id, m);
    return [...last.entries()].filter(([, m]) => m.direction === 'inbound').map(([id, m]) => ({ id, ...m }));
  }
  async function leadsById(ids: string[]) {
    if (!ids.length) return new Map<string, LeadLite>();
    const { data } = await admin.from('leads').select(LEAD_COLS).in('id', ids.slice(0, 100));
    return new Map((data ?? []).map((l) => [l.id, l as LeadLite]));
  }
  const line = (l: LeadLite, tail = '') => `• <a href="${leadUrl(l.id)}">${esc(leadName(l))}</a>${l.status ? ` · ${esc(STAGE[l.status] ?? l.status)}` : ''}${tail ? ' · ' + tail : ''}`;

  async function viewToday() {
    const now = Date.now(), list = await agenda();
    const late = list.filter((l) => new Date(l.next_activity_date!).getTime() < now - 3600_000);
    const today = list.filter((l) => !late.includes(l));
    return card({ icon: '📅', type: 'Agenda di oggi', body: [
      `<b>Scadute (${late.length})</b>`, ...(late.length ? late.map((l) => line(l, `${esc(l.next_activity_type ?? '')} ${fmtDate(l.next_activity_date)}`)) : ['nessuna']),
      '', `<b>Oggi (${today.length})</b>`, ...(today.length ? today.map((l) => line(l, `${esc(l.next_activity_type ?? '')} ${fmtDate(l.next_activity_date)}`)) : ['nessuna']),
    ] });
  }
  async function viewHot() {
    const { data: ls } = await admin.from('leads').select(LEAD_COLS).eq('status', 'trattativa').eq('archived', false).limit(300);
    const leads = (ls ?? []) as LeadLite[];
    const { data: sums } = await admin.rpc('bruno_message_summaries', { p_lead_ids: leads.map((l) => l.id) });
    const lastAt = new Map((sums ?? []).map((s: { lead_id: string; last_at: string }) => [s.lead_id, s.last_at]));
    const cutoff = Date.now() - 48 * 3600_000;
    const cold = leads.filter((l) => { const t = lastAt.get(l.id); return !t || new Date(t as string).getTime() < cutoff; })
      .sort((a, b) => String(lastAt.get(b.id) ?? '').localeCompare(String(lastAt.get(a.id) ?? ''))).slice(0, 15);
    return card({ icon: '🔥', type: `Trattative ferme da 48h (${cold.length})`, body: cold.length ? cold.map((l) => line(l, lastAt.get(l.id) ? `ultimo contatto ${fmtDate(lastAt.get(l.id) as string)}` : 'nessun contatto')) : ['Tutte le trattative sono seguite 👍'] });
  }
  async function viewOffers() {
    const { data } = await admin.from('commercial_offers').select('number,customer_name,amount,currency,status,lead_id,updated_at').in('status', OPEN_OFFERS).eq('archived', false).order('updated_at').limit(15);
    return card({ icon: '📄', type: `Offerte in attesa (${data?.length ?? 0})`, body: data?.length ? data.map((o) => `• ${o.lead_id ? `<a href="${leadUrl(o.lead_id)}">${esc(o.number)}</a>` : esc(o.number)} · ${esc(o.customer_name ?? '')} · ${o.amount ? `${Number(o.amount).toLocaleString('it-IT')} ${esc(o.currency ?? 'EUR')}` : ''} · ${o.status === 'negoziazione' ? 'in negoziazione' : 'inviata'} ${fmtDate(o.updated_at)}`) : ['Nessuna offerta in attesa.'] });
  }
  async function viewMario() {
    const day = new Date(); day.setUTCHours(0, 0, 0, 0);
    const [{ data: ap }, { data: st }, sent, found] = await Promise.all([
      admin.from('outreach_autopilot').select('enabled,auto_paused_reason,last_tick_at').limit(1).maybeSingle(),
      admin.from('outreach_settings').select('paused,pause_reason,daily_limit').limit(1).maybeSingle(),
      admin.from('outreach_outbox').select('id', { count: 'exact', head: true }).gte('accepted_at', day.toISOString()),
      admin.from('outreach_prospects').select('id', { count: 'exact', head: true }).gte('created_at', day.toISOString()),
    ]);
    return card({ icon: '🛰️', type: 'Mario · outbound', body: [
      `Autopilota: ${ap?.enabled ? '🟢 attivo' : '⚪ spento'}${ap?.auto_paused_reason ? ` (in pausa: ${esc(ap.auto_paused_reason)})` : ''}`,
      `Invii: ${st?.paused ? `⏸️ in pausa${st.pause_reason ? ' – ' + esc(st.pause_reason) : ''}` : '▶️ attivi'} · limite ${st?.daily_limit ?? '-'}/giorno`,
      `Oggi: ${sent.count ?? 0} email inviate · ${found.count ?? 0} nuovi contatti`,
      ap?.last_tick_at ? `Ultimo giro: ${fmtDate(ap.last_tick_at)}` : '',
    ].filter(Boolean) });
  }
  async function viewLead(q: string) {
    const s = q.replace(/[%,()]/g, ' ').trim();
    if (s.length < 2) return 'Scrivi /lead seguito dal nome, per esempio /lead Stanislao';
    const { data } = await admin.from('leads').select(LEAD_COLS).or(`contact_name.ilike.%${s}%,company_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`).eq('archived', false).limit(3);
    if (!data?.length) return `Nessun cliente trovato per «${esc(s)}».`;
    const out: string[] = [];
    for (const l of data as LeadLite[]) {
      const { data: m } = await admin.from('crm_messages').select('channel,direction,body,subject,created_at,metadata').eq('lead_id', l.id).neq('direction', 'internal').order('created_at', { ascending: false }).limit(1).maybeSingle();
      const channel = m ? communicationChannel(m) : '';
      out.push(card({ icon: '👤', type: 'Scheda cliente', lead: l, body: [[l.phone, l.email].filter(Boolean).map(esc).join(' · ') || 'nessun contatto', m ? `Ultima interazione: ${esc(CHANNEL[channel] ?? channel)} ${m.direction === 'inbound' ? '⬅️' : '➡️'} ${fmtDate(m.created_at)}\n«${esc(cut(m.body ?? m.subject ?? '', 200))}»` : 'Nessuna interazione registrata'], context: leadContext(l) }));
    }
    return out;
  }
  async function summary(which: 'mattina' | 'sera') {
    const since = new Date(Date.now() - (which === 'mattina' ? 24 : 10) * 3600_000).toISOString();
    const [{ data: newLeads }, open, list, { data: offers }, { data: msgs }, { data: decided }] = await Promise.all([
      admin.from('leads').select(LEAD_COLS).gte('created_at', since).order('created_at', { ascending: false }).limit(50),
      unanswered(),
      agenda(),
      admin.from('commercial_offers').select('id', { count: 'exact' }).in('status', OPEN_OFFERS).eq('archived', false),
      admin.from('crm_messages').select('direction,channel').gte('created_at', since).in('direction', ['inbound', 'outbound']).limit(1000),
      admin.from('telegram_pending').select('status').gte('decided_at', since),
    ]);
    const leadMap = await leadsById(open.map((o) => o.id));
    const openLines = open.slice(0, 8).map((o) => leadMap.get(o.id) ? line(leadMap.get(o.id)!, `${CHANNEL[o.channel] ?? o.channel} ${fmtDate(o.created_at)}`) : '').filter(Boolean);
    const late = list.filter((l) => new Date(l.next_activity_date!).getTime() < Date.now());
    if (which === 'mattina') return card({ icon: '☀️', type: 'Briefing del mattino', body: [
      `🆕 Nuovi lead (24h): <b>${newLeads?.length ?? 0}</b>`, ...(newLeads ?? []).slice(0, 5).map((l) => line(l as LeadLite)),
      '', `💬 Messaggi senza risposta: <b>${open.length}</b>`, ...openLines,
      '', `📅 Attività di oggi: <b>${list.length}</b> (scadute ${late.length}) → /oggi`,
      `📄 Offerte da seguire: <b>${offers?.length ?? 0}</b> → /offerte`,
    ] });
    const inb = (msgs ?? []).filter((m) => m.direction === 'inbound').length, outb = (msgs ?? []).length - inb;
    return card({ icon: '🌙', type: 'Chiusura di giornata', body: [
      `Ricevuti ${inb} messaggi · inviati ${outb}`,
      `Proposte: ${(decided ?? []).filter((d) => d.status === 'approved').length} approvate, ${(decided ?? []).filter((d) => d.status === 'rejected').length} annullate`,
      `🆕 Nuovi lead oggi: ${newLeads?.length ?? 0}`,
      '', `<b>Restano aperti</b>`, `💬 Senza risposta: ${open.length}`, ...openLines.slice(0, 5), `⏰ Attività scadute: ${late.length}`,
    ] });
  }

  // ---------- Notifications ----------
  // deno-lint-ignore no-explicit-any
  async function editAll(n: any, text: string, reply_markup: Kb) {
    for (const t of (n.tg_messages ?? []) as { chat_id: number; message_id: number }[]) await tg('editMessageText', { chat_id: t.chat_id, message_id: t.message_id, text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup });
  }
  const msgKb = (id: number, leadId: string, channel = 'all'): Kb => ({ inline_keyboard: [[{ text: '💡 Suggerisci risposta', callback_data: `sug:${id}` }, openBtn(leadId)], [{ text: channel === 'email' ? '📧 Apri Mail' : '💬 Apri Chat', url: communicationUrl(leadId, channel) }], [{ text: '⏰ Rimanda 2h', callback_data: `snz:${id}` }, { text: '✅ Gestito', callback_data: `done:${id}` }]] });
  const leadKb = (id: number, leadId: string): Kb => ({ inline_keyboard: [[{ text: '🎯 Qualifica', callback_data: `q:${id}` }, { text: '✉️ Primo messaggio', callback_data: `f:${id}` }], [openBtn(leadId), { text: '✅ Gestito', callback_data: `done:${id}` }]] });
  const callKb = (id: number, leadId: string): Kb => ({ inline_keyboard: [
    [{ text: '💡 Proponi prossimo passo', callback_data: `next:${id}` }, openBtn(leadId)],
    [{ text: '📞 Dial', url: `https://vesuvianoforni.com/erp/dial?lead=${leadId}` }, { text: '💬 Chat', url: communicationUrl(leadId, 'all') }, { text: '📧 Mail', url: communicationUrl(leadId, 'email') }],
    [{ text: '✅ Gestito', callback_data: `done:${id}` }],
  ] });
  const notificationKb = (n: any, channel = 'all') => n.kind === 'direct_call' ? callKb(n.id, n.lead_id) : n.kind === 'lead' ? leadKb(n.id, n.lead_id) : msgKb(n.id, n.lead_id, channel);

  // deno-lint-ignore no-explicit-any
  async function buildCard(n: any, extraBody?: string) {
    const { data: lead } = await admin.from('leads').select(LEAD_COLS).eq('id', n.lead_id).maybeSingle();
    if (!lead) return null;
    if (n.kind === 'direct_call') {
      const { data: call, error } = await admin.from('crm_direct_calls').select('id,lead_id,operator_id,destination,from_number,status,created_at,answered_at,ended_at').eq('id', n.direct_call_id).maybeSingle();
      if (error) throw error;
      if (!call) return null;
      const c = directCallEvidence(call);
      return { lead, channel: 'call', text: card({ icon: '📞', type: 'Chiamata diretta del team', lead, channel: 'call', body: [
        esc(directCallLabel(c.status, Boolean(c.answered_at))), `Da ${esc(c.from_number)} a ${esc(c.destination)}`,
        ...(c.duration_seconds !== null ? [`Durata: ${Math.floor(c.duration_seconds / 60)} min ${c.duration_seconds % 60} sec`] : []),
        `🕒 ${fmtDate(c.ended_at ?? c.created_at)}`, 'Stato riportato dal browser; nessuna trascrizione disponibile.'], context: leadContext(lead) }) };
    }
    const { count: offers } = await admin.from('commercial_offers').select('id', { count: 'exact', head: true }).eq('lead_id', lead.id).in('status', OPEN_OFFERS);
    if (n.kind === 'lead') {
      const { data: src } = await admin.from('leads').select('source,notes').eq('id', lead.id).maybeSingle();
      return { lead, text: card({ icon: '🆕', type: 'Nuovo lead', pri: 'alta', lead, body: [[lead.phone, lead.email].filter(Boolean).map(esc).join(' · ') || 'nessun contatto', src?.source ? `Fonte: ${esc(src.source)}` : '', src?.notes ? `«${esc(cut(src.notes, 400))}»` : ''].filter(Boolean), context: leadContext(lead) }) };
    }
    const { data: m } = await admin.from('crm_messages').select('channel,body,subject,sender,created_at,metadata').eq('id', n.message_id).maybeSingle();
    if (!m) return null;
    const body = extraBody ?? messageBody(m);
    const channel = communicationChannel(m);
    return { lead, body, channel, text: card({ icon: m.channel === 'call' ? '📞' : '📨', type: m.channel === 'call' ? 'Chiamata in arrivo' : 'Messaggio in arrivo', pri: priority(lead.status, 'message', (offers ?? 0) > 0), lead, channel, body: [body], context: leadContext(lead, (offers ?? 0) > 0 ? [`${offers} offerta aperta`] : []) }) };
  }

  // deno-lint-ignore no-explicit-any
  async function notify(n: any) {
    const chats = await groups();
    if (!chats.length) return;
    // Anti-noise: messages from the same customer within 5 minutes join the open alert.
    if (n.kind === 'message') {
      const { data: prev } = await admin.from('telegram_notifications').select('*').eq('lead_id', n.lead_id).eq('kind', 'message').is('handled_at', null).gte('sent_at', new Date(Date.now() - 5 * 60_000).toISOString()).neq('id', n.id).order('sent_at', { ascending: false }).limit(1).maybeSingle();
      if (prev?.tg_messages?.length && prev.body) {
        const { data: m } = await admin.from('crm_messages').select('body,subject,created_at,channel,metadata').eq('id', n.message_id).maybeSingle();
        const merged = `${prev.body}\n\n${messageBody(m ?? {})}`.slice(-2600);
        const c = await buildCard(prev, merged);
        if (c && m && c.channel === communicationChannel(m)) {
          await editAll(prev, c.text, msgKb(prev.id, prev.lead_id, c.channel));
          await admin.from('telegram_notifications').update({ body: merged }).eq('id', prev.id);
          await admin.from('telegram_notifications').update({ sent_at: new Date().toISOString(), handled_at: new Date().toISOString(), handled_by: `raggruppato in #${prev.id}` }).eq('id', n.id);
          return;
        }
      }
    }
    const c = await buildCard(n);
    if (!c) return;
    const kb = notificationKb(n, c.channel);
    const sent: { chat_id: number; message_id: number }[] = [];
    const alreadySent = (n.tg_messages ?? []) as { chat_id: number; message_id: number }[];
    sent.push(...alreadySent);
    for (const chat of chats) {
      if (sent.some(s => s.chat_id === chat)) continue;
      const r = await html(chat, c.text, kb);
      if (!r?.message_id) throw new Error('Notifica Telegram non confermata');
      sent.push({ chat_id: chat, message_id: r.message_id });
      const saved = await admin.from('telegram_notifications').update({ tg_messages: sent }).eq('id', n.id);
      if (saved.error) throw saved.error;
    }
    await admin.from('telegram_notifications').update({ sent_at: new Date().toISOString(), tg_messages: sent, body: c.body ?? null }).eq('id', n.id);
  }

  async function tick() {
    const chats = await groups();
    const { data: pendingCalls, error: pendingError } = await admin.from('telegram_notifications').select('*').eq('kind', 'direct_call').is('sent_at', null).order('created_at').limit(20);
    if (pendingError) throw pendingError;
    for (const n of pendingCalls ?? []) await notify(n);
    await admin.from('telegram_pending').update({ status: 'expired' }).eq('status', 'pending').lt('created_at', new Date(Date.now() - 24 * 3600_000).toISOString());
    const which = dueSummary();
    if (which && chats.length) {
      const tag = `summary:${which}:${romeClock().day}`;
      const { data: done } = await admin.from('telegram_notifications').select('id').eq('kind', tag).maybeSingle();
      if (!done) {
        await admin.from('telegram_notifications').insert({ kind: tag, sent_at: new Date().toISOString() });
        if (which === 'mattina') await tg('setMyCommands', { commands: COMMANDS });
        const text = await summary(which);
        for (const chat of chats) await html(chat, text);
      }
    }
    // One reminder: unhandled negotiation alerts after 2h, or snoozed alerts whose time has come.
    const { data: due } = await admin.from('telegram_notifications').select('*').eq('kind', 'message').is('handled_at', null).is('reminded_at', null)
      .gte('sent_at', new Date(Date.now() - 24 * 3600_000).toISOString()).lte('sent_at', new Date(Date.now() - 2 * 3600_000).toISOString()).limit(30);
    const snoozed = await admin.from('telegram_notifications').select('*').eq('kind', 'message').is('handled_at', null).is('reminded_at', null).not('snoozed_until', 'is', null).lte('snoozed_until', new Date().toISOString()).limit(30);
    const rows = new Map([...(due ?? []), ...(snoozed.data ?? [])].map((r) => [r.id, r]));
    const leads = await leadsById([...new Set([...rows.values()].map((r) => r.lead_id))]);
    for (const r of rows.values()) {
      const l = leads.get(r.lead_id);
      if (!l || (!r.snoozed_until && l.status !== 'trattativa')) continue;
      if (r.snoozed_until && new Date(r.snoozed_until) > new Date()) continue;
      for (const t of (r.tg_messages ?? []) as { chat_id: number; message_id: number }[]) {
        await html(t.chat_id, card({ icon: '⏰', type: 'Promemoria', pri: 'alta', lead: l, body: [`Questo messaggio aspetta ancora una risposta (${fmtDate(r.sent_at)}).`] }), msgKb(r.id, r.lead_id), { reply_parameters: { message_id: t.message_id, allow_sending_without_reply: true } });
      }
      await admin.from('telegram_notifications').update({ reminded_at: new Date().toISOString() }).eq('id', r.id);
    }
  }

  // ---------- Entry: DB-queued notification or hourly tick (per-row token) ----------
  if (!req.headers.get('X-Telegram-Bot-Api-Secret-Token') && !req.headers.get('Authorization')) {
    const b = await req.json().catch(() => ({}));
    const id = Number(b.notify_id);
    if (!Number.isFinite(id) || typeof b.token !== 'string') return json({ error: 'Richiesta non valida' }, 400);
    const { data: n } = await admin.from('telegram_notifications').select('*').eq('id', id).eq('token', b.token).is('sent_at', null).maybeSingle();
    if (!n) return json({ ok: true, skipped: true });
    try {
      if (n.kind === 'tick') { await admin.from('telegram_notifications').update({ sent_at: new Date().toISOString() }).eq('id', n.id); await tick(); }
      else if (n.kind === 'lead' || n.kind === 'message' || n.kind === 'direct_call') await notify(n);
      return json({ ok: true });
    } catch (e) { console.error('telegram-bruno notify', e); return json({ error: 'notify failed' }, 500); }
  }

  // ---------- Entry: ERP pairing code ----------
  if (!req.headers.get('X-Telegram-Bot-Api-Secret-Token')) {
    const { data: u } = await admin.auth.getUser((req.headers.get('Authorization') || '').replace('Bearer ', ''));
    if (!u?.user) return json({ error: 'Non autenticato' }, 401);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id);
    if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return json({ error: 'Accesso negato' }, 403);
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => (b % 36).toString(36)).join('').toUpperCase();
    const { data: existing } = await admin.from('telegram_links').select('chat_id').eq('user_id', u.user.id).maybeSingle();
    await admin.from('telegram_links').upsert({ user_id: u.user.id, link_code: code, code_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(), ...(existing ? {} : { chat_id: null }) });
    return json({ code, link: `https://t.me/${BOT_USERNAME}?start=${code}`, group_link: `https://t.me/${BOT_USERNAME}?startgroup=${code}`, linked: !!existing?.chat_id });
  }

  // ---------- Entry: Telegram webhook ----------
  if (!safeEqual(req.headers.get('X-Telegram-Bot-Api-Secret-Token'), await webhookSecret(key))) return new Response('Unauthorized', { status: 401 });
  const update = await req.json();
  if (typeof update.update_id !== 'number') return json({ ok: true });
  const { error: dup } = await admin.from('telegram_updates').insert({ update_id: update.update_id });
  if (dup) return json({ ok: true, duplicate: true });

  const cb = update.callback_query;
  if (cb?.message?.chat?.id && typeof cb.data === 'string') {
    const chatId: number = cb.message.chat.id;
    const isGroup = cb.message.chat.type !== 'private';
    const who = [cb.from?.first_name, cb.from?.last_name].filter(Boolean).join(' ') || cb.from?.username || 'utente';
    const at = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }).format(new Date());
    const answer = (text: string) => tg('answerCallbackQuery', { callback_query_id: cb.id, text });
    const work = (async () => {
      try {
        const userId = await linked(chatId);
        if (!userId) return answer('Chat non collegata all\'ERP');
        const pm = cb.data.match(/^(ok|no|ed):([0-9a-f-]{36})$/);
        if (pm) {
          const status = pm[1] === 'ok' ? 'approved' : 'rejected';
          const { data: p } = await admin.from('telegram_pending').update({ status, decided_by: who, decided_at: new Date().toISOString() }).eq('id', pm[2]).eq('chat_id', chatId).eq('status', 'pending').gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()).select('actions').maybeSingle();
          if (!p) return answer('Proposta già gestita o scaduta');
          await answer('Ricevuto');
          const stamp = pm[1] === 'ok' ? `✅ Approvata da ${who} alle ${at}` : pm[1] === 'ed' ? `✏️ In modifica da ${who} alle ${at}` : `❌ Annullata da ${who} alle ${at}`;
          await tg('editMessageText', { chat_id: chatId, message_id: cb.message.message_id, text: `${cb.message.text ?? ''}\n\n${stamp}`.slice(0, 4000), disable_web_page_preview: true });
          if (pm[1] === 'no' || pm[1] === 'ed') {
            const ids=(p.actions as {action_id?:string}[]).map(a=>a.action_id).filter((id):id is string=>Boolean(id));
            for(const id of ids){const {error}=await admin.rpc('cancel_bruno_action',{p_id:id,p_user:userId});if(error)throw new Error('Cancellazione proposta non riuscita');}
          }
          if (pm[1] === 'no') { await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: `[${who}] Proposta annullata.` }); return; }
          if (pm[1] === 'ed') {
            await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: `[${who}] Voglio modificare la proposta precedente, ti scrivo le modifiche.` });
            return html(chatId, `✏️ ${esc(who)}, rispondi a questo messaggio con le modifiche: preparo una nuova proposta.`, undefined, { reply_markup: { force_reply: true, selective: true } });
          }
          const token = await session(userId);
          try {
            const res = await bruno(token, { messages: [{ role: 'user', content: 'esegui' }], pending_id:pm[2],source:'telegram',requested_label:who });
            const out = await res.json().catch(() => ({}));
            const text = res.ok ? card({ icon: '✅', type: 'Esito azione', body: [esc(out.text)], context: [`Approvata da ${esc(who)} alle ${at}`] }) : card({ icon: '⚠️', type: 'Errore', body: [esc(out.error ?? res.status), 'Controlla nell\'ERP prima di riprovare.'] });
            await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'assistant', content: res.ok ? String(out.text) : `Errore: ${out.error ?? res.status}` });
            await html(chatId, text);
          } finally { await signOut(token); }
          return;
        }
        const nm = cb.data.match(/^(sug|snz|done|q|f|next):(\d+)$/);
        if (!nm) return answer('Pulsante non valido');
        const { data: n } = await admin.from('telegram_notifications').select('*').eq('id', Number(nm[2])).maybeSingle();
        if (!n?.lead_id) return answer('Avviso non trovato');
        const { data: lead } = await admin.from('leads').select(LEAD_COLS).eq('id', n.lead_id).maybeSingle();
        const c = await buildCard(n, n.body ?? undefined);
        if (nm[1] === 'done') {
          if (n.handled_at) return answer(`Già gestito da ${n.handled_by}`);
          await admin.from('telegram_notifications').update({ handled_at: new Date().toISOString(), handled_by: who }).eq('id', n.id);
          if (c) await editAll(n, `${c.text}\n\n✅ <i>Gestito da ${esc(who)} alle ${at}</i>`, { inline_keyboard: [[openBtn(n.lead_id)]] });
          return answer('Segnato come gestito');
        }
        if (nm[1] === 'snz') {
          await admin.from('telegram_notifications').update({ snoozed_until: new Date(Date.now() + 2 * 3600_000).toISOString(), reminded_at: null }).eq('id', n.id);
          if (c) await editAll(n, `${c.text}\n\n⏰ <i>Rimandato da ${esc(who)} alle ${at}</i>`, notificationKb(n, c.channel));
          return answer('Ti ricordo tra circa 2 ore');
        }
        await answer('Bruno sta preparando la proposta…');
        const name = lead ? leadName(lead as LeadLite) : 'il cliente';
        const ref = `${name} (lead_id ${n.lead_id})`;
        const ask = nm[1] === 'sug'
          ? `Leggi la conversazione con ${ref} e proponi la risposta all'ultimo messaggio ricevuto, sullo stesso canale (${c?.channel ?? 'wasender'}), con send_message.`
          : nm[1] === 'next'
            ? `Leggi get_lead e get_call_history per ${ref}, inclusa la chiamata diretta del team. Proponi un prossimo passo CRM o un follow-up opportuno dopo aver controllato Chat e Mail; non avviare chiamate, non inventare contenuto della telefonata. Se manca l'esito commerciale chiedi al team una breve nota. Ogni modifica o invio resta una proposta da approvare.`
          : nm[1] === 'q'
            ? `Analizza il nuovo lead ${ref}: proponi con update_lead la fase CRM corretta, la prossima attività con data e una nota di qualificazione.`
            : `Prepara il primo messaggio di benvenuto per il nuovo lead ${ref} su WhatsApp Gennaro (wasender), o via email se manca il telefono, con send_message.`;
        await converse(chatId, userId, who, isGroup, ask);
      } catch (e) { console.error('telegram-bruno cb', e); await html(chatId, card({ icon: '⚠️', type: 'Errore', body: ['Errore durante l\'esecuzione, controlla nell\'ERP prima di riprovare.'] })); }
    })();
    // @ts-ignore EdgeRuntime is provided by Supabase.
    EdgeRuntime.waitUntil(work);
    return json({ ok: true });
  }

  const msg = update.message;
  if (!msg?.chat?.id || !['private', 'group', 'supergroup'].includes(msg.chat.type) || typeof msg.text !== 'string') return json({ ok: true });
  const chatId: number = msg.chat.id;
  const isGroup = msg.chat.type !== 'private';
  const who = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.from?.username || 'utente';
  const text = msg.text.replace(new RegExp(`@${BOT_USERNAME}`, 'gi'), '').trim().slice(0, 4000);

  const work = (async () => {
    try {
      const start = text.match(/^\/(?:start|collega)\s+([A-Z0-9]{6})$/i);
      if (start) {
        const { data: row } = await admin.from('telegram_links').select('user_id,code_expires_at').eq('link_code', start[1].toUpperCase()).maybeSingle();
        if (!row || new Date(row.code_expires_at) < new Date()) return say(chatId, 'Codice non valido o scaduto. Generane uno nuovo dall\'ERP (Bruno → Collega gruppo Telegram).');
        await admin.from('telegram_links').update({ chat_id: null }).eq('chat_id', chatId);
        await admin.from('telegram_links').update({ chat_id: chatId, telegram_username: isGroup ? (msg.chat.title ?? 'gruppo') : (msg.from?.username ?? null), link_code: null, code_expires_at: null, linked_at: new Date().toISOString() }).eq('user_id', row.user_id);
        await tg('setMyCommands', { commands: COMMANDS });
        return html(chatId, `Collegato ✅ Sono Bruno.\n\n${HELP}`);
      }
      const userId = await linked(chatId);
      if (!userId) return isGroup ? undefined : say(chatId, 'Questo account Telegram non è collegato all\'ERP Vesuviano. Apri ERP → Bruno e premi «Collega gruppo Telegram».');
      const cmd = text.match(/^\/(\w+)(?:@\w+)?\s*(.*)$/s);
      if (cmd) {
        const [, c, arg] = cmd;
        if (c === 'reset') { await admin.from('telegram_bruno_messages').delete().eq('chat_id', chatId); return say(chatId, 'Conversazione azzerata.'); }
        if (c === 'aiuto' || c === 'help' || c === 'start') return html(chatId, HELP);
        if (c === 'oggi') return html(chatId, await viewToday());
        if (c === 'caldi') return html(chatId, await viewHot());
        if (c === 'offerte') return html(chatId, await viewOffers());
        if (c === 'mario') return html(chatId, await viewMario());
        if (c === 'briefing') return html(chatId, await summary(romeClock().hour >= 14 ? 'sera' : 'mattina'));
        if (c === 'lead') { const r = await viewLead(arg); for (const t of Array.isArray(r) ? r : [r]) await html(chatId, t); return; }
      }
      await converse(chatId, userId, who, isGroup, text);
    } catch (e) {
      console.error('telegram-bruno', e);
      await html(chatId, card({ icon: '⚠️', type: 'Errore', body: ['Si è verificato un errore, riprova tra poco.'] }));
    }
  })();
  // @ts-ignore EdgeRuntime is provided by Supabase.
  EdgeRuntime.waitUntil(work);
  return json({ ok: true });
});
