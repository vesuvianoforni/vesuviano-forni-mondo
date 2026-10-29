import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { selectEmailSignature, renderMailboxEmail, type EmailSignature } from '../_shared/email-layout.ts';
import { SignatureSchema } from '../_shared/email-signatures.ts';
import { composeEmail } from '../_shared/email-transport.ts';
import { simpleParser } from 'npm:mailparser@3.9.3';
import { Buffer } from 'node:buffer';

const first: EmailSignature = { id: 'cbad53c6-b078-4cd8-af57-fdab6e582c01', name: 'Gennaro Caglione', role: 'Sales & Export Manager', company: 'Vesuviano Forni', phone: '+39 081 1923 1684', whatsapp: '+39 350 928 6941', email: 'info@vesuvianoforni.com', website: 'https://vesuvianoforni.com', address: '', is_default: true };
const other: EmailSignature = { ...first, id: '6ac1ce57-eed3-4cbf-a570-d9b5ab85d081', is_default: false };
Deno.test('Email selects the mailbox default signature when no choice is supplied', () => assertEquals(selectEmailSignature([other, first])?.id, first.id));
Deno.test('An explicit signature choice overrides the mailbox default', () => assertEquals(selectEmailSignature([first, other], other.id)?.id, other.id));
Deno.test('Without signature does not silently apply the default', () => assertEquals(selectEmailSignature([first], null), null));
Deno.test('A removed signature blocks preparation instead of impersonating another sender', () => { assertThrows(() => selectEmailSignature([first], other.id), Error, 'MAIL_SIGNATURE_INVALID'); });
Deno.test('No default signature does not pick an arbitrary employee', () => assertEquals(selectEmailSignature([other]), null));
Deno.test('Signature contact URLs must use HTTPS', () => assertEquals(SignatureSchema.safeParse({ ...first, website: 'javascript:alert(1)' }).success, false));
Deno.test('Empty optional postal address is accepted', () => assertEquals(SignatureSchema.safeParse(first).success, true));
Deno.test('Rendered MIME preserves both alternatives and reply identity', async () => {
  const rendered = renderMailboxEmail('Messaggio di verifica\nSeconda riga', first);
  const messageId = '<layout-check@vesuvianoforni.com>';
  const mime = await composeEmail('test@example.com', 'Verifica MIME', rendered.text, messageId, new Date('2026-10-29T08:46:00Z'), '<previous@example.com>', rendered.html);
  const parsed = await simpleParser(Buffer.from(mime, 'base64'));
  assertEquals(parsed.text?.trim(), rendered.text);
  assertEquals(parsed.html, rendered.html);
  assertEquals(parsed.messageId, messageId);
  assertEquals(parsed.inReplyTo, '<previous@example.com>');
  assertEquals(parsed.from?.value[0]?.address, 'info@vesuvianoforni.com');
});