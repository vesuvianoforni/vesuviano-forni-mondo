import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { dialerStaff } from './crmDialer';
import { countryName, matchingDialContacts, parseDial, readPhoneContacts } from './dialPad';

export const resolveDialContact = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ destination: z.string().max(40), name: z.string().max(200) }).strict().parse(input))
  .handler(async ({ data, context }) => {
    const roles = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId);
    if (roles.error || !dialerStaff((roles.data ?? []).map(role => role.role))) throw new Error('Accesso alle chiamate negato.');
    const dialled = parseDial(data.destination, 'IT');
    if (!dialled.e164) throw new Error('Numero non valido.');
    // A failed or partial read must never be treated as a missing customer.
    const contacts = await readPhoneContacts(async (from, to) => {
      const result = await context.supabase.from('leads').select('*').not('phone', 'is', null).order('id').range(from, to);
      if (result.error) throw new Error('Impossibile verificare i clienti: nessuna nuova scheda creata.');
      return result.data ?? [];
    });
    const matches = matchingDialContacts(contacts, dialled.e164);
    if (matches.length > 1) throw new Error('Più clienti hanno questo numero: scegli la scheda dalla lista Clienti.');
    const existing = matches[0];
    if (existing) return { lead: existing, created: false, destination: dialled.e164 };
    const saved = await context.supabase.from('leads').insert({
      phone: dialled.e164, contact_name: data.name.trim() || null, status: 'nuovo', source: 'cold_call', pipeline: 'Vesuviano',
      country: dialled.country ? countryName(dialled.country) : null,
    }).select('*').single();
    if (saved.error || !saved.data) throw new Error('Impossibile salvare il nuovo cliente.');
    return { lead: saved.data, created: true, destination: dialled.e164 };
  });