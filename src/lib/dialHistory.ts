import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function fullPhoneIdentity(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const clean = phone.trim().replace(/^00/, '+');
  const parsed = parsePhoneNumberFromString(clean, clean.startsWith('+') ? undefined : 'IT');
  return parsed?.isValid() ? parsed.number : null;
}

export type DialDirectionFilter = 'all' | 'outbound' | 'inbound';
export function filterDialDirections<T extends { direction: 'outbound' | 'inbound' }>(calls: T[], filter: DialDirectionFilter) {
  return filter === 'all' ? calls : calls.filter(call => call.direction === filter);
}