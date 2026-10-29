import { ImapFlow } from 'npm:imapflow@2.9.1';
import nodemailer from 'npm:nodemailer@10.3.0';
import { Buffer } from 'node:buffer';
import { discoverSent } from './email-rules.ts';

export const MAIL_ADDRESS = 'info@vesuvianoforni.com';
export function mailConfig() {
  const keys = ['VESUVIANO_IMAP_HOST','VESUVIANO_IMAP_PORT','VESUVIANO_IMAP_PASSWORD','VESUVIANO_SMTP_HOST','VESUVIANO_SMTP_PORT','VESUVIANO_SMTP_PASSWORD'];
  const values = keys.map(k => Deno.env.get(k));
  if (values.some(v => !v)) throw new Error('MAIL_CONFIG_MISSING');
  // Hosted Supabase blocks ports 25 and 587. Never silently downgrade TLS.
  if (Number(values[4]) !== 465) throw new Error('SMTP_PORT_UNSUPPORTED');
  if (Number(values[1]) !== 993) throw new Error('IMAP_PORT_UNSUPPORTED');
  return { imapHost: values[0] as string, imapPass: values[2] as string, smtpHost: values[3] as string, smtpPass: values[5] as string };
}
export function imapClient() {
  const c = mailConfig();
  const client = new ImapFlow({ host: c.imapHost, port: 993, secure: true,
    auth: { user: MAIL_ADDRESS, pass: c.imapPass }, tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    logger: false, connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 20000,
    disableAutoIdle: true, emitLogs: false });
  client.on('error', () => { /* sanitized by caller; never log protocol or credentials */ });
  return client;
}
export function smtpClient() {
  const c = mailConfig();
  return nodemailer.createTransport({ host: c.smtpHost, port: 465, secure: true,
    auth: { user: MAIL_ADDRESS, pass: c.smtpPass }, tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    pool: false, logger: false, debug: false, connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true });
}
export async function composeEmail(recipient: string, subject: string, text: string, messageId: string, date: Date, replyId?: string, html?: string) {
  const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows', disableFileAccess: true, disableUrlAccess: true });
  const built = await composer.sendMail({ from: { name: 'Vesuviano Forni', address: MAIL_ADDRESS }, to: recipient,
    envelope: { from: MAIL_ADDRESS, to: [recipient] }, subject, text, ...(html ? { html } : {}), messageId, date,
    ...(replyId ? { inReplyTo: replyId, references: [replyId] } : {}) });
  return Buffer.from(built.message).toString('base64');
}
export const rawMIME = (mime: string) => Buffer.from(mime, 'base64');
export async function findSent(client: ImapFlow, saved?: string | null) {
  return discoverSent(await client.list(), saved);
}
export async function hasExactMessage(client: ImapFlow, folder: string, messageId: string) {
  const lock = await client.getMailboxLock(folder);
  try {
    const hits = await client.search({ header: { 'message-id': messageId } }, { uid: true });
    if (!Array.isArray(hits)) throw new Error('MAIL_SEARCH_FAILED');
    if (!hits.length) return false;
    const messages = await client.fetchAll(hits, { envelope: true }, { uid: true });
    return messages.some(m => m.envelope?.messageId?.trim() === messageId.trim());
  } finally { lock.release(); }
}
export async function closeIMAP(client: ImapFlow) {
  const timeout=setTimeout(()=>client.close(),3000);
  try { await client.logout(); } catch { client.close(); } finally {clearTimeout(timeout);client.close();}
}