import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { withCompanyEmailCopy, companySMTPEnvelope } from '../_shared/email-delivery-policy.ts';
import { composeEmail, rawMIME } from '../_shared/email-transport.ts';
import { simpleParser } from 'npm:mailparser@3.9.3';

Deno.test('Every customer email includes info@vesuvianoforni.com in BCC', () => {
  const email = withCompanyEmailCopy({ to: ['customer@example.com'], cc: ['team@example.com'], bcc: ['archive@example.com'] });
  assertEquals(email.bcc, ['archive@example.com', 'info@vesuvianoforni.com']);
  assertEquals(email.to, ['customer@example.com']);
  assertEquals(email.cc, ['team@example.com']);
});
Deno.test('Reply-To remains info@vesuvianoforni.com independently of the sender', () => {
  assertEquals(withCompanyEmailCopy({ from: 'ciao@vesuviano-forni.com', to: 'customer@example.com', reply_to: 'old@example.com' }).reply_to, 'info@vesuvianoforni.com');
});
Deno.test('Already addressed company notifications do not get a duplicate copy', () => {
  assertEquals(withCompanyEmailCopy({ to: ['Info <INFO@vesuvianoforni.com>'] }).bcc, []);
  assertEquals(withCompanyEmailCopy({ to: 'customer@example.com', cc: 'info@vesuvianoforni.com' }).bcc, []);
  assertEquals(withCompanyEmailCopy({ to: 'customer@example.com', bcc: ['INFO@vesuvianoforni.com'] }).bcc, ['INFO@vesuvianoforni.com']);
});
Deno.test('SMTP sends the company copy without changing the dedicated sender', () => {
  assertEquals(companySMTPEnvelope('ciao@vesuviano-forni.com', 'customer@example.com'), { from: 'ciao@vesuviano-forni.com', to: ['customer@example.com', 'info@vesuvianoforni.com'] });
});
Deno.test('MIME keeps BCC private and stores the corporate Reply-To', async () => {
  const raw = rawMIME(await composeEmail('customer@example.com', 'Verification', 'Private body', '<copy-check@example.com>', new Date('2026-11-12T08:27:00Z'), undefined, undefined, 'ciao@vesuviano-forni.com'));
  const parsed = await simpleParser(raw);
  assertEquals(parsed.replyTo?.value[0]?.address, 'info@vesuvianoforni.com');
  assertEquals(parsed.to && !Array.isArray(parsed.to) ? parsed.to.value.map(value => value.address) : [], ['customer@example.com']);
  assertEquals(parsed.headers.has('bcc'), false);
  assertEquals(parsed.from?.value[0]?.address, 'ciao@vesuviano-forni.com');
  assertEquals(parsed.messageId, '<copy-check@example.com>');
});