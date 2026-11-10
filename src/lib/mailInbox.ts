import type { Database } from '@/integrations/supabase/types';

export type MailInboxItem = Pick<Database['public']['Tables']['email_items']['Row'],
  'id' | 'sender' | 'recipients' | 'subject' | 'body' | 'direction' | 'sent_at' | 'folder' | 'lead_id'>;

export function mailRecipients(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((address): address is string => typeof address === 'string') : [];
}

export function mailSearchTerm(value: string) {
  // Keep user input out of PostgREST's filter grammar and wildcard operators.
  return value.replace(/[,%_*()"\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function mailCorrespondent(item: Pick<MailInboxItem, 'direction' | 'sender' | 'recipients'>) {
  return item.direction === 'outbound' ? mailRecipients(item.recipients).join(', ') : item.sender;
}