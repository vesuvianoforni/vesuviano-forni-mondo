import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { emailText, headerReferences } from './email-content.ts';
import { canSubmitSMTP, canAppendSent, chooseLead, nextUIDBatch, safeMailError } from './email-rules.ts';
import { imapClient, smtpClient, composeEmail, rawMIME, findSent, hasExactMessage, closeIMAP, MAIL_ADDRESS } from './email-transport.ts';

const checked = <T>(result: { data: T; error: unknown }): T => { if (result.error) throw new Error('MAIL_DB_FAILED'); return result.data; };
export async function mailbox(admin: SupabaseClient) {
  const row = checked(await admin.from('email_mailboxes').select('*').eq('address', MAIL_ADDRESS).single());
  if (!row) throw new Error('MAIL_CONFIG_MISSING');
  return row;
}
async function acquire(admin: SupabaseClient, id: string) {
  const token = crypto.randomUUID();
  const ok = checked(await admin.rpc('acquire_email_mailbox', { _id: id, _token: token }));
  if (!ok) throw new Error('MAILBOX_BUSY');
  return token;
}
async function release(admin: SupabaseClient, id: string, token: string) {
  checked(await admin.from('email_mailboxes').update({ lease_token: null, lease_until: null }).eq('id', id).eq('lease_token', token));
}
async function projectOutgoing(admin: SupabaseClient, row: any) {
  const external = `imap:${row.mailbox_id}:${row.message_id}`;
  const old = checked(await admin.from('crm_messages').select('*').eq('channel','email').eq('external_id', external).maybeSingle());
  if (old) return old;
  const result = await admin.from('crm_messages').insert({ lead_id: row.lead_id, channel: 'email', direction: 'outbound',
    sender: MAIL_ADDRESS, subject: row.subject, body: row.body, status: 'sent', external_id: external,
    created_by: row.created_by, created_at: row.smtp_accepted_at || row.created_at,
    metadata: { message_id: row.message_id, mailbox_id: row.mailbox_id, sent_copy: row.copy_status } }).select().single();
  if (result.error?.code === '23505') return checked(await admin.from('crm_messages').select('*').eq('channel','email').eq('external_id', external).single());
  return checked(result);
}

async function appendCopy(admin: SupabaseClient, row: any, client: ReturnType<typeof imapClient>, sentFolder: string) {
  if (!canAppendSent(row.smtp_status, row.copy_status)) return;
  if (await hasExactMessage(client, sentFolder, row.message_id)) {
    checked(await admin.from('email_outbox').update({ copy_status: 'found', last_error: null }).eq('id', row.id));
    return;
  }
  // An interrupted APPEND cannot safely be repeated. Reconcile only; never duplicate a possibly accepted literal.
  if (row.append_attempted_at) {
    checked(await admin.from('email_outbox').update({ copy_status: 'unknown', last_error: 'SENT_COPY_UNKNOWN' }).eq('id', row.id));
    return;
  }
  checked(await admin.from('email_outbox').update({ append_attempted_at: new Date().toISOString(), copy_status: 'unknown' }).eq('id', row.id));
  const appended = await client.append(sentFolder, rawMIME(row.mime), ['\\Seen'], new Date(row.smtp_accepted_at || row.created_at));
  if (!appended) throw new Error('SENT_COPY_UNKNOWN');
  checked(await admin.from('email_outbox').update({ copy_status: 'appended', last_error: null }).eq('id', row.id));
}

export async function sendMailboxEmail(admin: SupabaseClient, input: { lead_id: string; recipient: string; subject: string; body: string; idempotency_key: string; created_by: string }) {
  const box = await mailbox(admin);
  if (!box.enabled) throw new Error('MAILBOX_DISABLED');
  let row = checked(await admin.from('email_outbox').select('*').eq('mailbox_id', box.id).eq('idempotency_key', input.idempotency_key).maybeSingle());
  if (row && (row.lead_id !== input.lead_id || row.recipient !== input.recipient || row.body !== input.body || row.subject !== input.subject)) throw new Error('MAIL_IDEMPOTENCY_CONFLICT');
  if (!row) {
    const messageId = `<${crypto.randomUUID()}@vesuvianoforni.com>`;
    const date = new Date();
    const previous = checked(await admin.from('email_items').select('message_id').eq('lead_id', input.lead_id).eq('mailbox_id', box.id).order('sent_at', { ascending: false }).limit(1));
    const mime = await composeEmail(input.recipient, input.subject, input.body, messageId, date, previous?.[0]?.message_id || undefined);
    const inserted = await admin.from('email_outbox').insert({ ...input, mailbox_id: box.id, message_id: messageId, mime }).select().single();
    if (inserted.error?.code === '23505') row = checked(await admin.from('email_outbox').select('*').eq('mailbox_id', box.id).eq('idempotency_key', input.idempotency_key).single());
    else row = checked(inserted);
  }
  const lease = await acquire(admin, box.id);
  const smtp = smtpClient();
  const client = imapClient();
  let smtpStarted = false;
  try {
    // Re-read after acquiring the lock; stale callers may never submit the same operation twice.
    row = checked(await admin.from('email_outbox').select('*').eq('id', row.id).single());
    if (row.lead_id !== input.lead_id || row.body !== input.body || row.recipient !== input.recipient || row.subject !== input.subject) throw new Error('MAIL_IDEMPOTENCY_CONFLICT');
    if (row.smtp_status === 'sending') {
      checked(await admin.from('email_outbox').update({ smtp_status: 'unknown', last_error: 'SMTP_UNKNOWN' }).eq('id', row.id));
      throw new Error('SMTP_UNKNOWN');
    }
    if (canSubmitSMTP(row.smtp_status)) {
      // Verify both connections and discover Sent before risking a delivery.
      await client.connect();
      const sent = await findSent(client, box.sent_folder);
      checked(await admin.from('email_mailboxes').update({ sent_folder: sent }).eq('id', box.id));
      await smtp.verify();
      checked(await admin.from('email_outbox').update({ smtp_status: 'sending' }).eq('id', row.id));
      smtpStarted = true;
      const result = await smtp.sendMail({ envelope: { from: MAIL_ADDRESS, to: [row.recipient] }, raw: rawMIME(row.mime) });
      if (!result.accepted?.some((a: string) => String(a).toLowerCase() === row.recipient.toLowerCase()) || result.rejected?.length) throw new Error('SMTP_UNKNOWN');
      const acceptedAt = new Date().toISOString();
      checked(await admin.from('email_outbox').update({ smtp_status: 'accepted', smtp_accepted_at: acceptedAt, last_error: null }).eq('id', row.id));
      row = { ...row, smtp_status: 'accepted', smtp_accepted_at: acceptedAt };
    }
    if (row.smtp_status !== 'accepted') throw new Error('SMTP_UNKNOWN');
    const msg = await projectOutgoing(admin, row);
    checked(await admin.from('email_outbox').update({ crm_message_id: msg.id }).eq('id', row.id));
    try {
      if (!client.usable) await client.connect();
      const sent = await findSent(client, box.sent_folder);
      await appendCopy(admin, row, client, sent);
    } catch (e) {
      const current = checked(await admin.from('email_outbox').select('append_attempted_at').eq('id', row.id).single());
      checked(await admin.from('email_outbox').update({ copy_status: current?.append_attempted_at ? 'unknown' : 'failed', last_error: safeMailError(e), copy_next_attempt_at: new Date(Date.now() + 15 * 60000).toISOString() }).eq('id', row.id));
    }
    const final = checked(await admin.from('email_outbox').select('smtp_status,copy_status').eq('id', row.id).single());
    return { message: msg, ...final };
  } catch (e) {
    // Loss of final SMTP acknowledgement is ambiguous: never automatically send again.
    if (smtpStarted && row.smtp_status !== 'accepted') {
      const response = (e as { responseCode?: number }).responseCode;
      checked(await admin.from('email_outbox').update({ smtp_status: response && response >= 400 ? 'rejected' : 'unknown', last_error: safeMailError(e) }).eq('id', row.id).neq('smtp_status', 'accepted'));
    }
    throw e;
  } finally {
    smtp.close(); await closeIMAP(client); await release(admin, box.id, lease);
  }
}

async function linkItem(admin: SupabaseClient, item: any) {
  if (item.crm_message_id) return false;
  const addresses: string[] = item.direction === 'inbound' ? [item.sender] : item.recipients;
  const ids: string[] = [];
  for (const address of addresses.filter(a => a.toLowerCase() !== MAIL_ADDRESS)) {
    // Email validation before ilike prevents query wildcard broadening.
    if (!/^[^\s%_*<>]+@[^\s%_*<>]+\.[^\s%_*<>]+$/.test(address)) continue;
    const candidates = checked(await admin.from('leads').select('id,email').ilike('email', address).eq('pipeline', 'Vesuviano').limit(3));
    ids.push(...(candidates || []).filter((l: any) => l.email?.trim().toLowerCase() === address.toLowerCase()).map((l: any) => l.id));
  }
  let threadLead: string | null = null;
  const refs = [item.in_reply_to, ...(item.reference_ids || [])].filter(Boolean).slice(-20);
  if (refs.length) {
    const related = checked(await admin.from('email_items').select('lead_id').eq('mailbox_id', item.mailbox_id).in('message_id', refs).not('lead_id','is',null).limit(2));
    const relatedIds = [...new Set((related || []).map((r: any) => r.lead_id))];
    if (relatedIds.length === 1 && ids.includes(String(relatedIds[0]))) threadLead = String(relatedIds[0]);
  }
  const leadId = chooseLead(ids, threadLead);
  if (!leadId) return false; // no arbitrary client creation or matching ambiguous email addresses
  const external = `imap:${item.mailbox_id}:${item.message_key}`;
  let msg = checked(await admin.from('crm_messages').select('id').eq('channel', 'email').eq('external_id', external).maybeSingle());
  if (!msg) {
    const inserted = await admin.from('crm_messages').insert({ lead_id: leadId, channel: 'email', direction: item.direction,
      sender: item.sender, subject: item.subject, body: item.body || '(Messaggio senza testo)', status: item.direction === 'inbound' ? 'delivered' : 'sent',
      created_at: item.sent_at, external_id: external, metadata: { message_id: item.message_id, in_reply_to: item.in_reply_to, reference_ids: item.reference_ids, attachment_names: item.attachment_names, mailbox_id: item.mailbox_id } }).select('id').single();
    if (inserted.error?.code === '23505') msg = checked(await admin.from('crm_messages').select('id').eq('channel','email').eq('external_id', external).single());
    else msg = checked(inserted);
  }
  checked(await admin.from('email_items').update({ lead_id: leadId, crm_message_id: msg.id }).eq('id', item.id));
  return true;
}

export async function syncMailbox(admin: SupabaseClient, runId: string) {
  const box = await mailbox(admin);
  if (!box.enabled) return;
  let lease: string;
  try { lease = await acquire(admin, box.id); } catch { return; }
  const client = imapClient();
  const started = Date.now();
  let processed = 0, linked = 0;
  try {
    const run = checked(await admin.from('email_sync_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId).eq('mailbox_id', box.id).eq('status','queued').select('id').maybeSingle());
    if (!run) return;
    await client.connect();
    const sent = await findSent(client, box.sent_folder);
    checked(await admin.from('email_mailboxes').update({ sent_folder: sent }).eq('id',box.id));
    // Repairs are copy-only. Accepted SMTP is never re-run, even if the process previously crashed.
    const accepted = checked(await admin.from('email_outbox').select('*').eq('mailbox_id',box.id).eq('smtp_status','accepted').order('created_at').limit(100));
    for (const row of (accepted || []).filter((r: any) => !r.crm_message_id || !['found','appended'].includes(r.copy_status)).slice(0,5)) {
      const msg = await projectOutgoing(admin, row);
      checked(await admin.from('email_outbox').update({ crm_message_id: msg.id }).eq('id',row.id));
      try { await appendCopy(admin, row, client, sent); }
      catch (e) { checked(await admin.from('email_outbox').update({ last_error: safeMailError(e) }).eq('id',row.id)); }
    }
    for (const folder of [...new Set(['INBOX', sent])]) {
      if (Date.now() - started > 75000) break;
      const lock = await client.getMailboxLock(folder);
      try {
        const mb = client.mailbox;
        if (!mb) throw new Error('MAIL_OPERATION_FAILED');
        const validity = String(mb.uidValidity);
        const saved = checked(await admin.from('email_folder_cursors').select('*').eq('mailbox_id',box.id).eq('folder',folder).maybeSingle());
        const range = nextUIDBatch(Number(saved?.last_uid || 0), saved?.uid_validity, validity, Number(mb.uidNext), Number(mb.uidNext));
        if (range.start > range.end) continue;
        const uids = await client.search({ uid: `${range.start}:${range.end}` }, { uid: true });
        if (!Array.isArray(uids)) throw new Error('MAIL_SEARCH_FAILED');
        const selected = uids.filter(uid => uid > range.cursor).sort((a,b)=>a-b).slice(0,5);
        const entries = selected.length ? await client.fetchAll(selected, { uid: true, bodyStructure: true, envelope: true, internalDate: true, headers: ['References'] }, { uid: true }) : [];
        for (const entry of entries) {
          const envelope = entry.envelope;
          const messageId = envelope?.messageId?.trim() || null;
          const key = messageId || `${folder}:${validity}:${entry.uid}`;
          const old = checked(await admin.from('email_items').select('*').eq('mailbox_id',box.id).eq('message_key',key).maybeSingle());
          let item = old;
          if (!item) {
            const recipients = [...(envelope?.to || []), ...(envelope?.cc || [])].map(a => a.address?.toLowerCase()).filter(Boolean);
            const sender = envelope?.from?.[0]?.address?.toLowerCase() || '';
            const outbound = sender === MAIL_ADDRESS || folder === sent;
            const outgoing = outbound && messageId ? checked(await admin.from('email_outbox').select('lead_id,crm_message_id').eq('mailbox_id',box.id).eq('message_id',messageId).maybeSingle()) : null;
            item = checked(await admin.from('email_items').upsert({ mailbox_id: box.id, message_key: key, message_id: messageId,
              in_reply_to: envelope?.inReplyTo || null, reference_ids: headerReferences(entry.headers),
              sender, recipients, subject: envelope?.subject || '', body: await emailText(client,entry),
              direction: outbound ? 'outbound' : 'inbound', sent_at: new Date(envelope?.date || entry.internalDate || Date.now()).toISOString(),
              attachment_names: [],
              lead_id: outgoing?.lead_id || null, crm_message_id: outgoing?.crm_message_id || null,
            }, { onConflict: 'mailbox_id,message_key' }).select().single());
          }
          if (await linkItem(admin, item)) linked++;
          processed++;
        }
        // Cursor advances only after every row in this bounded range persisted successfully.
        checked(await admin.from('email_folder_cursors').upsert({ mailbox_id: box.id, folder, uid_validity: validity, last_uid: selected.length ? selected[selected.length-1] : range.end }, { onConflict: 'mailbox_id,folder' }));
      } finally { lock.release(); }
    }
    const unlinked = checked(await admin.from('email_items').select('*').eq('mailbox_id',box.id).is('crm_message_id',null).order('created_at', { ascending: false }).limit(25));
    for (const item of unlinked || []) if (await linkItem(admin,item)) linked++;
    const finished = new Date().toISOString();
    checked(await admin.from('email_mailboxes').update({ last_sync_at: finished, last_error: null }).eq('id',box.id));
    checked(await admin.from('email_sync_runs').update({ status: 'success', processed, linked, finished_at: finished }).eq('id',runId));
  } catch (e) {
    const code = safeMailError(e);
    console.error('Email sync failed', code, runId); // no hosts, credentials, MIME, recipients or provider responses
    await admin.from('email_mailboxes').update({ last_error: code }).eq('id',box.id);
    await admin.from('email_sync_runs').update({ status: 'failed', error_code: code, processed, linked, finished_at: new Date().toISOString() }).eq('id',runId);
  } finally { await closeIMAP(client); await release(admin, box.id, lease); }
}