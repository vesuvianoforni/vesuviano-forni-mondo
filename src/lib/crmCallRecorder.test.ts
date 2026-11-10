import { describe, it, expect } from 'vitest';
import { encodeCallWav } from './crmCallRecorder';
describe('Registrazione completa operatore', () => {
  it('ogni segmento conserva intestazione WAV, frequenza e tutti i campioni', async () => {
    const file = encodeCallWav([new Float32Array([0.5, -0.5]), new Float32Array([1, -1])], 16000);
    const b = await file.arrayBuffer(), v = new DataView(b);
    expect(new TextDecoder().decode(b.slice(0, 4))).toBe('RIFF');
    expect(new TextDecoder().decode(b.slice(8, 12))).toBe('WAVE');
    expect(v.getUint32(24, true)).toBe(16000); expect(v.getUint32(40, true)).toBe(8);
    expect(v.getInt16(44, true)).toBe(16383); expect(v.getInt16(46, true)).toBe(-16384);
    expect(v.getInt16(48, true)).toBe(32767); expect(v.getInt16(50, true)).toBe(-32768);
  });
});