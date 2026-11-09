import { CRM_CALLER_NUMBER, CRM_DIALER_CONNECTION, dialerRequest, type DialerCredentials } from './crmDialer';

export async function telnyxDialer(path: string, credentials: DialerCredentials, method = 'GET', body?: unknown) {
  const { url, headers } = dialerRequest(path, credentials);
  const response = await fetch(url, {
    method, headers: { ...headers, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`Telnyx dialer [${response.status}]: ${text}`);
    throw new Error(`Telnyx [${response.status}]: ${text}`);
  }
  // The token endpoint returns a plain JWT, not the usual JSON envelope.
  if (path.endsWith('/token')) return { token: text.replace(/^"|"$/g, '').trim() };
  return text ? JSON.parse(text) : {};
}

export async function checkDialerConnection(credentials: DialerCredentials) {
  const { data } = await telnyxDialer(`/credential_connections/${CRM_DIALER_CONNECTION}`, credentials);
  if (!data?.active || data?.outbound?.ani_override !== CRM_CALLER_NUMBER || data?.outbound?.ani_override_type !== 'always') {
    throw new Error('Linea CRM non pronta: identificativo UK da verificare.');
  }
}
