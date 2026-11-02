import { createOpenAI } from 'npm:@ai-sdk/openai@3';
import { streamText, Output } from 'npm:ai@6';
import { z } from 'npm:zod@3';
import { createLovableAiGatewayRunIdFetch } from '../mario-run-id.ts';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export async function marioObject<T extends z.ZodTypeAny>(db: SupabaseClient, request: Request, system: string, prompt: string, schema: T): Promise<z.infer<T>> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw Object.assign(new Error('AI non configurata'), { status: 503 });
  const { data: config } = await db.from('outreach_agent_config').select('ai_status,ai_reason').eq('key', 'default').single();
  if (config?.ai_status) throw Object.assign(new Error(config.ai_reason ?? 'AI in pausa'), { status: config.ai_status });
  const correlation = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({ baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: key, headers: { 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: correlation.fetch });
  try {
    const result = streamText({ model: provider.responses('openai/gpt-6-astra'), system, prompt, output: Output.object({ schema }), maxRetries: 0, abortSignal: request.signal,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } } });
    return await result.output;
  } catch (error) {
    const e = error as { statusCode?: number; responseBody?: string; message?: string };
    const status = e.statusCode ?? 422;
    let reason = 'La generazione non ha restituito un risultato valido.';
    try { const body = JSON.parse(e.responseBody ?? '{}'); reason = body.message ?? body.error?.message ?? reason; } catch { /* no provider text fallback */ }
    if (status === 402 || status === 403) await db.from('outreach_agent_config').update({ ai_status: status, ai_reason: reason }).eq('key', 'default');
    throw Object.assign(new Error(reason), { status });
  }
}