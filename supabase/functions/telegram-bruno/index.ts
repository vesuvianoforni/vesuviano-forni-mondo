// Telegram bot (@Erp_vesuviano_bot) for the internal team: linked ERP users chat with Bruno.
// Webhook (Telegram, secret header) + action "link_code" (ERP user, JWT) to pair an account.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY = 'https://connector-gateway.lovable.dev/telegram';
const BOT_USERNAME = 'Erp_vesuviano_bot';
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function webhookSecret(key: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`telegram-webhook:${key}`));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function safeEqual(a: string | null, b: string) {
  if (!a || a.length !== b.length) return false;
  let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0;
}

async function tg(method: string, body: unknown) {
  const res = await fetch(`${GATEWAY}/${method}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`, 'X-Connection-Api-Key': Deno.env.get('TELEGRAM_API_KEY')!, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('telegram', method, res.status, (await res.text()).slice(0, 300));
}
async function say(chat_id: number, text: string) {
  for (let i = 0; i < text.length; i += 4000) await tg('sendMessage', { chat_id, text: text.slice(i, i + 4000) });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = Deno.env.get('SUPABASE_URL')!, service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const key = Deno.env.get('TELEGRAM_API_KEY');
  if (!key || !service) return json({ error: 'Servizio non configurato' }, 503);
  const admin = createClient(url, service);

  // ERP side: generate pairing code / read status.
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

  if (!safeEqual(req.headers.get('X-Telegram-Bot-Api-Secret-Token'), await webhookSecret(key))) return new Response('Unauthorized', { status: 401 });
  const update = await req.json();
  if (typeof update.update_id !== 'number') return json({ ok: true });
  const { error: dup } = await admin.from('telegram_updates').insert({ update_id: update.update_id });
  if (dup) return json({ ok: true, duplicate: true });

  const LABEL: Record<string, string> = { update_lead: 'Aggiornare CRM', create_lead: 'Creare cliente', send_message: 'Inviare messaggio', create_offer: 'Creare offerta', create_order: 'Inserire ordine', update_order: 'Aggiornare ordine' };
  const describe = (a: { name: string; args: Record<string, any> }) => {
    const x = a.args;
    const bits = [x.contact_name, x.customer_name, x.title, x.channel, x.status, x.next_activity_type, x.next_activity_date, x.total_amount && `${x.total_amount}`, x.subject, x.body && `«${String(x.body).slice(0, 500)}»`, x.notes_append || x.notes, Array.isArray(x.items) && x.items.map((i: any) => `${i.quantity}× ${i.product_name} ${i.unit_price}`).join(', ')].filter(Boolean);
    return `• ${LABEL[a.name] ?? a.name}${bits.length ? ': ' + bits.join(' · ') : ''}`;
  };

  async function linked(chatId: number) {
    const { data: link } = await admin.from('telegram_links').select('user_id').eq('chat_id', chatId).maybeSingle();
    if (!link) return null;
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', link.user_id);
    return roles?.some((r) => r.role === 'admin' || r.role === 'commerciale') ? link.user_id : null;
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

  // Approval buttons.
  const cb = update.callback_query;
  if (cb?.message?.chat?.id && typeof cb.data === 'string') {
    const chatId: number = cb.message.chat.id;
    const who = [cb.from?.first_name, cb.from?.last_name].filter(Boolean).join(' ') || cb.from?.username || 'utente';
    const work = (async () => {
      try {
        const m = cb.data.match(/^(ok|no):([0-9a-f-]{36})$/);
        const userId = await linked(chatId);
        if (!m || !userId) return tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Non autorizzato' });
        const { data: p } = await admin.from('telegram_pending').update({ status: m[1] === 'ok' ? 'approved' : 'rejected' }).eq('id', m[2]).eq('chat_id', chatId).eq('status', 'pending').select('actions').maybeSingle();
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: p ? 'Ricevuto' : 'Proposta già gestita' });
        if (!p) return;
        await tg('editMessageReplyMarkup', { chat_id: chatId, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
        if (m[1] === 'no') { await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: `[${who}] Proposta annullata.` }); return say(chatId, `❌ Annullata da ${who}. Nessuna azione eseguita.`); }
        const token = await session(userId);
        const res = await bruno(token, { messages: [{ role: 'user', content: 'esegui' }], execute: p.actions });
        const out = await res.json().catch(() => ({}));
        const text = res.ok ? `Approvata da ${who}:\n${out.text}` : `Errore: ${out.error ?? res.status}`;
        await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'assistant', content: text });
        await say(chatId, text);
        await signOut(token);
      } catch (e) { console.error('telegram-bruno cb', e); await say(chatId, 'Errore durante l\'esecuzione, controlla nell\'ERP prima di riprovare.'); }
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
        return say(chatId, 'Collegato ✅ Sono Bruno. Chiedimi quello che serve: prima di modificare dati o scrivere ai clienti ti mando la proposta con i pulsanti Approva / Annulla.');
      }
      const userId = await linked(chatId);
      if (!userId) return isGroup ? undefined : say(chatId, 'Questo account Telegram non è collegato all\'ERP Vesuviano. Apri ERP → Bruno e premi «Collega gruppo Telegram».');
      if (text === '/reset') { await admin.from('telegram_bruno_messages').delete().eq('chat_id', chatId); return say(chatId, 'Conversazione azzerata.'); }

      const token = await session(userId);
      await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
      await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: isGroup ? `[${who}] ${text}` : text });
      const { data: hist } = await admin.from('telegram_bruno_messages').select('role,content').eq('chat_id', chatId).order('id', { ascending: false }).limit(20);
      const res = await bruno(token, {
        messages: (hist ?? []).reverse(), propose_writes: true,
        instructions: `Stai rispondendo su Telegram${isGroup ? ' in un gruppo del team: ogni messaggio utente inizia con [Nome] di chi scrive; rivolgiti a quella persona' : ''}. Le azioni che modificano dati o scrivono ai clienti non vengono eseguite subito: chiama comunque lo strumento, poi spiega in breve la proposta; il team la approverà con un pulsante. Non dire mai che un'azione è già fatta. Testo breve, niente tabelle markdown.`,
      });
      const out = await res.json().catch(() => ({}));
      await signOut(token);
      if (!res.ok) return say(chatId, `Errore: ${out.error ?? res.status}`);
      await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'assistant', content: String(out.text).slice(0, 8000) });
      const proposals = Array.isArray(out.proposals) ? out.proposals : [];
      if (!proposals.length) return say(chatId, out.text);
      const { data: p } = await admin.from('telegram_pending').insert({ chat_id: chatId, actions: proposals, summary: out.text }).select('id').single();
      const body = `${out.text}\n\n📋 Proposta da approvare:\n${proposals.map(describe).join('\n')}`.slice(0, 4000);
      await tg('sendMessage', { chat_id: chatId, text: body, reply_markup: { inline_keyboard: [[{ text: '✅ Approva', callback_data: `ok:${p!.id}` }, { text: '❌ Annulla', callback_data: `no:${p!.id}` }]] } });
    } catch (e) {
      console.error('telegram-bruno', e);
      await say(chatId, 'Si è verificato un errore, riprova tra poco.');
    }
  })();
  // @ts-ignore EdgeRuntime is provided by Supabase.
  EdgeRuntime.waitUntil(work);
  return json({ ok: true });
});
