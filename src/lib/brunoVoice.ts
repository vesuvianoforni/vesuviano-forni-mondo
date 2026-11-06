import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceCall {
  id: string; lead_id: string; direction?: 'outbound' | 'inbound'; destination: string; call_type?: string; instructions?: string | null; objective: string; status: string; summary: string | null; created_at: string;
  started_at: string | null; ended_at: string | null; expires_at: string; duration_seconds: number | null;
  recording_status: string; transcript_status: string; summary_status: string; error_code: string | null;
  leads?: { contact_name: string | null; company_name: string | null } | null | undefined;
}
export type VoiceView = 'planned' | 'executed';
export const callLabels: Record<string,string> = { proposed: 'Da approvare', starting: 'Avvio', dialing: 'Sta chiamando', active: 'In conversazione', completed: 'Conclusa', failed: 'Non riuscita', unknown: 'Esito da verificare', cancelled: 'Annullata' };
export const plannedStatuses = ['proposed','starting','dialing','active'];
export function callInView(status: string, view: VoiceView) { return view === 'planned' ? plannedStatuses.includes(status) : !plannedStatuses.includes(status); }
export async function voiceRequest<T>(body: Record<string,unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('bruno-voice',{body});
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const result = await error.context.json().catch(() => null);
      if (result?.error) throw new Error(`${result.error}${typeof result.details === 'string' ? `: ${result.details}` : ''}`);
    }
    throw error;
  }
  return data;
}