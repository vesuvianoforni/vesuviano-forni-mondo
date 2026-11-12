export const BOOKING_BASE_URL = 'https://vesuvianoforni.com/book-a-slot-call';
export const BOOKING_CODE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function readyToShipBookingUrl(code?: string | null, language = 'it') {
  if (!code || !BOOKING_CODE_PATTERN.test(code)) return BOOKING_BASE_URL;
  const url = new URL(BOOKING_BASE_URL);
  url.searchParams.set('offer', code);
  url.searchParams.set('lang', ['it', 'en', 'fr', 'de', 'es'].includes(language) ? language : 'it');
  return url.toString();
}