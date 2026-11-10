import { createFileRoute } from '@tanstack/react-router';
import { timingSafeEqual } from 'node:crypto';

export const Route = createFileRoute('/api/public/telnyx/process-results')({ server: { handlers: { POST: async ({ request }) => {
  const expected = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  const supplied = request.headers.get('x-call-analysis-key');
  if (!expected || !supplied || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return new Response('Unauthorized', { status: 401 });
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