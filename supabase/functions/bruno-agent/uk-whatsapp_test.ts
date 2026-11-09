import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { inCustomerWindow, renderTemplate, sendUkApproved } from './uk-whatsapp.ts';
Deno.test('UK testo libero solo entro 24h sulla linea del cliente', () => {
  const now = Date.parse('2026-11-09T18:00:00Z');
  assertEquals(inCustomerWindow('2026-11-08T18:00:00Z', now), false);
  assertEquals(inCustomerWindow('2026-11-08T18:00:01Z', now), true);
  assertEquals(inCustomerWindow(null, now), false);
});
Deno.test('Il corpo proposto corrisponde alle variabili reali del template', () => {
  assertEquals(renderTemplate('Hello {{1}}, your oven is {{2}}.', ['Mark', 'Ottavio']), 'Hello Mark, your oven is Ottavio.');
});
Deno.test('Due approvazioni concorrenti riservano un solo invio UK, mai un reinvio incerto', async () => {
  const original = globalThis.fetch;
  const oldLovable = Deno.env.get('LOVABLE_API_KEY'), oldWa = Deno.env.get('WHATSAPP_API_KEY');
  Deno.env.set('LOVABLE_API_KEY', 'test-only'); Deno.env.set('WHATSAPP_API_KEY', 'test-only');
  let message: any = null, sends = 0, reconciles = 0;
  const admin: any = { rpc: async () => { reconciles++; return { data: true, error: null }; }, from: () => {
    let operation = 'read', fields: any, filter: string | null = null;
    const q: any = {
      select: () => q, eq: (key: string, value: string) => { if (key === 'id') filter = value; return q; }, order: () => q, limit: () => q,
      insert: (v: any) => { operation = 'insert'; fields = v; return q; }, update: (v: any) => { operation = 'update'; fields = v; return q; },
      maybeSingle: async () => ({ data: filter ? message : { created_at: new Date().toISOString() }, error: null }),
      single: async () => {
        if (operation === 'insert') {
          if (message) return { data: null, error: { code: '23505' } };
          message = fields;
        } else if (operation === 'update') message = { ...message, ...fields };
        return { data: message, error: null };
      },
    };
    return q;
  } };
  globalThis.fetch = async () => { sends++; return new Response(JSON.stringify({ messages: [{ id: 'wamid.test' }] }), { status: 200 }); };
  const input = { lead_id: 'lead', body: 'Hello Mark', idempotency_key: 'approved-action' };
  try {
    await Promise.all([sendUkApproved(admin, input, '447123456789', 'operator'), sendUkApproved(admin, input, '447123456789', 'operator')]);
    assertEquals(sends, 1); assertEquals(reconciles, 1);
    assertEquals(message.status, 'queued'); assertEquals(message.metadata.submission_status, 'accepted');
    message.metadata.submission_status = 'unknown';
    await sendUkApproved(admin, input, '447123456789', 'operator');
    assertEquals(sends, 1);
  } finally {
    globalThis.fetch = original;
    if (oldLovable === undefined) Deno.env.delete('LOVABLE_API_KEY'); else Deno.env.set('LOVABLE_API_KEY', oldLovable);
    if (oldWa === undefined) Deno.env.delete('WHATSAPP_API_KEY'); else Deno.env.set('WHATSAPP_API_KEY', oldWa);
  }
});