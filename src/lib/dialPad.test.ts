import { describe, expect, it } from 'vitest';
import { cleanDial, crmPhoneCountry, matchingDialContacts, parseDial, phoneKey, readPhoneContacts } from './dialPad';

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

describe('Riconoscimento dei clienti già presenti nelle chiamate', () => {
  it('associa Andre Brincat al numero UK senza creare un nuovo lead', () => {
    const andre = { id: 'andre-originale', phone: '07999488655', country: 'UK' };
    expect(matchingDialContacts([andre], '+447999488655').map(lead => lead.id)).toEqual(['andre-originale']);
    expect(phoneKey(andre.phone, crmPhoneCountry(andre.country))).toBe('+447999488655');
  });
  it('riconosce un numero irlandese locale se il paese importato non produce un numero valido', () => {
    expect(matchingDialContacts([{ id: 'john', phone: '0872646302', country: 'UK' }], '+353872646302').map(lead => lead.id)).toEqual(['john']);
  });
  it('riconosce formati UK localizzati e internazionali equivalenti', () => {
    const contacts = [
      { id: 'local', phone: '07999 488 655', country: 'Regno Unito' },
      { id: 'international', phone: '0044 7999-488-655' },
    ];
    expect(matchingDialContacts(contacts, '+447999488655').map(lead => lead.id)).toEqual(['local', 'international']);
  });
  it('non confonde prefissi espliciti o paesi validi diversi né gli ultimi numeri uguali', () => {
    expect(matchingDialContacts([
      { id: 'explicit', phone: '+3907999488655', country: 'UK' },
      { id: 'italian', phone: '07999488655', country: 'IT' },
      { id: 'suffix', phone: '+447123488655', country: 'UK' },
    ], '+447999488655')).toEqual([]);
  });
  it('non sceglie arbitrariamente tra più schede con lo stesso numero', () => {
    expect(matchingDialContacts([{ id: 'a', phone: '+447999488655' }, { id: 'b', phone: '07999488655', country: 'UK' }], '+447999488655')).toHaveLength(2);
  });
  it('non identifica il secondo numero dello screenshot come Andre', () => {
    expect(matchingDialContacts([{ id: 'andre', phone: '07999488655', country: 'UK' }], '+447947888973')).toEqual([]);
  });
  it('verifica tutte le pagine prima di considerare sconosciuto un cliente', async () => {
    const first = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), phone: '+393383156161' }));
    const all = await readPhoneContacts(async from => from === 0 ? first : [{ id: 'andre', phone: '07999488655', country: 'UK' }]);
    expect(matchingDialContacts(all, '+447999488655').map(lead => lead.id)).toEqual(['andre']);
  });
  it('interrompe la risoluzione se una pagina non è leggibile', async () => {
    await expect(readPhoneContacts(async from => {
      if (from > 0) throw new Error('lettura interrotta');
      return Array.from({ length: 1000 }, (_, index) => index);
    })).rejects.toThrow('lettura interrotta');
  });
});
