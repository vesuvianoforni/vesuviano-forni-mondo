import { describe, it, expect } from 'vitest';
import { appointmentInput, availableBookingOffer, bookingThankYouUrl } from './booking';
import { readyToShipBookingUrl } from '../../supabase/functions/_shared/booking-link';

describe('Ready-to-ship booking', () => {
  it('redirects completed bookings to existing localized thank-you pages', () => {
    expect(bookingThankYouUrl('en')).toBe('/en/thank-you-en');
    expect(bookingThankYouUrl('it')).toBe('/it/thank-you-it');
    expect(bookingThankYouUrl('ar')).toBe('/it/thank-you-it');
  });
  it('links only by opaque offer code, without personal data in the URL', () => {
    const url = new URL(readyToShipBookingUrl('7a5d009a-14d6-415d-9613-53e37d552da0', 'en'));
    expect(url.origin).toBe('https://vesuvianoforni.com');
    expect([...url.searchParams.keys()]).toEqual(['offer', 'lang']);
    expect(url.searchParams.get('offer')).toBe('7a5d009a-14d6-415d-9613-53e37d552da0');
    expect(url.searchParams.get('lang')).toBe('en');
  });
  it('preserves edited customer name, email and phone in the submission', () => {
    const data = appointmentInput.parse({ name: 'Mohammad Alalyan', email: 'mody-79@hotmail.com', phoneNumber: '+96599988692', date: '13/11/2026', time: '10:30', contactMethod: 'phone' });
    expect([data.name, data.email, data.phoneNumber]).toEqual(['Mohammad Alalyan', 'mody-79@hotmail.com', '+96599988692']);
  });
  it('never discloses private, archived or expired offer contacts', () => {
    const offer = { public_enabled: true, archived: false, document: { valid_until: '2026-12-11' } };
    const now = new Date('2026-11-12T08:45:00Z');
    expect(availableBookingOffer(offer, now)).toBe(true);
    expect(availableBookingOffer({ ...offer, public_enabled: false }, now)).toBe(false);
    expect(availableBookingOffer({ ...offer, archived: true }, now)).toBe(false);
    expect(availableBookingOffer(offer, new Date('2026-12-12'))).toBe(false);
  });
});