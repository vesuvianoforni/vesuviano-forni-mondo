export const CALL_AUDIO_MAX_BYTES = 24 * 1024 * 1024;
export function callAnalysisRecovery(status: number, message: string, type = '') {
  if (/account.*(suspend|config|problem)|configuration.*problem/i.test(`${type} ${message}`)) return 'terminal' as const;
  if (status === 429 || status >= 500) return 'retry' as const;
  if (status === 403 && !/credit|workspace|model_requires|model_vendor|region|policy/i.test(`${type} ${message}`)) return 'provider_denied' as const;
  if (status === 402 || status === 403) return 'paused' as const;
  return 'terminal' as const;
}