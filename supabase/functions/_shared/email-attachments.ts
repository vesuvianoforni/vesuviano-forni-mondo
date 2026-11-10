import type { MessageStructureObject } from 'npm:imapflow@2.9.1';

export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export type EmailAttachment = { part: string; name: string; type: string; size: number; inline: boolean };

export function attachmentFilename(value: string) {
  return value.replace(/[\x00-\x1f\x7f/\\]/g, '_').trim().slice(0, 240) || 'Allegato';
}

/** BODYSTRUCTURE contains decoded parameters; never fetch MIME just to enumerate files. */
export function emailAttachments(structure?: MessageStructureObject): EmailAttachment[] {
  if (!structure) return [];
  const name = structure.dispositionParameters?.filename || structure.parameters?.name;
  const disposition = structure.disposition?.toLowerCase();
  if (structure.part && (disposition === 'attachment' || name || (!structure.childNodes?.length && /^(image|audio|video)\//i.test(structure.type)))) {
    return [{ part: structure.part, name: attachmentFilename(name || `Allegato ${structure.part}`), type: structure.type.toLowerCase(), size: structure.size || 0, inline: disposition === 'inline' }];
  }
  return (structure.childNodes || []).flatMap(node => emailAttachments(node));
}

export function sameEmailIdentity(saved: { imap_uid: number | null; uid_validity: string | null; message_id: string | null }, current: { uid: number; validity: string; messageId?: string | undefined }) {
  return saved.imap_uid === current.uid && saved.uid_validity === current.validity && (!saved.message_id || saved.message_id === current.messageId?.trim());
}

export function attachmentPreviewType(type: string) {
  return /^(application\/pdf|image\/(png|jpeg|gif|webp|avif)|video\/(mp4|webm)|audio\/(mpeg|mp4|ogg|wav|webm))$/.test(type) ? type : 'application/octet-stream';
}