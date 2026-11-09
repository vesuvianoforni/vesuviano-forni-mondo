import { describe, expect, it } from 'vitest';
import { CRM_CALLER_NUMBER, canStartCRMCall, dialerCredentials, dialerRequest, dialerStaff, dialerPhone, directStatus } from './crmDialer';

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

describe('Chiamate CRM: linea Telnyx anche su Netlify', () => {
  it('preferisce la chiave Telnyx propria e usa il gateway Lovable solo con entrambe le chiavi', () => {
    expect(dialerCredentials({ telnyx: 'chiave-telnyx', lovable: 'k', connection: 'c' })).toEqual({ direct: 'chiave-telnyx' });
    expect(dialerCredentials({ lovable: 'k', connection: 'c' })).toEqual({ lovable: 'k', connection: 'c' });
    expect(dialerCredentials({ lovable: 'k' })).toBeUndefined();
    expect(dialerCredentials({})).toBeUndefined();
  });
  it('parla con api.telnyx.com in diretta e con il gateway Lovable nell’altro modo', () => {
    const direct = dialerRequest('/telephony_credentials', { direct: 'chiave-telnyx' });
    expect(direct.url).toBe('https://api.telnyx.com/v2/telephony_credentials');
    expect(direct.headers.Authorization).toBe('Bearer chiave-telnyx');
    expect(direct.headers['X-Connection-Api-Key']).toBeUndefined();
    const gateway = dialerRequest('/telephony_credentials', { lovable: 'k', connection: 'c' });
    expect(gateway.url).toBe('https://connector-gateway.lovable.dev/udc_telnyx/telephony_credentials');
    expect(gateway.headers['X-Connection-Api-Key']).toBe('c');
  });
});