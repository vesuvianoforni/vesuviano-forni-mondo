import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { communicationChannel, directCallEvidence, assertNoHumanCall, communicationPage, callHistory } from '../_shared/bruno/coordination.ts';
Deno.test('UK e IT rimangono distinti anche nella chat Telegram', () => {
  assertEquals(communicationChannel({ channel: 'whatsapp_api', metadata: { whatsapp_line: 'uk' } }), 'whatsapp_uk');
  assertEquals(communicationChannel({ channel: 'whatsapp_api', metadata: { whatsapp_line: 'it' } }), 'whatsapp_api');
  assertEquals(communicationChannel({ channel: 'email' }), 'email');
});
Deno.test('Una chiamata diretta non inventa trascrizioni o fatti cliente', () => {
  const c = directCallEvidence({ id: 'call', status: 'ended', answered_at: '2026-11-09T17:00:00Z', ended_at: '2026-11-09T17:03:29Z', credential_id: 'secret' });
  assertEquals(c.mode, 'direct'); assertEquals(c.duration_seconds, 209);
  assertEquals(c.evidence_source, 'browser_reported'); assertEquals(c.transcript_available, false);
  assertEquals('credential_id' in c, false);
});
Deno.test('Bruno legge il riepilogo della chiamata operatore solo quando registrato', () => {
  const call = directCallEvidence({ id: 'call', recording_source: 'browser_audio', recording_status: 'ready', summary: 'Cliente cerca Ottavio gas.' });
  assertEquals(call.mode, 'direct'); assertEquals(call.evidence_source, 'operator_recording');
  assertEquals(call.summary, 'Cliente cerca Ottavio gas.'); assertEquals(call.transcript_available, true);
});
Deno.test('Bruno non sovrappone telefonate a una chiamata umana', async () => {
  const q: any = { select: () => q, in: () => q, limit: async () => ({ data: [{ id: 'live', status: 'active' }], error: null }) };
  await assertRejects(() => assertNoHumanCall({ from: () => q } as any, ['lead']), Error, 'Non sovrapporre');
});
Deno.test('Lo storico UK è paginato dall’RPC invoker e conserva il cursore', async () => {
  let passed: any;
  const reader: any = { rpc: async (name: string, args: any) => { passed = { name, args }; return { data: Array.from({ length: 21 }, (_, i) => ({ id: String(i), created_at: '2026-11-09T17:00:00Z', channel: 'whatsapp_api', body: 'test', metadata: { whatsapp_line: 'uk' } })), error: null }; } };
  const out = await communicationPage(reader, { lead_id: '3e429f10-5d54-4f5b-a8f7-00bf8e620ebb', channel: 'whatsapp_uk' });
  assertEquals(passed.name, 'bruno_message_page'); assertEquals(passed.args.p_channel, 'whatsapp_uk');
  assertEquals(out.messages.length, 20); assertEquals(out.has_more, true); assertEquals(out.next_cursor?.before_id, '19');
});
Deno.test('Cursori parziali o manipolati non ampliano le letture', async () => {
  await assertRejects(() => callHistory({} as any, { before_at: 'x),lead_id.neq.null' }), Error, 'Cursore incompleto');
});