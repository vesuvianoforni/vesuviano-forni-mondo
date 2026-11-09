import { describe, expect, it } from 'vitest';
import { CRM_CALLER_NUMBER, canStartCRMCall, dialerStaff, dialerPhone, directStatus } from './crmDialer';

describe('Chiamate CRM: scelta esplicita a ogni avvio', () => {
  it('non avvia senza scelta o conferma e consente entrambi i modi solo dopo conferma', () => {
    expect(canStartCRMCall(null, true, false)).toBe(false);
    expect(canStartCRMCall('ai', false, false)).toBe(false);
    expect(canStartCRMCall('direct', false, false)).toBe(false);
    expect(canStartCRMCall('ai', true, false)).toBe(true);
    expect(canStartCRMCall('direct', true, false)).toBe(true);
    expect(canStartCRMCall('direct', true, true)).toBe(false);
  });
  it('usa il numero UK di Bruno per le chiamate dirette', () => {
    expect(CRM_CALLER_NUMBER).toBe('+447457416033');
  });
  it('riserva le telefonate ad amministratore e commerciale', () => {
    expect(dialerStaff(['admin'])).toBe(true);
    expect(dialerStaff(['commerciale'])).toBe(true);
    expect(dialerStaff(['produzione', 'user'])).toBe(false);
    expect(dialerStaff([])).toBe(false);
  });
  it('non ricompone automaticamente un esito incerto o concluso', () => {
    expect(directStatus('unknown', 'dialing')).toBe('unknown');
    expect(directStatus('ended', 'active')).toBe('ended');
    expect(directStatus('failed', 'dialing')).toBe('failed');
    expect(directStatus('active', 'dialing')).toBe('active');
  });
  it('non indovina un prefisso mancante', () => {
    expect(dialerPhone('0044 7457 416033')).toBe('+447457416033');
    expect(() => dialerPhone('3383156161')).toThrow();
  });
});