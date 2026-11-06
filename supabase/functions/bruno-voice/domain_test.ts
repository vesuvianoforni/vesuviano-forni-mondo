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

import { planNextStep } from './domain.ts';
Deno.test('call plan dials one customer at a time in order, with a pause between calls', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const calls = [{ id: 'b', status: 'proposed', plan_position: 2, ended_at: null }, { id: 'a', status: 'proposed', plan_position: 1, ended_at: null }];
  assertEquals(planNextStep(calls, 3, now), { kind: 'dial', call_id: 'a' });
  assertEquals(planNextStep([{ ...calls[1], status: 'dialing' }, calls[0]], 3, now), { kind: 'wait' });
  assertEquals(planNextStep([{ ...calls[1], status: 'completed', ended_at: '2026-11-06T11:58:00Z' }, calls[0]], 3, now), { kind: 'wait' });
  assertEquals(planNextStep([{ ...calls[1], status: 'completed', ended_at: '2026-11-06T11:56:00Z' }, calls[0]], 3, now), { kind: 'dial', call_id: 'b' });
  assertEquals(planNextStep([{ ...calls[1], status: 'unknown', ended_at: null }, calls[0]], 3, now), { kind: 'wait' });
  assertEquals(planNextStep([{ ...calls[1], status: 'completed', ended_at: '2026-11-06T11:00:00Z' }], 3, now), { kind: 'done' });
});

import { inboundLanguage, inboundAssistantConfig, inboundExtraTools, inboundTexml } from './domain.ts';
Deno.test('inbound language follows the caller prefix', () => {
  if (inboundLanguage('+39 333 1234567').code !== 'it') throw new Error('it');
  if (inboundLanguage('+447700900123').code !== 'en') throw new Error('en');
  if (inboundLanguage('0033612345678').code !== 'fr') throw new Error('fr');
  if (inboundLanguage('+4915112345678').code !== 'de') throw new Error('de');
  if (inboundLanguage('+34612345678').code !== 'es') throw new Error('es');
  if (inboundLanguage('+31612345678').code !== 'en') throw new Error('nl->en');
});
Deno.test('Inbound handover is always on request, with no default unavailability or office-hours restriction', () => {
  const variables = inboundAssistantConfig([], 'https://x.supabase.co').dynamic_variables;
  assertEquals(variables.handover_policy, 'always_on_request');
  assertEquals('gennaro_available' in variables, false);
});
Deno.test('Gennaro must explicitly accept in a private consult before connecting the caller', () => {
  const tool = inboundExtraTools('https://x.supabase.co', '+3908119237684').find(t => t.type === 'transfer');
  assertEquals(tool?.transfer?.targets, [{ name: 'Gennaro Caglione', to: '+3908119237684' }]);
  assertEquals(tool?.transfer?.warm_transfer_acceptance, { enabled: true, end_user_target_context_mode: 'private', require_acceptance: true, timeout_secs: 60 });
});
Deno.test('Transfer stops on Gennaro voicemail instead of connecting the caller', () => {
  const tool = inboundExtraTools('https://x.supabase.co', '+3908119237684').find(t => t.type === 'transfer');
  assertEquals(tool?.transfer?.voicemail_detection.on_voicemail_detected.action, 'stop_transfer');
});
Deno.test('inbound TeXML records once and starts the inbound assistant', () => {
  const x = inboundTexml('assistant-1', 'https://x.supabase.co');
  if (!x.includes('<Recording') || !x.includes('AIAssistant id="assistant-1"') || x.includes('&inbound=1"') ) throw new Error(x);
});
