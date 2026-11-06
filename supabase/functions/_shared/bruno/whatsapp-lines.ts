// Bruno's per-country official WhatsApp lines (non-secret Meta IDs). Customers whose number starts with
// `prefix` are served by that line; everyone else uses the default line from META_WHATSAPP_* secrets.
// Add one entry per new country number.
export const COUNTRY_LINES = [
  { key: 'uk', label: 'WhatsApp UK', prefix: '44', phoneId: '1487643001088299', wabaId: '1103319505997045' },
] as const;

export function lineFor(to?: string | null) {
  const d = String(to ?? '').replace(/\D/g, '');
  return COUNTRY_LINES.find((l) => d.startsWith(l.prefix)) ?? null;
}
