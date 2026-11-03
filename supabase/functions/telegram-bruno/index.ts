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
  const msg = update.message;
  if (typeof update.update_id !== 'number' || !msg?.chat?.id || !['private','group','supergroup'].includes(msg.chat.type) || typeof msg.text !== 'string') return json({ ok: true });
  const { error: dup } = await admin.from('telegram_updates').insert({ update_id: update.update_id });
  if (dup) return json({ ok: true, duplicate: true });
  const chatId: number = msg.chat.id;
  const isGroup = msg.chat.type !== 'private';
  const raw = msg.text.replace(new RegExp(`@${BOT_USERNAME}`, 'gi'), '').trim();
  const who = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.from?.username || 'utente';
  const text = raw.slice(0, 4000);

  const work = (async () => {
    try {
      const start = text.match(/^\/(?:start|collega)\s+([A-Z0-9]{6})$/i);
      if (start) {
        const { data: row } = await admin.from('telegram_links').select('user_id,code_expires_at').eq('link_code', start[1].toUpperCase()).maybeSingle();
        if (!row || new Date(row.code_expires_at) < new Date()) return say(chatId, 'Codice non valido o scaduto. Generane uno nuovo dall\'ERP (Bruno → Telegram).');
        await admin.from('telegram_links').update({ chat_id: null }).eq('chat_id', chatId);
        await admin.from('telegram_links').update({ chat_id: chatId, telegram_username: isGroup ? (msg.chat.title ?? 'gruppo') : (msg.from?.username ?? null), link_code: null, code_expires_at: null, linked_at: new Date().toISOString() }).eq('user_id', row.user_id);
        return say(chatId, 'Collegato ✅ Sono Bruno.' + (isGroup ? ' In questo gruppo chiunque può darmi indicazioni: scrivi @Erp_vesuviano_bot seguito dalla richiesta, oppure rispondi a un mio messaggio.' : '') + ' Scrivimi cosa ti serve: clienti, prossime attività, offerte, ordini, messaggi ai clienti.');
      }
      const { data: link } = await admin.from('telegram_links').select('user_id').eq('chat_id', chatId).maybeSingle();
      if (!link) return isGroup ? undefined : say(chatId, 'Questo account Telegram non è collegato all\'ERP Vesuviano. Apri ERP → Bruno → Telegram e premi «Collega Telegram».');
      const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', link.user_id);
      if (!roles?.some((r) => r.role === 'admin' || r.role === 'commerciale')) return say(chatId, 'Accesso non più autorizzato.');
      if (text === '/reset') { await admin.from('telegram_bruno_messages').delete().eq('chat_id', chatId); return say(chatId, 'Conversazione azzerata.'); }

      // Real session for the linked user, so every existing role check and RLS still applies.
      const { data: au } = await admin.auth.admin.getUserById(link.user_id);
      const { data: gl, error: ge } = await admin.auth.admin.generateLink({ type: 'magiclink', email: au.user!.email! });
      if (ge) throw ge;
      const { data: s, error: se } = await createClient(url, anon).auth.verifyOtp({ token_hash: gl.properties.hashed_token, type: 'magiclink' });
      if (se || !s.session) throw se ?? new Error('session');

      await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
      await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'user', content: isGroup ? `[${who}] ${text}` : text });
      const { data: hist } = await admin.from('telegram_bruno_messages').select('role,content').eq('chat_id', chatId).order('id', { ascending: false }).limit(20);
      const messages = (hist ?? []).reverse();
      const res = await fetch(`${url}/functions/v1/bruno-chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${s.session.access_token}`, apikey: anon, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, instructions: isGroup ? 'Stai rispondendo in un gruppo Telegram del team: ogni messaggio utente inizia con [Nome] di chi scrive; rivolgiti a quella persona. Testo breve, niente tabelle markdown.' : 'Stai rispondendo su Telegram: testo breve, niente tabelle markdown.' }),
      });
      const answer = res.ok ? await res.text() : `Errore: ${(await res.json().catch(() => ({}))).error ?? res.status}`;
      if (res.ok) await admin.from('telegram_bruno_messages').insert({ chat_id: chatId, role: 'assistant', content: answer.slice(0, 8000) });
      await say(chatId, answer);
      await createClient(url, anon, { global: { headers: { Authorization: `Bearer ${s.session.access_token}` } } }).auth.signOut().catch(() => {});
    } catch (e) {
      console.error('telegram-bruno', e);
      await say(chatId, 'Si è verificato un errore, riprova tra poco.');
    }
  })();
  // @ts-ignore EdgeRuntime is provided by Supabase.
  EdgeRuntime.waitUntil(work);
  return json({ ok: true });
});
