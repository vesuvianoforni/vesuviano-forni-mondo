import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { dialerCredentials, dialerStaff } from './crmDialer';

export const syncInboundCallHistory = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  setResponseHeader('Cache-Control','no-store');
  const roles = await context.supabase.from('user_roles').select('role').eq('user_id',context.userId);
  if (roles.error || !dialerStaff((roles.data ?? []).map(row=>row.role))) throw new Error('Accesso allo storico chiamate negato.');
  const credentials=dialerCredentials({telnyx:process.env['TELNYX_API_KEY'],lovable:process.env['LOVABLE_API_KEY'],connection:process.env['UDC_TELNYX_API_KEY']});
  if (!credentials) throw new Error('Telnyx non collegato.');
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {syncInboundHistory}=await import('./inboundCallHistory.server');
  return syncInboundHistory(supabaseAdmin,credentials);
});