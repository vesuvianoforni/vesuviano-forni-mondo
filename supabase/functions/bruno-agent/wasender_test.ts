import { assertEquals, assertRejects } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { sendGennaroWhatsApp } from './wasender.ts';

const credentials = { lovableKey: 'test-only-lovable', connectionKey: 'test-only-connection' };
const input = { phone: '447700900123', text: 'Messaggio di prova' };

Deno.test('invio Gennaro usa il collegamento WaSender senza cambiare webhook', async () => {
  let calls = 0;
  const request: typeof fetch = async (url, init) => {
    calls += 1;
    assertEquals(String(url), 'https://connector-gateway.lovable.dev/udc_wasender/api/send-message');
    assertEquals(init?.method, 'POST');
    const headers = new Headers(init?.headers);
    assertEquals(headers.get('Authorization'), 'Bearer test-only-lovable');
    assertEquals(headers.get('X-Connection-Api-Key'), 'test-only-connection');
    assertEquals(JSON.parse(String(init?.body)), { to: '+447700900123', text: 'Messaggio di prova' });
    return new Response(JSON.stringify({ success: true, data: { msgId: 12345 } }));
  };
  assertEquals(await sendGennaroWhatsApp(credentials, input, request), '12345');
  assertEquals(calls, 1);
});

Deno.test('errori WaSender conservano il motivo e non ripetono l’invio', async () => {
  let calls = 0;
  const request: typeof fetch = async () => {
    calls += 1;
    return new Response('{"error":"session disconnected"}', { status: 422 });
  };
  await assertRejects(() => sendGennaroWhatsApp(credentials, input, request), Error, 'WaSender 422: {"error":"session disconnected"}');
  assertEquals(calls, 1);
});

Deno.test('un rifiuto in una risposta 200 non risulta inviato', async () => {
  const request: typeof fetch = async () => new Response('{"success":false,"message":"not connected"}');
  await assertRejects(() => sendGennaroWhatsApp(credentials, input, request), Error, 'not connected');
});

Deno.test('chiave mancante o telefono non valido non contattano WaSender', async () => {
  let calls = 0;
  const request: typeof fetch = async () => { calls += 1; return new Response('{}'); };
  await assertRejects(() => sendGennaroWhatsApp({ ...credentials, connectionKey: '' }, input, request), Error, 'non ancora collegato');
  await assertRejects(() => sendGennaroWhatsApp(credentials, { ...input, phone: '' }, request), Error, 'Telefono cliente non valido');
  assertEquals(calls, 0);
});