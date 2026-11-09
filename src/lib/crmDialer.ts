export const CRM_CALLER_NUMBER = '+447457416033';
export const CRM_DIALER_CONNECTION = '3089447004791637361';
export type CallMode = 'ai' | 'direct' | null;
export function canStartCRMCall(mode: CallMode, confirmed: boolean, busy: boolean) {
  return mode !== null && confirmed && !busy;
}
export function dialerStaff(roles: readonly string[]) {
  return roles.some(role => role === 'admin' || role === 'commerciale');
}
export function dialerPhone(phone: string) {
  const value = phone.replace(/[\s().-]/g, '').replace(/^00/, '+');
  if (!/^\+[1-9]\d{7,14}$/.test(value)) throw new Error('Salva il numero del cliente con prefisso internazionale.');
  return value;
}
export function directStatus(current: string, event: string) {
  if (['ended', 'failed', 'unknown'].includes(current)) return current;
  if (event === 'active') return 'active';
  if (event === 'ended' || event === 'failed' || event === 'unknown') return event;
  return current === 'active' ? current : 'dialing';
}
export const directStatusLabels: Record<string, string> = {
  preparing: 'Preparazione', dialing: 'Sta chiamando', active: 'In conversazione',
  ended: 'Chiamata terminata', failed: 'Chiamata non riuscita', unknown: 'Esito da verificare',
};

// Two ways to reach Telnyx: the Lovable connector gateway (used on the Lovable
// host, where the connector key exists) or the provider API directly with the
// owner's own Telnyx key (needed on Netlify, where that connector key is not
// readable). The same relative paths work on both.
export type DialerCredentials = { direct: string } | { lovable: string; connection: string };

export function dialerCredentials(env: { telnyx?: string; lovable?: string; connection?: string }): DialerCredentials | undefined {
  if (env.telnyx) return { direct: env.telnyx };
  if (env.lovable && env.connection) return { lovable: env.lovable, connection: env.connection };
  return undefined;
}

export function dialerRequest(path: string, credentials: DialerCredentials) {
  if ('direct' in credentials) {
    return { url: `https://api.telnyx.com/v2${path}`, headers: { Authorization: `Bearer ${credentials.direct}` } };
  }
  return {
    url: `https://connector-gateway.lovable.dev/udc_telnyx${path}`,
    headers: { Authorization: `Bearer ${credentials.lovable}`, 'X-Connection-Api-Key': credentials.connection },
  };
}