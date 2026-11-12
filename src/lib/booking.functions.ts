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
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    if (!url || !key) throw new Error('Prenotazione non disponibile.');
    const response = await fetch(`${url}/functions/v1/send-form-data`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key, ...(!key.startsWith('sb_') ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ formType: 'appointment', data: { ...data.attribution, name: data.name, email: data.email, phoneNumber: data.phoneNumber, date: data.date, time: data.time, contactMethod: data.contactMethod, ...(contact ? { readyToShipOfferId: contact.offerId, websiteLeadId: contact.websiteLeadId } : {}) } }),
      signal: AbortSignal.timeout(25000),
    });
    const result = await response.json() as { success?: boolean; companyEmailId?: string };
    if (!response.ok || !result.success) throw new Error('Impossibile completare la prenotazione.');
    return { success: true, notificationId: result.companyEmailId };
  });