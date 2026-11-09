import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { communicationChannel, directCallEvidence, assertNoHumanCall } from './coordination.ts';
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
Deno.test('Bruno non sovrappone telefonate a una chiamata umana', async () => {
  const q: any = { select: () => q, in: () => q, limit: async () => ({ data: [{ id: 'live', status: 'active' }], error: null }) };
  await assertRejects(() => assertNoHumanCall({ from: () => q } as any, ['lead']), Error, 'Non sovrapporre');
});