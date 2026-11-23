import { describe, expect, it } from 'vitest';
import { normalizeChatPhone, requiresChatPhone } from '@/lib/chatPhone';

describe('telefono obbligatorio chat e richiamate', () => {
  it('rifiuta la frase effettivamente scambiata per il numero di Ibrqhim', () => {
    expect(normalizeChatPhone('I need gas pizza oven for restaurant')).toBeNull();
  });
  it('rifiuta numeri mancanti, troppo corti, troppo lunghi e testo con cifre', () => {
    for (const input of [null, undefined, '', ' ', '123', '+1234567890123456', '0000000000', 'oven 100 cm', 'call +44 7457 416033']) {
      expect(normalizeChatPhone(input)).toBeNull();
    }
  });
  it('conserva prefissi e numeri locali eliminando soltanto la formattazione', () => {
    expect(normalizeChatPhone('+44 7457 416033')).toBe('+447457416033');
    expect(normalizeChatPhone('07760 686363')).toBe('07760686363');
    expect(normalizeChatPhone('+39 (081) 1923-1684')).toBe('+3908119231684');
  });
  it('richiede il telefono su entrambe le richiamate e sul contatto chat, non sugli altri moduli', () => {
    expect(requiresChatPhone('callback_request')).toBe(true);
    expect(requiresChatPhone('hero_callback')).toBe(true);
    expect(requiresChatPhone('ai_chat')).toBe(true);
    expect(requiresChatPhone('download-modal')).toBe(false);
  });
});