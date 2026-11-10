import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type MailAttachment = { part: string; name: string; type: string; size: number; inline: boolean };
export type MailAttachmentSource = { itemId: string; messageId?: never } | { messageId: string; itemId?: never };

export function mailAttachmentNames(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((name): name is string => typeof name === 'string' && Boolean(name.trim())) : [];
}
export function mailAttachmentType(type: string) {
  return /^(application\/pdf|image\/(png|jpeg|gif|webp|avif)|video\/(mp4|webm)|audio\/(mpeg|mp4|ogg|wav|webm))$/.test(type) ? type : 'application/octet-stream';
}
export function mailAttachmentSize(bytes: number) {
  return bytes > 0 ? bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toLocaleString('it-IT', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB` : '';
}
const errors: Record<string, string> = {
  MAIL_ATTACHMENT_UNAVAILABLE: 'Allegato non più disponibile nella casella originale.',
  MAIL_ATTACHMENT_TOO_LARGE: 'L’allegato supera 25 MB. Aprilo dalla webmail.',
  MAILBOX_BUSY: 'La casella sta sincronizzando o inviando. Riprova tra poco.',
  MAIL_AUTH_FAILED: 'La connessione alla casella email non è disponibile.',
  MAIL_TIMEOUT: 'La casella non ha risposto in tempo. Riprova.',
};
async function attachmentRequest(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('email-sync', { body });
  if (error) {
    let code = '';
    if (error instanceof FunctionsHttpError) { try { code = (await error.context.json()).error || ''; } catch { /* no private server details */ } }
    throw new Error(errors[code] || 'Impossibile recuperare gli allegati. Riprova.');
  }
  return data;
}
export async function listMailAttachments(source: MailAttachmentSource): Promise<{ item_id: string | null; attachments: MailAttachment[] }> {
  return attachmentRequest({ action: 'attachments', ...(source.itemId ? { item_id: source.itemId } : { crm_message_id: source.messageId }) });
}
export async function fetchMailAttachment(itemId: string, file: MailAttachment): Promise<Blob> {
  const blob = await attachmentRequest({ action: 'attachment', item_id: itemId, part: file.part });
  if (!(blob instanceof Blob) || !blob.size) throw new Error('Allegato non disponibile.');
  return new Blob([blob], { type: mailAttachmentType(file.type) });
}
/** Invoke synchronously from the ready-state click, preserving iOS user activation. */
export async function saveMailAttachment(blob: Blob, name: string) {
  const file = new File([blob], name, { type: blob.type });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}