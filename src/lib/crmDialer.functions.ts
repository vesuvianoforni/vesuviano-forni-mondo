import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { CRM_CALLER_NUMBER, CRM_DIALER_CONNECTION, dialerCredentials, dialerPhone, dialerStaff, directStatus, directStatusLabels } from './crmDialer';

const dialerAccess = createMiddleware({ type: 'function' }).middleware([requireSupabaseAuth]).server(async ({ context, next }) => {
  const { data: roles, error } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId);
  if (error || !dialerStaff((roles ?? []).map(r => r.role))) throw new Error('Accesso alle chiamate negato.');
  const credentials = dialerCredentials({
    telnyx: process.env['TELNYX_API_KEY'],
    lovable: process.env['LOVABLE_API_KEY'],
    connection: process.env['UDC_TELNYX_API_KEY'],
  });
  if (!credentials) throw new Error('Telnyx non collegato.');
  setResponseHeader('Cache-Control', 'no-store');
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  return next({ context: { admin, credentials } });
});

export const prepareDirectCall = createServerFn({ method: 'POST' }).middleware([dialerAccess])
  .inputValidator(d => z.object({ lead_id: z.string().uuid() }).strict().parse(d))
  .handler(async ({ data, context }) => {
    const { data: lead, error } = await context.supabase.from('leads').select('id,phone,status,archived').eq('id', data.lead_id).single();
    if (error || !lead) throw new Error('Cliente non trovato.');
    if (lead.archived || lead.status === 'perso') throw new Error('Cliente archiviato o non interessato: chiamata bloccata.');
    const destination = dialerPhone(lead.phone ?? '');
    const { telnyxDialer, checkDialerConnection } = await import('./crmDialer.server');
    await checkDialerConnection(context.credentials);
    const id = crypto.randomUUID();
    const inserted = await context.admin.from('crm_direct_calls').insert({ id, lead_id: lead.id, operator_id: context.userId, destination, from_number: CRM_CALLER_NUMBER, recording_status: 'pending' });
    if (inserted.error) throw new Error(inserted.error.code === '23505' ? 'Hai già una chiamata aperta o da verificare. Chiudila prima di chiamare di nuovo.' : inserted.error.message);
    let credentialId: string | undefined;
    try {
      const credential = await telnyxDialer('/telephony_credentials', context.credentials, 'POST', {
        connection_id: CRM_DIALER_CONNECTION, name: `CRM ${context.userId} ${id}`, tag: 'vesuviano-crm',
        expires_at: new Date(Date.now() + 2 * 3600000).toISOString(),
      });
      credentialId = credential.data?.id;
      if (!credentialId) throw new Error('Accesso telefonico non creato.');
      const saved = await context.admin.from('crm_direct_calls').update({ credential_id: credentialId }).eq('id', id);
      if (saved.error) throw new Error(saved.error.message);
      const { token } = await telnyxDialer(`/telephony_credentials/${credentialId}/token`, context.credentials, 'POST');
      if (!token || token.split('.').length !== 3) throw new Error('Accesso telefonico non valido.');
      return { id, token: token as string, destination, from_number: CRM_CALLER_NUMBER };
    } catch (error) {
      await context.admin.from('crm_direct_calls').update({ status: 'failed', ended_at: new Date().toISOString() }).eq('id', id);
      if (credentialId) await telnyxDialer(`/telephony_credentials/${credentialId}`, context.credentials, 'DELETE').catch(() => undefined);
      throw error;
    }
  });

export const updateDirectCall = createServerFn({ method: 'POST' }).middleware([dialerAccess])
  .inputValidator(d => z.object({ id: z.string().uuid(), event: z.enum(['dialing', 'active', 'ended', 'failed', 'unknown']), provider_id: z.string().max(200).optional() }).strict().parse(d))
  .handler(async ({ data, context }) => {
    const { data: call, error } = await context.admin.from('crm_direct_calls').select('*').eq('id', data.id).eq('operator_id', context.userId).single();
    if (error || !call) throw new Error('Chiamata non trovata.');
    const status = directStatus(call.status, data.event);
    const terminal = ['ended', 'failed', 'unknown'].includes(status);
    const now = new Date().toISOString();
    const answeredAt = call.answered_at ?? (status === 'active' ? now : null);
    const updated = await context.admin.from('crm_direct_calls').update({ status, answered_at: answeredAt,
      ...(data.provider_id ? { provider_call_id: data.provider_id } : {}), ...(terminal ? { ended_at: call.ended_at ?? now } : {}),
    }).eq('id', call.id).eq('status', call.status).select('id').maybeSingle();
    if (updated.error) throw new Error(updated.error.message);
    if (!updated.data) return { status: call.status };
    // Use the call UUID as the message UUID: duplicate SDK events cannot duplicate CRM history.
    if (call.provider_call_id || data.provider_id) {
      const seconds = answeredAt ? Math.max(0, Math.floor((Date.parse(call.ended_at ?? now) - Date.parse(answeredAt)) / 1000)) : 0;
      const body = call.summary || `Chiamata diretta dell’operatore dal numero UK ${call.from_number} a ${call.destination}. ${directStatusLabels[status] ?? status}${terminal && answeredAt ? ` · ${Math.floor(seconds / 60)} min ${seconds % 60} sec` : ''}. ${call.recording_status === 'legacy' ? 'Stato riportato dal telefono del browser.' : 'Riepilogo in preparazione dalla registrazione.'}`;
      const logged = await context.admin.from('crm_messages').upsert({ id: call.id, lead_id: call.lead_id, channel: 'call', direction: 'outbound', sender: 'operator',
        body, status: 'logged', ai_generated: false, created_by: call.operator_id, created_at: call.created_at,
        metadata: { direct_call_id: call.id, call_mode: 'direct', from_number: call.from_number, duration_seconds: seconds, source: 'browser_reported' },
      }, { onConflict: 'id' });
      if (logged.error) throw new Error(logged.error.message);
    }
    if (terminal && call.credential_id) {
      const { telnyxDialer } = await import('./crmDialer.server');
      await telnyxDialer(`/telephony_credentials/${call.credential_id}`, context.credentials, 'DELETE');
    }
    if (terminal && !answeredAt && call.recording_status === 'pending') {
      await context.admin.from('crm_direct_calls').update({ recording_status: 'unavailable', recording_error: 'Nessuna risposta registrata.' }).eq('id', call.id).eq('recording_status', 'pending');
    }
    return { status };
  });

export const getDirectCallResult = createServerFn({ method: 'POST' }).middleware([dialerAccess])
  .inputValidator(d => z.object({ id: z.string().uuid() }).strict().parse(d))
  .handler(async ({ data, context }) => {
    const call = await context.supabase.from('crm_direct_calls').select('id,summary,recording_status,recording_error').eq('id', data.id).single();
    if (call.error || !call.data) throw new Error('Chiamata non trovata.');
    const result = await context.supabase.from('crm_call_results').select('call_id,recording_path,transcript,summary,status,error').eq('call_id', data.id).maybeSingle();
    if (result.error) throw new Error(result.error.message);
    let audioUrl: string | null = null;
    if (result.data?.recording_path) {
      const signed = await context.admin.storage.from('bruno-call-recordings').createSignedUrl(result.data.recording_path, 600);
      if (signed.error) throw new Error(signed.error.message); audioUrl = signed.data.signedUrl;
    }
    return { ...call.data, transcript: result.data?.transcript ?? null, summary: result.data?.summary ?? call.data.summary,
      processing_status: result.data?.status ?? call.data.recording_status, error: result.data?.error ?? call.data.recording_error, audioUrl };
  });

export const pendingDirectCalls = createServerFn({ method: 'POST' }).middleware([dialerAccess]).handler(async ({ context }) => {
  const { data, error } = await context.admin.from('crm_direct_calls').select('id,destination,status,created_at').eq('operator_id', context.userId).in('status', ['preparing','dialing','active']).limit(1);
  if (error) throw new Error(error.message);
  return data ?? [];
});