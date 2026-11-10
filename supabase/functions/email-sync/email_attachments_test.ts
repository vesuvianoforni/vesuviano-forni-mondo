import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { emailAttachments, attachmentFilename, attachmentPreviewType, sameEmailIdentity } from '../_shared/email-attachments.ts';

Deno.test('Enumerate real attachments and inline images without mistaking text for files', () => {
  assertEquals(emailAttachments({ type: 'multipart/mixed', childNodes: [
    { type: 'text/plain', part: '1' },
    { type: 'application/pdf', part: '2', size: 1234, disposition: 'attachment', dispositionParameters: { filename: 'Offerta.pdf' } },
    { type: 'multipart/related', childNodes: [{ type: 'image/png', part: '3.2', disposition: 'inline', parameters: { name: 'Logo.png' } }] },
  ] }), [
    { part: '2', name: 'Offerta.pdf', type: 'application/pdf', size: 1234, inline: false },
    { part: '3.2', name: 'Logo.png', type: 'image/png', size: 0, inline: true },
  ]);
});
Deno.test('Attached emails are one file, not recursively exposed parts', () => {
  assertEquals(emailAttachments({ type: 'message/rfc822', part: '2', disposition: 'attachment', childNodes: [{ type: 'image/png', part: '2.1' }] }).map(file => file.part), ['2']);
});
Deno.test('Reject stale UIDVALIDITY and wrong message identity', () => {
  const saved = { imap_uid: 391, uid_validity: '1758192543', message_id: '<mail@example.com>' };
  assertEquals(sameEmailIdentity(saved, { uid: 391, validity: '1758192543', messageId: '<mail@example.com>' }), true);
  assertEquals(sameEmailIdentity(saved, { uid: 391, validity: 'other', messageId: '<mail@example.com>' }), false);
  assertEquals(sameEmailIdentity(saved, { uid: 392, validity: '1758192543', messageId: '<mail@example.com>' }), false);
  assertEquals(sameEmailIdentity(saved, { uid: 391, validity: '1758192543', messageId: '<other@example.com>' }), false);
});
Deno.test('HTML and SVG attachments cannot execute in previews', () => {
  assertEquals(attachmentPreviewType('text/html'), 'application/octet-stream');
  assertEquals(attachmentPreviewType('image/svg+xml'), 'application/octet-stream');
  assertEquals(attachmentPreviewType('application/pdf'), 'application/pdf');
});
Deno.test('Attachment filenames do not include header controls or path separators', () => {
  assertEquals(attachmentFilename('cartella/file\r\n.pdf'), 'cartella_file__.pdf');
});