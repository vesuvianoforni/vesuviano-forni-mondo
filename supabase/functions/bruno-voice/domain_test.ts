import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { assistantConfig, callAllowed, e164, FROM_NUMBER, nextCallStatus, Proposal, Qualification, verifyTelnyx, VOICE_LANGUAGE } from './domain.ts';

Deno.test('Bruno uses the specified UK caller number', () => assertEquals(FROM_NUMBER, '+447457416033'));
Deno.test('Telephone language is English', () => assertEquals(VOICE_LANGUAGE, 'en'));
Deno.test('Voice qualification preserves real facts and rejects unrelated writes', () => {
  assertEquals(Qualification.parse({ uso: 'pizzeria', alimentazione: 'gas' }), { uso: 'pizzeria', alimentazione: 'gas' });
  assertEquals(Qualification.safeParse({ status: 'qualificato' }).success, false);
});
Deno.test('Call proposal needs a documented customer permission basis', () => {
  const a = { lead_id: '3e429f10-5d54-4f5b-a8f7-00bf8e620ebb', objective: 'Qualificare progetto pizzeria', consent_basis: '', customer_timezone: 'Europe/London' };
  assertEquals(Proposal.safeParse(a).success, false);
  assertEquals(Proposal.safeParse({ ...a, consent_basis: 'Richiesta telefonica del cliente' }).success, true);
});
Deno.test('Voice capabilities exclude recordings', () => assertEquals(assistantConfig([]).telephony_settings.recording_settings.enabled, false));
Deno.test('Lost leads cannot be called', () => assertEquals(Boolean(callAllowed({ status: 'perso' }, 'Europe/London', new Date('2026-11-05T10:00:00Z'))), true));
Deno.test('Calling hours follow customer timezone', () => {
  assertEquals(callAllowed({}, 'Europe/London', new Date('2026-11-05T09:00:00Z')), null);
  assertEquals(Boolean(callAllowed({}, 'Europe/London', new Date('2026-11-05T20:00:00Z'))), true);
});
Deno.test('Terminal call events never regress', () => {
  assertEquals(nextCallStatus('completed', 'ringing'), 'completed');
  assertEquals(nextCallStatus('active', 'initiated'), 'active');
  assertEquals(nextCallStatus('dialing', 'answered'), 'active');
});
Deno.test('Destination requires international format', () => {
  assertEquals(e164('+44 7457 416033'), '+447457416033');
  let rejected = false; try { e164('3383156161'); } catch { rejected = true; }
  assertEquals(rejected, true);
});
Deno.test('Telnyx signature binds raw payload and expires after five minutes', async () => {
  const pair = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify']);
  const pub = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))));
  const raw = '{"action":"knowledge"}', time = '1793874600';
  const bytes = await crypto.subtle.sign('Ed25519', pair.privateKey, new TextEncoder().encode(`${time}|${raw}`));
  const sig = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  assertEquals(await verifyTelnyx(raw, sig, time, pub, Number(time) * 1000), true);
  assertEquals(await verifyTelnyx(raw + ' ', sig, time, pub, Number(time) * 1000), false);
  assertEquals(await verifyTelnyx(raw, sig, time, pub, Number(time) * 1000 + 301000), false);
});