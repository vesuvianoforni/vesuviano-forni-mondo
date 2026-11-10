import { describe, expect, it } from 'vitest';
import { fullPhoneIdentity, filterDialDirections } from './dialHistory';

describe('Storico delle chiamate ricevute', () => {
  it('riconosce il cliente dal numero completo con prefisso senza confondere paesi diversi', () => {
    expect(fullPhoneIdentity('0039 338 315 6161')).toBe('+393383156161');
    expect(fullPhoneIdentity('+44 7457 416033')).toBe('+447457416033');
    expect(fullPhoneIdentity('+39 081 1923 1684')).toBe('+3908119231684');
    expect(fullPhoneIdentity('Numero privato')).toBeNull();
    expect(fullPhoneIdentity('+447457416033')).not.toBe(fullPhoneIdentity('+33745741603'));
  });
  it('Ricevute comprende gli inoltri ma non le chiamate outbound AI o operatore', () => {
    const calls = [{ id: 'forward', direction: 'inbound' as const }, { id: 'operator', direction: 'outbound' as const }, { id: 'ai', direction: 'outbound' as const }];
    expect(filterDialDirections(calls, 'inbound').map(c => c.id)).toEqual(['forward']);
    expect(filterDialDirections(calls, 'outbound').map(c => c.id)).toEqual(['operator', 'ai']);
    expect(filterDialDirections(calls, 'all')).toHaveLength(3);
  });
});