import { z } from 'zod';
export type BookingContact = { name: string; email: string; phoneNumber: string; language: string; offerId: string; websiteLeadId: string };
export const appointmentInput = z.object({
  name: z.string().trim().min(2).max(100), email: z.union([z.string().trim().email().max(254), z.literal('')]).default(''),
  phoneNumber: z.string().trim().min(8).max(20), date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/), contactMethod: z.enum(['whatsapp', 'phone', 'googlemeet']),
  offer: z.string().uuid().optional(), attribution: z.record(z.unknown()).optional(),
});
export function availableBookingOffer(offer: { public_enabled: boolean; archived: boolean; document: unknown } | null, now = new Date()) {
  if (!offer?.public_enabled || offer.archived || !offer.document || typeof offer.document !== 'object') return false;
  const validUntil = (offer.document as Record<string, unknown>).valid_until;
  return typeof validUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(validUntil) && now.getTime() < Date.parse(`${validUntil}T23:59:59.999Z`);
}