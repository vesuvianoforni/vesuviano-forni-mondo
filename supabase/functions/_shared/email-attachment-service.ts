import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { Buffer } from 'node:buffer';
import { imapClient, closeIMAP } from './email-transport.ts';
import { emailAttachments, MAX_ATTACHMENT_BYTES, sameEmailIdentity } from './email-attachments.ts';

export async function readEmailAttachments(admin: SupabaseClient, item: { id: string; mailbox_id: string; folder: string | null; imap_uid: number | null; uid_validity: string | null; message_id: string | null }, part?: string) {
  if (!item.folder || !item.imap_uid || !item.uid_validity) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
  const token = crypto.randomUUID();
  const { data: acquired, error: acquireError } = await admin.rpc('acquire_email_mailbox', { _id: item.mailbox_id, _token: token });
  if (acquireError || !acquired) throw new Error('MAILBOX_BUSY');
  const client = imapClient();
  const deadline = setTimeout(() => client.close(), 90000);
  try {
    await client.connect();
    const lock = await client.getMailboxLock(item.folder);
    try {
      const validity = client.mailbox ? String(client.mailbox.uidValidity) : '';
      if (validity !== item.uid_validity) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
      const entry = await client.fetchOne(item.imap_uid, { uid: true, envelope: true, bodyStructure: true }, { uid: true });
      if (!entry || !sameEmailIdentity(item, { uid: entry.uid, validity, messageId: entry.envelope?.messageId })) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
      const attachments = emailAttachments(entry.bodyStructure);
      if (!part) {
        const { error } = await admin.from('email_items').update({ attachment_names: attachments.map(file => file.name) }).eq('id', item.id).eq('mailbox_id', item.mailbox_id);
        if (error) throw new Error('MAIL_DB_FAILED');
        return { attachments };
      }
      // The client selects only a server-enumerated part, never a folder, UID or MIME section.
      const attachment = attachments.find(file => file.part === part);
      if (!attachment) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
      const downloaded = await client.download(item.imap_uid, attachment.part, { uid: true, maxBytes: MAX_ATTACHMENT_BYTES + 1 });
      if (!downloaded.content) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const chunk of downloaded.content) {
        bytes += chunk.length;
        if (bytes > MAX_ATTACHMENT_BYTES) { downloaded.content.destroy(); throw new Error('MAIL_ATTACHMENT_TOO_LARGE'); }
        chunks.push(Buffer.from(chunk));
      }
      if (!bytes) throw new Error('MAIL_ATTACHMENT_UNAVAILABLE');
      return { attachment, content: Buffer.concat(chunks, bytes) };
    } finally { lock.release(); }
  } finally {
    clearTimeout(deadline);
    await closeIMAP(client);
    const { error } = await admin.from('email_mailboxes').update({ lease_token: null, lease_until: null }).eq('id', item.mailbox_id).eq('lease_token', token);
    if (error) console.error('Email attachment lease release failed', 'MAIL_DB_FAILED');
  }
}