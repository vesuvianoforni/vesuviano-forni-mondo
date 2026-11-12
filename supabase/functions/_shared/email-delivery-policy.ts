export const COMPANY_EMAIL = 'info@vesuvianoforni.com';

type Addresses = string | string[];
export type CompanyEmail = { to: Addresses; cc?: Addresses; bcc?: Addresses; reply_to?: Addresses };
const addresses = (value?: Addresses): string[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
const key = (address: string) => (address.match(/<([^>]+)>/)?.[1] ?? address).trim().toLowerCase();

/** Apply the corporate copy at the final delivery boundary, without changing customer recipients. */
export function withCompanyEmailCopy<T extends CompanyEmail>(email: T) {
  const visible = new Set([...addresses(email.to), ...addresses(email.cc)].map(key));
  const seen = new Set(visible);
  const bcc = [...addresses(email.bcc), COMPANY_EMAIL].filter(address => {
    const normalized = key(address);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  return { ...email, reply_to: COMPANY_EMAIL, bcc };
}

/** BCC is an SMTP envelope recipient only, never a public MIME header. */
export function companySMTPEnvelope(sender: string, recipient: string) {
  const email = withCompanyEmailCopy({ to: recipient });
  return { from: sender, to: [recipient, ...email.bcc] };
}