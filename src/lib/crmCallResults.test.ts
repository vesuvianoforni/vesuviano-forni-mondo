import { describe, expect, it } from 'vitest';
import { directRecordingCommand, directEventMatches, callRecordingUrl, callAnalysisRecovery, verifyDirectCallSignature } from './crmCallResults';
describe('Registrazioni chiamate operatore', () => {
  it('registra entrambe le voci con avviso e comando idempotente', () => {
    const command = directRecordingCommand('call');
    expect(command.channels).toBe('dual'); expect(command.recording_track).toBe('both');
    expect(command.play_beep).toBe(true); expect(command.command_id).toBe('call');
  });
  it('accetta solo la connessione CRM e la destinazione del cliente', () => {
    const call = { destination: '+447405868801', from_number: '+447457416033' };
    expect(directEventMatches({ connection_id: '3089447004791637361', to: '+447405868801' }, call)).toBe(true);
    expect(directEventMatches({ connection_id: 'foreign', to: '+447405868801' }, call)).toBe(false);
    expect(directEventMatches({ connection_id: '3089447004791637361', to: '+393383156161' }, call)).toBe(false);
  });
  it('non scarica registrazioni da host arbitrari o con credenziali', () => {
    expect(callRecordingUrl('https://s3.amazonaws.com/telephony-recorder-prod/file.mp3')).toContain('/file.mp3');
    expect(() => callRecordingUrl('https://evil.com/file.mp3')).toThrow();
    expect(() => callRecordingUrl('https://telnyx.com@evil.com/file.mp3')).toThrow();
  });
  it('nega callback non firmati e scaduti', async () => {
    expect(await verifyDirectCallSignature('{}', null, '1')).toBe(false);
    expect(await verifyDirectCallSignature('{}', 'bad', '1')).toBe(false);
  });
  it('non ripete dinieghi, rifiuti o errori definitivi', () => {
    expect(callAnalysisRecovery(403, 'Provider access denied')).toBe('provider_denied');
    expect(callAnalysisRecovery(402, 'Insufficient credits')).toBe('paused');
    expect(callAnalysisRecovery(400, 'invalid request')).toBe('terminal');
    expect(callAnalysisRecovery(404, 'unavailable model')).toBe('terminal');
    expect(callAnalysisRecovery(429, 'rate limited')).toBe('retry');
  });
});