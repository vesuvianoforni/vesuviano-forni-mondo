import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { appointmentInput, availableBookingOffer, type BookingContact } from './booking';

async function resolveContact(code?: string): Promise<BookingContact | null> {
  if (!code) return null;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  // The unguessable shared-offer code is the capability; no lookup by email, phone or lead ID is exposed.
  const offer = await supabaseAdmin.from('commercial_offers').select('id,public_enabled,archived,document').eq('public_code', code).maybeSingle();
  if (offer.error) throw new Error('Impossibile recuperare i dati della richiesta.');
  if (!offer.data || !availableBookingOffer(offer.data)) return null;
  const request = await supabaseAdmin.from('website_leads').select('id,first_name,last_name,email,phone').eq('form_type', 'ready_to_ship').eq('metadata->>offer_id', offer.data.id).limit(2);
  if (request.error) throw new Error('Impossibile recuperare i dati della richiesta.');
  if (request.data?.length !== 1) return null;
  const customer = request.data[0];
  if (!customer) return null;
  const document = offer.data.document as Record<string, unknown>;
  return { name: [customer.first_name, customer.last_name].filter(Boolean).join(' '), email: customer.email ?? '', phoneNumber: customer.phone ?? '', language: typeof document['language'] === 'string' ? document['language'] : 'it', offerId: offer.data.id, websiteLeadId: customer.id };
}

export const loadBookingContact = createServerFn({ method: 'POST' })
  .inputValidator(input => z.object({ offer: z.string().uuid().optional() }).parse(input))
  .handler(({ data }) => resolveContact(data.offer));

export const submitBookingAppointment = createServerFn({ method: 'POST' })
  .inputValidator(input => appointmentInput.parse(input))
  .handler(async ({ data }) => {
    const contact = await resolveContact(data.offer);
    if (data.offer && !contact) throw new Error('Il collegamento della richiesta non è più disponibile.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const saved = await supabaseAdmin.from('appointments').insert({
      appointment_date: data.date, appointment_time: data.time, phone_number: data.phoneNumber, contact_method: data.contactMethod, status: 'pending',
      notes: JSON.stringify({ name: data.name, email: data.email, ...(contact ? { ready_to_ship_offer_id: contact.offerId, website_lead_id: contact.websiteLeadId } : {}) }),
    }).select('id').single();
    if (saved.error || !saved.data) throw new Error('Impossibile salvare la prenotazione.');
    const key = process.env['RESEND_API_KEY'];
    if (!key) return { success: true, notificationId: undefined, notificationPending: true };
    const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
    let notificationId: string | undefined;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `appointment-${saved.data.id}` },
        body: JSON.stringify({ from: 'Sistema Notifiche <system@vesuvianoforni.com>', to: ['stanislaoelefante@gmail.com', 'info@vesuvianoforni.com'], reply_to: 'info@vesuvianoforni.com',
          subject: '📞 Nuova chiamata prenotata da Lead', html: `<h2>Nuova chiamata prenotata</h2><p>Nome: ${escape(data.name)}</p><p>Email: ${escape(data.email)}</p><p>Telefono: ${escape(data.phoneNumber)}</p><p>Data: ${escape(data.date)} · Ora: ${escape(data.time)}</p><p>Contatto: ${escape(data.contactMethod)}</p>${contact ? '<p>Richiesta Pronta Consegna</p>' : ''}` }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) notificationId = ((await response.json()) as { id?: string }).id;
    } catch { /* Keep the saved appointment; never encourage a duplicate form submission. */ }
    return { success: true, notificationId, notificationPending: !notificationId };
  });