import { describe, expect, it } from 'vitest';
import { cleanDial, parseDial, phoneKey } from './dialPad';

describe('dialPad', () => {
  it('converts 00 prefix to +', () => expect(cleanDial('0044 7457 416033')).toBe('+447457416033'));
  it('recognises UK number from prefix', () => {
    const r = parseDial('+447457416033', 'IT');
    expect(r.country).toBe('GB'); expect(r.e164).toBe('+447457416033');
  });
  it('uses default country without prefix', () => expect(parseDial('3383156161', 'IT').e164).toBe('+393383156161'));
  it('rejects incomplete numbers', () => expect(parseDial('+44745', 'IT').e164).toBeNull());
  it('matches CRM numbers saved in different formats', () =>
    expect(phoneKey('338 315 6161')).toBe(phoneKey('+39 338-315-6161')));
});
