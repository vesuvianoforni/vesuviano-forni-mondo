import { z } from 'npm:zod@3';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { selectEmailSignature, type EmailSignature } from './email-layout.ts';

const phone = z.string().trim().max(40).refine(v => !v || /^\+?[\d\s().-]{6,40}$/.test(v), 'Numero non valido');
export const SignatureSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(1).max(100),
  role: z.string().trim().max(150), company: z.string().trim().min(1).max(100),
  phone, whatsapp: phone, email: z.string().trim().email().max(254),
  website: z.string().trim().url().max(300).refine(v => v.startsWith('https://'), 'Usa un indirizzo HTTPS'),
  address: z.string().trim().max(500), is_default: z.boolean(),
});
export async function listEmailSignatures(admin: SupabaseClient, mailboxId: string): Promise<EmailSignature[]> {
  const { data, error } = await admin.from('email_signatures').select('id,name,role,company,phone,whatsapp,email,website,address,is_default').eq('mailbox_id', mailboxId).order('is_default', { ascending: false }).order('name');
  if (error) throw new Error('MAIL_DB_FAILED');
  return data || [];
}
export async function resolveEmailSignature(admin: SupabaseClient, mailboxId: string, id?: string | null) {
  return selectEmailSignature(await listEmailSignatures(admin, mailboxId), id);
}