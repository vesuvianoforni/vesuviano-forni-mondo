import { createFileRoute } from '@tanstack/react-router';
import { timingSafeEqual } from 'node:crypto';

export const Route = createFileRoute('/api/public/telnyx/process-results')({ server: { handlers: { POST: async ({ request }) => {
  const expected = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const supplied = request.headers.get('x-call-analysis-key');
  if (!expected || !supplied) return new Response('Unauthorized', { status: 401 });
  const exact = supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!exact) {
    // Netlify can use an opaque sb_secret_ key while the existing Supabase runtime uses service_role.
    // Verify privileged access with a service-only column, never trust a decoded JWT role or caller-supplied URL.
    const url = process.env['SUPABASE_URL'];
    if (!url) return new Response('Not configured', { status: 503 });
    const headers = new Headers({ apikey: supplied });
    if (!supplied.startsWith('sb_')) headers.set('Authorization', `Bearer ${supplied}`);
    const verification = await fetch(`${url}/rest/v1/crm_call_ai_state?select=lease_token&key=eq.calls`, { headers });
    if (!verification.ok) return new Response('Unauthorized', { status: 401 });
    const rows = await verification.json();
    if (!Array.isArray(rows) || rows.length !== 1) return new Response('Unauthorized', { status: 401 });
  }
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const { processDueDirectResults } = await import('@/lib/crmCallResults.server');
  const encoder = new TextEncoder();
  // The verified internal caller consumes this stream until the database checkpoint is settled.
  const stream = new ReadableStream<Uint8Array>({ async start(controller) {
    controller.enqueue(encoder.encode('processing\n'));
    const heartbeat = setInterval(() => { try { controller.enqueue(encoder.encode('pending\n')); } catch { clearInterval(heartbeat); } }, 10000);
    try { await processDueDirectResults(admin as unknown as import('@supabase/supabase-js').SupabaseClient, request.headers.get('x-call-ai-key') ?? undefined); controller.enqueue(encoder.encode('done\n')); }
    catch { controller.enqueue(encoder.encode('failed\n')); }
    finally { clearInterval(heartbeat); controller.close(); }
  } });
  return new Response(stream, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });
} } } });