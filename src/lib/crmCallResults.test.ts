import { describe, expect, it } from 'vitest';
import { callAnalysisRecovery } from './crmCallResults';
describe('Registrazioni chiamate operatore', () => {
  it('non ripete dinieghi, rifiuti o errori definitivi', () => {
    expect(callAnalysisRecovery(403, 'Provider access denied')).toBe('provider_denied');
    expect(callAnalysisRecovery(402, 'Insufficient credits')).toBe('paused');
    expect(callAnalysisRecovery(400, 'invalid request')).toBe('terminal');
    expect(callAnalysisRecovery(404, 'unavailable model')).toBe('terminal');
    expect(callAnalysisRecovery(429, 'rate limited')).toBe('retry');
  });
});