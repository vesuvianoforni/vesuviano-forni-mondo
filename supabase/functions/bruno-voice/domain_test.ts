import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { assistantConfig, callAllowed, e164, FROM_NUMBER, nextCallStatus, Proposal, Qualification, verifyTelnyx, VOICE_LANGUAGE } from './domain.ts';

Deno.test('Bruno uses the specified UK caller number', () => assertEquals(FROM_NUMBER, '+447457416033'));
Deno.test('Telephone language is English', () => assertEquals(VOICE_LANGUAGE, 'en'));
Deno.test('Voice qualification preserves real facts and rejects unrelated writes', () => {
  assertEquals(Qualification.parse({ uso: 'pizzeria', alimentazione: 'gas' }), { uso: 'pizzeria', alimentazione: 'gas' });
  assertEquals(Qualification.safeParse({ status: 'qualificato' }).success, false);
});
Deno.test('Call proposal uses a call type and accepts team instructions without a documented consent field', () => {
  const a = { lead_id: '3e429f10-5d54-4f5b-a8f7-00bf8e620ebb', objective: 'Qualificare progetto pizzeria', call_type: 'qualifica', customer_timezone: 'Europe/London' };
  assertEquals(Proposal.safeParse(a).success, true);
  assertEquals(Proposal.safeParse({ ...a, instructions: 'Chiedere volume pizze, accesso e tempi' }).success, true);
  assertEquals(Proposal.safeParse({ ...a, call_type: 'trattativa' }).success, true);
  assertEquals(Proposal.safeParse({ ...a, call_type: 'sconto' }).success, false);
});
Deno.test('Conversation transcript retention is enabled for CRM history', () => assertEquals(assistantConfig([]).privacy_settings.data_retention, true));
Deno.test('Assistant keeps full post-call history for CRM transcript', () => assertEquals(assistantConfig([]).telephony_settings.conversation_ended_full_history, true));
Deno.test('Lost leads cannot be called', () => assertEquals(Boolean(callAllowed({ status: 'perso' }, 'Europe/London', new Date('2026-11-05T10:00:00Z'))), true));
Deno.test('Calling hours follow customer timezone', () => {
  assertEquals(callAllowed({}, 'Europe/London', new Date('2026-11-05T09:00:00Z')), null);
  assertEquals(Boolean(callAllowed({}, 'Europe/London', new Date('2026-11-05T20:00:00Z'))), true);
});
Deno.test('48-hour autonomy pause does not block an explicit team call or clear the pause', () => {
  const now = new Date('2026-11-05T14:26:00Z');
  const lead = { bruno_mode: 'draft', bruno_paused_until: '2026-11-07T14:26:00Z' };
  assertEquals(callAllowed(lead, 'Europe/London', now, 'operator'), null);
  assertEquals(lead.bruno_paused_until, '2026-11-07T14:26:00Z');
  assertEquals(lead.bruno_mode, 'draft');
});
Deno.test('Autonomous calls remain blocked during the same 48-hour pause by default', () => {
  const lead = { bruno_mode: 'draft', bruno_paused_until: '2026-11-07T14:26:00Z' };
  assertEquals(callAllowed(lead, 'Europe/London', new Date('2026-11-05T14:26:00Z')), 'L’autonomia di Bruno è in pausa per questo cliente; gli incarichi espliciti del team restano disponibili.');
});
Deno.test('Paused or disabled autonomy still allows team tasks without reactivation', () => {
  const now = new Date('2026-11-05T14:26:00Z');
  for (const bruno_mode of ['paused', 'off']) {
    const lead = { bruno_mode };
    assertEquals(callAllowed(lead, 'Europe/London', now, 'operator'), null);
    assertEquals(Boolean(callAllowed(lead, 'Europe/London', now)), true);
    assertEquals(lead.bruno_mode, bruno_mode);
  }
});
Deno.test('Team instructions do not bypass customer refusal or archived records', () => {
  const now = new Date('2026-11-05T14:26:00Z');
  assertEquals(callAllowed({ status: 'perso' }, 'Europe/London', now, 'operator'), 'Cliente archiviato o non interessato: chiamata bloccata.');
  assertEquals(callAllowed({ archived: true }, 'Europe/London', now, 'operator'), 'Cliente archiviato o non interessato: chiamata bloccata.');
});
Deno.test('Team instructions retain the 09-20 customer calling window', () => {
  assertEquals(callAllowed({ bruno_mode: 'paused' }, 'Europe/London', new Date('2026-11-05T20:00:00Z'), 'operator'), 'Chiamate consentite tra le 9 e le 20 nel fuso del cliente.');
});
Deno.test('Call requests cannot self-declare an operator override', () => {
  const proposal = { lead_id: '3e429f10-5d54-4f5b-a8f7-00bf8e620ebb', objective: 'Qualificare progetto pizzeria', call_type: 'qualifica' };
  assertEquals(Proposal.safeParse(proposal).success, true);
  assertEquals(Proposal.safeParse({ ...proposal, execution: 'operator' }).success, false);
  assertEquals(Proposal.safeParse({ ...proposal, override_pause: true }).success, false);
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
  if (!('publicKey' in pair)) throw new Error('Ed25519 key pair required');
  const pub = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))));
  const raw = '{"action":"knowledge"}', time = '1793874600';
  const bytes = await crypto.subtle.sign('Ed25519', pair.privateKey, new TextEncoder().encode(`${time}|${raw}`));
  const sig = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  assertEquals(await verifyTelnyx(raw, sig, time, pub, Number(time) * 1000), true);
  assertEquals(await verifyTelnyx(raw + ' ', sig, time, pub, Number(time) * 1000), false);
  assertEquals(await verifyTelnyx(raw, sig, time, pub, Number(time) * 1000 + 301000), false);
});
import { timezoneFromPhone } from './domain.ts';
Deno.test('fuso orario dal prefisso del numero', () => {
  if (timezoneFromPhone('+39 338 315 6161') !== 'Europe/Rome') throw new Error('+39');
  if (timezoneFromPhone('0044 7457 416033') !== 'Europe/London') throw new Error('+44');
  if (timezoneFromPhone('+353 87 123 4567') !== 'Europe/Dublin') throw new Error('+353');
  if (timezoneFromPhone('+33 6 12 34 56 78') !== 'Europe/Paris') throw new Error('+33');
  if (timezoneFromPhone('+999123') !== null) throw new Error('unknown');
});

Deno.test('callOutcomeCode distingue chiamate senza conversazione', async () => {
  const { callOutcomeCode } = await import('./domain.ts');
  const eq = (a: unknown, b: unknown) => { if (a !== b) throw new Error(`${a} !== ${b}`); };
  eq(callOutcomeCode('completed', 2), 'no_conversation');
  eq(callOutcomeCode('completed', 113), null);
  eq(callOutcomeCode('no-answer'), 'no_answer');
  eq(callOutcomeCode('busy'), 'busy');
  eq(callOutcomeCode('failed'), 'unreachable');
});
