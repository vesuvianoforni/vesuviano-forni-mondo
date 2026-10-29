import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type MailSignature = {
  id: string; name: string; role: string; company: string; phone: string; whatsapp: string;
  email: string; website: string; address: string; is_default: boolean;
};
export async function mailboxRequest(action: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('email-sync', { body: { action, ...extra } });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try { const body = await error.context.json(); message = typeof body.error === 'string' ? body.error : 'Controlla i campi della firma.'; } catch { /* no provider details */ }
    }
    throw new Error(message);
  }
  return data;
}